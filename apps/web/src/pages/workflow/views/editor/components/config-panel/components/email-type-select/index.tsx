import React from 'react';
import { useControllableValue } from 'ahooks';

import { Select, FormControl, InputLabel, MenuItem, type SelectProps } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon } from '@milesight/shared/src/components';

import './style.less';

export enum EMAIL_TYPE {
    SMTP = 'SMTP',
    GMAIL = 'GMAIL',
}

export const EmailTypeOptions = [
    {
        label: 'SMTP',
        value: EMAIL_TYPE.SMTP,
    },
    {
        label: 'Gmail',
        value: EMAIL_TYPE.GMAIL,
    },
];

export type EmailTypeSelectProps = Omit<
    SelectProps,
    'notched' | 'variant' | 'labelId' | 'IconComponent' | 'label'
>;

/**
 * Email Notify Node
 * The Email Type Select Component
 */
const EmailTypeSelect: React.FC<EmailTypeSelectProps> = props => {
    const { required, disabled, value, onChange, ...restProps } = props;

    const { getIntlText } = useI18n();

    const [state, setState] = useControllableValue(
        { value: value || '', onChange },
        {
            defaultValue: '',
        },
    );

    return (
        <div className="ms-workflow-email-notify-type">
            <FormControl fullWidth required={required} disabled={disabled}>
                <InputLabel id="email-notify-select-type-label">
                    {getIntlText('workflow.label.node_email_type')}
                </InputLabel>
                <Select
                    notched
                    variant="outlined"
                    labelId="email-notify-select-type-label"
                    label={getIntlText('workflow.label.node_email_type')}
                    IconComponent={KeyboardArrowDownIcon}
                    value={state}
                    onChange={e => setState(e.target.value as EMAIL_TYPE)}
                    disabled={disabled}
                    {...restProps}
                >
                    {EmailTypeOptions.map(o => (
                        <MenuItem key={o.value} value={o.value}>
                            {o.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default EmailTypeSelect;
