import React from 'react';
import cls from 'classnames';
import { Backdrop, Slide, IconButton, Button, Divider, Alert } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon, CheckCircleIcon } from '@milesight/shared/src/components';
import { CodeEditor } from '@/components';
import './style.less';

export interface TestDrawerProps {
    title?: string;
    open: boolean;
    onClose: () => void;
}

const TestDrawer: React.FC<TestDrawerProps> = ({ title, open, onClose }) => {
    const { getIntlText } = useI18n();

    return (
        <div className={cls('ms-config-panel-test-drawer-root', { open })}>
            <Backdrop open={open} onClick={onClose}>
                <Slide direction="up" in={open}>
                    <div className="ms-config-panel-test-drawer" onClick={e => e.stopPropagation()}>
                        <div className="ms-config-panel-test-drawer-header">
                            <div className="ms-config-panel-test-drawer-title">
                                {title || 'Test xxx Node'}
                            </div>
                            <IconButton onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <div className="ms-config-panel-test-drawer-body">
                            <div className="input-content-area">
                                <CodeEditor
                                    editorLang="json"
                                    title={getIntlText('common.label.input')}
                                />
                                <Button fullWidth variant="contained" startIcon={<PlayArrowIcon />}>
                                    {getIntlText('common.label.run')}
                                </Button>
                            </div>
                            <Divider />
                            <div className="output-content-area">
                                <Alert severity="success" icon={<CheckCircleIcon />}>
                                    Success
                                </Alert>
                                <CodeEditor
                                    editorLang="json"
                                    title={getIntlText('common.label.output')}
                                />
                            </div>
                        </div>
                    </div>
                </Slide>
            </Backdrop>
        </div>
    );
};

export default React.memo(TestDrawer);
