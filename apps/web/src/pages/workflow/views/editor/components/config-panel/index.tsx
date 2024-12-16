import { useState, useCallback, useMemo, useLayoutEffect, useEffect } from 'react';
import {
    Panel,
    useReactFlow,
    type Node,
    type ReactFlowProps,
    type UseOnSelectionChangeOptions,
} from '@xyflow/react';
import cls from 'classnames';
import { Stack, IconButton, Divider } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
// import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon } from '@milesight/shared/src/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import useWorkflow from '../../hooks/useWorkflow';
import { useCommonFormItems, useNodeFormItems, type CommonFormDataProps } from './hooks';
import useConfigPanelStore from './store';
import './style.less';

/**
 * Config Panel
 */
const ConfigPanel = () => {
    const { getIntlText } = useI18n();

    // ---------- Handle Node-related logic ----------
    const { updateNode } = useReactFlow();
    const { selectedNode } = useWorkflow();
    const nodeConfig = useMemo(() => {
        console.log({ selectedNode });
        if (!selectedNode) return;

        return basicNodeConfigs[selectedNode.type as WorkflowNodeType];
    }, [selectedNode]);

    // ---------- Entity List Data Init ----------
    const getEntityList = useConfigPanelStore(state => state.getEntityList);

    useLayoutEffect(() => {
        if (!selectedNode) return;
        getEntityList(undefined, true);
    }, [selectedNode, getEntityList]);

    // ---------- Handle Form-related logic ----------
    const { control, formState, handleSubmit, reset } = useForm<CommonFormDataProps>();
    const commonFormItems = useCommonFormItems();
    const nodeFormItems = useNodeFormItems(selectedNode);

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-config-root', {
                hidden: !selectedNode,
            })}
        >
            <div className="ms-workflow-panel-config">
                <div className="ms-workflow-panel-config-header">
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <span className="icon" style={{ backgroundColor: nodeConfig?.iconBgColor }}>
                            {nodeConfig?.icon}
                        </span>
                        {!!nodeConfig?.labelIntlKey && (
                            <span className="title">{getIntlText(nodeConfig.labelIntlKey)}</span>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {nodeConfig?.testable && (
                            <IconButton
                                onClick={() => console.log('execute testing or popup test panel')}
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
                    <div className="ms-common-form-items">
                        {commonFormItems.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <Divider className="ms-divider" />
                    <div className="ms-node-form-items">
                        {nodeFormItems?.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Panel>
    );
};

export default ConfigPanel;
