import React from 'react';

import { useI18n } from '@milesight/shared/src/hooks';
import { AddCircleIcon } from '@milesight/shared/src/components';
import MarkdownEditor, { type MarkdownEditorProps } from '../markdown-editor';

import styles from './style.module.less';

/**
 * Email Notify Node
 * The Email Content Enter Component
 */
const EmailContent: React.FC<MarkdownEditorProps> = props => {
    const { getIntlText } = useI18n();

    return (
        <div className={styles['email-content']}>
            <div className={styles.header}>
                <div className={styles.title}>{getIntlText('common.label.content')}</div>
                <AddCircleIcon color="primary" />
            </div>
            <MarkdownEditor {...props} />
        </div>
    );
};

export default EmailContent;
