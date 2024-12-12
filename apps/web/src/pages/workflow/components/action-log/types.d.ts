import type { LogStatus } from '../../config';

/**
 * Action Log Type
 */
export interface AccordionLog {
    /**
     * Key for Component render
     */
    key: string | number;
    /**
     * Node Type
     */
    type: WorkflowNodeType;
    /**
     * Custom header render config
     */
    config?: CustomConfigItemType;
    /**
     * Node status
     */
    status: LogStatus;
    /**
     * Input
     */
    input: string;
    /**
     * Output
     */
    output: string;
    /**
     * Children
     */
    children?: AccordionLog[];
}

/**
 * Custom header render config
 */
export type CustomConfigItemType = {
    /**
     * Label i18n key
     */
    labelIntlKey?: string;
    /**
     * Node Icon
     */
    icon?: React.ReactNode;
    /**
     * Node Icon background color
     */
    iconBgColor?: string;
};
