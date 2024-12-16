import React, { useCallback, useMemo } from 'react';
import { MenuItem, Select } from '@mui/material';
import { type SelectInputProps } from '@mui/material/Select/SelectInput';
import { ContentCopyIcon, ExpandMoreIcon } from '@milesight/shared/src/components';
import { useCopy } from '@milesight/shared/src/hooks';
import { editorLangOptions } from '../../constant';
import { type EditorSupportLang, EditorProps } from '../../types';
import './style.less';

interface IProps extends Pick<EditorProps, 'header' | 'supportLangs'> {
    editorValue: string;
    editorLang?: EditorSupportLang;
    setEditorLang: (lang: EditorSupportLang) => void;
}
export default React.memo(
    ({ editorValue, editorLang, setEditorLang, header, supportLangs }: IProps) => {
        const { icon, title } = header || {};
        const { handleCopy } = useCopy();

        /** select change callback */
        const handleChange = useCallback<Required<SelectInputProps<EditorSupportLang>>['onChange']>(
            e => {
                const { value } = e.target;
                setEditorLang(value as EditorSupportLang);
            },
            [setEditorLang],
        );

        /** copy button callback */
        const handleCopyIcon = useCallback(() => {
            handleCopy?.(editorValue);
        }, [editorValue, handleCopy]);

        /** custom select options */
        const customEditorLangOptions = useMemo(() => {
            if (!supportLangs?.length) return editorLangOptions;

            return editorLangOptions.filter(item => supportLangs.includes(item.lang));
        }, [supportLangs]);

        return (
            <div className="ms-code-editor-header">
                {title || (
                    <Select
                        className="ms-header-select"
                        value={editorLang}
                        onChange={handleChange}
                        IconComponent={ExpandMoreIcon}
                    >
                        {customEditorLangOptions.map(({ label, lang }) => (
                            <MenuItem key={lang} value={lang}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                )}
                {icon || (
                    <div className="ms-header-action">
                        <ContentCopyIcon onClick={handleCopyIcon} />
                    </div>
                )}
            </div>
        );
    },
);
