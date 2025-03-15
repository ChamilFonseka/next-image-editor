import Dexie from 'dexie';

class ImageDB extends Dexie {
    images: Dexie.Table<{ id: string; data: ArrayBuffer; type: string }, string>;

    constructor() {
        super('ImageDB');
        this.version(1).stores({
            images: 'id' // 'id' is the primary key
        });
        this.images = this.table('images');
    }
}

const db = new ImageDB();
const imageId = 'imageId';

export const saveFileToDB = async (file: File) => {
    const fileData = await file.arrayBuffer();
    await db.images.put({ id: imageId, data: fileData, type: file.type });
};

export const getFileFromDB = async () => {
    const images = await db.images.toArray();
    
    if(images.length === 0) return null;

    const image = images[0];

    return new File([image.data], imageId, { type: image.type });
};

export const deleteFileFromDB = async () => {
    await db.images.delete(imageId);
};