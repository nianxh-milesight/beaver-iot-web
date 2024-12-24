import { useCallback, useMemo } from 'react';
import { THEME_MAIN_BG_COLOR } from '../constant';
import { getCssVariable } from '../helper';
import { type EditorProps } from '../types';

type IProps = Pick<EditorProps, 'onFocus' | 'onBlur'>;
export const useCssVariable = ({ onFocus, onBlur }: IProps) => {
    const updateCssVariable = useCallback((themeColor: string) => {
        const root = document.documentElement;
        root.style.setProperty(THEME_MAIN_BG_COLOR, themeColor);
    }, []);

    const handleFocus: Required<EditorProps>['onFocus'] = useCallback(
        async (...params) => {
            onFocus && onFocus(...params);

            updateCssVariable('var(--main-background)');
        },
        [onFocus, updateCssVariable],
    );
    const handleBlur: Required<EditorProps>['onBlur'] = useCallback(
        async (...params) => {
            onBlur && onBlur(...params);

            updateCssVariable('var(--component-background-gray)');
        },
        [onBlur, updateCssVariable],
    );

    const themeBgColor = useMemo(() => {
        return { backgroundColor: getCssVariable(THEME_MAIN_BG_COLOR) };
    }, []);

    return {
        themeBgColor,
        handleFocus,
        handleBlur,
    };
};
