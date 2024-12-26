import { useState, useMemo, useEffect } from 'react';
import { Stack, IconButton, Button, TextField, CircularProgress } from '@mui/material';
import { Panel, useNodes, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon } from '@milesight/shared/src/components';
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
    const nodes = useNodes<WorkflowNode>();
    const { toObject } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const {
        openLogPanel,
        logPanelMode,
        logDetail,
        logDetailLoading,
        testLogs,
        setOpenLogPanel,
        setLogDetail,
        setLogDetailLoading,
    } = useFlowStore(
        useStoreShallow([
            'openLogPanel',
            'logPanelMode',
            'logDetail',
            'logDetailLoading',
            'testLogs',
            'setOpenLogPanel',
            'setLogDetail',
            'setLogDetailLoading',
        ]),
    );
    const { updateNodesStatus } = useWorkflow();
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

    const handleClose = () => {
        // TODO: remove node `$status` prop and close the panel
        setOpenLogPanel(false);
        updateNodesStatus(null);
    };

    // ---------- Run Test ----------
    const [entryInput, setEntryInput] = useState('');
    const showTestInput = useMemo(() => {
        if (logPanelMode !== 'testRun') return false;
        const hasTriggerNode = nodes.find(node => node.type === 'trigger');

        return !!hasTriggerNode;
    }, [nodes, logPanelMode]);
    const { run: runFlowTest } = useRequest(
        async () => {
            if (logPanelMode !== 'testRun') return;
            setLogDetailLoading(true);
            const dsl = toObject();
            // TODO: insert entryInput value into dsl
            const [error, resp] = await awaitWrap(workflowAPI.runFlow({ dsl }));
            setLogDetailLoading(false);

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);

            setLogDetail(data?.trace_infos);
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [logPanelMode, entryInput, toObject],
        },
    );

    // Auto run flow test when there is not trigger node in workflow
    useEffect(() => {
        if (logPanelMode !== 'testRun' || showTestInput) return;
        runFlowTest();
    }, [logPanelMode, showTestInput, runFlowTest]);

    console.log({ logDetail });
    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-log-root', { hidden: !openLogPanel })}
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
                    {showTestInput && (
                        <div className="input-area">
                            {/* TODO: Replace TextField with JSON Editor */}
                            <TextField
                                multiline
                                fullWidth
                                rows={8}
                                onChange={e => setEntryInput(e.target.value)}
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
                                onClick={runFlowTest}
                            >
                                {getIntlText('common.label.run')}
                            </Button>
                        </div>
                    )}
                    <div className="log-detail-area">
                        {!!logDetail?.length && (
                            <ActionLog traceData={logDetail!} workflowData={toObject()} />
                        )}
                    </div>
                </div>
            </div>
        </Panel>
    );
};

export default LogPanel;
