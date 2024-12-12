import {
    checkRequired,
    checkRangeLength,
    type Validate,
} from '@milesight/shared/src/utils/validators';

/**
 * Node Data Validators Config
 */
export const validatorsConfig: Record<string, Record<string, Validate>> = {
    name: {
        checkRequired: checkRequired(),
        checkRangeLength: checkRangeLength({ min: 1, max: 50 }),
    },
    remark: {
        checkRangeLength: checkRangeLength({ min: 1, max: 1000 }),
    },
};
