import React, { useCallback, useMemo } from 'react';
import cls from 'classnames';
import CodeMirror from '@uiw/react-codemirror';
// support language
import { yaml } from '@codemirror/lang-yaml';
import { json } from '@codemirror/lang-json';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
// extension language
import { StreamLanguage } from '@codemirror/language';
import { groovy } from '@codemirror/legacy-modes/mode/groovy';

import { useEditorTheme } from '../../hooks';
import { EditorContentProps, type EditorSupportLang } from '../../types';
import './style.less';

interface IProps extends EditorContentProps {
    editorLang?: EditorSupportLang;
    editorValue: string;
    setEditorValue: (value: string) => void;
}
export default React.memo(
    ({
        showLineNumber = true,
        showFold = true,
        editable = true,
        readOnly = false,
        editorLang,
        editorValue,
        fontSize,
        setEditorValue,
        ...rest
    }: IProps) => {
        const { editorTheme } = useEditorTheme({ fontSize });

        /** editor input change callback */
        const onInputChange = useCallback(
            (value: string) => {
                setEditorValue(value);
            },
            [setEditorValue],
        );

        /** Select the corresponding extension based on the language */
        const extensions = useMemo(() => {
            switch (editorLang) {
                case 'yaml':
                    return [yaml()];
                case 'json':
                    return [json()];
                case 'mvel':
                    // The mvel language is similar to java, which is used here for highlighting
                    return [java()];
                case 'python':
                    return [python()];
                case 'javascript':
                    return [javascript()];
                case 'groovy':
                    return [StreamLanguage.define(groovy)];
                default:
                    return [];
            }
        }, [editorLang]);

        return (
            <CodeMirror
                {...rest}
                className={cls('ms-code-editor-content', {
                    [`ms-editor__lineNumbers--hide`]: !showLineNumber,
                    [`ms-editor__foldGutter--hide`]: !showFold,
                })}
                value={editorValue}
                extensions={extensions}
                onChange={onInputChange}
                theme={editorTheme}
                readOnly={readOnly}
                editable={editable}
            />
        );
    },
);
