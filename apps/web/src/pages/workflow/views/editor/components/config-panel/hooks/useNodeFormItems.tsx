import { useMemo, useState } from 'react';

import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import {
    CodeEditor,
    ConditionsInput,
    EntityAssignSelect,
    EntityFilterSelect,
    EntitySelect,
    ParamAssignInput,
    // ParamInputSelect,
    TimerInput,
    EmailContent,
    ParamInput,
    ServiceParamAssignInput,
    EmailSendSource,
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
    // const { getIntlText } = useI18n();
    const [serviceKey, setServiceKey] = useState<ApiKey>();
    const formConfigs = useMemo(() => {
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
                                return <EntityFilterSelect value={value} onChange={onChange} />;
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
                            name: 'input_vars',
                            render({ field: { onChange, value } }) {
                                return <ParamAssignInput value={value} onChange={onChange} />;
                            },
                        },
                    ],
                },
                {
                    children: [
                        {
                            name: 'code',
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
                            name: 'output_vars',
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
                            name: 'service',
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
                            name: 'paramList',
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
                            name: 'assignments',
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
                                return <EntityFilterSelect value={value} onChange={onChange} />;
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
                            name: 'recipient',
                            render({ field: { onChange, value } }) {
                                return (
                                    <TextField
                                        required
                                        fullWidth
                                        autoComplete="off"
                                        label="Email Recipient"
                                        helperText='Multiple recipients need to use ";" separate'
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
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
    }, [serviceKey]);

    return !node?.type ? [] : formConfigs[node.type as WorkflowNodeType] || [];
};

export default useNodeFormItems;
