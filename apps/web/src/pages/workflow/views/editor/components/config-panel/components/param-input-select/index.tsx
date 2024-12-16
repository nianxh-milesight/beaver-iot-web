import { useEffect, useLayoutEffect, useState } from 'react';
import { useControllableValue } from 'ahooks';
import { Autocomplete, TextField, MenuItem, type AutocompleteProps } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { SettingsOutlinedIcon } from '@milesight/shared/src/components';
import useWorkflow from '@/pages/workflow/views/editor/hooks/useWorkflow';
import './style.less';

type ParamInputSelectValueType = {
    type: 'custom' | 'reference';
    value?: string;
};

type OptionItemType = {
    nodeId: ApiKey;
    nodeName: string;
    nodeType: WorkflowNodeType;
    outputs: {
        name: string;
        type: string;
        key: string;
    }[];
};

export interface ParamInputSelectProps {
    label?: string;

    required?: boolean;

    disabled?: boolean;

    /**
     * Param Select Placeholder
     */
    placeholder?: string;

    value?: ParamInputSelectValueType;

    defaultValue?: ParamInputSelectValueType;

    onChange?: (value: ParamInputSelectValueType) => void;

    /**
     * Autocomplete Props
     */
    autocompleteProps?: Omit<
        AutocompleteProps<ParamInputSelectValueType, false, false, true>,
        'options' | 'renderInput'
    >;
}

/**
 * Param Input Select Component
 *
 * Note: This is a basic component., use in CodeNode, ServiceNode, EntityAssignmentNode
 *
 * TODO: render nodes params
 */
const ParamSelect: React.FC<ParamInputSelectProps> = ({
    label,
    required,
    disabled,
    placeholder,
    autocompleteProps,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [value, setValue] = useControllableValue<ParamInputSelectValueType>(props);
    const [popperOpen, setPopperOpen] = useState<boolean | undefined>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [innerValue, setInnerValue] = useState<string>('');

    useLayoutEffect(() => {
        if (value?.type === 'custom') {
            setInputValue(value?.value || '');
        } else if (value?.type === 'reference') {
            setInnerValue(value?.value || '');
        }
    }, [value]);

    return (
        <div className="ms-param-input-select">
            <Autocomplete
                freeSolo
                forcePopupIcon
                defaultValue=""
                open={popperOpen}
                onClose={() => setPopperOpen(false)}
                value={innerValue}
                onChange={(_, value) => {
                    setValue({ type: 'reference', value: value || '' });
                }}
                onInputChange={(e, value) => {
                    setValue({ type: 'custom', value });
                }}
                options={['111', '222', '333']}
                renderInput={params => (
                    <TextField
                        {...params}
                        label={label || getIntlText('common.label.value')}
                        placeholder={
                            placeholder ||
                            getIntlText('workflow.editor.form_param_select_placeholder')
                        }
                    />
                )}
                filterOptions={options => options}
                popupIcon={<SettingsOutlinedIcon />}
                slotProps={{
                    popupIndicator: {
                        onClick() {
                            setPopperOpen(true);
                        },
                    },
                }}
            />
        </div>
    );
};

export default ParamSelect;
