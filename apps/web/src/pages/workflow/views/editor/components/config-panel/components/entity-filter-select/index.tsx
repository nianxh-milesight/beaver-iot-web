import { useLayoutEffect } from 'react';
import {
    Select,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    type SelectProps,
} from '@mui/material';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    DeleteOutlineIcon,
    AddIcon,
    KeyboardArrowDownIcon,
} from '@milesight/shared/src/components';
import EntitySelect, { type EntitySelectProps, type EntitySelectValueType } from '../entity-select';
import './style.less';

export type EntityFilterSelectValueType = EntitySelectValueType & {
    type?: EntityType;
};

export interface EntityFilterSelectProps {
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: EntityFilterSelectValueType[];
    onChange?: (value: EntityFilterSelectValueType[]) => void;
    typeSelectProps?: SelectProps;
    entitySelectProps?: EntitySelectProps;
}

const DEFAULT_EMPTY_VALUE: EntityFilterSelectValueType = {
    label: '',
    value: '',
};

const MAX_VALUE_LENGTH = 10;

const entityTypes: EntityType[] = ['PROPERTY', 'EVENT', 'SERVICE'];

/**
 * Entity Filter Select Component
 */
const EntityFilterSelect: React.FC<EntityFilterSelectProps> = ({
    required,
    disabled,
    multiple = true,
    error,
    helperText,
    typeSelectProps,
    entitySelectProps,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [innerValue, setInnerValue] = useControllableValue<EntityFilterSelectValueType[]>(props, {
        defaultValue: [DEFAULT_EMPTY_VALUE],
    });
    const { list, remove, getKey, insert, replace } = useDynamicList<EntityFilterSelectValueType>(
        innerValue || [DEFAULT_EMPTY_VALUE],
    );

    useLayoutEffect(() => {
        setInnerValue?.(list);
    }, [list, setInnerValue]);

    return (
        <div className="ms-entity-filter-select">
            {list.map((item, index) => (
                <div className="ms-entity-filter-select-item" key={getKey(index)}>
                    <FormControl required={required} disabled={disabled}>
                        <InputLabel id="entity-filter-select-type-label">
                            {typeSelectProps?.label || getIntlText('common.label.type')}
                        </InputLabel>
                        <Select<EntityType>
                            notched
                            labelId="entity-filter-select-type-label"
                            label={typeSelectProps?.label || getIntlText('common.label.type')}
                            IconComponent={KeyboardArrowDownIcon}
                            value={item.type || ''}
                            onChange={e =>
                                replace(index, { ...item, type: e.target.value as EntityType })
                            }
                        >
                            {entityTypes.map(type => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <EntitySelect
                        label={entitySelectProps?.label || getIntlText('common.label.target')}
                        required={required}
                        disabled={disabled}
                        value={item}
                        filterModel={{
                            type: item.type,
                        }}
                        onChange={(_, data) => {
                            if (!data) {
                                replace(index, { ...item, ...DEFAULT_EMPTY_VALUE });
                                return;
                            }

                            replace(index, {
                                ...item,
                                ...data,
                            });
                        }}
                    />
                    {list.length > 1 && (
                        <IconButton onClick={() => remove(index)}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    )}
                </div>
            ))}
            {multiple && (
                <Button
                    fullWidth
                    variant="outlined"
                    className="ms-entity-filter-select-add-btn"
                    startIcon={<AddIcon />}
                    disabled={list.length >= MAX_VALUE_LENGTH}
                    onClick={() => {
                        if (list.length >= MAX_VALUE_LENGTH) return;
                        insert(list.length, DEFAULT_EMPTY_VALUE);
                    }}
                >
                    {getIntlText('common.label.add')}
                </Button>
            )}
        </div>
    );
};

export default EntityFilterSelect;
