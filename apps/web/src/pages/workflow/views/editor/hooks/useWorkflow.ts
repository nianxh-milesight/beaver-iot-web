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
import { PARALLEL_LIMIT, PARALLEL_DEPTH_LIMIT, ENTRY_NODE_NUMBER_LIMIT } from '../constants';
import { getParallelInfo } from './utils';

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

    // Check entry node number limit
    const checkEntryNodeNumberLimit = useCallback(() => {
        const nodes = getNodes();
        const entryNodes = nodes.filter(node =>
            entryNodeTypes.includes(node.type as WorkflowNodeType),
        );

        if (entryNodes.length > 1) {
            toast.error({
                key: 'entry-node-number-limit',
                content: getIntlText('workflow.label.entry_node_number_limit_tip', {
                    1: ENTRY_NODE_NUMBER_LIMIT,
                }),
            });
            return false;
        }

        return true;
    }, [getNodes, getIntlText]);

    // Check Parallel Limit
    const checkParallelLimit = useCallback(
        (nodeId: ApiKey, nodeHandle?: string | null) => {
            const edges = getEdges();
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
            if (hasAbnormalEdges) return false;

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

    // const checkFreeNodeLimit = useCallback(() => {

    // }, [getNodes, getUpstreamNodes]);

    return {
        nodes,
        edges,
        // selectedNode,
        isValidConnection,
        checkParallelLimit,
        checkNestedParallelLimit,
        checkEntryNodeNumberLimit,
        getSelectedNode,
        getUpstreamNodes,
    };
};

export default useWorkflow;
