import { NextResponse } from "next/server";
import grpc from "@grpc/grpc-js";

type BaseResponse<T = unknown> = {
  code: string;
  success: boolean;
  message: string;
  data?: T;
};

export function jsonOk<T>(payload: BaseResponse<T>) {
  return NextResponse.json(payload, { status: 200 });
}

export function jsonFail(message: string, status = 400) {
  return NextResponse.json(
    { code: String(status), success: false, message },
    { status }
  );
}

export function mapGrpcError(error: unknown) {
  const e = error as { code?: number; message?: string };

  if (typeof e?.code !== "number") {
    return jsonFail(e?.message || "Unable to process request", 500);
  }

  switch (e.code) {
    case grpc.status.INVALID_ARGUMENT:
      return jsonFail(e.message || "Invalid request", 400);
    case grpc.status.NOT_FOUND:
      return jsonFail(e.message || "Resource not found", 404);
    case grpc.status.UNAUTHENTICATED:
      return jsonFail(e.message || "Unauthenticated", 401);
    case grpc.status.PERMISSION_DENIED:
      return jsonFail(e.message || "Permission denied", 403);
    case grpc.status.ALREADY_EXISTS:
      return jsonFail(e.message || "Already exists", 409);
    default:
      return jsonFail(e.message || "Internal server error", 500);
  }
}
