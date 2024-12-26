import { useMemo } from 'react';
import { getIncomers, getOutgoers } from '@xyflow/react';
import { cloneDeep } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { generateUUID, objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { basicNodeConfigs } from '../../../config';
import type {
    ActionLogProps,
    ParallelNodeResult,
    WorkflowDataType,
    WorkflowNestDataType,
    WorkflowNestNode,
    WorkflowTraceType,
} from '../types';

const entryNodeConfigs = Object.values(basicNodeConfigs).filter(node => node.category === 'entry');
export const useNestedData = ({ traceData, workflowData }: ActionLogProps) => {
    /** Generate trace Map */
    const traceMap = useMemo(() => {
        return (traceData || []).reduce(
            (acc, cur) => {
                const { nodeId } = objectToCamelCase(cur || {});
                acc[nodeId] = cur;
                return acc;
            },
            {} as Record<string, WorkflowTraceType>,
        );
    }, [traceData]);

    /** Add required attributes */
    const wrapperNode = useMemoizedFn((node: WorkflowNode): WorkflowNestNode => {
        const nestNode = cloneDeep(node) as WorkflowNestNode;
        const { id, type, data } = nestNode || {};
        const { nodeName } = data || {};
        const { status, input, output, timeCost, errorMessage } = objectToCamelCase(
            traceMap[id] || {},
        );

        nestNode.attrs = {
            $$token: generateUUID(),
            name: nodeName || '',
            type: type!,
            status,
            timeCost,
            input,
            output,
            errorMessage,
        };

        return nestNode;
    });

    /** Determine whether it is the root node */
    const isRootNode = useMemoizedFn((node: WorkflowNestNode) => {
        const { type } = node || {};
        return entryNodeConfigs.some(config => config.type === type);
    });

    /** Wrap workflow data */
    const wrapperWorkflowData = useMemoizedFn(
        (workflowData: WorkflowDataType): WorkflowNestDataType => {
            const { nodes } = workflowData || {};
            const nestNodes = (nodes || []).map(node => wrapperNode(node));

            return {
                ...(workflowData || {}),
                nodes: nestNodes,
            };
        },
    );

    const workflowNestData = useMemo(
        () => wrapperWorkflowData(workflowData),
        [workflowData, wrapperWorkflowData],
    );

    /** Convert flat data to tree */
    const dataToTree = useMemoizedFn(
        (cb?: (node: WorkflowNestNode) => void): WorkflowNestNode[] => {
            const { nodes, edges } = workflowNestData || {};

            const root: WorkflowNestNode[] = [];
            (nodes || []).forEach(node => {
                /** Get root node */
                const isRoot = isRootNode(node);
                isRoot && root.push(node);

                // Callback during traversal
                cb?.(node);

                const outgoers = getOutgoers(node, nodes, edges) as WorkflowNestNode[];
                /** Generate nested structure data */
                if (outgoers.length) {
                    node.children = [...(node.children || []), ...outgoers];
                }
            });

            return root;
        },
    );

    // Tree node data
    const roots = useMemo(() => dataToTree(), [dataToTree]);

    // Tree structure related mappings
    const { treeDepthMap, treeParentMap } = useMemo(() => {
        const treeDepthMap: Map<string, number> = new Map();
        const treeParentMap: Map<string, WorkflowNestNode | null> = new Map();

        const dfs = (node: WorkflowNestNode, parent: WorkflowNestNode | null, depth: number) => {
            const { $$token } = node.attrs || {};

            treeDepthMap.set($$token, depth);
            treeParentMap.set($$token, parent || null);

            if (node.children) {
                node.children.forEach(child => dfs(child, node, depth + 1));
            }
        };
        roots.forEach(root => dfs(root, null, 0));
        return { treeDepthMap, treeParentMap };
    }, [roots]);

    /** Get the depth of a node */
    const getDepthByNode = useMemoizedFn((node: WorkflowNestNode): number => {
        const { attrs } = node || {};
        const { $$token } = attrs || {};

        return treeDepthMap.get($$token) || 0;
    });

    // Get the upstream node of a given node
    const getParentNodeInTree = useMemoizedFn((node: WorkflowNestNode) => {
        const { attrs } = node;
        const { $$token } = attrs;

        return treeParentMap.get($$token);
    });

    /** Get available upstream nodes */
    const getOnceIncomeNode = useMemoizedFn((node: WorkflowNestNode): ParallelNodeResult | null => {
        const { nodes, edges } = workflowNestData || {};

        // Get parent nodes
        const incomers = getIncomers(node, nodes, edges) as WorkflowNestNode[];
        if (!incomers?.length) return null;

        // Check if parent nodes have only one outgoing node
        const isOnceIncomeNode = incomers.every(incomer => {
            const outgoers = getOutgoers(incomer, nodes, edges) as WorkflowNestNode[];
            // Only one outgoing node
            return outgoers.length === 1;
        });
        if (!isOnceIncomeNode) return null;

        const usableIncomes = incomers.sort((a, b) => getDepthByNode(a) - getDepthByNode(b));
        const [usableIncome] = usableIncomes || [];

        return {
            node,
            incomers,
            usableIncome,
        };
    });

    /** Get nodes that need to be promoted to the same level */
    const getParallelNodeList = useMemoizedFn((): ParallelNodeResult[] => {
        const { nodes } = workflowNestData || {};
        const parallelNodeList: ParallelNodeResult[] = [];

        (nodes || []).forEach(node => {
            const result = getOnceIncomeNode(node);
            if (!result) return;

            parallelNodeList.push(result);
        });

        return parallelNodeList;
    });

    /** Cancel references */
    const cancelQuote = useMemoizedFn((parallelNodeList: ParallelNodeResult[]) => {
        const { nodes, edges } = workflowNestData || {};

        (parallelNodeList || []).forEach(({ node }) => {
            const incomers = getIncomers(node, nodes, edges) as WorkflowNestNode[];
            // Remove references
            (incomers || []).forEach(incomer => {
                incomer.children = (incomer.children || []).filter(v => v.id !== node.id);
            });
        });
    });

    /** Connect new references */
    const connectQuote = useMemoizedFn((parallelNodeList: ParallelNodeResult[]) => {
        (parallelNodeList || []).forEach(result => {
            const { node, usableIncome } = result || {};
            const parentNode = getParentNodeInTree(usableIncome);

            if (parentNode) {
                parentNode.children = (parentNode.children || []).concat(node);
                return;
            }

            roots.push(node);
        });
    });

    /** Generate tree data */
    const treeData = useMemo(() => {
        const parallelNodeList = getParallelNodeList();
        const taskQueue = [cancelQuote, connectQuote];
        taskQueue.forEach(handler => handler(parallelNodeList));

        return roots;
    }, [cancelQuote, connectQuote, getParallelNodeList, roots]);

    return {
        treeData,
    };
};
