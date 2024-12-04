/**
 * ReactFlow 节点模型
 */
declare type ReactFlowNode<
    D extends Record<string, unknown> = Record<string, unknown>,
    T extends string = string,
> = import('@xyflow/react').Node<D, T>;

/**
 * ReactFlow 边模型
 */
declare type ReactFlowEdge<
    D extends Record<string, unknown> = Record<string, unknown>,
    T extends string = string,
> = import('@xyflow/react').Edge<D, T>;

/**
 * ReactFlow 视口模型
 */
declare type ReactFlowViewport = import('@xyflow/react').Viewport;

/**
 * 节点类型
 * @param trigger 触发器节点
 * @param timer 定时节点
 * @param listener 监听器节点
 * @param ifelse 条件节点
 * @param code 代码节点
 * @param service 实体服务调用节点
 * @param assigner 实体赋值节点
 * @param select 实体选择节点
 * @param email 邮件节点
 * @param webhook webhook 节点
 */
declare type WorkflowNodeType =
    | 'trigger'
    | 'timer'
    | 'listener'
    | 'ifelse'
    | 'code'
    | 'service'
    | 'assigner'
    | 'select'
    | 'email'
    | 'webhook';

/**
 * 边类型
 * @param addable 可添加节点的边
 */
declare type WorkflowEdgeType = 'addable';

/**
 * 节点分类
 * @param entry 入口节点
 * @param control 控制节点
 * @param action 动作节点
 * @param external 外部节点
 */
declare type WorkflowNodeCategoryType = 'entry' | 'control' | 'action' | 'external';

/**
 * Node Status Type
 */
declare type WorkflowNodeStatus = 'error' | 'success' | 'loading';

/**
 * 节点基础数据类型（以 $ 开头的均为前端私有属性）
 */
declare type BaseNodeDataType<T extends Record<string, any>> = {
    /** 名称 */
    name: string;
    /** 描述 */
    remark?: string;
    /** 后端组件 ID */
    componentId?: string;
    /** 状态 */
    $status?: WorkflowNodeStatus;
    /** 错误信息 */
    $errMsg?: React.ReactNode;
    /** 流程参数 */
    parameters?: T;
};

/**
 * 触发器节点参数类型
 */
declare type TriggerNodeDataType = BaseNodeDataType<{
    /** 输入参数 */
    entityConfigs: {
        name: string;
        type: EntityValueDataType;
        value: any;
    }[];
}>;

/**
 * 定时器节点参数类型
 */
declare type TimerNodeDataType = BaseNodeDataType<{
    /**
     * 执行类型
     * @param ONCE 单次执行
     * @param CYCLE 周期执行
     */
    type: 'ONCE' | 'CYCLE';
    /** 首次执行时间 */
    firstExecutionTime?: number;
    /** 过期时间，默认 2035/01/01 00:00 */
    expireTime?: number;
    /** 周期配置 */
    settings?: {
        /** 执行周期 */
        period:
            | 'EVERYDAY'
            | 'Monday'
            | 'Tuesday'
            | 'Wednesday'
            | 'Thursday'
            | 'Friday'
            | 'Saturday'
            | 'Sunday';
        /**
         * 执行时间，该数据为零点到所选时间点的毫秒数，默认 32400000(09:00)
         */
        time: number;
    }[];
}>;

/**
 * 事件监听节点参数类型
 */
declare type ListenerNodeDataType = BaseNodeDataType<{
    /**
     * 监听类型
     * @param change 实体数据变更
     * @param call 服务调用
     * @param report 事件上报
     */
    type: 'change' | 'call' | 'report';
    /** 监听目标 */
    target: ApiKey;
    /** 输出参数 */
    // outputs?: {
    //     key: ApiKey;
    //     name: string;
    //     type: EntityType;
    //     value: any;
    // }[];
}>;

declare type WorkflowLogicOperator = 'AND' | 'OR';

declare type WorkflowFilterOperator =
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'START_WITH'
    | 'END_WITH'
    | 'IS'
    | 'IS_NOT'
    | 'IS_EMPTY'
    | 'IS_NOT_EMPTY';

/**
 * 条件节点参数类型
 *
 * 注意：实际节点渲染时需默认增加一个 else 分支
 */
declare type IfElseNodeDataType = BaseNodeDataType<{
    when: {
        id: ApiKey;
        [logic: WorkflowLogicOperator]: {
            /**
             * 表达式类型（默认 `condition`，且当前仅支持 `condition`）
             * @param mvel mvel 表达式
             * @param condition 条件表达式
             */
            expressionType: 'mvel' | 'condition';
            /** 表达式值 */
            expressionValue: {
                id: ApiKey;
                key: ApiKey;
                operator: WorkflowFilterOperator;
                value?: string;
            };
        }[];
    }[];
    otherwise: {
        id: ApiKey;
    };
}>;

