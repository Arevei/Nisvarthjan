import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB limit

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    configureCloudinary();
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 500KB or less" }, { status: 400 });
    }

    const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "nisvarthjan/members";
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload with transformation for compression and resizing for ID card
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: uploadFolder,
      resource_type: "image",
      transformation: [
        { width: 300, height: 300, crop: "limit" }, // Limit max dimensions
        { quality: "auto:good", fetch_format: "auto" }, // Auto compression
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
  }
}