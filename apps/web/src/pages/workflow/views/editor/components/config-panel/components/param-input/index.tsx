/**
 * Param Input Component
 *
 * Note: use in TriggerNode, CodeNode
 */

import { useLayoutEffect, useMemo } from 'react';
import {
    Select,
    Button,
    IconButton,
    FormControl,
    MenuItem,
    TextField,
    Switch,
    InputLabel,
    type SelectProps,
    type TextFieldProps,
} from '@mui/material';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import './style.less';

export type ParamInputValueType = {
    arg: string;
    type: string;
    isCheck?: boolean;
};

export interface ParamInputProps {
    required?: boolean;
    disabled?: boolean;
    defaultValue?: ParamInputValueType[];
    showSwitch?: boolean;
    typeSelectProps?: SelectProps;
    nameInputProps?: TextFieldProps;
    maxAddNum?: number;
    value?: ParamInputValueType[];
    onChange?: (value: ParamInputValueType[]) => void;
}

const DEFAULT_EMPTY_VALUE: ParamInputValueType = {
    arg: '',
    type: '',
};
const typeOptions = ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN', 'BINARY'];

const ParamInput: React.FC<ParamInputProps> = ({
    required,
    disabled,
    defaultValue,
    showSwitch,
    typeSelectProps,
    nameInputProps,
    maxAddNum,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [innerValue, setInnerValue] = useControllableValue<ParamInputValueType[]>(props, {
        defaultValue: defaultValue || [],
    });
    const { list, remove, getKey, insert, replace } = useDynamicList<ParamInputValueType>(
        innerValue || [],
    );

    useLayoutEffect(() => {
        setInnerValue?.(list);
    }, [list, setInnerValue]);

    const handlerChange = (
        index: number,
        rowItem: ParamInputValueType,
        key: string,
        value: string | boolean,
    ) => {
        replace(index, { ...rowItem, [key]: value });
    };
    const disabledAdd = useMemo(() => {
        return maxAddNum !== undefined && Number.isInteger(maxAddNum) && list.length >= maxAddNum;
    }, [list]);
    const handlerAdd = () => {
        if (disabledAdd) return;
        insert(list.length, DEFAULT_EMPTY_VALUE);
    };
    return (
        <div className="ms-param-input">
            {list.map((item, index) => (
                <div className="ms-param-input-item" key={getKey(index)}>
                    <FormControl required={required} disabled={disabled}>
                        <TextField
                            label={nameInputProps?.label || getIntlText('common.label.name')}
                            value={item.arg}
                            onChange={e =>
                                handlerChange(index, item, 'arg', e.target.value as string)
                            }
                        />
                    </FormControl>
                    <FormControl required={required} disabled={disabled}>
                        <InputLabel id="param-input-type-label">
                            {typeSelectProps?.label || getIntlText('common.label.type')}
                        </InputLabel>
                        <Select
                            notched
                            labelId="param-input-type-label"
                            label={typeSelectProps?.label || getIntlText('common.label.type')}
                            value={item.type}
                            onChange={e =>
                                handlerChange(index, item, 'type', e.target.value as string)
                            }
                        >
                            {typeOptions.map(item => (
                                <MenuItem key={item} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {showSwitch && (
                        <FormControl
                            className="ms-param-output-switch"
                            required={required}
                            disabled={disabled}
                        >
                            <Switch
                                checked={!!item?.isCheck}
                                onChange={e =>
                                    handlerChange(
                                        index,
                                        item,
                                        'isCheck',
                                        e.target.checked as boolean,
                                    )
                                }
                            />
                            <span className="ms-param-output-switch-label">
                                {getIntlText('workflow.node.trigger_switch_label')}
                            </span>
                        </FormControl>
                    )}
                    <IconButton onClick={() => remove(index)}>
                        <DeleteOutlineIcon />
                    </IconButton>
                </div>
            ))}
            <Button
                fullWidth
                variant="outlined"
                className="ms-param-input-add-btn"
                startIcon={<AddIcon />}
                disabled={disabledAdd}
                onClick={handlerAdd}
            >
                {getIntlText('common.label.add')}
            </Button>
        </div>
    );
};

export default ParamInput;
