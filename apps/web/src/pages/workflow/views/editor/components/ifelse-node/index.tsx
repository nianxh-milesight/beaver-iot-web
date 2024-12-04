import React from 'react';
import { Position, type Node, type NodeProps } from '@xyflow/react';
import { useI18n } from '@milesight/shared/src/hooks';
import Handle from '../handle';
import NodeContainer from '../node-container';
import { basicNodeConfigs } from '../../constant';

export type IfElseNode = Node<IfElseNodeDataType, 'ifelse'>;

const nodeConfig = basicNodeConfigs.ifelse;

/**
 * 输入节点
 */
const IfElseNode: React.FC<NodeProps<IfElseNode>> = props => {
    const { getIntlText } = useI18n();
    console.log(props);

    return (
        <NodeContainer
            type="ifelse"
            title={getIntlText(nodeConfig.labelIntlKey)}
            icon={nodeConfig.icon}
            iconBgColor={nodeConfig.iconBgColor}
            nodeProps={props}
            handles={[
                <Handle type="target" position={Position.Left} nodeProps={props} />,
                // TODO: 根据条件动态渲染多个操作柄
                <Handle
                    id="case-1"
                    type="source"
                    position={Position.Right}
                    nodeProps={props}
                    style={{ top: 20 }}
                />,
                <Handle
                    id="case-2"
                    type="source"
                    position={Position.Right}
                    nodeProps={props}
                    style={{ top: 40 }}
                />,
                <Handle
                    id="case-else"
                    type="source"
                    position={Position.Right}
                    nodeProps={props}
                    style={{ top: 60 }}
                />,
            ]}
        >
            {/* TODO: render conditions detail... */}
            <span>render cases...</span>
        </NodeContainer>
    );
};

export default React.memo(IfElseNode);
