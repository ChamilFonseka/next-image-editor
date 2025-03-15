'use client';

import { saveFileToDB } from "@/db";
import { Image, MousePointerSquareDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { toast } from "sonner";

const PhotoUploader = () => {
    const router = useRouter();
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    const onDropRejected = (rejectedFiles: FileRejection[]) => {
        const [file] = rejectedFiles;

        setIsDragOver(false);

        toast.error(`${file.file.type} type is not supported.`, {
            description: "Please choose a PNG, JPG, or JPEG image instead.",
        });
    };

    const onDropAccepted = async (acceptedFiles: File[]) => {
        const [file] = acceptedFiles;

        setIsDragOver(false);

        await saveFileToDB(file);

        router.push('/info');
    };

    return (
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
                <div
                    
                    className='flex-1 rounded-3xl flex flex-col items-center justify-center w-full h-full border-2 border-zinc-500'
                    {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isDragOver ? (
                        <MousePointerSquareDashed className='size-32 text-zinc-500 mb-2' />
                    ) : (
                        <Image className='size-32 text-zinc-500 mb-2' />
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
    );
};
export default PhotoUploader;    