import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type WorkflowAPISchema } from '@/services/http';
import { basicNodeConfigs } from '../../config';
import type { NodeConfigItem } from './typings';

interface FlowStore {
    /** Workflow Node Configs */
    nodeConfigs: Record<WorkflowNodeType, NodeConfigItem>;

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
    testLogs?: WorkflowAPISchema['getLogList']['response']['content'];

    /**
     * Run Log List
     */
    runLogs?: WorkflowAPISchema['getLogList']['response']['content'];

    logDetail?: WorkflowAPISchema['getLogDetail']['response'];

    logDetailLoading?: boolean;

    setNodeConfigs: (nodeConfigs: WorkflowAPISchema['getFlowNodes']['response']) => void;

    setLogPanelMode: (logPanelMode: FlowStore['logPanelMode']) => void;

    setOpenLogPanel: (open: FlowStore['openLogPanel']) => void;

    setTestLogs: (testLogs: FlowStore['testLogs']) => void;

    setRunLogs: (runLogs: FlowStore['runLogs']) => void;

    setLogDetail: (detail?: FlowStore['logDetail']) => void;

    setLogDetailLoading: (loading: FlowStore['logDetailLoading']) => void;
}

const useFlowStore = create(
    immer<FlowStore>(set => ({
        nodeConfigs: basicNodeConfigs,

        testLogs: [
            {
                id: '1',
                start_time: 1733809691235,
                time_cost: 1000,
                status: 'Success',
            },
            {
                id: '2',
                start_time: 1733809691235,
                time_cost: 1000,
                status: 'Error',
            },
            {
                id: '3',
                start_time: 1733809691235,
                time_cost: 1000,
                status: 'Success',
            },
        ],

        setNodeConfigs: nodeConfigs => {
            const configs = Object.entries(nodeConfigs).reduce((acc, [cat, configs]) => {
                const result = configs.map(config => {
                    const schema =
                        typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
                    const basicConfig = Object.values(basicNodeConfigs).find(
                        item => item.componentName === config.name,
                    );

                    return {
                        type: config.name,
                        label: config.title,
                        ...basicConfig,
                        category: cat,
                        testable: schema?.component?.testable,
                        schema,
                    } as NodeConfigItem;
                });

                acc = acc.concat(result);
                return acc;
            }, [] as NodeConfigItem[]);
            const result = configs.reduce(
                (acc, config) => {
                    acc[config.type] = config;
                    return acc;
                },
                {} as FlowStore['nodeConfigs'],
            );

            set({ nodeConfigs: result });
        },
        setLogPanelMode: logPanelMode => set({ logPanelMode }),
        setOpenLogPanel: open => set({ openLogPanel: open }),
        setTestLogs: testLogs => set({ testLogs }),
        setRunLogs: runLogs => set({ runLogs }),
        setLogDetail: detail => set({ logDetail: detail }),
        setLogDetailLoading: loading => set({ logDetailLoading: loading }),
    })),
);

export default useFlowStore;
