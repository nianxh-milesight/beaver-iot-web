import { useMemo } from 'react';
import { useTheme } from '@milesight/shared/src/hooks';
import { vscodeDarkInit, vscodeLightInit } from '@uiw/codemirror-theme-vscode';
import { type EditorProps } from '../types';

export const useEditorTheme = ({
    fontSize = 18,
    themeBgColor,
}: Pick<EditorProps, 'fontSize'> & { themeBgColor?: string }) => {
    const { theme, getCSSVariableValue } = useTheme();

    /** editor theme */
    const editorTheme = useMemo(() => {
        const vscodeThemeInit = theme === 'dark' ? vscodeDarkInit : vscodeLightInit;

        return vscodeThemeInit({
            settings: {
                gutterBorder: themeBgColor,
                gutterBackground: themeBgColor,
                background: themeBgColor,
                gutterForeground: getCSSVariableValue('--text-color-tertiary'),
                lineHighlight: 'transparent',
                fontSize: `${fontSize}`,
            },
        });
    }, [theme, themeBgColor, getCSSVariableValue, fontSize]);

    return {
        editorTheme,
    };
};
