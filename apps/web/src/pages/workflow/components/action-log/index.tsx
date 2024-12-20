import { Fragment } from 'react/jsx-runtime';
import { isNil } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { AccordionCard, AccordionHeader, AccordionTree } from './components';
import { useNestedData } from './hooks';
import { ALPHABET_LIST } from './constant';
import type { ActionLogProps, LevelStructType, WorkflowNestNode } from './types';
import './style.less';

export default function AccordionUsage({ traceData, workflowData }: ActionLogProps) {
    const { getIntlText } = useI18n();
    const { treeData } = useNestedData({ workflowData, traceData });

    /** recursive rendering */
    const renderAccordion = (data: WorkflowNestNode, levelStruct: LevelStructType) => {
        const { children, attrs, ...item } = data || {};
        /** get parallel text */
        const { label: levelLabel, value: levelValue, parentValue } = levelStruct || {};
        const parentText = !isNil(parentValue) ? `${ALPHABET_LIST[parentValue]}` : '';
        const parallelLabel = `${levelLabel}${parentText}`;
        const parallelText = getIntlText('workflow.label.parallel', {
            1: `-${parallelLabel}`,
        });

        return (
            <>
                <AccordionCard header={<AccordionHeader data={attrs} />}>
                    {/* // TODO */}
                    <div>input</div>
                </AccordionCard>
                {!!children?.length && (
                    <AccordionTree header={parallelText}>
                        {children.map((child, ind) => {
                            const nextLevel = levelValue + 1;
                            const branchLabel = ALPHABET_LIST[ind];
                            const branchText = getIntlText('workflow.label.branch', {
                                1: `-${parallelLabel}-${branchLabel}`,
                            });

                            return (
                                <Fragment key={item.id}>
                                    <div className="ms-log-branch">{branchText}</div>
                                    {renderAccordion(child, {
                                        label: `${nextLevel + 1}`,
                                        value: nextLevel,
                                        parentValue: children.length > 1 ? ind : void 0,
                                    })}
                                </Fragment>
                            );
                        })}
                    </AccordionTree>
                )}
            </>
        );
    };
    return (
        <div className="ms-action-log">
            {treeData.map((item, index) => (
                <Fragment key={item.id}>
                    {renderAccordion(item, { label: `${index + 1}`, value: index })}
                </Fragment>
            ))}
        </div>
    );
}
