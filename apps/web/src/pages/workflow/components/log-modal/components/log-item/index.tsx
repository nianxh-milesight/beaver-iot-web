import React, { useMemo } from 'react';
import cls from 'classnames';
import { ErrorIcon, CheckCircleIcon } from '@milesight/shared/src/components';
import { useTime } from '@milesight/shared/src/hooks';
import type { LOG_STATUS, LogItemProps } from '../../types';
import './style.less';

export interface IProps {
    isActive?: boolean;
    data: LogItemProps;
    onClick?: (data: LogItemProps) => void;
}
const StatusMap: Record<LOG_STATUS, { className: string; Icon: typeof CheckCircleIcon }> = {
    success: {
        className: 'ms-log-status__success',
        Icon: CheckCircleIcon,
    },
    failed: {
        className: 'ms-log-status__error',
        Icon: ErrorIcon,
    },
};
export default React.memo(({ data, isActive, onClick }: IProps) => {
    const { status, title, timestamp } = data || {};
    const { getTimeFormat } = useTime();

    const { className: statusClassName, Icon } = useMemo(() => StatusMap[status], [status]);
    return (
        <div
            className={cls('ms-log-item', {
                'ms-log-item--active': !!isActive,
            })}
            onClick={() => onClick?.(data)}
        >
            <div className={cls('ms-log-status', statusClassName)}>
                <Icon />
            </div>
            <div className="ms-log-content">
                <p className="ms-log-title">{title}</p>
                <p className="ms-log-timestamp">
                    {timestamp && getTimeFormat(timestamp, 'fullDateTimeSecondFormat')}
                </p>
            </div>
        </div>
    );
});
