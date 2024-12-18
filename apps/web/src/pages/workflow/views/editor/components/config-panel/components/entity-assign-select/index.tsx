import React, { useLayoutEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { DeleteOutlineIcon, AddIcon } from '@milesight/shared/src/components';
import EntitySelect from '../entity-select';
import ParamInputSelect from '../param-input-select';
import './style.less';

export type EntityAssignInputValueType =
    | undefined
    | {
          entityKey?: ApiKey;
          ref?: string;
          value?: string;
      };

export interface EntityAssignSelectProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: EntityAssignInputValueType[];
    defaultValue?: EntityAssignInputValueType[];
    onChange?: (value: EntityAssignInputValueType[]) => void;
}

const MAX_VALUE_LENGTH = 10;

/**
 * Entity Assignment Input Component
 *
 * Note: use in EntityAssignmentNode
 */
const EntityAssignSelect: React.FC<EntityAssignSelectProps> = ({
    label,
    required = true,
    multiple = true,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<EntityAssignInputValueType[]>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<EntityAssignInputValueType>(data || []);

    useLayoutEffect(() => {
        if (isEqual(data, list)) return;
        resetList(data || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useLayoutEffect(() => {
        setData?.(list);
    }, [list, setData]);

    return (
        <div className="ms-entity-assign-select">
            {list.map((item, index) => (
                <div className="ms-entity-assign-select-item" key={getKey(index)}>
                    <EntitySelect
                        value={item?.entityKey}
                        onChange={value => {
                            replace(index, { ...item, entityKey: value });
                        }}
                    />
                    <ParamInputSelect
                        value={{ ref: item?.ref, value: item?.value }}
                        onChange={data => {
                            replace(index, { entityKey: item?.entityKey, ...data });
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
                    className="ms-entity-assign-select-add-btn"
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

export default EntityAssignSelect;
