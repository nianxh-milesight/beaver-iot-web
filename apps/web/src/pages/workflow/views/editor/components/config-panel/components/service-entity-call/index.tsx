import { useLayoutEffect, useMemo } from 'react';
import { useEntityApi } from '@/plugin/hooks';
import { Divider } from '@mui/material';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { useControllableValue, useDynamicList } from 'ahooks';
import EntitySelect, { EntitySelectValueType } from '../entity-select';
import ParamInputSelect, { type ParamInputSelectProps } from '../param-input-select';
import './style.less';
import useConfigPanelStore from '../../store';

type InputParamListType = {
    key: ApiKey;
    name: ApiKey;
    type: ApiKey;
    value: ParamInputSelectProps['value'];
};
type ServiceEntityCallValueType = {
    serviceValue?: EntitySelectValueType;
    paramList?: InputParamListType[];
};
type ServiceEntityCallProps = {
    required?: boolean;
    disabled?: boolean;
    value?: ServiceEntityCallValueType;
    defaultValue?: any;
    onChange?: (value: ServiceEntityCallValueType) => void;
};
type EntityItem = {
    entity_key: ApiKey;
    entity_name: ApiKey;
    entity_value_type: ApiKey;
};

const filterModel: {
    type: EntityType;
} = {
    type: 'SERVICE',
};
const ServiceEntityCall: React.FC<ServiceEntityCallProps> = ({
    required,
    disabled,
    defaultValue,
    ...props
}) => {
    const { getEntityList } = useConfigPanelStore(useStoreShallow(['getEntityList']));
    const { getIntlText } = useI18n();
    const { getEntityChildren } = useEntityApi();
    const [innerValue, setInnerValue] = useControllableValue<ServiceEntityCallValueType>(props, {
        defaultValue: defaultValue || {},
    });
    const { list, replace, resetList } = useDynamicList<InputParamListType>(
        innerValue?.paramList ?? [],
    );
    const handlerChange = async (value: EntitySelectValueType) => {
        const entityFilterList = await getEntityList({ keyword: value as string });
        if (entityFilterList?.length) {
            const entityItem = entityFilterList[0];
            const { error, res } = await getEntityChildren({
                id: entityItem.entity_id,
            });
            if (error) {
                resetList([]);
            } else {
                resetList(
                    res.map((item: EntityItem) => {
                        return {
                            key: item.entity_key,
                            name: item.entity_name,
                            type: item.entity_value_type,
                        };
                    }),
                );
            }
        } else {
            resetList([]);
        }
        setInnerValue(pre => ({ ...pre, serviceValue: value }));
    };
    const renderInputParam = useMemo(() => {
        if (list.length) {
            return (
                <div className="ms-service-entity-call-input">
                    <Divider className="ms-service-entity-call-input-divider" />
                    <span className="ms-service-entity-call-title">
                        {getIntlText('workflow.node.service_call_Input_title')}
                    </span>
                    {list.map((item, index) => {
                        return (
                            <div key={item.key} className="param-item">
                                <div className="param-item-title">
                                    <span className="param-item-name">{item.name}</span>
                                    <span className="param-item-type">{item.type}</span>
                                </div>
                                <ParamInputSelect
                                    required={required}
                                    value={item?.value}
                                    onChange={data => {
                                        replace(index, { ...item, value: data });
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    }, [list]);
    useLayoutEffect(() => {
        setInnerValue(pre => ({ ...pre, paramList: list }));
    }, list);
    return (
        <div className="ms-service-entity-call">
            <span className="ms-service-entity-call-title">
                {getIntlText('workflow.node.service_call_service_title')}
            </span>
            <EntitySelect
                label={getIntlText('common.label.service')}
                required={required}
                disabled={disabled}
                value={innerValue?.serviceValue}
                filterModel={filterModel}
                onChange={data => {
                    handlerChange(data);
                }}
            />
            {renderInputParam}
        </div>
    );
};
export default ServiceEntityCall;
