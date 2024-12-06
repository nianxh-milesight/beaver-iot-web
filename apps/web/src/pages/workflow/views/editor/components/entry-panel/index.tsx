import { memo, useState } from 'react';
import { Panel, useNodes } from '@xyflow/react';
import cls from 'classnames';
import { Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { basicNodeConfigs } from '../../constant';
import useInteractions from '../../hooks/useInteractions';
import './style.less';

const entryNodeConfigs = Object.values(basicNodeConfigs).filter(node => node.category === 'entry');

const EntryModal = () => {
    const { getIntlText } = useI18n();
    const nodes = useNodes();
    const { addNode } = useInteractions();
    const [selectedNodeType, setSelectedNodeType] = useState<WorkflowNodeType>();

    const handleCreate = () => {
        if (!selectedNodeType) return;
        addNode({ nodeType: selectedNodeType, position: { x: 0, y: 0 } });
    };

    return nodes.length ? null : (
        <Panel position="top-center" className="ms-workflow-panel-entry-root">
            <div className="ms-workflow-panel-entry">
                <div className="ms-workflow-panel-entry-header">
                    <div className="title">
                        {getIntlText('workflow.modal.entry_node_create_title')}
                    </div>
                </div>
                <div className="ms-workflow-panel-entry-body">
                    <div className="ms-workflow-entry-nodes">
                        {entryNodeConfigs.map(config => (
                            <div
                                className={cls('ms-node-item', {
                                    selected: config.type === selectedNodeType,
                                })}
                                key={config.type}
                                onClick={() => setSelectedNodeType(config.type)}
                            >
                                <div
                                    className="ms-node-item-icon"
                                    style={{ backgroundColor: config.iconBgColor }}
                                >
                                    {config.icon}
                                </div>
                                <div className="ms-node-item-info">
                                    <div className="ms-node-item-name">
                                        {getIntlText(config.labelIntlKey)}
                                    </div>
                                    <div className="ms-node-item-desc">
                                        {getIntlText(config.descIntlKey || '')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="ms-workflow-panel-entry-footer">
                    <Button variant="contained" disabled={!selectedNodeType} onClick={handleCreate}>
                        {getIntlText('common.label.create')}
                    </Button>
                </div>
            </div>
        </Panel>
    );
};

export default memo(EntryModal);
