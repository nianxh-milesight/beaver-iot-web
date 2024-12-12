export type LOG_STATUS = 'success' | 'failed';

export interface LogItemProps {
    key: string | number;
    status: LOG_STATUS;
    title: string;
    timestamp: number;
}
