import {
    ToggleButtonGroup,
    ToggleButton,
    Button,
    IconButton,
    Chip,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    TextField,
} from '@mui/material';
import {
    AddIcon,
    DeleteOutlineIcon,
    InputIcon,
    CodeIcon,
    SyncIcon,
    KeyboardArrowDownIcon,
} from '@milesight/shared/src/components';
import ParamSelect from '../param-select';
import './style.less';

/**
 * Conditions Input Component
 *
 * Note: use in IfelseNode
 */
const ConditionsInput = () => {
    return (
        <div className="ms-conditions-input">
            <div className="ms-conditions-input-item">
                <div className="ms-conditions-input-item-topbar">
                    <div className="name">IF</div>
                    <div className="btns">
                        <ToggleButtonGroup size="small">
                            <ToggleButton disableRipple value="condition">
                                <InputIcon />
                            </ToggleButton>
                            <ToggleButton disableRipple value="mvel">
                                <CodeIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <IconButton>
                            <DeleteOutlineIcon />
                        </IconButton>
                    </div>
                </div>
                <div className="ms-conditions-input-item-content">
                    <div className="logic-operator">
                        <Chip
                            size="small"
                            variant="outlined"
                            label={
                                <>
                                    AND <SyncIcon />
                                </>
                            }
                        />
                    </div>
                    <div className="field-item">
                        <div className="input-wrapper">
                            <div className="select">
                                <ParamSelect label="" placeholder="Variable" />
                                <Select
                                    defaultValue=""
                                    placeholder="Condition"
                                    labelId="param-select-label"
                                    IconComponent={KeyboardArrowDownIcon}
                                    MenuProps={{ className: 'ms-param-select-menu' }}
                                >
                                    <MenuItem>111</MenuItem>
                                    <MenuItem>222</MenuItem>
                                </Select>
                            </div>
                            <TextField fullWidth placeholder="Value" />
                        </div>
                        <IconButton>
                            <DeleteOutlineIcon />
                        </IconButton>
                    </div>
                    <Button
                        className="ms-conditions-input-item-add-btn"
                        variant="outlined"
                        startIcon={<AddIcon />}
                    >
                        Add Condition
                    </Button>
                </div>
            </div>
            <Button fullWidth variant="outlined" startIcon={<AddIcon />}>
                ELIF
            </Button>
        </div>
    );
};

export default ConditionsInput;
