import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type WorkflowAPISchema } from '@/services/http';

interface LogStore {
    /**
     * Log Panel Mode
     *
     * @param testRun Render Test Run Panel
     * @param testLog Render Test Log Detail
     * @param runLog Render Run Log Detail
     * @param feVerify Render Frontend Verification Detail
     */
    logPanelMode?: 'testRun' | 'testLog' | 'runLog' | 'feVerify';

    /**
     * Open Log Panel
     */
    openLogPanel?: boolean;

    /**
     * Test Log List
     */
    testLogs?: WorkflowAPISchema['getLogList']['response'];

    /**
     * Run Log List
     */
    runLogs?: WorkflowAPISchema['getLogList']['response'];

    logDetail?: WorkflowAPISchema['getLogDetail']['response'];

    logDetailLoading?: boolean;

    setLogPanelMode: (logPanelMode: LogStore['logPanelMode']) => void;

    setOpenLogPanel: (open: LogStore['openLogPanel']) => void;

    setTestLogs: (testLogs: LogStore['testLogs']) => void;

    setRunLogs: (runLogs: LogStore['runLogs']) => void;

    setLogDetail: (detail?: LogStore['logDetail']) => void;

    setLogDetailLoading: (loading: LogStore['logDetailLoading']) => void;
}

const useLogStore = create(
    immer<LogStore>(set => ({
        testLogs: [
            {
                id: '1',
                start_time: 1733809691235,
                status: 'success',
            },
            {
                id: '2',
                start_time: 1733809691235,
                status: 'error',
            },
            {
                id: '3',
                start_time: 1733809691235,
                status: 'success',
            },
        ],
        setLogPanelMode: logPanelMode => set({ logPanelMode }),
        setOpenLogPanel: open => set({ openLogPanel: open }),
        setTestLogs: testLogs => set({ testLogs }),
        setRunLogs: runLogs => set({ runLogs }),
        setLogDetail: detail => set({ logDetail: detail }),
        setLogDetailLoading: loading => set({ logDetailLoading: loading }),
    })),
);

export default useLogStore;
