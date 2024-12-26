import { Fragment } from 'react/jsx-runtime';
import { Alert } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components';
import { AccordionCard, AccordionHeader, AccordionTree, ActionCodeEditor } from './components';
import { useNestedData } from './hooks';
import { ALPHABET_LIST } from './constant';
import type { ActionLogProps, WorkflowNestNode } from './types';
import './style.less';

/**
 * get alphabet index
 * @example getAlphabetIndex(0) => A
 */
const getAlphabetIndex = (index: number) => {
    if (index < 0) return;

    if (index > 26) {
        const first = Math.floor(index / 26);
        const second = index % 26;
        return `${ALPHABET_LIST[first - 1]}${ALPHABET_LIST[second]}`;
    }
    return ALPHABET_LIST[index];
};
export default function AccordionUsage({ traceData, workflowData }: ActionLogProps) {
    const { getIntlText } = useI18n();
    const { treeData } = useNestedData({ workflowData, traceData });

    /** recursive rendering */
    const renderAccordion = (treeData: WorkflowNestNode[], level: number = 0) => {
        // Existence of parallel branches
        const parallelBranchCount = treeData.reduce((acc, cur) => {
            if (cur.children?.length) acc++;
            return acc;
        }, 0);
        const hasParallelBranch = parallelBranchCount > 1;
        // current level
        const currentLevel = level + 1;
        // There are multiple parallel branches
        let multiBranchInParallelIndex = -1;

        return treeData.map(data => {
            const { children, attrs, ...item } = data || {};
            const { input, output, errorMessage } = attrs || {};

            // If there are child nodes, increment the index
            if ((children?.length || 0) > 1) {
                multiBranchInParallelIndex++;
            }

            const parallelLabel = hasParallelBranch
                ? `${currentLevel}${getAlphabetIndex(multiBranchInParallelIndex)}`
                : `${currentLevel}`;

            // Text to be displayed
            const parallelText = getIntlText('workflow.label.parallel', {
                1: `-${parallelLabel}`,
            });
            const branchText = getIntlText('workflow.label.branch', {
                1: `-${parallelLabel}-${getAlphabetIndex(multiBranchInParallelIndex)}`,
            });

            return (
                <Fragment key={item.id}>
                    <AccordionCard header={<AccordionHeader data={attrs} />}>
                        {errorMessage && (
                            <div className="ms-action-log__alert">
                                <Alert severity="error" icon={false}>
                                    <Tooltip autoEllipsis title={errorMessage} />
                                </Alert>
                            </div>
                        )}
                        {input && (
                            <div className="ms-action-log__input">
                                <ActionCodeEditor
                                    value={input}
                                    title={getIntlText('common.label.input')}
                                />
                            </div>
                        )}
                        {output && (
                            <div className="ms-action-log__output">
                                <ActionCodeEditor
                                    value={output}
                                    title={getIntlText('common.label.output')}
                                />
                            </div>
                        )}
                    </AccordionCard>
                    {!!children?.length && (
                        <AccordionTree header={parallelText}>
                            <div className="ms-log-branch">{branchText}</div>
                            {renderAccordion(children, currentLevel)}
                        </AccordionTree>
                    )}
                </Fragment>
            );
        });
    };

    return <div className="ms-action-log">{renderAccordion(treeData)}</div>;
}
