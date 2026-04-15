import { callAuth } from "@/lib/identity-grpc";
import { jsonFail, jsonOk, mapGrpcError } from "../helpers";

export const runtime = "nodejs";

type OTPData = {
  otpReqCount: number;
  maxOtpReq: number;
  otpErrCount: number;
  maxOtpErr: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { mobile?: string; random?: string };
    if (!body.mobile?.trim()) {
      return jsonFail("Mobile is required");
    }
    if (!body.random?.trim()) {
      return jsonFail("Random token is required");
    }

    const response = await callAuth<{ mobile: string; random: string }, OTPData>(
      "GenerateMobileOTP",
      {
        mobile: body.mobile.trim(),
        random: body.random.trim(),
      }
    );
    return jsonOk(response);
  } catch (error) {
    return mapGrpcError(error);
  }
}
