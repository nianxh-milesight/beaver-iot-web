import { useMemo, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { uniqBy } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';
import {
    isEmpty,
    isRangeValue,
    isMinLength,
    isMaxLength,
    isURL,
    isMatches,
} from '@milesight/shared/src/utils/validators';
import { EDGE_TYPE_ADDABLE } from '../constants';
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
export const EDGE_VALIDATE_TOAST_KEY = 'edge-validate';

// node and edge id regex
const ID_PATTERN = /^(?!_)[a-zA-Z0-9_]+$/;

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

    /**
     * Check Nodes ID
     * 1. ID is unique
     * 2. ID Cannot start with `_`
     * 3. ID strings can only contain letters (case insensitive), numbers, and underscores
     */
    const checkNodesId = useCallback(
        (nodes?: WorkflowNode[], options?: CheckOptions) => {
            nodes = nodes || getNodes();
            const result: NodesDataValidResult = {};
            const nodesMap = new Map();

            for (let i = 0; i < nodes.length; i++) {
                const { id, type, data } = nodes[i];
                const nodeName = data?.nodeName;
                const nodeType = type as WorkflowNodeType;
                const nodeLabel = !nodeConfigs[nodeType]
                    ? undefined
                    : getIntlText(nodeConfigs[nodeType]?.labelIntlKey);
                const errMsgs: string[] = [];

                if (nodesMap.has(id)) {
                    const [node1, node2] = nodes.filter(item => item.id === id);
                    errMsgs.push(
                        getIntlText('workflow.valid.node_id_duplicated', {
                            1:
                                node1.data?.nodeName ||
                                `${getIntlText(nodeConfigs[node1.type as WorkflowNodeType].labelIntlKey)}(${id})`,
                            2:
                                node2.data?.nodeName ||
                                `${getIntlText(nodeConfigs[node2.type as WorkflowNodeType].labelIntlKey)}(${id})`,
                        }),
                    );
                } else {
                    nodesMap.set(id, true);
                }

                if (!isMatches(id, ID_PATTERN)) {
                    errMsgs.push(
                        getIntlText('workflow.valid.invalid_node_id', {
                            1: nodeName || `${nodeLabel}(${id})`,
                        }),
                    );
                }

                if (errMsgs.length) {
                    result[id] = {
                        type: type as WorkflowNodeType,
                        label: nodeLabel,
                        name: nodeName,
                        status: 'ERROR',
                        errMsgs,
                    };
                }

                if (!options?.validateFirst || !errMsgs.length) continue;
                toast.error({
                    key: NODE_VALIDATE_TOAST_KEY,
                    content: errMsgs[0],
                });
                return result;
            }

            return Object.values(result).some(item => item.errMsgs.length) ? result : undefined;
        },
        [nodeConfigs, getNodes, getIntlText],
    );

    // Check Nodes Type
    const checkNodesType = useCallback(
        (nodes?: WorkflowNode[], options?: CheckOptions) => {
            nodes = nodes || getNodes();
            const result: NodesDataValidResult = {};

            for (let i = 0; i < nodes.length; i++) {
                const { id, type, data, componentName } = nodes[i];
                const nodeType = type as WorkflowNodeType;

                if (nodeConfigs[nodeType] && nodeConfigs[nodeType].componentName === componentName)
                    continue;

                result[id] = {
                    type: nodeType,
                    status: 'ERROR',
                    errMsgs: [
                        getIntlText('workflow.valid.invalid_node_type', {
                            1: data.nodeName || id,
                        }),
                    ],
                };

                if (!options?.validateFirst) continue;
                toast.error({
                    key: NODE_VALIDATE_TOAST_KEY,
                    content: result[id].errMsgs[0],
                });
                return result;
            }

            return Object.values(result).some(item => item.errMsgs.length) ? result : undefined;
        },
        [nodeConfigs, getNodes, getIntlText],
    );

    // Check Edges ID, the rule is same with node ID
    const checkEdgesId = useCallback(
        (edges?: WorkflowEdge[], nodes?: WorkflowNode[], options?: CheckOptions) => {
            edges = edges || getEdges();
            nodes = nodes || getNodes();
            const result: Record<
                string,
                { id: string; status: WorkflowNodeStatus; errMsgs: string[] }
            > = {};
            const edgesMap = new Map();

            for (let i = 0; i < edges.length; i++) {
                const { id, source, target } = edges[i];

                const sourceNode = nodes.find(node => node.id === source);
                const targetNode = nodes.find(node => node.id === target);
                const errMsgs: string[] = [];

                if (edgesMap.has(id)) {
                    errMsgs.push(
                        getIntlText('workflow.valid.edge_id_duplicated', {
                            1:
                                sourceNode?.data?.nodeName ||
                                `${getIntlText(nodeConfigs[sourceNode?.type as WorkflowNodeType]?.labelIntlKey || '')}(${id})`,
                            2:
                                targetNode?.data?.nodeName ||
                                `${getIntlText(nodeConfigs[targetNode?.type as WorkflowNodeType]?.labelIntlKey || '')}(${id})`,
                        }),
                    );
                } else {
                    edgesMap.set(id, true);
                }

                if (!isMatches(id, ID_PATTERN)) {
                    errMsgs.push(
                        getIntlText('workflow.valid.invalid_edge_id', {
                            1: sourceNode?.data.nodeName || source,
                            2: targetNode?.data.nodeName || target,
                        }),
                    );
                }

                if (errMsgs.length) {
                    result[id] = {
                        id,
                        status: 'ERROR',
                        errMsgs: [
                            getIntlText('workflow.valid.invalid_edge_id', {
                                1: sourceNode?.data.nodeName || source,
                                2: targetNode?.data.nodeName || target,
                            }),
                        ],
                    };
                }

                if (!options?.validateFirst || !errMsgs.length) continue;
                toast.error({
                    key: EDGE_VALIDATE_TOAST_KEY,
                    content: errMsgs[0],
                });
                return result;
            }

            const errors = Object.values(result);
            const isSuccess = !errors.some(item => item.errMsgs.length);

            if (isSuccess) return;

            toast.error({ key: EDGE_VALIDATE_TOAST_KEY, content: errors[0].errMsgs[0] });
            return result;
        },
        [nodeConfigs, getEdges, getNodes, getIntlText],
    );

    // Check Edges Type
    const checkEdgesType = useCallback(
        (edges?: WorkflowEdge[], nodes?: WorkflowNode[], options?: CheckOptions) => {
            edges = edges || getEdges();
            nodes = nodes || getNodes();
            const result: Record<
                string,
                { id: string; status: WorkflowNodeStatus; errMsgs: string[] }
            > = {};

            for (let i = 0; i < edges.length; i++) {
                const { id, type, source, target } = edges[i];

                if (type === EDGE_TYPE_ADDABLE) continue;
                const sourceNode = nodes.find(node => node.id === source);
                const targetNode = nodes.find(node => node.id === target);

                result[id] = {
                    id,
                    status: 'ERROR',
                    errMsgs: [
                        getIntlText('workflow.valid.invalid_edge_type', {
                            1: sourceNode?.data.nodeName || source,
                            2: targetNode?.data.nodeName || target,
                        }),
                    ],
                };

                if (!options?.validateFirst || !result[id].errMsgs.length) continue;
                toast.error({
                    key: EDGE_VALIDATE_TOAST_KEY,
                    content: result[id].errMsgs[0],
                });
                return result;
            }

            const errors = Object.values(result);
            const isSuccess = !errors.some(item => item.errMsgs.length);

            if (isSuccess) return;

            toast.error({ key: EDGE_VALIDATE_TOAST_KEY, content: errors[0].errMsgs[0] });
            return result;
        },
        [getEdges, getNodes, getIntlText],
    );

    // Check Nodes Data
    const checkNodesData = useCallback(
        (nodes?: WorkflowNode[], options?: CheckOptions) => {
            nodes = nodes || getNodes();
            const result: NodesDataValidResult = {};

            for (let i = 0; i < nodes.length; i++) {
                const { id, type, data } = nodes[i];
                const nodeType = type as WorkflowNodeType;
                const config = nodeConfigs[nodeType];
                const { nodeName, nodeRemark, parameters } = data || {};
                let tempResult = result[id];

                // if (
                //     options?.validateFirst &&
                //     Object.values(result).some(item => item.errMsgs.length)
                // ) {
                //     const errItem = Object.values(result).find(item => item.errMsgs.length);
                //     toast.error({ key: 'node-validate', content: errItem?.errMsgs[0] });
                //     return result;
                // }

                if (!tempResult) {
                    tempResult = {
                        type: nodeType,
                        label: config ? getIntlText(config.labelIntlKey) : undefined,
                        name: nodeName,
                        status: 'SUCCESS',
                        errMsgs: [],
                    };
                    result[id] = tempResult;
                }

                // Node name check
                Object.values(dataValidators.nodeName).forEach(validator => {
                    const result = validator(nodeName, getIntlText('common.label.name'));
                    if (result && result !== true) {
                        tempResult.errMsgs.push(result);
                    }
                });

                // Node remark check
                Object.values(dataValidators.nodeRemark).forEach(validator => {
                    const result = validator(nodeRemark, getIntlText('common.label.remark'));
                    if (result && result !== true) {
                        tempResult.errMsgs.push(result);
                    }
                });

                // console.log({ id, type, parameters });
                // Node parameters check
                if (!parameters || !Object.keys(parameters).length) {
                    tempResult.errMsgs.push(
                        getIntlText('workflow.valid.parameter_required', {
                            1: nodeName || `${getIntlText(config.labelIntlKey)} (ID: ${id})`,
                        }),
                    );
                } else {
                    // Node parameters data check
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

                if (options?.validateFirst && tempResult.errMsgs.length) {
                    toast.error({ key: 'node-validate', content: tempResult.errMsgs[0] });
                    return result;
                }
            }

            Object.entries(result).forEach(([id, data]) => {
                if (!data.errMsgs.length) {
                    delete result[id];
                } else {
                    data.status = 'ERROR';
                }
            });

            return Object.values(result).some(item => item.errMsgs.length) ? result : undefined;
        },
        [dataValidators, nodeConfigs, getIntlText, getNodes],
    );

    return {
        checkNodesId,
        checkNodesType,
        checkEdgesId,
        checkEdgesType,
        checkNodesData,
    };
};

export default useValidate;
