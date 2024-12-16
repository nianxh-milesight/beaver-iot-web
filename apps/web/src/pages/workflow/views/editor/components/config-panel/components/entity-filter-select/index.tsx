import { memo, useLayoutEffect } from 'react';
import {
    Select,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    type SelectProps,
} from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    DeleteOutlineIcon,
    AddIcon,
    KeyboardArrowDownIcon,
} from '@milesight/shared/src/components';
import EntitySelect, { type EntitySelectProps } from '../entity-select';
import './style.less';

export type EntityFilterSelectValueType = {
    entityType?: EntityType;
    entityKey?: ApiKey;
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

// const DEFAULT_EMPTY_VALUE: EntityFilterSelectValueType = {
//     label: '',
//     value: '',
// };

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
        defaultValue: [],
    });
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<EntityFilterSelectValueType>(innerValue || []);

    useLayoutEffect(() => {
        if (isEqual(innerValue, list)) return;
        resetList(innerValue || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [innerValue, resetList]);

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
                            value={item.entityType || ''}
                            onChange={e =>
                                replace(index, {
                                    ...item,
                                    entityType: e.target.value as EntityType,
                                })
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
                        value={item.entityKey}
                        filterModel={{
                            type: item.entityType,
                        }}
                        onChange={value => {
                            replace(index, {
                                ...item,
                                entityKey: value,
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
                        insert(list.length, {});
                    }}
                >
                    {getIntlText('common.label.add')}
                </Button>
            )}
        </div>
    );
};

export default memo(EntityFilterSelect);
