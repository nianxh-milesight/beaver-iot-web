import React, { useMemo } from 'react';
import cls from 'classnames';
import { Tooltip } from '@/components';
import { basicNodeConfigs, LogStatusMap } from '@/pages/workflow/config';
import type { AccordionLog } from '../../types';
import './style.less';

interface IProps {
    data: AccordionLog;
}
export default React.memo(({ data }: IProps) => {
    /** Get the header render config */
    const { icon, iconBgColor, name, status } = useMemo(() => {
        const { type, config, status, name } = data || {};
        const { icon, iconBgColor, labelIntlKey } = config || {};
        const result = basicNodeConfigs[type];

        return {
            status,
            name,
            icon: icon || result?.icon,
            iconBgColor: iconBgColor || result?.iconBgColor,
            labelIntlKey: labelIntlKey || result?.labelIntlKey,
        };
    }, [data]);

    /** Get this state render config */
    const { className: statusClassName, icon: statusIcon } = useMemo(
        () => LogStatusMap[status] || {},
        [status],
    );
    return (
        <div className="ms-accordion-header">
            <div className="ms-header-type">
                <div className="ms-header-type__icon" style={{ backgroundColor: iconBgColor }}>
                    {icon}
                </div>
                <div className="ms-header-type__name">
                    <Tooltip autoEllipsis title={name || ''} />
                </div>
            </div>
            <div className={cls('ms-header-status', statusClassName)}>{statusIcon}</div>
        </div>
    );
});
