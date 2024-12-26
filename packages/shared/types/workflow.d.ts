/**
 * ReactFlow 节点模型
 */
declare type ReactFlowNode<
    D extends Record<string, unknown> = Record<string, unknown>,
    T extends string = string,
> = import('@xyflow/react').Node<D, T> & {
    /** Backend Node Type */
    componentName: string;
};

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
declare type BaseNodeDataType<T extends Record<string, any> = Record<string, any>> = {
    /** Node Name */
    nodeName: string;
    /** Node Remark */
    nodeRemark?: string;
    /** Status */
    $status?: WorkflowNodeStatus;
    /** Error Message */
    $errMsg?: React.ReactNode;
    /** Flow Parameters */
    parameters?: T;
};

/**
 * 触发器节点参数类型
 */
declare type TriggerNodeDataType = BaseNodeDataType<{
    /** 输入参数 */
    entityConfigs: {
        arg: string;
        type: string;
    }[];
}>;

declare type TimePeriodType =
    | 'EVERYDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

/**
 * 定时器节点参数类型
 */
declare type TimerNodeDataType = BaseNodeDataType<{
    timerSettings: {
        type: 'ONCE' | 'SCHEDULE';
        timezone: string;
        executionEpochSecond?: number;
        rules?: {
            hour?: number;
            minute?: number;
            daysOfWeek?: TimePeriodType[];
        }[];
        expirationEpochSecond?: number;
    };
}>;

/**
 * 事件监听节点参数类型
 */
declare type ListenerNodeDataType = BaseNodeDataType<{
    entities: ApiKey[];
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
    choice: {
        when: {
            id: ApiKey;
            logicOperator: WorkflowLogicOperator;
            /**
             * 表达式类型（默认 `condition`）
             * @param mvel mvel 表达式
             * @param condition 条件表达式
             */
            expressionType: 'mvel' | 'condition';
            conditions: {
                id: ApiKey;
                expressionValue?:
                    | string
                    | {
                          key?: ApiKey;
                          operator?: WorkflowFilterOperator;
                          value?: string;
                      };
                /** 表达式备注 */
                expressionDescription?: string;
            }[];
        }[];
        otherwise: {
            id: ApiKey;
        };
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
    inputArguments: { key: string; value: string }[];
    /** 输出参数 */
    Payload: {
        name: ApiKey;
        type: EntityValueDataType;
    }[];
}>;

/**
 * 服务节点参数类型
 */
declare type ServiceNodeDataType = BaseNodeDataType<{
    /** Service Entity Key */
    serviceEntity: ApiKey;
    /**
     * Input variables of service entity
     */
    serviceParams: Record<ApiKey, string>;
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
    entities: ApiKey[];
}>;

/**
 * 邮件节点参数类型
 */
declare type EmailNodeDataType = BaseNodeDataType & {
    emailConfig: {
        provider: 'SMTP' | 'google';
        smtpConfig: {
            host: string;
            port: number;
            encryption: 'STARTTLS' | 'NONE';
            username: string;
            password: string;
        };
    };
    subject: string;
    recipients: string[];
    content: string;
};

/**
 * Webhook 节点参数类型
 */
declare type WebhookNodeDataType = BaseNodeDataType & {
    /** Custom Data */
    inputArguments?: {
        key: ApiKey;
        value: string;
    }[];
    /** Webhook URL */
    webhookUrl: string;
    /** Webhook Secret */
    secretKey?: string;
};

/**
 * 工作流节点模型
 */
// declare type WorkflowNode =
//     | ReactFlowNode<Partial<TriggerNodeDataType>, 'trigger'>
//     | ReactFlowNode<Partial<TimerNodeDataType>, 'timer'>
//     | ReactFlowNode<Partial<ListenerNodeDataType>, 'listener'>
//     | ReactFlowNode<Partial<IfElseNodeDataType>, 'ifelse'>
//     // | ReactFlowNode<EndNodeDataType, 'end'>
//     | ReactFlowNode<Partial<CodeNodeDataType>, 'code'>
//     | ReactFlowNode<Partial<ServiceNodeDataType>, 'service'>
//     | ReactFlowNode<Partial<AssignerNodeDataType>, 'assigner'>
//     | ReactFlowNode<Partial<SelectNodeDataType>, 'select'>
//     | ReactFlowNode<Partial<EmailNodeDataType>, 'email'>
//     | ReactFlowNode<Partial<WebhookNodeDataType>, 'webhook'>
//     | ReactFlowNode<Partial<BaseNodeDataType>, any>;
declare type WorkflowNode<T extends WorkflowNodeType | undefined = undefined> = T extends 'trigger'
    ? ReactFlowNode<Partial<TriggerNodeDataType>, 'trigger'>
    : T extends 'timer'
      ? ReactFlowNode<Partial<TimerNodeDataType>, 'timer'>
      : T extends 'listener'
        ? ReactFlowNode<Partial<ListenerNodeDataType>, 'listener'>
        : T extends 'ifelse'
          ? ReactFlowNode<Partial<IfElseNodeDataType>, 'ifelse'>
          : T extends 'code'
            ? ReactFlowNode<Partial<CodeNodeDataType>, 'code'>
            : T extends 'service'
              ? ReactFlowNode<Partial<ServiceNodeDataType>, 'service'>
              : T extends 'assigner'
                ? ReactFlowNode<Partial<AssignerNodeDataType>, 'assigner'>
                : T extends 'select'
                  ? ReactFlowNode<Partial<SelectNodeDataType>, 'select'>
                  : T extends 'email'
                    ? ReactFlowNode<Partial<EmailNodeDataType>, 'email'>
                    : T extends 'webhook'
                      ? ReactFlowNode<Partial<WebhookNodeDataType>, 'webhook'>
                      : ReactFlowNode<Partial<BaseNodeDataType>>;

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
