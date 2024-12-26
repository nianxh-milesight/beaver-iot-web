import { useMemo, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';
import {
    isEmpty,
    isRangeValue,
    isMinLength,
    isMaxLength,
    isURL,
} from '@milesight/shared/src/utils/validators';
import useFlowStore from '../store';

type NodeDataValidator<T = any> = (value?: T, fieldName?: string) => string | boolean | undefined;

type CheckOptions = {
    /**
     * When a rule fails validation, should the validation of the remaining rules be stopped
     */
    validateFirst?: boolean;
};

export type NodesDataValidResult = Record<
    string,
    {
        type: WorkflowNodeType;
        label?: string;
        name?: string;
        status: WorkflowNodeStatus;
        errMsgs: string[];
    }
>;

enum ErrorIntlKey {
    required = 'workflow.valid.required',
    rangeLength = 'workflow.valid.range_length',
    minLength = 'workflow.valid.min_length',
    maxLength = 'workflow.valid.max_length',
}

export const NODE_VALIDATE_TOAST_KEY = 'node-validate';

const useValidate = () => {
    const { getIntlText } = useI18n();
    const { getNodes, getEdges } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const nodeConfigs = useFlowStore(state => state.nodeConfigs);

    const dataValidators = useMemo(() => {
        const checkRequired: NodeDataValidator = (value?: any, fieldName?: string) => {
            if (!isEmpty(value)) {
                return true;
            }
            const message = getIntlText(ErrorIntlKey.required, { 1: fieldName });
            return message;
        };
        const genMaxLengthValidator = (maxLength: number): NodeDataValidator => {
            return (value, fieldName) => {
                if (value && !isMaxLength(value, maxLength)) {
                    const message = getIntlText(ErrorIntlKey.maxLength, {
                        1: fieldName,
                        2: maxLength,
                    });
                    return message;
                }
                return true;
            };
        };
        const result: Record<string, Record<string, NodeDataValidator>> = {
            nodeName: {
                checkRequired,
                checkRangeLength(value) {
                    if (!isRangeValue(value, 1, 50)) return true;

                    const message = getIntlText(ErrorIntlKey.rangeLength, {
                        1: getIntlText('common.label.name'),
                    });
                    return message;
                },
            },
            nodeRemark: {
                checkRangeLength(value) {
                    if (!isEmpty(value) || !isRangeValue(value, 1, 1000)) return true;

                    const message = getIntlText(ErrorIntlKey.rangeLength, {
                        1: getIntlText('common.label.remark'),
                    });
                    return message;
                },
            },
            // Check listener.entities, select.entities
            entities: {
                checkRequired(
                    value: NonNullable<ListenerNodeDataType['parameters']>['entities'],
                    fieldName?: string,
                ) {
                    if (value?.length && value.some(item => !isEmpty(item))) {
                        return true;
                    }
                    const message = getIntlText(ErrorIntlKey.required, { 1: fieldName });
                    return message;
                },
            },
            // Check code.inputArguments and webhook.inputArguments
            inputArguments: {
                checkMaxLength(
                    value: NonNullable<CodeNodeDataType['parameters']>['inputArguments'],
                    fieldName,
                ) {
                    return true;
                },
            },
            'trigger.entityConfigs': {
                checkRequired(
                    value?: NonNullable<TriggerNodeDataType['parameters']>['entityConfigs'],
                    fieldName?: string,
                ) {
                    if (
                        value?.length &&
                        value.every(item => Object.values(item).every(it => !!it))
                    ) {
                        return true;
                    }
                    const message = getIntlText(ErrorIntlKey.required, { 1: fieldName });
                    return message;
                },
                // checkType(value, fieldName) {
                //     return true;
                // },
            },
            'timer.timerSettings': {
                checkRequired(
                    value?: NonNullable<TimerNodeDataType['parameters']>['timerSettings'],
                    fieldName?: string,
                ) {
                    switch (value?.type) {
                        case 'ONCE':
                            if (value.timezone && value.executionEpochSecond) {
                                return true;
                            }
                            break;
                        case 'SCHEDULE':
                            if (
                                value.timezone &&
                                value.expirationEpochSecond &&
                                value.rules?.length &&
                                value.rules.every(
                                    rule =>
                                        !isEmpty(rule.hour) &&
                                        !isEmpty(rule.minute) &&
                                        rule.daysOfWeek?.length,
                                )
                            ) {
                                return true;
                            }
                            break;
                        default:
                            break;
                    }

                    const message = getIntlText(ErrorIntlKey.required, { 1: fieldName });
                    return message;
                },
            },
            'ifelse.choice': {
                checkRequired(
                    value: NonNullable<IfElseNodeDataType['parameters']>['choice'],
                    fieldName,
                ) {
                    return true;
                },
            },
            'code.expression': {
                // checkRequired() {},
            },
            'code.Payload': {
                checkMaxLength(
                    value: NonNullable<CodeNodeDataType['parameters']>['Payload'],
                    fieldName,
                ) {
                    return true;
                },
            },
            'service.serviceInvocationSetting': {},
            'assigner.exchangePayload': {},
            'email.emailConfig': {
                checkRequired(
                    value: NonNullable<EmailNodeDataType['parameters']>['emailConfig'],
                    fieldName,
                ) {
                    return true;
                },
                checkMaxLength(
                    value: NonNullable<EmailNodeDataType['parameters']>['emailConfig'],
                    fieldName,
                ) {
                    return true;
                },
            },
            'email.subject': {
                checkRequired,
                checkMaxLength: genMaxLengthValidator(500),
            },
            'email.recipients': {
                checkRequired,
            },
            'email.content': {
                checkRequired,
                checkMaxLength: genMaxLengthValidator(5000),
            },
            'webhook.webhookUrl': {
                checkRequired,
                checkUrl(value: string, fieldName) {
                    return true;
                },
            },
            // 'webhook.secretKey': {},
        };
        return result;
    }, [getIntlText]);

    const checkNodeId = () => {};

    const checkNodeType = () => {};

    const checkEdgeType = () => {};

    const checkNodesData = useCallback(
        (nodes?: WorkflowNode[], options?: CheckOptions) => {
            nodes = nodes || getNodes();
            const result: NodesDataValidResult = {};

            for (let i = 0; i < nodes.length; i++) {
                const { id, type, data } = nodes[i];
                const config = nodeConfigs[type as WorkflowNodeType];
                const { nodeName, nodeRemark, parameters } = data || {};
                let tempResult = result[id];

                if (options?.validateFirst && tempResult?.errMsgs.length) {
                    toast.error({ key: 'node-validate', content: tempResult.errMsgs[0] });
                    return result;
                }

                if (!tempResult) {
                    tempResult = {
                        type: type as WorkflowNodeType,
                        label: getIntlText(config.labelIntlKey),
                        name: nodeName,
                        status: 'SUCCESS',
                        errMsgs: [],
                    };
                    result[id] = tempResult;
                }

                Object.values(dataValidators.nodeName).forEach(validator => {
                    const result = validator(nodeName, getIntlText('common.label.name'));
                    if (result && result !== true) {
                        tempResult.errMsgs.push(result);
                    }
                });

                Object.values(dataValidators.nodeRemark).forEach(validator => {
                    const result = validator(nodeRemark, getIntlText('common.label.remark'));
                    if (result && result !== true) {
                        tempResult.errMsgs.push(result);
                    }
                });

                // console.log({ id, type, parameters });
                if (!parameters || !Object.keys(parameters).length) {
                    tempResult.errMsgs.push(
                        getIntlText('workflow.valid.parameter_required', {
                            1: `${getIntlText(config.labelIntlKey)} (ID: ${id})`,
                        }),
                    );
                    continue;
                }

                Object.entries(parameters).forEach(([key, value]) => {
                    const validKey = `${type}.${key}`;
                    const validators = dataValidators[validKey] || dataValidators[key] || {};

                    Object.values(validators).forEach(validator => {
                        const result = validator(value, key);
                        if (result && result !== true) {
                            tempResult.errMsgs.push(result);
                        }
                    });
                });
            }

            Object.entries(result).forEach(([id, data]) => {
                if (!data.errMsgs.length) {
                    delete result[id];
                } else {
                    data.status = 'ERROR';
                }
            });

            return Object.values(result).some(item => item.errMsgs.length) ? result : true;
        },
        [dataValidators, getIntlText, getNodes, nodeConfigs],
    );

    return {
        checkNodeId,
        checkNodeType,
        checkEdgeType,
        checkNodesData,
    };
};

export default useValidate;
