import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired, checkMaxLength } from '@milesight/shared/src/utils/validators';

/**
 * type of dataSource
 */
export type FormDataProps = {
    name: string;
    remark?: string;
};

const useEditFormItems = (initialData?: FormDataProps) => {
    const { getIntlText } = useI18n();
    const { name = '', remark = '' } = initialData || {};
    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];
        result.push(
            {
                name: 'name',
                defaultValue: name,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 50 }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('workflow.modal.workflow_name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'remark',
                defaultValue: remark,
                rules: {
                    validate: { checkMaxLength: checkMaxLength({ max: 1000 }) },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            type="text"
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        );

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useEditFormItems;
