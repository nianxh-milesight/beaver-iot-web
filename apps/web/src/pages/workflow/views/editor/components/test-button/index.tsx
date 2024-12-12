import { useCallback, useMemo, useState } from 'react';
import { ButtonGroup, Button, Popover, Tabs, Tab, CircularProgress } from '@mui/material';
import { useRequest } from 'ahooks';
import { useNodes } from '@xyflow/react';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { PlayArrowIcon, HistoryIcon } from '@milesight/shared/src/components';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { TabPanel } from '@/components';
import LogList, { type LogType, type LogListProps } from './log-list';
import useLogStore from '../../log-store';
import './style.less';

export type TestButtonType = 'test' | 'history';

type LogTabItem = {
    key: LogType;
    label: string;
    component: React.ReactNode;
};

interface Props {
    onClick?: () => void | Promise<void>;
}

const DEFAULT_TAB_KEY: LogType = 'test';

/**
 * Test Button
 */
const TestButton: React.FC<Props> = () => {
    const { getIntlText } = useI18n();
    const nodes = useNodes<WorkflowNode>();
    const {
        runLogs,
        testLogs,
        logDetailLoading,
        setRunLogs,
        setLogPanelMode,
        setOpenLogPanel,
        setLogDetail,
        setLogDetailLoading,
    } = useLogStore(
        useStoreShallow([
            'runLogs',
            'testLogs',
            'logDetailLoading',
            'setRunLogs',
            'setLogPanelMode',
            'setOpenLogPanel',
            'setLogDetail',
            'setLogDetailLoading',
        ]),
    );

    const { loading, run: getRunLogList } = useRequest(
        async () => {
            // const [error, resp] = await awaitWrap(workflowAPI.getLogList());
            // if (error || !isRequestSuccess(resp)) {
            //     return;
            // }
            // const data = getResponseData(resp);

            // TODO: get log list
            const log = {
                id: '1',
                start_time: Date.now(),
                status: 'success',
            };
            const data = new Array(100).fill(0).map((_, index) => ({
                ...log,
                id: index + 1,
                status: Math.floor(Math.random() * 10) % 2 === 0 ? 'success' : 'error',
            }));

            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });

            setRunLogs(data);
        },
        {
            manual: true,
            debounceWait: 300,
        },
    );

    // ---------- Popover ----------
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>, type: TestButtonType) => {
        if (type === 'test') {
            setOpenLogPanel(true);
            setLogPanelMode('testRun');
            return;
        }

        getRunLogList();
        setTabKey(DEFAULT_TAB_KEY);
        setAnchorEl(e.currentTarget);
    };
    const handleLogItemClick = useCallback(
        async (type: LogType, record: Parameters<NonNullable<LogListProps['onSelect']>>[0]) => {
            setAnchorEl(null);
            setOpenLogPanel(true);
            switch (type) {
                case 'test': {
                    setLogPanelMode('testLog');
                    break;
                }
                case 'run': {
                    setLogPanelMode('runLog');
                    break;
                }
                default: {
                    break;
                }
            }

            // TODO: get log detail
            setLogDetailLoading(true);
            const [error, resp] = await awaitWrap(workflowAPI.getLogDetail({ id: record.id }));
            setLogDetailLoading(false);

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);

            setLogDetail(data);
        },
        [setLogDetail, setLogDetailLoading, setLogPanelMode, setOpenLogPanel],
    );

    // ---------- Tab ----------
    const [tabKey, setTabKey] = useState<LogType>(DEFAULT_TAB_KEY);
    const tabs = useMemo<LogTabItem[]>(() => {
        return [
            {
                key: 'test',
                label: getIntlText('workflow.editor.logs_popover_title_test'),
                component: (
                    <LogList
                        type="test"
                        data={testLogs}
                        onSelect={record => handleLogItemClick('test', record)}
                    />
                ),
            },
            {
                key: 'run',
                label: getIntlText('workflow.editor.logs_popover_title_run'),
                component: (
                    <LogList
                        type="run"
                        data={runLogs}
                        loading={loading}
                        onSelect={record => handleLogItemClick('run', record)}
                    />
                ),
            },
        ];
    }, [runLogs, testLogs, loading, getIntlText, handleLogItemClick]);

    return (
        <>
            <ButtonGroup className="ms-workflow-test-button">
                <Button
                    variant="outlined"
                    disabled={logDetailLoading || !nodes?.length}
                    startIcon={
                        !logDetailLoading ? (
                            <PlayArrowIcon />
                        ) : (
                            <CircularProgress size={16} color="inherit" />
                        )
                    }
                    onClick={e => handleClick(e, 'test')}
                >
                    {getIntlText('common.label.test')}
                </Button>
                <Button variant="outlined" onClick={e => handleClick(e, 'history')}>
                    <HistoryIcon />
                </Button>
            </ButtonGroup>
            <Popover
                className="ms-workflow-test-popover-root"
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: -8,
                    horizontal: 'right',
                }}
            >
                <div className="ms-workflow-test-popover">
                    <div className="ms-workflow-test-popover-header">
                        <Tabs
                            className="ms-workflow-tabs"
                            value={tabKey}
                            onChange={(_, value) => setTabKey(value)}
                        >
                            {tabs.map(({ key, label }) => (
                                <Tab
                                    disableRipple
                                    key={key}
                                    value={key}
                                    title={label}
                                    label={label}
                                />
                            ))}
                        </Tabs>
                    </div>
                    <div className="ms-workflow-test-popover-body">
                        {tabs.map(({ key, component }) => (
                            <TabPanel value={tabKey} index={key} key={key}>
                                {component}
                            </TabPanel>
                        ))}
                    </div>
                </div>
            </Popover>
        </>
    );
};

export default TestButton;
