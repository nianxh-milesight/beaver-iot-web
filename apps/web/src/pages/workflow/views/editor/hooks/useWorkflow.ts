import { useMemo, useCallback } from 'react';
import {
    useReactFlow,
    useNodes,
    useEdges,
    getIncomers,
    getOutgoers,
    type IsValidConnection,
} from '@xyflow/react';
import { uniqBy } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import {
    PARALLEL_LIMIT,
    PARALLEL_DEPTH_LIMIT,
    NODE_MIN_NUMBER_LIMIT,
    ENTRY_NODE_NUMBER_LIMIT,
} from '../constants';
import { getParallelInfo } from './utils';

export type NodeParamType = {
    nodeId: ApiKey;
    nodeName?: string;
    nodeType?: WorkflowNodeType;
    outputs: {
        name: string;
        type: string;
        key: string;
    }[];
};

export type FlattenNodeParamType = {
    nodeId: ApiKey;
    nodeName?: string;
    nodeType?: WorkflowNodeType;
    valueName: string;
    valueType: string;
    valueKey: string;
};

const entryNodeTypes = Object.values(basicNodeConfigs)
    .filter(item => item.category === 'entry')
    .map(item => item.type);

const useWorkflow = () => {
    const { getNodes, getEdges } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const nodes = useNodes<WorkflowNode>();
    const edges = useEdges<WorkflowEdge>();
    const { getIntlText } = useI18n();

    const selectedNode = useMemo(() => {
        const selectedNodes = nodes.filter(item => item.selected);
        const node = selectedNodes?.[0];

        if (selectedNodes.length > 1 || !node || !node.selected || node.dragging) {
            return;
        }

        return node;
    }, [nodes]);
    // Use nodeId, nodeType to avoid frequent render triggers
    const selectedNodeId = selectedNode?.id;
    const selectedNodeType = selectedNode?.type;

    // Check node number limit
    const checkNodeNumberLimit = useCallback(
        (nodes?: WorkflowNode[]) => {
            nodes = nodes || getNodes();

            if (nodes.length < NODE_MIN_NUMBER_LIMIT) {
                toast.error({
                    key: 'node-min-number-limit',
                    content: getIntlText('workflow.label.node_min_number_limit_tip', {
                        1: NODE_MIN_NUMBER_LIMIT,
                    }),
                });
                return false;
            }

            const entryNodes = nodes.filter(node =>
                entryNodeTypes.includes(node.type as WorkflowNodeType),
            );

            if (entryNodes.length !== ENTRY_NODE_NUMBER_LIMIT) {
                toast.error({
                    key: 'entry-node-number-limit',
                    content: getIntlText('workflow.label.entry_node_number_limit_tip', {
                        1: ENTRY_NODE_NUMBER_LIMIT,
                    }),
                });
                return false;
            }

            return true;
        },
        [getNodes, getIntlText],
    );

    // Check Parallel Limit
    const checkParallelLimit = useCallback(
        (nodeId: ApiKey, nodeHandle?: string | null, edges?: WorkflowEdge[]) => {
            edges = edges || getEdges();
            const connectedEdges = edges.filter(
                edge =>
                    edge.source === nodeId &&
                    ((!nodeHandle && !edge.sourceHandle) || edge.sourceHandle === nodeHandle),
            );

            if (connectedEdges.length > PARALLEL_LIMIT - 1) {
                toast.error({
                    key: 'parallel-limit',
                    content: getIntlText('workflow.label.parallel_limit_tip', {
                        1: PARALLEL_LIMIT,
                    }),
                });
                return false;
            }

            return true;
        },
        [getEdges, getIntlText],
    );

    // Check nested parallel limit
    const checkNestedParallelLimit = useCallback(
        (nodes: WorkflowNode[], edges: WorkflowEdge[], parentNodeId?: ApiKey) => {
            const { parallelList, hasAbnormalEdges } = getParallelInfo(nodes, edges, parentNodeId);

            // console.log({ parallelList, hasAbnormalEdges });
            if (hasAbnormalEdges) {
                toast.error({
                    key: 'abnormal-edge',
                    content: getIntlText('workflow.label.abnormal_edge_tip'),
                });
                return false;
            }

            const isGtLimit = parallelList.some(item => item.depth > PARALLEL_DEPTH_LIMIT);

            if (isGtLimit) {
                toast.error({
                    key: 'parallel-depth-limit',
                    content: getIntlText('workflow.label.parallel_depth_limit_tip', {
                        1: PARALLEL_DEPTH_LIMIT,
                    }),
                });
                return false;
            }

            return true;
        },
        [getIntlText],
    );

    // Check node connection cycle
    const isValidConnection = useCallback<IsValidConnection>(
        connection => {
            // we are using getNodes and getEdges helpers here
            // to make sure we create isValidConnection function only once
            const nodes = getNodes();
            const edges = getEdges();
            const target = nodes.find(node => node.id === connection.target);
            const hasCycle = (node: WorkflowNode, visited = new Set()) => {
                if (visited.has(node.id)) return false;

                visited.add(node.id);

                for (const outgoer of getOutgoers(node, nodes, edges)) {
                    if (outgoer.id === connection.source) return true;
                    if (hasCycle(outgoer, visited)) return true;
                }
            };

            if (!checkParallelLimit(connection.source, connection.sourceHandle)) return false;

            if (target?.id === connection.source) return false;
            return !hasCycle(target!);
        },
        [getNodes, getEdges, checkParallelLimit],
    );

    // Get the only selected node that is not dragging
    const getSelectedNode = useCallback(() => {
        const nodes = getNodes();
        const selectedNodes = nodes.filter(
            item => item.id === selectedNodeId && item.type === selectedNodeType,
        );
        const node = selectedNodes?.[0];

        if (selectedNodes.length > 1 || !node || !node.selected || node.dragging) {
            return;
        }

        return node;
    }, [selectedNodeId, selectedNodeType, getNodes]);

    // Get all upstream nodes of the current node
    const getUpstreamNodes = useCallback(
        (currentNode?: WorkflowNode) => {
            currentNode = currentNode || getSelectedNode();
            const getAllIncomers = (
                node: WorkflowNode,
                data: Record<ApiKey, WorkflowNode[]> = {},
                depth = 1,
            ) => {
                if (!node) return [];
                const incomers = getIncomers(node, nodes, edges);

                data[depth] = data[depth] || [];
                data[depth].push(...incomers);
                incomers.forEach(item => getAllIncomers(item, data, depth + 1));

                const keys = Object.keys(data).sort((a, b) => +a - +b);
                const result = keys.reduce((acc, key) => {
                    acc.push(...data[key]);
                    return acc;
                }, [] as WorkflowNode[]);

                return uniqBy(result, 'id');
            };

            return getAllIncomers(currentNode!);
        },
        [nodes, edges, getSelectedNode],
    );

    const getUpstreamNodeParams = useCallback(
        (currentNode?: WorkflowNode): [NodeParamType[], FlattenNodeParamType[]] | [] => {
            currentNode = currentNode || getSelectedNode();
            if (!currentNode) return [];

            const incomeNodes = getUpstreamNodes(currentNode);
            // TODO: get the correct nodes params
            const result: NodeParamType[] = incomeNodes.map(node => ({
                nodeId: node.id,
                nodeName: node.data?.nodeName,
                nodeType: node.type as WorkflowNodeType,
                outputs: [
                    {
                        name: 'output112123123123123123123123131231231',
                        type: 'string',
                        key: `${node.type}.${node.id}.1132e3123132`,
                    },
                    {
                        name: 'output22',
                        type: 'number',
                        key: `${node.type}.${node.id}.11eyu3123132`,
                    },
                ],
            }));
            const flattenResult = result.reduce((acc, item) => {
                acc.push(
                    ...item.outputs.map(output => ({
                        nodeId: item.nodeId,
                        nodeName: item.nodeName,
                        nodeType: item.nodeType,
                        valueName: output.name,
                        valueType: output.type,
                        valueKey: output.key,
                    })),
                );
                return acc;
            }, [] as FlattenNodeParamType[]);

            return [result, flattenResult];
        },
        [getSelectedNode, getUpstreamNodes],
    );

    // Check if there is a node that is not connected to an entry node
    const checkFreeNodeLimit = useCallback(
        (nodes?: WorkflowNode[]) => {
            nodes = nodes || getNodes();
            let result = false;

            result = nodes
                .filter(node => !entryNodeTypes.includes(node.type as WorkflowNodeType))
                .some(node => {
                    const upstreamNodes = getUpstreamNodes(node);
                    const hasEntryNode = upstreamNodes.some(item =>
                        entryNodeTypes.includes(item.type as WorkflowNodeType),
                    );

                    return !hasEntryNode;
                });

            if (result) {
                toast.error({
                    key: 'free-node-limit',
                    content: getIntlText('workflow.label.free_node_limit_tip'),
                });
            }

            return result;
        },
        [getNodes, getUpstreamNodes, getIntlText],
    );

    return {
        nodes,
        edges,
        isValidConnection,
        checkParallelLimit,
        checkNestedParallelLimit,
        checkNodeNumberLimit,
        checkFreeNodeLimit,
        getSelectedNode,
        getUpstreamNodes,
        getUpstreamNodeParams,
    };
};

export default useWorkflow;
