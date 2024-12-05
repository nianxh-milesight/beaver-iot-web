import {
    SettingsEthernetIcon,
    EntityIcon,
    RoomServiceIcon,
    EmailIcon,
    WebhookIcon,
    TimerIcon,
    HearingIcon,
    InputIcon,
    CallSplitIcon,
    FactCheckIcon,
    // FlagIcon,
} from '@milesight/shared/src/components';

/**
 * Minimum scaling ratio
 */
export const MIN_ZOOM = 0.25;

/**
 * Maximum scaling ratio
 */
export const MAX_ZOOM = 2;

type NodeCategoryConfigItemType = {
    /** Node Category i18n key */
    labelIntlKey: string;
};

/**
 * Node category configs
 */
export const nodeCategoryConfigs: Record<WorkflowNodeCategoryType, NodeCategoryConfigItemType> = {
    entry: {
        labelIntlKey: 'workflow.label.node_category_entry',
    },
    control: {
        labelIntlKey: 'workflow.label.node_category_control',
    },
    action: {
        labelIntlKey: 'workflow.label.node_category_action',
    },
    external: {
        labelIntlKey: 'workflow.label.node_category_external',
    },
};

/**
 * Node config item type
 */
export type NodeConfigItemType = {
    /**
     * Node Type
     */
    type: WorkflowNodeType;
    /**
     * Label i18n key
     */
    labelIntlKey: string;
    /**
     * Node Icon
     */
    icon: React.ReactNode;
    /**
     * Node Icon background color
     */
    iconBgColor: string;
    /**
     * Node Category
     */
    category: WorkflowNodeCategoryType;
    /**
     * Independent testing enabled
     */
    testable?: boolean;
};

/**
 * Basic node configs
 */
export const basicNodeConfigs: Record<WorkflowNodeType, NodeConfigItemType> = {
    trigger: {
        type: 'trigger',
        labelIntlKey: 'workflow.label.trigger_node_name',
        icon: <InputIcon />,
        iconBgColor: '#3491FA',
        category: 'entry',
    },
    timer: {
        type: 'timer',
        labelIntlKey: 'workflow.label.timer_node_name',
        icon: <TimerIcon />,
        iconBgColor: '#3491FA',
        category: 'entry',
    },
    listener: {
        type: 'listener',
        labelIntlKey: 'workflow.label.listener_node_name',
        icon: <HearingIcon />,
        iconBgColor: '#3491FA',
        category: 'entry',
    },
    ifelse: {
        type: 'ifelse',
        labelIntlKey: 'workflow.label.ifelse_node_name',
        icon: <CallSplitIcon sx={{ transform: 'rotate(90deg)' }} />,
        iconBgColor: '#F57C00',
        category: 'control',
        testable: true,
    },
    // end: {
    //     type: 'end',
    //     labelIntlKey: 'workflow.label.end_node_name',
    //     icon: <FlagIcon />,
    //     iconBgColor: '#F57C00',
    //     category: 'control',
    // },
    code: {
        type: 'code',
        labelIntlKey: 'workflow.label.code_node_name',
        icon: <SettingsEthernetIcon />,
        iconBgColor: '#26A69A',
        category: 'action',
        testable: true,
    },
    assigner: {
        type: 'assigner',
        labelIntlKey: 'workflow.label.assigner_node_name',
        icon: <EntityIcon />,
        iconBgColor: '#26A69A',
        category: 'action',
    },
    service: {
        type: 'service',
        labelIntlKey: 'workflow.label.service_node_name',
        icon: <RoomServiceIcon />,
        iconBgColor: '#26A69A',
        category: 'action',
        testable: true,
    },
    select: {
        type: 'select',
        labelIntlKey: 'workflow.label.select_node_name',
        icon: <FactCheckIcon />,
        iconBgColor: '#26A69A',
        category: 'action',
        testable: true,
    },
    email: {
        type: 'email',
        labelIntlKey: 'workflow.label.email_node_name',
        icon: <EmailIcon />,
        iconBgColor: '#7E57C2',
        category: 'external',
        testable: true,
    },
    webhook: {
        type: 'webhook',
        labelIntlKey: 'workflow.label.webhook_node_name',
        icon: <WebhookIcon />,
        iconBgColor: '#7E57C2',
        category: 'external',
        testable: true,
    },
};

/**
 * Parallel nesting layer limit
 */
export const PARALLEL_DEPTH_LIMIT = 3;

/**
 * The addable Edge type
 */
export const EDGE_TYPE_ADDABLE: WorkflowEdgeType = 'addable';

/**
 * The default node width
 */
export const DEFAULT_NODE_WIDTH = 240;

/**
 * The default node height
 */
export const DEFAULT_NODE_HEIGHT = 50;

/**
 * Node X-axis spacing
 */
export const NODE_SPACING_X = 50;

/**
 * Node Y-axis spacing
 */
export const NODE_SPACING_Y = 50;
