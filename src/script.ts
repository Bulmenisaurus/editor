// https://developer.mozilla.org/en-US/docs/Web/API/File_System_API

import { EditorState } from '@codemirror/state';
import {
    EditorView,
    drawSelection,
    dropCursor,
    highlightActiveLine,
    highlightActiveLineGutter,
    keymap,
    lineNumbers,
    placeholder,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import {
    syntaxHighlighting,
    defaultHighlightStyle,
    bracketMatching,
    indentOnInput,
    foldKeymap,
} from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

const DUMMY_WRITABLE = {
    async close() {
        console.log('closing...');
        // noop
    },

    async write(data: string) {
        console.log(`Writing data:`);
        console.log(data);
    },
} as FileSystemWritableFileStream;

const DUMMY_FILE = {
    async text() {
        console.log('reading');
        return 'file_text';
    },
} as File;

const DUMMY_HANDLE = {
    async createWritable() {
        return DUMMY_WRITABLE;
    },

    async getFile() {
        return DUMMY_FILE;
    },
} as FileHandle;

const DEBUG = new URL(window.location.toString()).searchParams.has('debug');

type FileHandle = FileSystemHandle & {
    getFile: () => Promise<File>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
};

type FileInfo = { handle: FileHandle; writer: FileSystemWritableFileStream };

const getFileInfo = async (): Promise<FileInfo> => {
    if (DEBUG) return { handle: DUMMY_HANDLE, writer: DUMMY_WRITABLE };

    // @ts-ignore
    const [fileHandle] = (await window.showOpenFilePicker()) as FileHandle[];
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
    const codeMirrorContainer = document.getElementById('codemirror-container') as HTMLDivElement;

    let startState = EditorState.create({
        extensions: [
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            lineNumbers(),
            javascript(),
            drawSelection(),
            bracketMatching(),
            highlightActiveLine(),
            history(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            highlightSelectionMatches(),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap,
            ]),
            placeholder('Select a file to get started'),
        ],
    });

    let view = new EditorView({
        state: startState,
        parent: codeMirrorContainer,
    });

    let currentFileInfo: FileInfo | undefined = undefined;

    fileChooseButton.addEventListener('click', async () => {
        // close the previous file
        if (currentFileInfo != undefined) {
            currentFileInfo.writer.close();
        }

        currentFileInfo = await getFileInfo();

        // write to the textarea

        const newValue = await read(currentFileInfo);

        const docString = view.state.doc.toString();
        const setValueTransaction = view.state.update({
            changes: { from: 0, to: docString.length, insert: newValue },
        });
        view.dispatch(setValueTransaction);
    });

    writeFileButton.addEventListener('click', async () => {
        if (currentFileInfo === undefined) {
            alert('Error: No file currently opened');
            return;
        }
        await write(currentFileInfo, view.state.doc.toString());
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
