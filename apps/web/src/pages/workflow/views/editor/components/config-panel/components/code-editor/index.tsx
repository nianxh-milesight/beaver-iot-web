import React from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

export type CodeEditorProps = TextFieldProps;

/**
 * Code Editor Component
 *
 * Note: Use in CodeNode, IfelseNode
 */
const CodeEditor: React.FC<CodeEditorProps> = ({ ...props }) => {
    return (
        <TextField
            {...props}
            multiline
            fullWidth
            placeholder="Content"
            rows={5}
            sx={{ margin: 0 }}
        />
    );
};

export default CodeEditor;
