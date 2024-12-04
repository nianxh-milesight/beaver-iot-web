import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ArrowBackIcon } from '@milesight/shared/src/components';
import './style.less';

/**
 * Workflow 头部工具栏组件
 */
const Topbar = () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    return (
        <div className="ms-workflow-topbar">
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/workflow', { replace: true })}
            >
                {getIntlText('common.label.back')}
            </Button>
        </div>
    );
};

export default Topbar;
