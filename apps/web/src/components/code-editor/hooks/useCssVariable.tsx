import { useCallback, useState } from 'react';
import { useTheme } from '@milesight/shared/src/hooks';
import { type EditorProps } from '../types';

type IProps = Pick<EditorProps, 'onFocus' | 'onBlur'>;
export const useCssVariable = ({ onFocus, onBlur }: IProps) => {
    const { getCSSVariableValue } = useTheme();
    const [themeBgColor, setThemeBgColor] = useState(
        getCSSVariableValue('--component-background-gray'),
    );

    const handleFocus: Required<EditorProps>['onFocus'] = useCallback(
        (...params) => {
            const themeColorVariable = '--main-background';

            setThemeBgColor(getCSSVariableValue(themeColorVariable));
            onFocus && onFocus(...params);
        },
        [getCSSVariableValue, onFocus],
    );
    const handleBlur: Required<EditorProps>['onBlur'] = useCallback(
        (...params) => {
            const themeColorVariable = '--component-background-gray';

            setThemeBgColor(getCSSVariableValue(themeColorVariable));
            onBlur && onBlur(...params);
        },
        [getCSSVariableValue, onBlur],
    );

    return {
        themeBgColor,
        handleFocus,
        handleBlur,
    };
};
