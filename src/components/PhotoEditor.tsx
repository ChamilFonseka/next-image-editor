'use client';

import { getFileFromDB } from "@/db";
import NextImage from "next/image";
import { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import exifr from "exifr";
import { ImageData } from "@/types";
import { Download } from "lucide-react";

function PhotoEditor() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageData, setImageData] = useState<ImageData | null>();
    const frameRef = useRef<HTMLDivElement>(null);

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

    const handleDownload = () => {
        if (!frameRef.current || !imageSrc) return;

        // Get the frame dimensions
        const frame = frameRef.current;
        const frameRect = frame.getBoundingClientRect();

        // Get the Rnd component with the image
        const rndElements = document.querySelectorAll('.react-draggable');
        if (!rndElements.length) return;

        const rndElement = rndElements[0];
        const rndRect = rndElement.getBoundingClientRect();

        // Create canvas with fixed 8"x10" at 300 DPI dimensions
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to 8" x 10" at 300 DPI
        const dpi = 300;
        const widthInPixels = 8 * dpi;
        const heightInPixels = 10 * dpi;
        canvas.width = widthInPixels;
        canvas.height = heightInPixels;

        // Fill with white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, widthInPixels, heightInPixels);

        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            // Calculate the position of the Rnd component relative to the frame
            const relativeX = (rndRect.left - frameRect.left) / frameRect.width;
            const relativeY = (rndRect.top - frameRect.top) / frameRect.height;

            // Calculate the size of the Rnd component relative to the frame
            const relativeWidth = rndRect.width / frameRect.width;
            const relativeHeight = rndRect.height / frameRect.height;

            // Calculate the destination position and dimensions in the 8x10 canvas
            const destX = relativeX * widthInPixels;
            const destY = relativeY * heightInPixels;
            const destWidth = relativeWidth * widthInPixels;
            const destHeight = relativeHeight * heightInPixels;

            // Draw the image at its relative position and size
            ctx.drawImage(
                img,
                0, 0, img.width, img.height,  // Source rectangle (entire image)
                destX, destY, destWidth, destHeight  // Destination rectangle (positioned and scaled as in preview)
            );

            // Convert canvas to a downloadable image
            canvas.toBlob((blob) => {
                if (blob) {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "photo-8x10.png";
                    link.click();

                    // Clean up the object URL after download
                    setTimeout(() => {
                        URL.revokeObjectURL(link.href);
                    }, 100);
                }
            }, "image/png");
        };
    };

    return (
        <div className='flex-1 rounded-3xl flex flex-col items-center justify-center w-full h-full border-2 border-zinc-500 overflow-hidden pt-8'>

            <div id='frame' ref={frameRef} className="relative mx-auto">
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

            <button
                onClick={handleDownload}
                className="size-16 m-8 bg-emerald-400 p-2 rounded-full text-emerald-800 z-100 flex items-center justify-center">
                <Download className="size-8 hover:size-10" />
            </button>
        </div>
    );
}
export default PhotoEditor;