"use strict";
// https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const getFileInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const [fileHandle] = window.showOpenFilePicker();
    const writableHandle = yield fileHandle.createWritable();
    return { handle: fileHandle, writer: writableHandle };
});
const read = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileData = yield file.handle.getFile();
        return fileData.text();
    }
    catch (e) {
        alert(`Error reading file: ${e}`);
        throw e;
    }
});
const write = (file, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        file.writer.write(data);
    }
    catch (e) {
        alert(`Error writing to file: ${e}`);
        throw e;
    }
});
const main = () => {
    const fileChooseButton = document.getElementById('file-choose');
    const writeFileButton = document.getElementById('write');
    const fileContentsTextField = document.getElementById('content');
    let currentFileInfo = undefined;
    fileChooseButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        // close the previous file
        if (currentFileInfo != undefined) {
            currentFileInfo.writer.close();
        }
        currentFileInfo = yield getFileInfo();
        // write to the textarea
        fileContentsTextField.value = 'Loading...';
        fileContentsTextField.readOnly = true;
        fileContentsTextField.value = yield read(currentFileInfo);
        fileContentsTextField.readOnly = false;
    }));
    writeFileButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        if (currentFileInfo === undefined) {
            alert('Error: No file currently opened');
            return;
        }
        yield write(currentFileInfo, fileContentsTextField.value);
    }));
    window.addEventListener('beforeunload', (e) => {
        // close the writer when closing the tab
        if (currentFileInfo === undefined) {
            return;
        }
        currentFileInfo.writer.close();
    });
};
main();
//# sourceMappingURL=script.js.map