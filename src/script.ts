// https://developer.mozilla.org/en-US/docs/Web/API/File_System_API

type FileHandle = FileSystemHandle & {
    getFile: () => Promise<File>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
};

type FileInfo = { handle: FileHandle; writer: FileSystemWritableFileStream };

const getFileInfo = async (): Promise<FileInfo> => {
    //@ts-ignore
    const [fileHandle] = window.showOpenFilePicker() as FileHandle[];
    const writableHandle = await fileHandle.createWritable();

    return { handle: fileHandle, writer: writableHandle };
};

const read = async (file: FileInfo): Promise<string> => {
    try {
        const fileData = await file.handle.getFile();
        return fileData.text();
    } catch (e) {
        alert(`Error reading file: ${e}`);
        throw e;
    }
};

const write = async (file: FileInfo, data: string) => {
    try {
        file.writer.write(data);
    } catch (e) {
        alert(`Error writing to file: ${e}`);
        throw e;
    }
};

const main = () => {
    const fileChooseButton = document.getElementById('file-choose') as HTMLButtonElement;
    const writeFileButton = document.getElementById('write') as HTMLButtonElement;
    const fileContentsTextField = document.getElementById('content') as HTMLTextAreaElement;

    let currentFileInfo: FileInfo | undefined = undefined;

    fileChooseButton.addEventListener('click', async () => {
        // close the previous file
        if (currentFileInfo != undefined) {
            currentFileInfo.writer.close();
        }

        currentFileInfo = await getFileInfo();

        // write to the textarea
        fileContentsTextField.value = 'Loading...';
        fileContentsTextField.readOnly = true;

        fileContentsTextField.value = await read(currentFileInfo);
        fileContentsTextField.readOnly = false;
    });

    writeFileButton.addEventListener('click', async () => {
        if (currentFileInfo === undefined) {
            alert('Error: No file currently opened');
            return;
        }
        await write(currentFileInfo, fileContentsTextField.value);
    });

    window.addEventListener('beforeunload', (e) => {
        // close the writer when closing the tab
        if (currentFileInfo === undefined) {
            return;
        }
        currentFileInfo.writer.close();
    });
};

main();
