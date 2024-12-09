import React, { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import useEditFormItems, { type FormDataProps } from './hook/useWorkflowFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** confirm callback */
    onConfirm?: (params: FormDataProps) => Promise<void> | void;

    /** table-row item */
    data?: FormDataProps;

    /** table-row item */
    isAdd?: boolean;
}

/**
 * workflow add/edit modal
 */
const EditModal: React.FC<Props> = ({
    visible,
    isAdd = false,
    data,
    onCancel,
    onConfirm,
    ...props
}) => {
    const { getIntlText } = useI18n();

    // ---------- forms processing ----------
    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>();
    const formItems = useEditFormItems(data);

    const modalTitle = useMemo(() => {
        return isAdd
            ? getIntlText('workflow.modal.add_workflow_modal')
            : getIntlText('workflow.modal.edit_workflow_modal');
    }, [isAdd]);

    const onSubmit: SubmitHandler<FormDataProps> = async ({ ...params }) => {
        if (onConfirm) {
            await onConfirm(params);
        }
        // Clear the form data upon confirmation.
        reset();
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    return (
        <Modal
            visible={visible}
            title={modalTitle}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            sx={{ '& .MuiDialog-paper': { width: 600 } }}
            {...props}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default EditModal;
