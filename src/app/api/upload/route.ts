import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import { randomUUID } from "crypto";

import tinify from "tinify";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  tinify.key = process.env.TINIFY_API_KEY || "";

  if (!tinify.key) {
    console.error("TINIFY_API_KEY is not configured.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress and convert to AVIF using Tinify
    const source = tinify.fromBuffer(buffer);
    const converted = source.convert({ type: "image/avif" });
    const optimizedBuffer = await converted.toBuffer();

    const key = `uploads/${randomUUID()}.avif`;
    const contentType = "image/avif";

    const publicUrl = await uploadToR2(Buffer.from(optimizedBuffer), key, contentType);

    return NextResponse.json({ publicUrl, key });
  } catch (e: any) {
    console.error("Tinify/R2 Upload error:", e);
    return NextResponse.json({ error: "Failed to process and upload image" }, { status: 500 });
  }
}
