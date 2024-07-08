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

export const saveFile = async (content: string, filename: string): Promise<void> => {
    return new Promise(resolve => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        const clickHandler = () => {
            setTimeout(() => {
                URL.revokeObjectURL(url);
                a.removeEventListener("click", clickHandler);
                resolve();
            }, 150);
        };
        a.addEventListener("click", clickHandler, false);

        const event = new MouseEvent("click");
        a.dispatchEvent(event);
    });
};
