import { genRandomString } from '@milesight/shared/src/utils/tools';
import {
    checkRequired,
    checkRangeLength,
    type Validate,
} from '@milesight/shared/src/utils/validators';
import { PARAM_REFERENCE_PATTERN, PARAM_REFERENCE_DIVIDER } from './constants';

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

/**
 * Generate Reference Param Key
 */
export const genRefParamKey = (nodeId: ApiKey, valueKey: ApiKey) => {
    return `#{properties.${nodeId}['${valueKey}']}`;
};

/**
 * Check if the value is a reference param key
 */
export const isRefParamKey = (key?: string) => {
    return key && PARAM_REFERENCE_PATTERN.test(key);
};

/**
 * Parse the reference param key
 */
export const parseRefParamKey = (key?: string) => {
    if (!key || !isRefParamKey(key)) return;
    const matches = key.match(/^#\{properties\.([^'[\]]+)\['([^']+)'\]\}$/);

    if (!matches) return;
    const [, nodeId, valueKey] = matches;
    return {
        nodeId,
        valueKey,
    };
};

/**
 * Generate Workflow Node, Edge or Condition uuid, format as `{node}:{8-bit random string}:{timestamp}`
 * @param type node/edge
 */
export const genUuid = (type: 'node' | 'edge' | 'condition' | 'subcondition' | 'temp') => {
    return `${type}_${genRandomString(8, { lowerCase: true })}`;
};
