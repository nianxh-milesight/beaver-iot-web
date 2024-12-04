import { useCallback } from 'react';
import {
    useReactFlow,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    getIncomers,
    getOutgoers,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type ReactFlowProps,
    type IsValidConnection,
} from '@xyflow/react';
import { cloneDeep, maxBy } from 'lodash-es';
import { genRandomString } from '@milesight/shared/src/utils/tools';
import { NODE_SPACING_X, NODE_SPACING_Y, EDGE_TYPE_ADDABLE } from '../constant';

type RFProps = ReactFlowProps<WorkflowNode, WorkflowEdge>;

/**
 * The closest node payload type for AddNode function
 */
export type AddNodeClosestPayloadParam = {
    prevNodeId?: ApiKey;
    prevNodeSourceHandle?: string | null;
    nextNodeId?: ApiKey;
    nextNodeTargetHandle?: string | null;
};

type AddNodeFunc = (
    newNodePayload: {
        nodeType: WorkflowNodeType;
        sourceHandle?: ApiKey;
        targetHandle?: ApiKey;
        position?: {
            x: number;
            y: number;
        };
    },
    closestNodePayload?: AddNodeClosestPayloadParam,
) => void;

/**
 * Generate Workflow Node or Edge uuid, format as `{node}:{timestamp}:{8-bit random string}`
 * @param type node/edge
 */
const genUuid = (type: 'node' | 'edge') => {
    return `${type}:${Date.now()}:${genRandomString(8, { lowerCase: true })}`;
};

/**
 * Workflow Interactions Hook
 */
const useInteractions = () => {
    const { getNodes, getEdges, setNodes, setEdges, addNodes, addEdges } = useReactFlow<
        WorkflowNode,
        WorkflowEdge
    >();

    const addNode = useCallback<AddNodeFunc>(
        (
            { nodeType, position },
            { prevNodeId, prevNodeSourceHandle, nextNodeId, nextNodeTargetHandle } = {},
        ) => {
            console.log({
                nodeType,
                prevNodeId,
                prevNodeSourceHandle,
                nextNodeId,
                nextNodeTargetHandle,
            });
            const nodes = getNodes();
            const edges = getEdges();
            const prevNode = nodes.find(node => node.id === prevNodeId);
            const nextNode = nodes.find(node => node.id === nextNodeId);
            const newNode: WorkflowNode = {
                id: genUuid('node'),
                type: nodeType,
                position: position || {
                    x: 0,
                    y: 0,
                },
                data: {},
            };

            // Button at the edge
            if (prevNode && nextNode) {
                const newEdges = cloneDeep(edges);
                const newNodes = cloneDeep(nodes);

                // Update current edge
                const edge = newEdges.find(
                    edge => edge.source === prevNodeId && edge.target === nextNodeId,
                )!;
                edge.target = newNode.id;

                // Add new Edge
                if (newNode.type !== 'ifelse') {
                    newEdges.push({
                        id: genUuid('edge'),
                        type: EDGE_TYPE_ADDABLE,
                        source: newNode.id,
                        target: nextNode.id,
                        targetHandle: nextNodeTargetHandle,
                    });
                }

                newNode.position = {
                    x: nextNode.position.x,
                    y: nextNode.position.y,
                };
                newNodes.push(newNode);

                const updateNodesPosition = (node: WorkflowNode) => {
                    const tempNode = newNodes.find(item => item.id === node.id)!;

                    tempNode.position = {
                        x: node.position.x + NODE_SPACING_X,
                        y: node.position.y,
                    };

                    const outgoers = getOutgoers(node, newNodes, newEdges);

                    outgoers.forEach(node => updateNodesPosition(node));
                };
                updateNodesPosition(nextNode);

                setNodes(newNodes);
                setEdges(newEdges);
                return;
            }

            // Button at the node target handle
            if (!prevNode && nextNode) {
                const newEdge: WorkflowEdge | undefined = {
                    id: genUuid('edge'),
                    type: 'addable',
                    source: newNode.id,
                    target: nextNode.id,
                    targetHandle: nextNodeTargetHandle,
                };
                const incomers = getIncomers(nextNode, nodes, edges);

                if (!incomers.length) {
                    newNode.position = {
                        x: nextNode.position.x - NODE_SPACING_X,
                        y: nextNode.position.y,
                    };
                } else {
                    const maxYIncomer = maxBy(incomers, item => item.position.y)!;

                    newNode.position = {
                        x: maxYIncomer.position.x,
                        y: maxYIncomer.position.y + NODE_SPACING_Y,
                    };
                }

                addNodes([newNode]);
                addEdges([newEdge]);
                return;
            }

            // Button at the node source handle
            if (prevNode && !nextNode) {
                const newEdge: WorkflowEdge | undefined = {
                    id: genUuid('edge'),
                    type: EDGE_TYPE_ADDABLE,
                    source: prevNode.id,
                    target: newNode.id,
                    sourceHandle: prevNodeSourceHandle,
                };
                const outgoers = getOutgoers(prevNode, nodes, edges);

                if (!outgoers.length) {
                    newNode.position = {
                        x: prevNode.position.x + NODE_SPACING_X,
                        y: prevNode.position.y,
                    };
                } else {
                    const maxYOutgoers = maxBy(outgoers, item => item.position.y)!;

                    newNode.position = {
                        x: maxYOutgoers.position.x,
                        y: maxYOutgoers.position.y + NODE_SPACING_Y,
                    };
                }

                addNodes([newNode]);
                addEdges([newEdge]);
                return;
            }

            addNodes([newNode]);
        },
        [addEdges, addNodes, getEdges, getNodes],
    );

    const handleNodesChange = useCallback<OnNodesChange<WorkflowNode>>(
        changes => {
            setNodes(nds => applyNodeChanges(changes, nds));
        },
        [setNodes],
    );

    const handleEdgesChange = useCallback<OnEdgesChange<WorkflowEdge>>(
        changes => {
            setEdges(eds => applyEdgeChanges(changes, eds));
        },
        [setEdges],
    );

    const handleConnect = useCallback<OnConnect>(
        connection => {
            setEdges(eds => addEdge({ ...connection, type: 'addable' }, eds!));
        },
        [setEdges],
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

            if (target?.id === connection.source) return false;
            return !hasCycle(target!);
        },
        [getNodes, getEdges],
    );

    // Check before node delete
    const handleBeforeDelete = useCallback<NonNullable<RFProps['onBeforeDelete']>>(
        async ({ nodes }) => {
            const hasEntryNode = nodes.some(
                node =>
                    node.type === 'trigger' || node.type === 'timer' || node.type === 'listener',
            );

            if (hasEntryNode) return false;
            return true;
        },
        [],
    );

    return {
        addNode,
        handleNodesChange,
        handleEdgesChange,
        handleConnect,
        handleBeforeDelete,
        isValidConnection,
    };
};

export default useInteractions;
