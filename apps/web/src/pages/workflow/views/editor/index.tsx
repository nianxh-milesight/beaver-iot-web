import { memo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { omitBy } from 'lodash-es';
import {
    ReactFlow,
    Background,
    SelectionMode,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    type NodeChange,
    type EdgeChange,
} from '@xyflow/react';
import { Button } from '@mui/material';
import { checkPrivateProperty } from '@milesight/shared/src/utils/tools';
import { useI18n, useTheme, useStoreShallow, usePreventLeave } from '@milesight/shared/src/hooks';
import { CheckIcon, toast } from '@milesight/shared/src/components';
import { CodeEditor, useConfirm } from '@/components';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { MIN_ZOOM, MAX_ZOOM, FROZEN_NODE_PROPERTY_KEYS } from './constants';
import useFlowStore from './store';
import { useNodeTypes, useInteractions, useWorkflow } from './hooks';
import {
    Topbar,
    Controls,
    ConfigPanel,
    Edge,
    HelperLines,
    getHelperLines,
    EntryPanel,
    LogPanel,
    TestButton,
    type DesignMode,
    type TopbarProps,
} from './components';
import demoData from './demo-data.json';

import '@xyflow/react/dist/style.css';
import './style.less';

const edgeTypes: Record<WorkflowEdgeType, React.FC<any>> = {
    addable: Edge,
};

/**
 * Workflow Editor
 */
const WorkflowEditor = () => {
    const { grey } = useTheme();
    const { getIntlText } = useI18n();
    const nodeTypes = useNodeTypes();
    const { toObject } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const {
        isValidConnection,
        checkParallelLimit,
        checkNestedParallelLimit,
        checkEntryNodeNumberLimit,
        checkFreeNodeLimit,
    } = useWorkflow();
    const { handleConnect, handleBeforeDelete, handleEdgeMouseEnter, handleEdgeMouseLeave } =
        useInteractions();
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
    const checkWorkflowValid = useCallback(() => {
        const { nodes, edges } = toObject();
        if (!checkEntryNodeNumberLimit(nodes)) return false;
        if (checkFreeNodeLimit(nodes)) return false;
        if (!checkNestedParallelLimit(nodes, edges)) return false;
        if (nodes.some(node => !checkParallelLimit(node.id, undefined, edges))) return false;

        return true;
    }, [
        toObject,
        checkEntryNodeNumberLimit,
        checkFreeNodeLimit,
        checkNestedParallelLimit,
        checkParallelLimit,
    ]);

    // ---------- Prevent Leave ----------
    const confirm = useConfirm();
    const [isPreventLeave, setIsPreventLeave] = useState(false);
    const handleEdgesChange = useCallback(
        (changes: EdgeChange<WorkflowEdge>[]) => {
            if (changes.some(({ type }) => ['add', 'remove'].includes(type))) {
                setIsPreventLeave(true);
            }

            onEdgesChange(changes);
        },
        [onEdgesChange],
    );

    usePreventLeave({ isPreventLeave, confirm });

    // ---------- Show Helper Lines when node change ----------
    const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
    const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);
    const handleNodesChange = useCallback(
        (changes: NodeChange<WorkflowNode>[]) => {
            if (changes.some(({ type }) => ['add', 'remove', 'position'].includes(type))) {
                setIsPreventLeave(true);
            }

            // reset the helper lines (clear existing lines, if any)
            setHelperLineHorizontal(undefined);
            setHelperLineVertical(undefined);

            if (
                changes.length === 1 &&
                changes[0].type === 'position' &&
                changes[0].dragging &&
                changes[0].position
            ) {
                const helperLines = getHelperLines(changes[0], nodes || []);

                // if we have a helper line, we snap the node to the helper line position
                // this is being done by manipulating the node position inside the change object
                changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
                changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

                // if helper lines are returned, we set them so that they can be displayed
                setHelperLineHorizontal(helperLines.horizontal);
                setHelperLineVertical(helperLines.vertical);
            }

            onNodesChange(changes);
        },
        [nodes, onNodesChange],
    );

    // ---------- Fetch Nodes Config ----------
    const { setNodeConfigs } = useFlowStore(useStoreShallow(['setNodeConfigs']));
    const { loading: configLoading } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(workflowAPI.getFlowNodes());
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            setNodeConfigs(data);
        },
        { debounceWait: 300 },
    );

    // ---------- Fetch Flow Data ----------
    const [searchParams] = useSearchParams();
    const wid = searchParams.get('wid');
    const [basicData, setBasicData] = useState<TopbarProps['data']>(() => {
        if (wid) return { id: wid };
    });
    const [flowDataLoading, setFlowDataLoading] = useState<boolean>();
    const {
        // loading,
        // data: flowData,
        run: getFlowDesign,
    } = useRequest(
        async () => {
            if (!wid) return;
            setFlowDataLoading(true);
            // TODO: Call workflow detail API
            // const [error, resp] = await awaitWrap(workflowAPI.getFlowDesign({ id: wid }));

            // if (error || !isRequestSuccess(resp)) return;
            // const data = getResponseData(resp);
            // console.log(data);

            await new Promise(resolve => {
                setTimeout(resolve, 500);
            });

            setFlowDataLoading(false);
            setNodes(demoData.nodes as WorkflowNode[]);
            setEdges(demoData.edges as WorkflowEdge[]);
            setBasicData({
                id: 'xxx',
                name: 'Workflow Name',
                remark: 'Workflow Remark',
                enabled: false,
            });

            return { id: 'xxx', name: 'Workflow Name', remark: 'Workflow Remark', enabled: false };
        },
        {
            debounceWait: 300,
            refreshDeps: [wid],
        },
    );
    const handleFlowDataChange = useCallback<NonNullable<TopbarProps['onDataChange']>>(data => {
        setBasicData(data);
        setIsPreventLeave(true);
    }, []);

    // ---------- Design Mode Change ----------
    const [designMode, setDesignMode] = useState<DesignMode>('canvas');
    const [editorFlowData, setEditorFlowData] = useState<string>();
    const handleDesignModeChange = useCallback(
        (mode: DesignMode) => {
            if (!checkWorkflowValid()) return;

            if (mode === 'advanced') {
                const { nodes, edges } = toObject();
                const newNodes = nodes.map(node => {
                    const result = omitBy(node, (_, key) =>
                        FROZEN_NODE_PROPERTY_KEYS.includes(key),
                    );
                    result.data = omitBy(node.data, (_, key) => checkPrivateProperty(key));
                    return result;
                });

                setEditorFlowData(JSON.stringify({ nodes: newNodes, edges }, null, 2));
            } else if (mode === 'canvas') {
                let data: Pick<WorkflowSchema, 'nodes' | 'edges'>;

                // TODO: json validate, data validate
                try {
                    data = JSON.parse(editorFlowData || '{}');
                } catch (e) {
                    toast.error({ content: getIntlText('common.message.json_format_error') });
                    return;
                }
                const { nodes, edges } = data;

                setNodes(nodes);
                setEdges(edges);
            }
            const data = toObject();
            // TODO: check the nodes json data is valid
            console.log('workflow data', data);

            setDesignMode(mode);
        },
        [editorFlowData, toObject, setEdges, setNodes, checkWorkflowValid, getIntlText],
    );

    // ---------- Save Workflow ----------
    const handleSave = () => {
        if (!checkWorkflowValid()) return;

        const { nodes, edges, viewport } = toObject();

        // TODO: check the nodes data is valid
        console.log('workflow data', { nodes, edges, viewport });
    };

    return (
        <div className="ms-main">
            <Topbar
                data={basicData}
                loading={flowDataLoading}
                mode={designMode}
                onDataChange={handleFlowDataChange}
                onDesignModeChange={handleDesignModeChange}
                rightSlot={[
                    <TestButton
                        key="test-button"
                        disabled={designMode === 'advanced' || !nodes.length}
                    />,
                    <Button
                        key="save-button"
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={handleSave}
                    >
                        {getIntlText('common.button.save')}
                    </Button>,
                ]}
            />
            <div className="ms-view ms-view-wf_editor">
                <div className="ms-view__inner">
                    <ReactFlow<WorkflowNode, WorkflowEdge>
                        fitView
                        className="ms-workflow"
                        minZoom={MIN_ZOOM}
                        maxZoom={MAX_ZOOM}
                        selectionOnDrag={false}
                        selectNodesOnDrag={false}
                        selectionKeyCode={null}
                        multiSelectionKeyCode={null}
                        selectionMode={SelectionMode.Partial}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodes={nodes}
                        edges={edges}
                        onBeforeDelete={handleBeforeDelete}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={handleConnect}
                        onEdgeMouseEnter={handleEdgeMouseEnter}
                        onEdgeMouseLeave={handleEdgeMouseLeave}
                    >
                        <Background style={{ backgroundColor: grey['100'] }} />
                        <Controls minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
                        <HelperLines
                            horizontal={helperLineHorizontal}
                            vertical={helperLineVertical}
                        />
                        <LogPanel />
                        <ConfigPanel />
                        <EntryPanel loading={!!wid || flowDataLoading} />
                    </ReactFlow>
                    {designMode === 'advanced' && (
                        <div className="ms-workflow-advance">
                            <CodeEditor
                                editorLang="json"
                                renderHeader={() => null}
                                value={editorFlowData}
                                onChange={value => {
                                    setIsPreventLeave(true);
                                    setEditorFlowData(value);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(() => (
    <ReactFlowProvider>
        <WorkflowEditor />
    </ReactFlowProvider>
));
