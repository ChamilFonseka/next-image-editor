'use server'

import sharp from "sharp";

export default async function processImage(file: File): Promise<File> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const metadata = await sharp(buffer).metadata();
    const dpiX = metadata.density || 72; // Default to 72 if density is not available

    if (dpiX < 300) {
        const resizedBuffer = await sharp(buffer)
            .resize({ width: metadata.width, height: metadata.height })
            .withMetadata({ density: 300 })
            .toBuffer();

        return new File([resizedBuffer], file.name, { type: file.type });
    }

    return file;
}