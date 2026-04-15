import path from "path";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

type GrpcResponse<T = unknown> = {
  code: string;
  success: boolean;
  message: string;
  data?: T;
};

type IdentityClients = {
  authClient: grpc.Client;
  userClient: grpc.Client;
};

const globalCache = globalThis as typeof globalThis & {
  __identityClients?: IdentityClients;
};

function loadIdentityPackage() {
  const protoRoot =
    process.env.IDENTITY_PROTO_ROOT ||
    path.resolve(process.cwd(), "../yetbota/common/proto/definition");
  const packageDefinition = protoLoader.loadSync(
    [
      path.join(protoRoot, "identity/v1/auth.proto"),
      path.join(protoRoot, "identity/v1/user.proto"),
    ],
    {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protoRoot],
    }
  );

  return grpc.loadPackageDefinition(packageDefinition) as Record<string, unknown>;
}

function getClients(): IdentityClients {
  if (globalCache.__identityClients) {
    return globalCache.__identityClients;
  }

  const identityPackage = loadIdentityPackage()
    .identity as Record<string, unknown>;
  const v1Package = identityPackage.v1 as Record<string, unknown>;
  const AuthService = v1Package.AuthService as grpc.ServiceClientConstructor;
  const UserService = v1Package.UserService as grpc.ServiceClientConstructor;

  const identityAddress = process.env.IDENTITY_GRPC_ADDRESS || "localhost:6969";
  const credentials = grpc.credentials.createInsecure();

  const clients: IdentityClients = {
    authClient: new AuthService(identityAddress, credentials),
    userClient: new UserService(identityAddress, credentials),
  };

  globalCache.__identityClients = clients;
  return clients;
}

function callUnary<Req extends object, Res>(
  client: grpc.Client,
  method: string,
  request: Req
): Promise<Res> {
  const clientMethods = client as unknown as Record<string, unknown>;
  const fallbackMethod = `${method.charAt(0).toLowerCase()}${method.slice(1)}`;
  const methodRef = (clientMethods[method] || clientMethods[fallbackMethod]) as
    | ((
        req: Req,
        cb: (error: grpc.ServiceError | null, response: Res) => void
      ) => void)
    | undefined;

  if (!methodRef) {
    return Promise.reject(new Error(`Unknown gRPC method: ${method}`));
  }

  return new Promise((resolve, reject) => {
    methodRef.call(client, request, (error, response) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

export async function callAuth<Req extends object, Res>(
  rpcName: string,
  payload: Req
): Promise<GrpcResponse<Res>> {
  const { authClient } = getClients();
  return callUnary<Req, GrpcResponse<Res>>(authClient, rpcName, payload);
}

export async function callUser<Req extends object, Res>(
  rpcName: string,
  payload: Req
): Promise<GrpcResponse<Res>> {
  const { userClient } = getClients();
  return callUnary<Req, GrpcResponse<Res>>(userClient, rpcName, payload);
}
