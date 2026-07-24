import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl } from "@/lib/r2";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await request.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "bin";
  const key = `uploads/${randomUUID()}.${ext}`;

  try {
    const { uploadUrl, publicUrl } = await getSignedUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
