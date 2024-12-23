import { type WorkflowAPISchema } from '@/services/http';
import type { FlowRunningStatus } from '@/services/http/workflow';

export interface LogItemProps {
    /**
     * Key for Component render
     */
    id: string | number;
    /**
     * Node status
     */
    status: FlowRunningStatus;
    /**
     * Title
     */
    title: string;
}

export type LogListPageType = WorkflowAPISchema['getLogList']['response'];

export interface PaginationModel {
    page: number;
    pageSize: number;
}

export type LogRenderListType = LogItemProps & { $$isFooterNode?: boolean };

export interface InfiniteScrollType {
    list: LogRenderListType[];
    source: LogListPageType;
    hasMore: boolean;
}
