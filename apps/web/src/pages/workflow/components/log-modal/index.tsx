import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualList } from 'ahooks';
import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components';
import { LogItem } from './components';
import ActionLog from '../action-log';
import type { LogItemProps } from './types';
import './style.less';

export type IProps = ModalProps;
export default React.memo(({ visible, ...props }: IProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { getIntlText } = useI18n();
    const [activeItem, setActiveItem] = useState<LogItemProps>();

    // TODO: mock data
    const list: LogItemProps[] = useMemo(() => {
        return Array.from({ length: 1000 }).map(() => ({
            key: Math.random().toString(36).substring(2, 9),
            title: Math.random().toString(36).substring(2, 9),
            status: Math.random() > 0.5 ? 'success' : 'failed',
            timestamp: Date.now(),
        }));
    }, []);

    /** virtual list */
    const [virtualList, scrollTo] = useVirtualList(list, {
        containerTarget: containerRef,
        wrapperTarget: listRef,
        itemHeight: 62,
        overscan: 10,
    });

    /** When initializing, set the first as the default value */
    useEffect(() => {
        const [firstItem] = list || [];

        setActiveItem(firstItem);
        scrollTo(0);
    }, [list]);

    /** handle click left bar */
    const handleClick = useCallback((data: LogItemProps) => {
        setActiveItem(data);
    }, []);

    return (
        <Modal
            size="lg"
            footer={null}
            showCloseIcon
            visible={visible}
            title={getIntlText('workflow.modal.running_log')}
            className="ms-log-modal"
            {...props}
        >
            <div className="ms-log-container">
                <div className="ms-log-left-bar" ref={containerRef}>
                    <div className="ms-log-list" ref={listRef}>
                        {virtualList.map(({ data }) => (
                            <LogItem
                                data={data}
                                key={data.key}
                                isActive={data.key === activeItem?.key}
                                onClick={handleClick}
                            />
                        ))}
                    </div>
                </div>
                <div className="ms-log-right-bar">
                    <div className="ms-log-title">
                        <Tooltip title={activeItem?.title || ''} autoEllipsis />
                    </div>
                    <div className="ms-log-detail">
                        <ActionLog />
                    </div>
                </div>
            </div>
        </Modal>
    );
});
