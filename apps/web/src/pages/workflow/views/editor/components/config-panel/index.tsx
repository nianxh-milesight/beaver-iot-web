import { useMemo, useLayoutEffect, useEffect, useRef } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { isEqual } from 'lodash-es';
import { useDebounceEffect } from 'ahooks';
import { Stack, IconButton, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon } from '@milesight/shared/src/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import useWorkflow from '../../hooks/useWorkflow';
import {
    useCommonFormItems,
    useNodeFormItems,
    type CommonFormDataProps,
    type NodeFormDataProps,
} from './hooks';
import useConfigPanelStore from './store';
import './style.less';

type FormDataProps = CommonFormDataProps & NodeFormDataProps;

/**
 * Config Panel
 */
const ConfigPanel = () => {
    const { getIntlText } = useI18n();
    const { updateNode, updateNodeData } = useReactFlow();

    // ---------- Handle Node-related logic ----------
    const { getSelectedNode } = useWorkflow();
    const selectedNode = useMemo(() => getSelectedNode(), [getSelectedNode]);
    const openPanel = !!selectedNode;
    const nodeConfig = useMemo(() => {
        if (!selectedNode) return;

        return basicNodeConfigs[selectedNode.type as WorkflowNodeType];
    }, [selectedNode]);

    // ---------- Entity List Data Init ----------
    const getEntityList = useConfigPanelStore(state => state.getEntityList);

    useLayoutEffect(() => {
        if (!openPanel) return;
        getEntityList(undefined, true);
    }, [openPanel, getEntityList]);

    // ---------- Handle Form-related logic ----------
    const { control, setValue, watch, reset } = useForm<FormDataProps>();
    const commonFormItems = useCommonFormItems();
    const nodeFormGroups = useNodeFormItems(selectedNode);
    const allFormData = watch();
    const preFormData = useRef<FormDataProps>();
    const formDataInit = useRef(false);
    // Use ref value to avoid unnecessary re-renders
    const latestFormData = useMemo(() => {
        if (isEqual(preFormData.current, allFormData)) {
            return preFormData.current;
        }

        preFormData.current = allFormData;
        return allFormData;
    }, [allFormData]);

    // Backfill form data
    useEffect(() => {
        if (!selectedNode) {
            formDataInit.current = false;
            return;
        }
        const { name, remark, parameters } = selectedNode.data || {};
        const data: Record<string, any> = { name, remark, ...parameters };

        reset();
        /**
         * Since node form items are rendered dynamically, `SetTimeout` is used here to
         * ensure that the initial data is filled in after the rendering is complete.
         */
        setTimeout(() => {
            Object.keys(data).forEach(key => {
                setValue(key, data[key]);
            });
            formDataInit.current = true;
        }, 0);
    }, [selectedNode, reset, setValue]);

    // Save node data
    useDebounceEffect(
        () => {
            if (!openPanel || !formDataInit.current) return;
            const { name, remark, ...formData } = latestFormData || {};

            updateNodeData(selectedNode.id, { name, remark, parameters: formData });
        },
        [openPanel, selectedNode, latestFormData, updateNodeData],
        { wait: 300 },
    );

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
                        {nodeFormGroups.map(({ groupName, children: formItems }, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <div className="ms-node-form-group" key={`${groupName || ''}-${index}`}>
                                {!!groupName && (
                                    <div className="ms-node-form-group-title">{groupName}</div>
                                )}
                                <div className="ms-node-form-group-item">
                                    {formItems?.map(props => (
                                        <Controller<NodeFormDataProps>
                                            {...props}
                                            key={props.name}
                                            control={control}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Panel>
    );
};

export default ConfigPanel;
