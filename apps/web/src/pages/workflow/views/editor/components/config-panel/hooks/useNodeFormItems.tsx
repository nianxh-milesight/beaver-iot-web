import { useMemo } from 'react';
import { get } from 'lodash-es';

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
    ParamInput,
    // ParamInputSelect,
    TimerInput,
    EmailTypeSelect,
    EMAIL_TYPE,
    EmailContent,
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
                            name: 'when',
                            render({ field: { onChange, value } }) {
                                return <ConditionsInput />;
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
                            render({ field: { onChange, value }, fieldState, formState }) {
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
                                        onChange={onChange}
                                    />
                                );
                            },
                        },
                    ],
                },
                {
                    groupName: 'Input Variables',
                    helperText: 'Please select the service you want to call first.',
                    children: [],
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
                            name: 'emailType',

                            render({ field: { onChange, value } }) {
                                return (
                                    <EmailTypeSelect required value={value} onChange={onChange} />
                                );
                            },
                        },
                        {
                            name: 'emailApiKey',
                            shouldRender: data => {
                                return get(data, 'emailType') === EMAIL_TYPE.GMAIL;
                            },
                            render({ field: { onChange, value } }) {
                                return (
                                    <TextField
                                        fullWidth
                                        autoComplete="new-password"
                                        label="SerpApi API Key"
                                        type="text"
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
                            },
                        },
                    ],
                },
                {
                    groupName: 'Email Content',
                    children: [
                        {
                            name: 'emailRecipient',
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
            ],
        };

        return result;
    }, []);

    return !node?.type ? [] : formConfigs[node.type] || [];
};

export default useNodeFormItems;
