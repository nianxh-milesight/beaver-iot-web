import { genRandomString } from '@milesight/shared/src/utils/tools';
import {
    checkRequired,
    checkRangeLength,
    type Validate,
} from '@milesight/shared/src/utils/validators';
import { PARAM_REFERENCE_PREFIX, PARAM_REFERENCE_DIVIDER } from './constants';

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
export const genRefParamKey = (nodeType: WorkflowNodeType, nodeId: ApiKey, valueKey: ApiKey) => {
    return `${PARAM_REFERENCE_PREFIX}${[nodeType, nodeId, valueKey].join(PARAM_REFERENCE_DIVIDER)}`;
};

/**
 * Check if the value is a reference param key
 */
export const isRefParamKey = (key: string) => {
    return key.startsWith(PARAM_REFERENCE_PREFIX);
};

/**
 * Parse the reference param key
 */
export const parseRefParamKey = (key: string) => {
    if (!isRefParamKey(key)) return {};
    const [nodeType, nodeId, valueKey] = key.slice(1).split(PARAM_REFERENCE_DIVIDER);
    return { nodeType, nodeId, valueKey };
};

/**
 * Generate Workflow Node, Edge or Condition uuid, format as `{node}:{8-bit random string}:{timestamp}`
 * @param type node/edge
 */
export const genUuid = (type: 'node' | 'edge' | 'condition' | 'subcondition') => {
    return `${type}:${genRandomString(8, { lowerCase: true })}:${Date.now()}`;
};
