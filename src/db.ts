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

export const saveFileToDB = async (file: File) => {
    const fileData = await file.arrayBuffer();
    await db.images.put({ id: file.name, data: fileData, type: file.type });
};

export const getFilesFromDB = async () => {
    const images = await db.images.toArray();
    return images.map(img => ({
        name: img.id,
        data: URL.createObjectURL(new Blob([img.data], { type: img.type })),
    }));
};

export const deleteFileFromDB = async (id: string) => {
    await db.images.delete(id);
};