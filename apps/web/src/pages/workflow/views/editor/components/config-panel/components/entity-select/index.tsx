import React, { useCallback, useMemo, useRef, forwardRef } from 'react';
import { useRequest } from 'ahooks';
import {
    Autocomplete,
    TextField,
    MenuItem,
    type AutocompleteProps,
    type AutocompleteRenderInputParams,
} from '@mui/material';
import { useI18n, useVirtualList } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type EntityAPISchema,
} from '@/services/http';
import './style.less';

export type EntitySelectValueType = {
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
        entity_value_attribute: EntityValueAttributeType;
    };
};

export interface EntitySelectProps<
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
> extends Omit<
        AutocompleteProps<EntitySelectValueType, Multiple, DisableClearable, FreeSolo>,
        'loading' | 'options' | 'renderInput'
    > {
    label?: string;

    required?: boolean;

    /**
     * API Filter Model
     */
    filterModel?: {
        /** Search Keyword */
        keyword?: string;
        /** Entity Type */
        type?: EntityType | EntityType[];
        /** Entity Value Type */
        valueType?: EntityValueDataType | EntityValueDataType[];
        /** Entity Access Mode */
        accessMode?: EntityAccessMode | EntityAccessMode[];
        /** Exclude Children */
        excludeChildren?: boolean;
    };
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
            overscan: 10,
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
const EntitySelect: React.FC<EntitySelectProps> = ({ label, required, filterModel, ...props }) => {
    const { getIntlText } = useI18n();
    const {
        loading,
        data: entityList,
        run: getEntityList,
    } = useRequest(
        async (keyword?: string) => {
            const entityType =
                filterModel?.type &&
                (Array.isArray(filterModel.type) ? filterModel.type : [filterModel.type]);
            const valueType =
                filterModel?.valueType &&
                (Array.isArray(filterModel.valueType)
                    ? filterModel.valueType
                    : [filterModel.valueType]);
            const accessMode =
                filterModel?.accessMode &&
                (Array.isArray(filterModel.accessMode)
                    ? filterModel.accessMode
                    : [filterModel.accessMode]);
            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword,
                    entity_type: entityType,
                    entity_value_type: valueType,
                    entity_access_mod: accessMode,
                    exclude_children: filterModel?.excludeChildren,
                    page_number: 1,
                    page_size: 999,
                }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp)!;
            return data?.content || [];
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [filterModel],
        },
    );
    const options = useMemo(() => {
        if (!entityList?.length) return [];
        const result: EntitySelectValueType[] = entityList.map(item => {
            const entityValueAttribute = (() => {
                try {
                    return JSON.parse(item.entity_value_attribute);
                } catch (e) {
                    return item.entity_value_attribute;
                }
            })();
            return {
                label: item.entity_name,
                value: item.entity_id,
                valueType: item.entity_value_type,
                description: [item.device_name, item.integration_name].filter(Boolean).join(', '),
                rawData: {
                    ...item,
                    entity_value_attribute: entityValueAttribute as EntityValueAttributeType,
                },
            };
        });

        return result;
    }, [entityList]);

    const renderInput = useCallback(
        (params: AutocompleteRenderInputParams) => {
            return (
                <TextField
                    {...params}
                    required={required}
                    label={label || getIntlText('common.label.entity')}
                />
            );
        },
        [label, required, getIntlText],
    );

    const renderOption = useCallback<NonNullable<EntitySelectProps['renderOption']>>(
        (optionProps, option) => {
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
        },
        [],
    );

    return (
        <Autocomplete
            {...props}
            loading={loading}
            options={options}
            renderInput={renderInput}
            renderOption={renderOption}
            filterOptions={x => x}
            isOptionEqualToValue={(option, currentVal) => option.value === currentVal.value}
            slotProps={{
                listbox: { component: Listbox },
            }}
            onInputChange={(_, keyword, reason) => {
                if (reason !== 'input') {
                    getEntityList();
                    return;
                }

                getEntityList(keyword);
            }}
            onOpen={() => getEntityList()}
        />
    );
};

export default React.memo(EntitySelect);
