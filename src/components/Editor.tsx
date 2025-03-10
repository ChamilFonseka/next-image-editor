'use client';

import { Image as ImageIcon, MousePointerSquareDashed } from "lucide-react";
import { useState } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { Rnd } from "react-rnd";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import exifr from "exifr";

type ImageData = {
    name: string;
    width: number;
    height: number;
    type: string;
    size: string;
    dpiX: string;
    dpiY: string;
    ppi: string;
};

export const Editor = () => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [imageData, setImageData] = useState<ImageData | null>();
    const [preview, setPreview] = useState('');

    const onDropRejected = (rejectedFiles: FileRejection[]) => {
        const [file] = rejectedFiles;

        setIsDragOver(false);

        toast.error(`${file.file.type} type is not supported.`, {
            description: "Please choose a PNG, JPG, or JPEG image instead.",
        });
    };

    const onDropAccepted = (acceptedFiles: File[]) => {
        const [file] = acceptedFiles;
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
                    name: file.name,
                    width: img.width,
                    height: img.height,
                    type: file.type,
                    size: (file.size / 1024).toFixed(2) + " KB",
                    dpiX,
                    dpiY,
                    ppi,
                });
                setPreview(imgSrc);
            };
        };

        reader.readAsDataURL(file);
        setIsDragOver(false);
    };

    return (
        <section className="flex flex-col items-center justify-center space-y-4">
            <div className='border-2 border-dashed border-zinc-800 rounded-lg h-32 w-full'>

                <Dropzone
                    onDropRejected={onDropRejected}
                    onDropAccepted={onDropAccepted}
                    accept={{
                        'image/png': ['.png'],
                        'image/jpeg': ['.jpeg'],
                        'image/jpg': ['.jpg'],
                    }}
                    onDragEnter={() => setIsDragOver(true)}
                    onDragLeave={() => setIsDragOver(false)}>
                    {({ getRootProps, getInputProps }) => (
                        <div className='flex flex-col items-center justify-center w-full h-full'
                            {...getRootProps()}>
                            <input {...getInputProps()} />
                            {isDragOver ? (
                                <MousePointerSquareDashed className='size-8 text-zinc-500 mb-2' />
                            ) : (
                                <ImageIcon className='size-8 text-zinc-500 mb-2' />
                            )}
                            <div className='flex flex-col justify-center mb-2 text-sm text-zinc-700'>
                                {isDragOver ? (
                                    <p>
                                        <span className='font-semibold'>Drop file</span> to upload
                                    </p>
                                ) : (
                                    <p>
                                        <span className='font-semibold'>Click to upload</span> or drag and drop
                                    </p>
                                )}
                            </div>
                            <p className='text-xs text-zinc-500'>PNG, JPG, JPEG</p>
                        </div>
                    )}
                </Dropzone>

            </div>

            {imageData && (
                <Card className="w-full">
                    <CardContent>
                        <p><strong>Name:</strong> {imageData.name}</p>
                        <p><strong>Resolution:</strong> {imageData.width} x {imageData.height} px</p>
                        <p><strong>Type:</strong> {imageData.type}</p>
                        <p><strong>Size:</strong> {imageData.size}</p>
                        <p><strong>DPI (X):</strong> {imageData.dpiX}</p>
                        <p><strong>DPI (Y):</strong> {imageData.dpiY}</p>
                        <p><strong>PPI:</strong> {imageData.ppi}</p>
                    </CardContent>
                </Card>
            )}

            <div className="relative mx-auto bg-red-400">
                <div className='relative 
                w-[300px]
                xl:w-[400px]
                2xl:w-[600px]
                aspect-[8/10]  
                pointer-events-none 
                bg-zinc-100
                shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)]
                '>
                </div>

                <div className='absolute 
                w-[300px]
                xl:w-[400px]
                2xl:w-[600px]
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
                        {preview && (
                            <img src={preview} alt="Uploaded Preview" className="pointer-events-none" />
                        )}
                    </Rnd>
                )}
            </div>

        </section>
    );
};