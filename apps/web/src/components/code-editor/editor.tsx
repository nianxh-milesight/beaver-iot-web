import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useControllableValue } from 'ahooks';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorHeaderComponent, EditorComponent } from './components';
import { useEditorCommand } from './hooks';
import type { EditorSupportLang, EditorProps, EditorHandlers } from './types';
import './style.less';

export const CodeEditor = forwardRef<EditorHandlers, EditorProps>((props, ref) => {
    const {
        title,
        Header: CustomHeader,
        readOnly = false,
        editable = true,
        height,
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

    const cssVariable = useMemo(() => {
        return {
            '--code-mirror-height': height ?? '100%',
        } as React.CSSProperties;
    }, [height]);
    return (
        <div className="ms-code-editor" style={cssVariable}>
            {CustomHeader !== null && (
                <EditorHeaderComponent
                    title={title}
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
                height={height}
            />
        </div>
    );
});

export default React.memo(CodeEditor);
