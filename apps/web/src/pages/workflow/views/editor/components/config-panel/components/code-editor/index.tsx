import React from 'react';
import { CodeEditor as CodeMirror, type EditorProps } from '@/components';
import './style.less';

/**
 * Code Editor Component
 *
 * Note: Use in CodeNode, IfelseNode
 */
const CodeEditor: React.FC<EditorProps> = ({ value, onChange }) => {
    return (
        <CodeMirror
            value={value}
            onChange={onChange}
            height="200px"
            defaultEditorLang="javascript"
        />
    );
};

export default CodeEditor;
