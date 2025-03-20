'use client';

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { deleteFileFromDB, getFileFromDB } from "@/db";
import { ArrowBigLeft, ArrowBigRight, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import exifr from "exifr";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ImageData } from "@/types";

function PhotoInfoDisplay() {
    const router = useRouter();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageData, setImageData] = useState<ImageData | null>();

    useEffect(() => {
        (async () => {
            const file = await getFileFromDB();
            if (file) {
                const blobUrl = URL.createObjectURL(file); // Convert to Blob URL
                setImageSrc(blobUrl);

                const reader = new FileReader();

                reader.onload = async (event) => {
                    const imgSrc = event.target?.result as string;
                    const img = new Image();
                    img.src = imgSrc as string;
                    img.onload = async () => {
                        const exifData = await exifr.parse(file);
                        const dpiX = exifData?.XResolution || "Unknown";
                        const dpiY = exifData?.YResolution || "Unknown";
                        const ppi = exifData?.XResolution && exifData?.YResolution ? ((dpiX + dpiY) / 2).toFixed(2) : "Unknown";

                        setImageData({
                            width: img.width,
                            height: img.height,
                            type: file.type,
                            size: (file.size / 1024).toFixed(2) + " KB",
                            dpiX,
                            dpiY,
                            ppi,
                        });
                    };
                };
                reader.readAsDataURL(file);
            }
        })();
    }, []);

    const handleDelete = async () => {
        await deleteFileFromDB();
        router.push('/');
    };

    return (
        <div className='flex-1 rounded-3xl flex flex-col items-center  w-full h-full border-2 border-zinc-500'>
            <div className="flex w-full justify-between">
                <button
                    className="m-4 text-sky-500 hover:text-rsky-700"
                    onClick={() => router.push('/')}
                >
                    <ArrowBigLeft className="size-8" />Back
                </button>
                <button
                    className="m-4 text-sky-500 hover:text-rsky-700"
                    onClick={() => router.push('/edit')}
                >
                    <ArrowBigRight className="size-8" />Edit
                </button>
            </div>
            {imageSrc && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center">
                        <NextImage src={imageSrc} alt='uploaded image'
                            width={300}
                            height={300}
                            className="w-[300px] md:w-[400px] 2xl:w-[600px] h-[300px] md:h-[400px] 2xl:h-[600px] object-cover rounded-2xl shadow-2xl"
                        />
                        <button
                            className="m-4 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete()}
                        >
                            <Trash className="size-8" />
                        </button>
                    </div>

                    {imageData && (
                        <Card className="h-[300px] md:h-[400px] 2xl:h-[600px]">
                            <CardHeader className="font-bold capitalize tracking-tighter text-xl">Image Information</CardHeader>
                            <CardContent className="grid grid-cols-2 gap-2">
                                <strong className="mr-2">Type:</strong> <span>{imageData.type}</span>
                                <strong className="mr-2">Size:</strong> <span>{imageData.size}</span>
                                <strong className="mr-2">Resolution:</strong> <span>{imageData.width} x {imageData.height}px</span>
                                <strong className="mr-2">DPI (X):</strong> <span>{imageData.dpiX}</span>
                                <strong className="mr-2">DPI (Y):</strong> <span>{imageData.dpiY}</span>
                                <strong className="mr-2">PPI:</strong> <span>{imageData.ppi}</span>
                            </CardContent>
                        </Card>
                    )}

                </div>
            )}
        </div>
    );
}
export default PhotoInfoDisplay;