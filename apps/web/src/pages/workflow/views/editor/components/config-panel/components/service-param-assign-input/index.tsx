import { useLayoutEffect, useMemo } from 'react';
import { useEntityApi } from '@/plugin/hooks';
import { useStoreShallow } from '@milesight/shared/src/hooks';
import { useControllableValue, useDynamicList } from 'ahooks';
import ParamInputSelect, { type ParamInputSelectProps } from '../param-input-select';
import useConfigPanelStore from '../../store';
import './style.less';

type InputParamListType = {
    key: ApiKey;
    name: ApiKey;
    type: ApiKey;
    value: ParamInputSelectProps['value'];
};
type ServiceParamAssignInputValueType = InputParamListType[];
type ServiceParamAssignInputProps = {
    required?: boolean;
    disabled?: boolean;
    serviceKey?: ApiKey;
    value?: ServiceParamAssignInputValueType;
    defaultValue?: ServiceParamAssignInputValueType;
    onChange?: (value: ServiceParamAssignInputValueType) => void;
};
type EntityItem = {
    entity_key: ApiKey;
    entity_name: ApiKey;
    entity_value_type: ApiKey;
};

const ServiceParamAssignInput: React.FC<ServiceParamAssignInputProps> = ({
    required,
    disabled,
    defaultValue,
    serviceKey,
    ...props
}) => {
    const { getEntityList } = useConfigPanelStore(useStoreShallow(['getEntityList']));
    const { getEntityChildren } = useEntityApi();
    const [innerValue, setInnerValue] =
        useControllableValue<ServiceParamAssignInputValueType>(props);
    const { list, replace, resetList } = useDynamicList<InputParamListType>(innerValue);
    const handlerChange = async (entityKey?: ApiKey) => {
        if (entityKey) {
            const entityFilterList = await getEntityList({ keyword: entityKey as string });
            if (entityFilterList?.length) {
                const entityItem = entityFilterList[0];
                const { error, res } = await getEntityChildren({
                    id: entityItem.entity_id,
                });
                if (!error) {
                    resetList(
                        res.map((item: EntityItem) => {
                            const valueItem = innerValue?.find(
                                innerItem => innerItem.key === item.entity_key,
                            );
                            return {
                                key: item.entity_key,
                                name: item.entity_name,
                                type: item.entity_value_type,
                                value: valueItem?.value ?? '',
                            };
                        }),
                    );
                    return;
                }
            }
        }
        resetList([]);
    };
    const renderInputParam = useMemo(() => {
        if (list.length) {
            return (
                <div className="ms-service-param-assign-input">
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
        setInnerValue(list);
    }, [list]);
    useLayoutEffect(() => {
        handlerChange(serviceKey);
    }, [serviceKey]);
    return <div className="ms-service-entity-call">{renderInputParam}</div>;
};
export default ServiceParamAssignInput;
