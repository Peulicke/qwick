export const loadFile = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";

        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files === null) return reject();
            if (target.files.length === 0) return reject();
            const file = target.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                typeof reader.result === "string" ? resolve(reader.result) : reject();
            };

            reader.onerror = () => reject(reader.error);

            reader.readAsText(file);
        };

        input.click();
    });
};

type WritableStream = {
    createWritable: () => Promise<WritableStream>;
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
};

declare global {
    interface Window {
        showSaveFilePicker: (input: { suggestedName: string }) => Promise<WritableStream>;
    }
}

export const saveFile = async (data: string, suggestedName: string): Promise<void> => {
    try {
        const fileHandle = await window.showSaveFilePicker({ suggestedName });
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(data);
        await writableStream.close();
    } catch (err) {
        console.log(err);
    }
};
