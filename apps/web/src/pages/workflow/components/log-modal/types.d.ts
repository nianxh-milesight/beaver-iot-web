import type { LogStatus } from '../../config';

export interface LogItemProps {
    /**
     * Key for Component render
     */
    key: string | number;
    /**
     * Node status
     */
    status: LogStatus;
    /**
     * Title
     */
    title: string;
    /**
     * Timestamp
     */
    timestamp: number;
}
