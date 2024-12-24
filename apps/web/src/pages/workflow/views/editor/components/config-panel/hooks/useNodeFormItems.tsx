import { useMemo, useState } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { isEmpty } from 'lodash-es';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import useFlowStore from '../../../store';
import {
    CodeEditor,
    ConditionsInput,
    EntityAssignSelect,
    EntityMultipleSelect,
    EntitySelect,
    ParamAssignInput,
    // ParamInputSelect,
    TimerInput,
    EmailContent,
    ParamInput,
    ServiceParamAssignInput,
    EmailSendSource,
    EmailRecipients,
} from '../components';

type NodeFormGroupType = {
    groupName?: string;
    helperText?: string;
    children?: (ControllerProps<NodeFormDataProps> & {
        /**
         * To Control whether the current component is rendered
         */
        shouldRender?: (data: NodeFormDataProps) => boolean;
    })[];
};

/**
 * Form Item Props
 */
export type NodeFormDataProps = Record<string, any>;

const useNodeFormItems = (node?: WorkflowNode) => {
    const nodeConfigs = useFlowStore(state => state.nodeConfigs);
    // const { getIntlText } = useI18n();
    const [serviceKey, setServiceKey] = useState<ApiKey>();

    const formConfigs = useMemo(() => {
        if (!Object.keys(nodeConfigs).length) return {};
        console.log({ nodeConfigs });
        // const result2: Partial<Record<WorkflowNodeType, NodeFormGroupType[]>> = {};

        // Object.entries(nodeConfigs).forEach(([nodeType, nodeConfig]) => {
        //     const { properties = {}, outputProperties = {} } = nodeConfig.schema || {};
        //     const formConfigs = Object.values(properties)
        //         .filter(item => !item.autowired)
        //         .sort((a, b) => (a.index || 0) - (b.index || 0))
        //         .concat(
        //             Object.values(outputProperties)
        //                 .filter(item => !item.autowired)
        //                 .sort((a, b) => (a.index || 0) - (b.index || 0)),
        //         );

        //     formConfigs.forEach(
        //         ({
        //             name,
        //             type,
        //             secret,
        //             required,
        //             enum: enums,
        //             defaultValue,
        //             displayName,
        //             description,
        //             uiComponent,
        //             uiComponentGroup,
        //         }) => {
        //             const groupName = uiComponentGroup || name;
        //         },
        //     );
        // });

        const result: Partial<Record<WorkflowNodeType, NodeFormGroupType[]>> = {
            trigger: [
                {
                    // TODO: the name may come from api config
                    groupName: 'Arguments',
                    children: [
                        {
                            name: 'entityConfigs',
                            render({ field: { onChange, value } }) {
                                return <ParamInput value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            timer: [
                {
                    // TODO: the name may come from api config
                    groupName: 'Timer Setting',
                    children: [
                        {
                            name: 'timer',
                            render({ field: { onChange, value } }) {
                                return <TimerInput value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            listener: [
                {
                    groupName: 'Entity Listening Setting',
                    children: [
                        {
                            name: 'entities',
                            render({ field: { onChange, value } }) {
                                return <EntityMultipleSelect value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            ifelse: [
                {
                    children: [
                        {
                            name: 'choice',
                            render({ field: { onChange, value } }) {
                                return <ConditionsInput value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            code: [
                {
                    groupName: 'Input Variables',
                    children: [
                        {
                            name: 'inputArguments',
                            render({ field: { onChange, value } }) {
                                return <ParamAssignInput value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
                {
                    children: [
                        {
                            name: 'expression',
                            render({ field: { onChange, value } }) {
                                return <CodeEditor value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
                {
                    groupName: 'Output Variables',
                    children: [
                        {
                            name: 'payload',
                            render({ field: { onChange, value } }) {
                                return <ParamInput showSwitch value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            service: [
                {
                    groupName: 'Service Setting',
                    children: [
                        {
                            name: 'serviceParams',
                            render({ field: { onChange, value } }) {
                                return (
                                    <EntitySelect
                                        filterModel={{ type: 'SERVICE' }}
                                        value={value}
                                        onChange={value => {
                                            setServiceKey(value);
                                            onChange(value);
                                        }}
                                    />
                                );
                            },
                        },
                    ],
                },
                {
                    groupName: 'Input Variables',
                    helperText: 'Please select the service you want to call first.',
                    children: [
                        {
                            name: 'serviceParams',
                            render({ field: { onChange, value } }) {
                                return (
                                    <ServiceParamAssignInput
                                        serviceKey={serviceKey}
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
                            },
                        },
                    ],
                },
            ],
            assigner: [
                {
                    groupName: 'Assignment Setting',
                    children: [
                        {
                            name: 'exchangePayload',
                            render({ field: { onChange, value } }) {
                                return <EntityAssignSelect value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            select: [
                {
                    groupName: 'Entity Select Setting',
                    children: [
                        {
                            name: 'entitySelect',
                            render({ field: { onChange, value } }) {
                                return <EntityMultipleSelect value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            email: [
                {
                    groupName: 'Email Sending Source',
                    children: [
                        {
                            name: 'config',
                            render({ field: { onChange, value } }) {
                                return <EmailSendSource value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
                {
                    groupName: 'Email Content',
                    children: [
                        {
                            name: 'subject',
                            render({ field: { onChange, value } }) {
                                return (
                                    <TextField
                                        required
                                        fullWidth
                                        autoComplete="off"
                                        label="Subject"
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
                            },
                        },
                        {
                            name: 'recipient',
                            render({ field: { value, onChange } }) {
                                return <EmailRecipients value={value} onChange={onChange} />;
                            },
                        },
                        {
                            name: 'content',
                            render({ field: { onChange, value } }) {
                                return <EmailContent value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
            webhook: [
                {
                    groupName: 'Webhook Arguments',
                    children: [
                        {
                            name: 'webhookUrl',
                            render({ field: { onChange, value } }) {
                                return (
                                    <TextField
                                        required
                                        fullWidth
                                        label="Webhook URL"
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
                            },
                        },
                        {
                            name: 'secretKey',
                            render({ field: { onChange, value } }) {
                                return (
                                    <TextField
                                        fullWidth
                                        label="Secret Key"
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
                            },
                        },
                    ],
                },
                {
                    groupName: 'Custom Data',
                    children: [
                        {
                            name: 'custom_data',
                            render({ field: { onChange, value } }) {
                                return <ParamAssignInput value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
            ],
        };

        return result;
    }, [serviceKey, nodeConfigs]);

    return !node?.type ? [] : formConfigs[node.type as WorkflowNodeType] || [];
};

export default useNodeFormItems;
