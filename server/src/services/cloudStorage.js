import { v2 as cloudinary } from "cloudinary";

export async function uploadToCloudinary(file, folder = "wisebook/notes") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { secure_url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}` };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  const encoded = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  return cloudinary.uploader.upload(encoded, {
    folder,
    resource_type: "auto"
  });
}
