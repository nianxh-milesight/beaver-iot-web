import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';

/**
 * Form Item Props
 */
export type NodeFormDataProps = Record<string, any>;

const useNodeFormItems = (node: WorkflowNode) => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: Partial<Record<WorkflowNodeType, ControllerProps<NodeFormDataProps>[]>> = {
            trigger: [],
        };

        return result[node.type!];
    }, [node]);

    return formItems;
};

export default useNodeFormItems;
