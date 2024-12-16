import React from 'react';
import { useControllableValue } from 'ahooks';
import { EditorComponent, EditorHeader } from './components';
import type { EditorSupportLang, EditorProps } from './types';
import './style.less';

export default React.memo((props: EditorProps) => {
    const { header, supportLangs, ...rest } = props;
    const [editorLang, setEditorLang] = useControllableValue<EditorSupportLang>(props, {
        valuePropName: 'editorLang',
        trigger: 'onLangChange',
    });
    const [editorValue, setEditorValue] = useControllableValue<string>(props, {
        valuePropName: 'value',
        trigger: 'onValueChange',
    });

    return (
        <div className="ms-code-editor">
            {header === null ? null : (
                <EditorHeader
                    editorLang={editorLang}
                    editorValue={editorValue}
                    setEditorLang={setEditorLang}
                    header={header!}
                    supportLangs={supportLangs}
                />
            )}
            <EditorComponent
                {...rest}
                editorLang={editorLang}
                editorValue={editorValue}
                setEditorValue={setEditorValue}
            />
        </div>
    );
});
