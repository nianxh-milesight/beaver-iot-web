import React, { useMemo } from 'react';
import { useControllableValue } from 'ahooks';

import { MenuList, MenuItem, ListSubheader } from '@mui/material';
import { Tooltip } from '@/components';
import useWorkflow, {
    type FlattenNodeParamType,
} from '@/pages/workflow/views/editor/hooks/useWorkflow';

import './style.less';

export interface UpstreamNodeListProps {
    value?: FlattenNodeParamType;
    onChange: (value: FlattenNodeParamType) => void;
}

/**
 * Upstream node list
 */
const UpstreamNodeList: React.FC<UpstreamNodeListProps> = props => {
    const { getUpstreamNodeParams } = useWorkflow();
    const [nodeParams] = getUpstreamNodeParams();

    const [state, setState] = useControllableValue<FlattenNodeParamType>(props);

    const upstreamNodes = useMemo(() => {
        return nodeParams?.reduce((acc, param) => {
            param.outputs?.forEach(output => {
                acc.push({
                    nodeId: param.nodeId,
                    nodeName: param.nodeName,
                    nodeType: param.nodeType,
                    valueName: output.name,
                    valueType: output.type,
                    valueKey: output.key,
                });
            });
            return acc;
        }, [] as FlattenNodeParamType[]);
    }, [nodeParams]);

    const renderedUpstreamNodes = useMemo(() => {
        return nodeParams?.reduce((acc, node) => {
            acc.push(
                <ListSubheader key={node.nodeId} className="ms-upstream-node-list-option-groupname">
                    {node.nodeType}
                </ListSubheader>,
            );

            node.outputs.forEach(output => {
                acc.push(
                    <MenuItem
                        className="ms-upstream-node-list-option"
                        key={output.key}
                        selected={node.nodeId === state?.nodeId && output.key === state?.valueKey}
                        onClick={() => {
                            const node = upstreamNodes?.find(r => r.valueKey === output.key);
                            if (node) setState(node);
                        }}
                    >
                        <div className="ms-upstream-node-list-item">
                            <Tooltip autoEllipsis className="name" title={output.name} />
                            <span className="type">{output.type}</span>
                        </div>
                    </MenuItem>,
                );
            });
            return acc;
        }, [] as React.ReactNode[]);
    }, [state, nodeParams, upstreamNodes, setState]);

    /**
     * TODO: render Empty component when the options is empty
     */
    return <MenuList>{renderedUpstreamNodes}</MenuList>;
};

export default UpstreamNodeList;
