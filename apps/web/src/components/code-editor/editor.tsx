import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useControllableValue } from 'ahooks';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorHeaderComponent, EditorComponent } from './components';
import { useEditorCommand } from './hooks';
import type { EditorSupportLang, EditorProps, EditorHandlers } from './types';
import './style.less';

export const CodeEditor = forwardRef<EditorHandlers, EditorProps>((props, ref) => {
    const {
        Header: CustomHeader,
        readOnly = false,
        editable = true,
        renderHeader,
        ...rest
    } = props;
    const editorInstanceRef = useRef<ReactCodeMirrorRef>(null);

    const [editorLang, setEditorLang] = useControllableValue<EditorSupportLang>(props, {
        defaultValuePropName: 'defaultEditorLang',
        valuePropName: 'editorLang',
        trigger: 'onLangChange',
    });
    const [editorValue, setEditorValue] = useControllableValue<string>(props, {
        defaultValuePropName: 'defaultValue',
        valuePropName: 'value',
        trigger: 'onChange',
    });

    const { handlers } = useEditorCommand({ editorInstanceRef, readOnly, editable });
    /** Methods exposed to external components */
    useImperativeHandle(ref, () => handlers);

    return (
        <div className="ms-code-editor">
            {CustomHeader !== null && (
                <EditorHeaderComponent
                    editorHandlers={handlers}
                    editorLang={editorLang}
                    editorValue={editorValue}
                    setEditorLang={setEditorLang}
                    readOnly={readOnly}
                    editable={editable}
                    renderHeader={renderHeader}
                />
            )}
            <EditorComponent
                {...rest}
                ref={editorInstanceRef}
                editorLang={editorLang}
                editorValue={editorValue}
                setEditorValue={setEditorValue}
                readOnly={readOnly}
                editable={editable}
            />
        </div>
    );
});

export default React.memo(CodeEditor);
