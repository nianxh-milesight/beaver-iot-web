import { useState, useCallback, useMemo } from 'react';
import {
    Panel,
    useNodes,
    useReactFlow,
    type Node,
    type ReactFlowProps,
    type UseOnSelectionChangeOptions,
} from '@xyflow/react';
import cls from 'classnames';
import { Paper, Stack, IconButton } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
// import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon } from '@milesight/shared/src/components';
import { basicNodeConfigs } from '../../constant';
import { useCommonFormItems, type CommonFormDataProps } from './hooks';
import './style.less';

/**
 * 配置面板组件
 */
const ConfigPanel = () => {
    const { getIntlText } = useI18n();

    // ---------- 节点相关逻辑处理 ----------
    const nodes = useNodes();
    const { updateNode } = useReactFlow();
    const selectedNode = useMemo(() => {
        const selectedNodes = nodes.filter(item => item.selected);
        const node = selectedNodes?.[0];

        if (selectedNodes.length > 1 || !node || !node.selected || node.dragging) {
            return;
        }

        return node;
    }, [nodes]);
    const nodeConfig = useMemo(() => {
        if (!selectedNode) return;

        return basicNodeConfigs[selectedNode.type as WorkflowNodeType];
    }, [selectedNode]);

    // ---------- 表单相关逻辑处理 ----------
    const { control, formState, handleSubmit, reset } = useForm<CommonFormDataProps>();
    const commonFormItems = useCommonFormItems();

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-config-root', {
                hidden: !nodeConfig,
            })}
        >
            {nodeConfig?.labelIntlKey && (
                <div className="ms-workflow-panel-config">
                    <div className="ms-workflow-panel-config-header">
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <span
                                className="icon"
                                style={{ backgroundColor: nodeConfig.iconBgColor }}
                            >
                                {nodeConfig.icon}
                            </span>
                            <span className="title">{getIntlText(nodeConfig.labelIntlKey)}</span>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {nodeConfig.testable && (
                                <IconButton
                                    onClick={() =>
                                        console.log('execute testing or popup test panel')
                                    }
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                            )}
                            <IconButton
                                onClick={() => {
                                    if (!selectedNode) return;
                                    updateNode(selectedNode.id, {
                                        selected: false,
                                    });
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </div>
                    <div className="ms-workflow-panel-config-body">
                        {commonFormItems.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                        <span>Other Arguments...</span>
                    </div>
                </div>
            )}
        </Panel>
    );
};

export default ConfigPanel;
