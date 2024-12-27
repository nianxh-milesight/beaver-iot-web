import { useMemo, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useControllableValue, useSize } from 'ahooks';
import { TextField, Menu, MenuItem, IconButton, Chip, ListSubheader } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { SettingsOutlinedIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import useWorkflow from '@/pages/workflow/views/editor/hooks/useWorkflow';
import { isRefParamKey } from '@/pages/workflow/views/editor/helper';
import './style.less';

type ParamInputSelectValueType = string | undefined;

type OptionItemType = {
    nodeId: ApiKey;
    nodeName?: string;
    nodeType?: WorkflowNodeType;
    valueName?: string;
    valueType?: string;
    valueKey?: string;
};

export interface ParamInputSelectProps {
    label?: string;

    required?: boolean;

    /**
     * Param Select Placeholder
     */
    placeholder?: string;

    value?: ParamInputSelectValueType;

    defaultValue?: ParamInputSelectValueType;

    onChange?: (value: ParamInputSelectValueType) => void;
}

/**
 * Param Input Select Component
 *
 * Note: This is a basic component., use in CodeNode, ServiceNode, EntityAssignmentNode
 */
const ParamInputSelect: React.FC<ParamInputSelectProps> = ({
    label,
    required = true,
    placeholder,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { getUpstreamNodeParams } = useWorkflow();
    const containerRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useControllableValue<ParamInputSelectValueType>(props);
    const [inputValue, setInputValue] = useState<string>('');
    const [selectValue, setSelectValue] = useState<OptionItemType>();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { width: containerWidth } = useSize(containerRef) || {};

    const [options, renderedOptions] = useMemo(() => {
        const [nodeParams] = getUpstreamNodeParams();
        const result = nodeParams?.reduce((acc, param) => {
            param.outputs?.forEach(output => {
                acc.push({
                    nodeId: param.nodeId,
                    nodeName: param.nodeName,
                    nodeType: param.nodeType,
                    valueName: output.name,
                    valueType: output.type,
                    valueKey: output.key,
                });
            });
            return acc;
        }, [] as OptionItemType[]);

        // TODO: render Empty component when the options is empty
        const renderedOptions = nodeParams?.reduce((acc, node) => {
            acc.push(
                <ListSubheader key={node.nodeId} className="ms-param-input-select-option-groupname">
                    {node.nodeType}
                </ListSubheader>,
            );

            node.outputs.forEach(output => {
                acc.push(
                    <MenuItem
                        className="ms-param-input-select-option"
                        key={output.key}
                        selected={
                            node.nodeId === selectValue?.nodeId &&
                            output.key === selectValue?.valueKey
                        }
                        onClick={() => {
                            setAnchorEl(null);
                            setData(output.key);
                        }}
                    >
                        <div className="ms-param-input-select-item">
                            <Tooltip autoEllipsis className="name" title={output.name} />
                            <span className="type">{output.type}</span>
                        </div>
                    </MenuItem>,
                );
            });
            return acc;
        }, [] as React.ReactNode[]);

        return [result, renderedOptions];
    }, [selectValue, getUpstreamNodeParams, setData]);

    const handleInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => {
            const { value } = e.target;

            // input value
            if (!isRefParamKey(value)) {
                setData(value);
                return;
            }

            // Reference to an entity
            setInputValue('');
            const option = options?.find(item => item.valueKey === value);

            if (!option) return;
            setData(value);
            setSelectValue(option);
        },
        [options, setData],
    );

    useLayoutEffect(() => {
        // Direct input value
        if (!isRefParamKey(data)) {
            setInputValue(data || '');
            setSelectValue(undefined);
            return;
        }

        // Reference to an entity
        setInputValue('');
        const option = options?.find(item => item.valueKey === data);

        setSelectValue(val => {
            if (val && val.valueKey === data) {
                return val;
            }
            return option;
        });
    }, [data, options]);

    return (
        <div className="ms-param-input-select" ref={containerRef}>
            <TextField
                fullWidth
                autoComplete="off"
                label={label || getIntlText('common.label.value')}
                required={required}
                placeholder={
                    selectValue
                        ? ''
                        : placeholder ||
                          getIntlText('workflow.editor.form_param_select_placeholder')
                }
                slotProps={{
                    input: {
                        readOnly: !!selectValue,
                        endAdornment: (
                            <IconButton onClick={() => setAnchorEl(containerRef.current)}>
                                <SettingsOutlinedIcon />
                            </IconButton>
                        ),
                    },
                }}
                value={inputValue}
                onChange={handleInputChange}
            />
            {!!selectValue && (
                <Chip
                    className="ms-param-input-select-chip"
                    label={
                        <>
                            <Tooltip autoEllipsis className="name" title={selectValue.valueName} />
                            <span className="type">{selectValue.valueType}</span>
                        </>
                    }
                    onDelete={() => setData(undefined)}
                />
            )}
            <Menu
                className="ms-param-input-select-menu"
                open={!!anchorEl}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClose={() => setAnchorEl(null)}
                sx={{
                    '& .MuiList-root': {
                        width: containerWidth,
                        minWidth: 300,
                        maxHeight: 420,
                    },
                }}
            >
                {renderedOptions}
            </Menu>
        </div>
    );
};

export default ParamInputSelect;
