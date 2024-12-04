import { useCallback } from 'react';
import {
    useReactFlow,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    getOutgoers,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type ReactFlowProps,
    type IsValidConnection,
} from '@xyflow/react';
import { genRandomString } from '@milesight/shared/src/utils/tools';

type RFProps = ReactFlowProps<WorkflowNode, WorkflowEdge>;

interface AddNodeOptions {
    newNodePayload: {
        nodeType: WorkflowNodeType;
        sourceHandle?: ApiKey;
        targetHandle?: ApiKey;
    };
}

type AddNodeFunc = (
    newNodePayload: {
        nodeType: WorkflowNodeType;
        sourceHandle?: ApiKey;
        targetHandle?: ApiKey;
    },
    atNodePayload?: {
        atNodeId?: ApiKey;
        atNodeTargetHandle?: ApiKey;
        atNodeSourceHandle?: ApiKey;
    },
) => void;

/**
 * Generate Workflow Node or Edge uuid, format as `{node}:{timestamp}:{8-bit random string}`
 * @param type node/edge
 */
const genUuid = (type: 'node' | 'edge') => {
    return `${type}:${Date.now()}:${genRandomString()}`;
};

/**
 * 工作流通用交互逻辑
 */
const useInteractions = () => {
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow<WorkflowNode, WorkflowEdge>();

    const addNode = useCallback<AddNodeFunc>(
        (
            { nodeType, sourceHandle, targetHandle },
            { atNodeId, atNodeSourceHandle, atNodeTargetHandle } = {},
        ) => {
            console.log({ nodeType, sourceHandle, targetHandle });
            const nodes = getNodes();
            const node: WorkflowNode = {
                id: genUuid('node'),
                type: nodeType,
                position: {
                    x: 0,
                    y: 0,
                },
                data: {},
            };
        },
        [getNodes],
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
