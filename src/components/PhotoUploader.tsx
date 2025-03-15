'use client';

import { getFilesFromDB, saveFileToDB, deleteFileFromDB } from "@/db";
import { Image as ImageIcon, MousePointerSquareDashed, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { toast } from "sonner";
import Image from "next/image";

const PhotoUploader = () => {

    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [uploadedImage, setUploadedImage] = useState<{ id: string; data: string; } | null>();

    useEffect(() => {
        (async () => {
            const image = await getFilesFromDB();
            setUploadedImage(image);
        })();
    }, []);

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

        const images = await getFilesFromDB();
        setUploadedImage(images);

        toast.success(`File ${file.name} uploaded successfully!`);
    };

    const handleDelete = async (fileName: string) => {
        await deleteFileFromDB(fileName);
        const images = await getFilesFromDB();
        setUploadedImage(images);
        toast.success(`File ${fileName} deleted.`);
    };

    return (

        <>
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
                        style={{ background: "linear-gradient(180deg,#f3f1ff 10.1%,#fff4ee 126.67%)" }}
                        className='flex-1 rounded-3xl flex flex-col items-center justify-center w-full h-full'
                        {...getRootProps()}>
                        <input {...getInputProps()} />
                        {isDragOver ? (
                            <MousePointerSquareDashed className='size-32 text-zinc-500 mb-2' />
                        ) : (
                            <ImageIcon className='size-32 text-zinc-500 mb-2' />
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

            {uploadedImage && (
                <div className="mt-8 flex flex-col items-center">
                    <Image src={uploadedImage.data} alt={uploadedImage.id}
                        width={300}
                        height={300}
                        className="w-[300px] h-[300px] object-cover rounded-2xl shadow-2xl"
                    />
                    <button
                        className="m-4 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(uploadedImage.id)}
                    >
                        <Trash className="size-8" />
                    </button>
                </div>
            )}
        </>
    );
};
export default PhotoUploader;    