import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import {
    ConditionsInput,
    EntityAssignSelect,
    EntityFilterSelect,
    EntitySelect,
    MarkdownEditor,
    ParamAssignInput,
    ParamInputSelect,
    TimerInput,
} from '../components';

/**
 * Form Item Props
 */
export type NodeFormDataProps = Record<string, any>;

const useNodeFormItems = (node?: WorkflowNode) => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        if (!node) return [];

        const result: Partial<Record<WorkflowNodeType, ControllerProps<NodeFormDataProps>[]>> = {
            trigger: [
                {
                    name: 'debug',
                    render({ field: { onChange, value }, fieldState: { error } }) {
                        return <EntitySelect value={value} onChange={onChange} />;
                    },
                },
                {
                    name: 'debug2',
                    render({ field: { onChange, value }, fieldState: { error } }) {
                        return <EntityAssignSelect value={value} onChange={onChange} />;
                    },
                },
            ],
            assigner: [],
            select: [
                {
                    name: 'entity',
                    render({ field: { onChange, value }, fieldState: { error } }) {
                        return <EntityFilterSelect value={value} onChange={onChange} />;
                    },
                },
            ],
            listener: [
                {
                    name: 'listener',
                    render({ field: { onChange, value }, fieldState: { error } }) {
                        return <EntityFilterSelect value={value} onChange={onChange} />;
                    },
                },
            ],
            code: [
                {
                    name: 'input_vars',
                    render({ field: { onChange, value }, fieldState: { error } }) {
                        return <ParamAssignInput value={value} onChange={onChange} />;
                    },
                },
            ],
            ifelse: [
                {
                    name: 'condition',
                    render({ field: { onChange, value }, fieldState: { error } }) {
                        return <ConditionsInput />;
                    },
                },
            ],
        };

        return result[node.type!];
    }, [node]);

    return formItems;
};

export default useNodeFormItems;
