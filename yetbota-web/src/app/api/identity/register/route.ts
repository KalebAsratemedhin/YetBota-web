import { callUser } from "@/lib/identity-grpc";
import { jsonFail, jsonOk, mapGrpcError } from "../helpers";

export const runtime = "nodejs";

type RegisterPayload = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  mobile: string;
  password: string;
  random: string;
};

type PrivateUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  mobile: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RegisterPayload>;
    const requiredFields: Array<keyof RegisterPayload> = [
      "id",
      "firstName",
      "lastName",
      "username",
      "mobile",
      "password",
      "random",
    ];

    const missing = requiredFields.find((field) => !body[field]?.trim());
    if (missing) {
      return jsonFail(`${missing} is required`);
    }

    const response = await callUser<RegisterPayload, PrivateUser>("Register", {
      id: body.id!,
      firstName: body.firstName!,
      lastName: body.lastName!,
      username: body.username!,
      mobile: body.mobile!,
      password: body.password!,
      random: body.random!,
    });
    return jsonOk(response);
  } catch (error) {
    return mapGrpcError(error);
  }
}
