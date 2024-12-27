import { useState, useMemo, useEffect, useCallback } from 'react';
import { Stack, IconButton, Button, CircularProgress } from '@mui/material';
import { Panel, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { genRandomString } from '@milesight/shared/src/utils/tools';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon, toast } from '@milesight/shared/src/components';
import { CodeEditor } from '@/components';
import { ActionLog } from '@/pages/workflow/components';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import useWorkflow from '../../hooks/useWorkflow';
import useFlowStore from '../../store';
import './style.less';

/**
 * Log Detail Panel
 */
const LogPanel = () => {
    const { getIntlText } = useI18n();
    const { getNodes, toObject } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const {
        openLogPanel,
        logPanelMode,
        logDetail,
        logDetailLoading,
        addTestLog,
        setOpenLogPanel,
        setLogDetail,
        setLogDetailLoading,
    } = useFlowStore(
        useStoreShallow([
            'openLogPanel',
            'logPanelMode',
            'logDetail',
            'logDetailLoading',
            'addTestLog',
            'setOpenLogPanel',
            'setLogDetail',
            'setLogDetailLoading',
        ]),
    );
    const { updateNodesStatus } = useWorkflow();
    const flowData = useMemo(() => {
        if (!openLogPanel) return;
        return toObject();
    }, [openLogPanel, toObject]);
    const title = useMemo(() => {
        switch (logPanelMode) {
            case 'testRun':
                return getIntlText('workflow.editor.log_panel_title_test_run');
            case 'runLog':
                return getIntlText('workflow.editor.log_title_run');
            case 'testLog':
                return getIntlText('workflow.editor.log_title_test');
            case 'feVerify':
                return getIntlText('workflow.editor.log_panel_title_verification_result');
            default:
                return '';
        }
    }, [logPanelMode, getIntlText]);
    const isTestRunMode = logPanelMode === 'testRun';

    const handleClose = useCallback(() => {
        setOpenLogPanel(false);
        setEntryInput('');
        setLogDetail(undefined);
        setLogDetailLoading(false);
        updateNodesStatus(null);
    }, [setLogDetail, setLogDetailLoading, setOpenLogPanel, updateNodesStatus]);

    // ---------- Run Test ----------
    const [entryInput, setEntryInput] = useState('');
    const hasInput = useMemo(() => {
        if (!openLogPanel || !flowData || !isTestRunMode) return false;
        const nodes = getNodes();

        return !!nodes.find(({ type }) => type === 'trigger' || type === 'listener');
    }, [openLogPanel, flowData, isTestRunMode, getNodes]);

    const genDemoData = useCallback(() => {
        if (!openLogPanel || !isTestRunMode) return;
        const nodes = getNodes();
        const entryNode = nodes.find(({ type }) => type === 'trigger' || type === 'listener');
        const { parameters } = entryNode?.data || {};
        const result: Record<string, any> = {};

        switch (entryNode?.type) {
            case 'trigger': {
                const configs = parameters?.entityConfigs as NonNullable<
                    TriggerNodeDataType['parameters']
                >['entityConfigs'];

                if (!configs?.length) return result;
                configs.forEach(({ name, type }) => {
                    if (!name) return;
                    let value: any = genRandomString(8, { lowerCase: true });

                    switch (type) {
                        case 'BOOLEAN': {
                            value = Math.random() > 0.5;
                            break;
                        }
                        case 'INT':
                        case 'FLOAT': {
                            value = Math.floor(Math.random() * 100);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    result[name] = value;
                });
                break;
            }
            case 'listener': {
                const inputArgs = parameters?.entities;

                if (!inputArgs) return result;
                inputArgs.forEach((key: string) => {
                    result[key] = genRandomString(8, { lowerCase: true });
                });
                break;
            }
            default: {
                break;
            }
        }

        return result;
    }, [openLogPanel, isTestRunMode, getNodes]);

    const { run: runFlowTest } = useRequest(
        async (value?: string) => {
            if (!openLogPanel || !isTestRunMode) return;
            setLogDetailLoading(true);

            let input: Record<string, any>;
            try {
                input = !value ? undefined : JSON.parse(value || '{}');
            } catch (e) {
                toast.error({ content: getIntlText('common.message.json_format_error') });
                return;
            }
            const designData = toObject();
            const [error, resp] = await awaitWrap(
                workflowAPI.testFlow({ input, design_data: JSON.stringify(designData) }),
            );
            setLogDetailLoading(false);

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);
            const nodeStatus =
                data?.trace_infos.reduce(
                    (result: Record<string, WorkflowNodeStatus>, { node_id: nodeId, status }) => {
                        result[nodeId] = status;
                        return result;
                    },
                    {},
                ) || null;

            addTestLog({ id: genRandomString(8, { lowerCase: true }), ...data! });
            setLogDetail(data?.trace_infos);
            updateNodesStatus(nodeStatus);
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [openLogPanel, isTestRunMode, entryInput, toObject],
        },
    );

    // Auto run flow test when there is not trigger node in workflow
    useEffect(() => {
        if (!openLogPanel || !isTestRunMode) return;
        if (hasInput) {
            setEntryInput(JSON.stringify(genDemoData(), null, 2));
            return;
        }

        runFlowTest();
    }, [openLogPanel, isTestRunMode, hasInput, genDemoData, runFlowTest]);

    // Clear Data when panel mode change
    useEffect(() => {
        if (!logPanelMode) return;
        handleClose();
    }, [logPanelMode, handleClose]);

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-log-root', {
                hidden: !openLogPanel,
                loading: logDetailLoading,
            })}
        >
            <div className="ms-workflow-panel-log">
                <div className="ms-workflow-panel-config-header">
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <span className="title">{title}</span>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </div>
                <div className="ms-workflow-panel-config-body">
                    {hasInput && (
                        <div className="input-area">
                            <CodeEditor
                                editorLang="json"
                                title={getIntlText('common.label.input')}
                                value={entryInput}
                                onChange={setEntryInput}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                    !logDetailLoading ? (
                                        <PlayArrowIcon />
                                    ) : (
                                        <CircularProgress size={16} />
                                    )
                                }
                                disabled={logDetailLoading}
                                onClick={() => runFlowTest(entryInput)}
                            >
                                {getIntlText('common.label.run')}
                            </Button>
                        </div>
                    )}
                    {!!logDetail?.length && flowData && (
                        <div className="log-detail-area">
                            <ActionLog traceData={logDetail!} workflowData={flowData} />
                        </div>
                    )}
                </div>
                {logDetailLoading && <CircularProgress />}
            </div>
        </Panel>
    );
};

export default LogPanel;
