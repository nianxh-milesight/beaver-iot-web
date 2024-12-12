import { Fragment } from 'react/jsx-runtime';
import { AccordionCard, AccordionHeader, AccordionTree } from './components';
import type { AccordionLog } from './types';
import './style.less';

// TODO mock data
const treeData: AccordionLog[] = [
    {
        key: '1',
        type: 'trigger',
        status: 'success',
        input: 'xxxx',
        output: 'yyyyyy',
    },
    {
        key: '2',
        type: 'code',
        status: 'failed',
        input: 'xxxx',
        output: 'yyyyyy',
        children: [
            {
                key: '2-1',
                type: 'service',
                status: 'failed',
                input: 'gsagsagas',
                output: 'yyyyyy',
                children: [
                    {
                        key: '2-1-1',
                        type: 'service',
                        status: 'failed',
                        input: 'gsagsagas',
                        output: 'yyyyyy',
                    },
                    {
                        key: '2-1-2',
                        type: 'timer',
                        status: 'failed',
                        input: '4444',
                        output: 'yyyyyy',
                    },
                ],
            },
            {
                key: '2-2',
                type: 'timer',
                status: 'failed',
                input: '4444',
                output: 'yyyyyy',
            },
        ],
    },
];

export default function AccordionUsage() {
    /** recursive rendering */
    const renderAccordion = (data: AccordionLog) => {
        const { children, ...item } = data || {};

        return (
            <>
                <AccordionCard header={<AccordionHeader data={item} />}>
                    <div>{item.input}</div>
                </AccordionCard>
                {children && (
                    <AccordionTree header="Parallel-1">
                        {children.map(child => (
                            <Fragment key={item.key}>
                                <div className="ms-log-branch">xxxx</div>
                                {renderAccordion(child)}
                            </Fragment>
                        ))}
                    </AccordionTree>
                )}
            </>
        );
    };

    return (
        <div className="ms-action-log">
            {treeData.map(item => (
                <Fragment key={item.key}>{renderAccordion(item)}</Fragment>
            ))}
        </div>
    );
}
