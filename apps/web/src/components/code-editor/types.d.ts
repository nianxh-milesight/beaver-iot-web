import { ReactCodeMirrorProps } from '@uiw/react-codemirror';

/** Supported languages for the code editor. */
export type EditorSupportLang = 'groovy' | 'javascript' | 'python' | 'mvel' | 'json' | 'yaml';

/** Props for the code editor component. */
export interface EditorProps extends EditorContentProps {
    /** The programming language used in the editor. */
    editorLang?: EditorSupportLang;
    /**
     * Callback function triggered when the language changes.
     * @param value - The new language value.
     */
    onLangChange?: (value: string) => void;

    /** The content value of the editor. */
    value?: string;
    /**
     * Callback function triggered when the content value changes.
     * @param value - The new content value.
     */
    onValueChange?: (value: string) => void;

    /** Props for the editor toolbar header. */
    header?: EditorToolbarProps | null;
    /** Customize supported languages */
    supportLangs?: EditorSupportLang[];
}

/** Code Editor Header Props */
export interface EditorToolbarProps {
    /** The title displayed in the toolbar. */
    title?: React.ReactNode;
    /** The icon displayed in the toolbar. */
    icon?: React.ReactNode;
}

/** Props for the code editor content. */
export interface EditorContentProps extends ReactCodeMirrorProps {
    /** Whether to show line numbers in the editor. */
    showLineNumber?: boolean;
    /** Whether to enable code folding in the editor. */
    showFold?: boolean;
    /** The font size used in the editor. */
    fontSize?: number;
}
