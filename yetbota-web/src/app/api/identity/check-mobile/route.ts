import { callUser } from "@/lib/identity-grpc";
import { jsonFail, jsonOk, mapGrpcError } from "../helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { mobile?: string };
    if (!body.mobile?.trim()) {
      return jsonFail("Mobile is required");
    }

    const response = await callUser<{ mobile: string }, boolean>("CheckMobile", {
      mobile: body.mobile.trim(),
    });
    return jsonOk(response);
  } catch (error) {
    return mapGrpcError(error);
  }
}