/**
 * 结束节点参数类型
 */
// declare type EndNodeDataType = BaseNodeDataType<{
//     /** 输出参数 */
//     outputs: {
//         key: ApiKey;
//         type: EntityValueDataType;
//         value: any;
//     }[];
// }>;

/**
 * 代码节点参数类型
 */
declare type CodeNodeDataType = BaseNodeDataType<{
    /** 代码语言 */
    language: string;
    /** 代码内容 */
    expression: string;
    /** 输入参数 */
    inputArguments: Record<ApiKey, string>;
    /** 输出参数 */
    outputArguments: {
        name: ApiKey;
        type: EntityValueDataType;
    }[];
}>;

/**
 * 服务节点参数类型
 */
declare type ServiceNodeDataType = BaseNodeDataType<{
    /** 服务实体 Key */
    serviceEntity: ApiKey;
    /**
     * 输入参数
     *
     * TODO: 该参数后端设计与需求输入限制表不符，待确认
     */
    serviceParams: Record<ApiKey, string>;
    // inputs: {
    //     name: ApiKey;
    //     type: EntityValueDataType;
    //     value: any;
    //     source: ApiKey;
    // }[];
}>;

/**
 * 赋值节点参数类型
 */
declare type AssignerNodeDataType = BaseNodeDataType<{
    exchangePayload: Record<ApiKey, string>;
}>;

/**
 * 实体选择节点参数类型
 */
declare type SelectNodeDataType = BaseNodeDataType<{
    settings: {
        /**
         * 监听类型
         * @param change 实体数据变更
         * @param call 服务调用
         * @param report 事件上报
         */
        type: 'change' | 'call' | 'report';
        /** 监听目标 */
        target: ApiKey;
    }[];
}>;

/**
 * 邮件节点参数类型
 */
declare type EmailNodeDataType = BaseNodeDataType & {
    /** 邮箱类型 */
    type: 'gmail';
    /** 邮箱 API Key */
    apiKey: ApiKey;
    /** 邮箱 */
    email: string | string[];
    /** 邮件内容 */
    content: string;
    /** 输出参数 */
    // outputs: {
    //     name: ApiKey;
    //     type: EntityValueDataType;
    //     value: any;
    // }[];
};

/**
 * Webhook 节点参数类型
 */
declare type WebhookNodeDataType = BaseNodeDataType & {
    /** 推送数据（来源于上个节点） */
    data: ApiKey[];
    /** 自定义数据 */
    customData: {
        key: ApiKey;
        type: EntityValueDataType;
        value: any;
    }[];
    /** Webhook URL */
    url: string;
    /** Webhook 密钥 */
    secret: string;
    /** 输出参数 */
    outputs: {
        name: ApiKey;
        type: EntityValueDataType;
        value: any;
    }[];
};

/**
 * 工作流节点模型
 */
declare type WorkflowNode =
    | ReactFlowNode<Partial<TriggerNodeDataType>, 'trigger'>
    | ReactFlowNode<Partial<TimerNodeDataType>, 'timer'>
    | ReactFlowNode<Partial<ListenerNodeDataType>, 'listener'>
    | ReactFlowNode<Partial<IfElseNodeDataType>, 'ifelse'>
    // | ReactFlowNode<EndNodeDataType, 'end'>
    | ReactFlowNode<Partial<CodeNodeDataType>, 'code'>
    | ReactFlowNode<Partial<ServiceNodeDataType>, 'service'>
    | ReactFlowNode<Partial<AssignerNodeDataType>, 'assigner'>
    | ReactFlowNode<Partial<SelectNodeDataType>, 'select'>
    | ReactFlowNode<Partial<EmailNodeDataType>, 'email'>
    | ReactFlowNode<Partial<WebhookNodeDataType>, 'webhook'>;

/**
 * 工作流边模型
 */
declare type WorkflowEdge = ReactFlowEdge<
    {
        /** 标识鼠标是否 hover */
        $hovering?: boolean;
    },
    WorkflowEdgeType
>;

/**
 * 工作流数据模型
 */
declare type WorkflowSchema = {
    /** 版本号 */
    version: string;
    /** 名称 */
    name: string;
    /** 描述 */
    remark?: string;
    /** 节点 */
    nodes: WorkflowNode[];
    /** 边 */
    edges: WorkflowEdge[];
    /** 视口 */
    viewport: ReactFlowViewport;
};
