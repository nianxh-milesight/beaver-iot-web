import {
    checkRequired,
    checkRangeLength,
    type Validate,
} from '@milesight/shared/src/utils/validators';

/**
 * 节点数据校验器配置
 */
export const validatorsConfig: Record<string, Record<string, Validate>> = {
    /** 节点名称 */
    name: {
        checkRequired: checkRequired(),
        checkRangeLength: checkRangeLength({ min: 1, max: 50 }),
    },
    /** 节点备注 */
    remark: {
        checkRangeLength: checkRangeLength({ min: 1, max: 1000 }),
    },
};
