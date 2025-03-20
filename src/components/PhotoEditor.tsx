'use client';

import { getFileFromDB } from "@/db";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import exifr from "exifr";
import { ImageData } from "@/types";
import { Download } from "lucide-react";

function PhotoEditor() {

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

    return (
        <div className='flex-1 rounded-3xl flex flex-col items-center justify-center w-full h-full border-2 border-zinc-500 overflow-hidden p-8'>

            <div className="relative mx-auto bg-red-400">
                <div className='relative 
                w-[300px]
                xl:w-[400px]
                2xl:w-[800px]
                aspect-[8/10]  
                pointer-events-none 
                bg-zinc-100
                shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)]
                '>
                </div>

                <div className='absolute 
                w-[300px]
                xl:w-[400px]
                2xl:w-[800px]
                aspect-[8/10]  
                border-2 border-dashed border-zinc-800
                inset-0
                pointer-events-none
                z-10
                '>
                </div>

                {imageData && (
                    <Rnd
                        default={{
                            x: 0,
                            y: 0,
                            height: imageData.height / 4,
                            width: imageData.width / 4,
                        }}

                    >
                        {imageSrc && (
                            <NextImage src={imageSrc} alt='uploaded image'
                                fill
                                className="pointer-events-none"
                            />
                        )}
                    </Rnd>
                )}
            </div>
            
            <Download className="size-12 m-8 bg-emerald-400 p-2 rounded-full text-emerald-800 z-100" />
        </div>
    );
}
export default PhotoEditor;