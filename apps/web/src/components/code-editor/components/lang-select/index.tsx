import React, { useCallback } from 'react';
import { type SelectInputProps } from '@mui/material/Select/SelectInput';
import { ExpandMoreIcon, Select } from '@milesight/shared/src/components';
import { editorLangOptions } from '../../constant';
import type { EditorSupportLang, EditorSelectProps } from '../../types';
import './style.less';

export default React.memo(
    ({ editorLang, onEditorLangChange, renderOptions }: EditorSelectProps) => {
        /** select change callback */
        const handleChange = useCallback<Required<SelectInputProps<EditorSupportLang>>['onChange']>(
            e => {
                const { value } = e.target;
                onEditorLangChange?.(value as EditorSupportLang, e);
            },
            [onEditorLangChange],
        );

        return (
            <Select
                className="ms-header-select"
                value={editorLang}
                onChange={handleChange}
                IconComponent={ExpandMoreIcon}
                renderOptions={renderOptions}
                options={editorLangOptions}
            />
        );
    },
);
