import React from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import useImportFormItems, { type FormDataProps } from './hook/useImportFormItems';
import { basicNodeConfigs } from '../../config';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** upload callback */
    onUpload?: (contains: WorkflowSchema) => Promise<void> | void;
}

/**
 * workflow import modal
 */
const ImportModal: React.FC<Props> = ({ visible, onCancel, onUpload, ...props }) => {
    const { getIntlText } = useI18n();
    const formItems = useImportFormItems();

    // ---------- forms processing ----------
    const { control, formState, handleSubmit, reset } = useForm<FormDataProps>();

    const onSubmit: SubmitHandler<FormDataProps> = async ({ ...params }) => {
        const { res, contains } = await validateFile(params.file[0]);
        if (res && contains) {
            if (onUpload) {
                await onUpload(contains);
            }
            // Clear the form data upon confirmation.
            reset();
        } else {
            toast.error(getIntlText('workflow.message.import_dsl_error'));
            reset();
        }
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel && onCancel();
    });
    const validateFile = (file: File): Promise<{ res: boolean; contains?: WorkflowSchema }> => {
        return new Promise(resolve => {
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const result: WorkflowSchema = JSON.parse(event.target?.result as string);
                        if (result.nodes?.length) {
                            const nodeTypes = Object.values(basicNodeConfigs).map(
                                item => item.type,
                            );
                            const isError = result.nodes.some(
                                item => !nodeTypes.includes(item.type as WorkflowNodeType),
                            );
                            resolve({ res: !isError, contains: result });
                        }
                        resolve({ res: false });
                    } catch (error) {
                        resolve({ res: false });
                    }
                };
                reader.readAsText(file);
            } else {
                resolve({ res: false });
            }
        });
    };
    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('workflow.button.label_import_from_dsl')}
            className={cls({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...props}
        >
            {formItems.map(props => (
                <Controller<FormDataProps> {...props} key={props.name} control={control} />
            ))}
        </Modal>
    );
};

export default ImportModal;
