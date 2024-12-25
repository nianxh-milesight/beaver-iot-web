import React, { useLayoutEffect } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import ParamInputSelect from '../param-input-select';
import './style.less';

export type ParamAssignInputValueType =
    | undefined
    | {
          key?: string;
          ref?: string;
          value?: string;
      };

export interface ParamAssignInputProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: ParamAssignInputValueType[];
    defaultValue?: ParamAssignInputValueType[];
    onChange?: (value: ParamAssignInputValueType[]) => void;
}

const MAX_VALUE_LENGTH = 10;

/**
 * Param Assignment Input Component
 *
 * Note: use in CodeNode
 */
const ParamAssignInput: React.FC<ParamAssignInputProps> = ({
    label,
    required = true,
    multiple = true,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<ParamAssignInputValueType[]>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<ParamAssignInputValueType>(data);

    useLayoutEffect(() => {
        if (isEqual(data, list)) return;
        resetList(data || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useLayoutEffect(() => {
        setData?.(list);
    }, [list, setData]);

    return (
        <div className="ms-param-assign-input">
            {list.map((item, index) => (
                <div className="ms-param-assign-input-item" key={getKey(index)}>
                    <TextField
                        autoComplete="off"
                        label={label?.[0] || getIntlText('common.label.name')}
                        required={required}
                        value={item?.key || ''}
                        onChange={e => replace(index, { ...item, key: e.target.value })}
                    />
                    <ParamInputSelect
                        label={label?.[1]}
                        required={required}
                        value={{ ref: item?.ref, value: item?.value }}
                        onChange={data => {
                            replace(index, { key: item?.key, ...data });
                        }}
                    />
                    <IconButton onClick={() => remove(index)}>
                        <DeleteOutlineIcon />
                    </IconButton>
                </div>
            ))}
            {multiple && (
                <Button
                    fullWidth
                    variant="outlined"
                    className="ms-param-assign-input-add-btn"
                    startIcon={<AddIcon />}
                    disabled={list.length >= MAX_VALUE_LENGTH}
                    onClick={() => {
                        if (list.length >= MAX_VALUE_LENGTH) return;
                        insert(list.length, {});
                    }}
                >
                    {getIntlText('common.label.add')}
                </Button>
            )}
        </div>
    );
};

export default ParamAssignInput;
