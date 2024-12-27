import React, { useCallback, useMemo, useState, useRef, forwardRef, useLayoutEffect } from 'react';
import {
    Autocomplete,
    TextField,
    MenuItem,
    type AutocompleteProps,
    type AutocompleteRenderInputParams,
} from '@mui/material';
import { useControllableValue, useDebounceFn } from 'ahooks';
import { useI18n, useVirtualList, useStoreShallow } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import { type EntityAPISchema } from '@/services/http';
import useConfigPanelStore, { type EntityFilterParams } from '../../store';
import './style.less';

export type EntitySelectValueType = ApiKey;

export type EntitySelectOptionType = {
    /** Entity Name */
    label: string;
    /** Entity ID */
    value: ApiKey;
    /** Entity Value Type */
    valueType?: string;
    /** Custom Description */
    description?: string;
    rawData?: Omit<
        EntityAPISchema['getList']['response']['content'][number],
        'entity_value_attribute'
    > & {
        entity_value_attribute: string;
    };
};

export interface EntitySelectProps {
    label?: string;

    required?: boolean;

    disabled?: boolean;

    placeholder?: string;

    /**
     * API Filter Model
     */
    filterModel?: Omit<EntityFilterParams, 'keyword'>;

    value?: EntitySelectValueType;

    defaultValue?: EntitySelectValueType;

    onChange?: (value: EntitySelectValueType) => void;
}

/**
 * Virtual List Component
 */
const Listbox = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
    ({ children, ...props }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const list = useMemo(() => {
            const result: React.ReactElement<unknown>[] = [];
            (children as React.ReactElement<unknown>[]).forEach(
                (
                    item: React.ReactElement<unknown> & {
                        children?: React.ReactElement<unknown>[];
                    },
                ) => {
                    result.push(item);
                    result.push(...(item.children || []));
                },
            );

            return result;
        }, [children]);
        const [virtualList] = useVirtualList(list, {
            containerTarget: containerRef,
            wrapperTarget: wrapperRef,
            itemHeight: 58,
            overscan: 5,
        });

        return (
            <div {...props} ref={ref}>
                <div className="ms-entity-select-options-container" ref={containerRef}>
                    <div className="ms-entity-select-options-wrapper" ref={wrapperRef}>
                        {virtualList.map(({ data }) => data)}
                    </div>
                </div>
            </div>
        );
    },
);

/**
 * Entity Select Component
 *
 * Note: This is a basic component, use in EntityListeningNode, ServiceNode, EntitySelectNode
 */
const EntitySelect: React.FC<EntitySelectProps> = ({
    label,
    required,
    disabled,
    placeholder,
    filterModel,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [value, setValue] = useControllableValue<EntitySelectValueType | undefined>(props);

    // ---------- Entity List Data ----------
    const { entityList, getEntityList } = useConfigPanelStore(
        useStoreShallow(['entityList', 'getEntityList']),
    );
    const filteredEntityList = useMemo(() => {
        if (!filterModel) return entityList;

        return entityList?.filter(entity => {
            let { type, valueType, accessMode } = filterModel;

            type = type && (Array.isArray(type) ? type : [type]);
            valueType = valueType && (Array.isArray(valueType) ? valueType : [valueType]);
            accessMode = accessMode && (Array.isArray(accessMode) ? accessMode : [accessMode]);

            return (
                (!type || type.includes(entity.entity_type)) &&
                (!valueType || valueType.includes(entity.entity_value_type)) &&
                (!accessMode || accessMode.includes(entity.entity_access_mod))
            );
        });
    }, [entityList, filterModel]);

    // ---------- Search Entity Data ----------
    const [searchedEntityList, setSearchedEntityList] = useState<typeof entityList>();

    // ---------- Autocomplete Render ----------
    const options = useMemo(() => {
        const list = searchedEntityList || filteredEntityList || [];
        const result: EntitySelectOptionType[] = list.map(item => {
            return {
                label: item.entity_name,
                value: item.entity_key,
                valueType: item.entity_value_type,
                description: [item.device_name, item.integration_name].filter(Boolean).join(', '),
                rawData: item,
            };
        });

        return result;
    }, [filteredEntityList, searchedEntityList]);

    const renderInput = useCallback(
        (params: AutocompleteRenderInputParams) => {
            return (
                <TextField
                    {...params}
                    required={required}
                    label={label !== undefined ? label : getIntlText('common.label.entity')}
                    placeholder={placeholder}
                />
            );
        },
        [label, required, placeholder, getIntlText],
    );

    const renderOption = useCallback<
        NonNullable<
            AutocompleteProps<
                EntitySelectOptionType,
                undefined,
                undefined,
                undefined
            >['renderOption']
        >
    >((optionProps, option) => {
        const { label, value, description } = option || {};

        return (
            <MenuItem {...(optionProps || {})} key={value}>
                <div className="ms-entity-select-item">
                    <div className="ms-entity-select-item__label">
                        <Tooltip autoEllipsis title={label} />
                    </div>
                    <div className="ms-entity-select-item__description">
                        <Tooltip autoEllipsis title={description} />
                    </div>
                </div>
            </MenuItem>
        );
    }, []);

    const { run: handleInputChange } = useDebounceFn<
        NonNullable<
            AutocompleteProps<
                EntitySelectOptionType,
                undefined,
                undefined,
                undefined
            >['onInputChange']
        >
    >(
        async (_, keyword, reason) => {
            if (keyword && reason === 'input') {
                const list = await getEntityList({ ...filterModel, keyword });
                setSearchedEntityList(list);
                return;
            }

            setSearchedEntityList(undefined);
        },
        { wait: 300 },
    );

    // ---------- Autocomplete Inner Value ----------
    const [innerValue, setInnerValue] = useState<EntitySelectOptionType | null>(null);
    useLayoutEffect(() => {
        const option = options.find(item => item.value === value);
        setInnerValue(option || null);
    }, [value, options]);

    return (
        <Autocomplete<EntitySelectOptionType, undefined, undefined, undefined>
            value={innerValue}
            disabled={disabled}
            options={options}
            renderInput={renderInput}
            renderOption={renderOption}
            filterOptions={x => x}
            isOptionEqualToValue={(option, currentVal) => option.value === currentVal.value}
            slotProps={{
                listbox: { component: Listbox },
                popper: {
                    sx: { minWidth: 300 },
                    placement: 'bottom-end',
                },
            }}
            popupIcon={<KeyboardArrowDownIcon />}
            onInputChange={handleInputChange}
            onChange={(_, data) => {
                setValue(data?.value);
            }}
        />
    );
};

export default React.memo(EntitySelect);
