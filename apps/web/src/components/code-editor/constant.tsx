import type { EditorSupportLang } from './types';

/** Editor language options */
export const editorLangOptions: {
    lang: EditorSupportLang;
    label: string;
}[] = [
    {
        lang: 'javascript',
        label: 'JavaScript',
    },
    {
        lang: 'python',
        label: 'Python',
    },
    {
        lang: 'json',
        label: 'JSON',
    },
    {
        lang: 'yaml',
        label: 'YAML',
    },
    {
        lang: 'groovy',
        label: 'Groovy',
    },
    {
        lang: 'mvel',
        label: 'mvel',
    },
    {
        lang: 'markdown',
        label: 'Markdown',
    },
    {
        lang: 'text',
        label: 'Text',
    },
];

/** Common editor header class name  */
export const COMMON_EDITOR_HEADER_CLASS = 'ms-code-editor-header';
