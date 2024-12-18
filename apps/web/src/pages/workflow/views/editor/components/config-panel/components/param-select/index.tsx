import { useCallback } from 'react';
import {
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    ListSubheader,
    type SelectProps,
} from '@mui/material';
import { isNil } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import useWorkflow from '@/pages/workflow/views/editor/hooks/useWorkflow';
import './style.less';

type ParamSelectValueType = string;

type OptionItemType = {
    nodeId: ApiKey;
    nodeName?: string;
    nodeType?: WorkflowNodeType;
    outputs: {
        name: string;
        type: string;
        key: string;
    }[];
};

export type ParamSelectProps = SelectProps<ParamSelectValueType>;

/**
 * Param Select Component
 *
 * Note: This is a basic component, use in IfelseNode
 */
const ParamSelect: React.FC<ParamSelectProps> = ({ label, required, disabled, ...props }) => {
    const { getIntlText } = useI18n();
    const { getUpstreamNodes } = useWorkflow();

    const renderOptions = useCallback(() => {
        const incomeNodes = getUpstreamNodes();
        // TODO: get the correct nodes params
        const data: OptionItemType[] = incomeNodes.map(node => ({
            nodeId: node.id,
            nodeName: node.data?.name,
            nodeType: node.type,
            outputs: [
                {
                    name: 'output112123123123123123123123131231231',
                    type: 'string',
                    key: `${node.type}.${node.id}.1132e3123132`,
                },
                {
                    name: 'output22',
                    type: 'number',
                    key: `${node.type}.${node.id}.11eyu3123132`,
                },
            ],
        }));

        // TODO: render Empty component when the options is empty
        return data.map(item => [
            <ListSubheader className="ms-param-select-option-groupname">
                {item.nodeType}
            </ListSubheader>,
            item.outputs.map(output => (
                <MenuItem className="ms-param-select-option" key={output.key} value={output.key}>
                    <div className="ms-param-select-item">
                        <Tooltip autoEllipsis className="name" title={output.name} />
                        <span className="type">{output.type}</span>
                    </div>
                </MenuItem>
            )),
        ]);
    }, [getUpstreamNodes]);

    return (
        <div className="ms-param-select">
            <FormControl fullWidth required={required} disabled={disabled}>
                <InputLabel id="param-select-label">
                    {!isNil(label) ? label : getIntlText('common.label.value')}
                </InputLabel>
                <Select<ParamSelectValueType>
                    {...props}
                    // @ts-ignore
                    notched
                    defaultValue=""
                    labelId="param-select-label"
                    label={!isNil(label) ? label : getIntlText('common.label.value')}
                    IconComponent={KeyboardArrowDownIcon}
                    MenuProps={{
                        className: 'ms-param-select-menu',
                        anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                        },
                        transformOrigin: {
                            vertical: 'top',
                            horizontal: 'right',
                        },
                    }}
                >
                    {renderOptions()}
                </Select>
            </FormControl>
        </div>
    );
};

export default ParamSelect;
