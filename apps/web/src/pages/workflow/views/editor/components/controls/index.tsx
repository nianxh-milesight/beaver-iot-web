import React, { useState, useCallback } from 'react';
import { Panel, useReactFlow, useViewport } from '@xyflow/react';
import { Stack, Paper, ButtonGroup, Button } from '@mui/material';
import {
    ZoomInIcon,
    ZoomOutIcon,
    MyLocationIcon,
    AddCircleIcon,
} from '@milesight/shared/src/components';
import NodeMenu from '../node-menu';
import './style.less';

export interface ControlsProps {
    /**
     * 最小缩放比例
     */
    minZoom?: number;

    /**
     * 最大缩放比例
     */
    maxZoom?: number;
}

/**
 * 工作流编辑器工具栏
 */
const Controls: React.FC<ControlsProps> = ({ minZoom, maxZoom }) => {
    const { zoom } = useViewport();
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    // ---------- Add Button Click Callback ----------
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEl(e.currentTarget);
        e.stopPropagation();
    }, []);

    return (
        <Panel position="bottom-left" className="ms-workflow-controls-root">
            <Stack direction="row" spacing={1}>
                <Paper elevation={0}>
                    <ButtonGroup variant="text">
                        <Button disabled={!!minZoom && minZoom === zoom} onClick={() => zoomOut()}>
                            <ZoomOutIcon sx={{ fontSize: 20 }} />
                        </Button>
                        <Button disabled={!!maxZoom && maxZoom === zoom} onClick={() => zoomIn()}>
                            <ZoomInIcon sx={{ fontSize: 20 }} />
                        </Button>
                        <Button onClick={() => fitView({ duration: 300 })}>
                            <MyLocationIcon sx={{ fontSize: 20 }} />
                        </Button>
                    </ButtonGroup>
                </Paper>
                <Paper elevation={0}>
                    <Button sx={{ minWidth: 'auto' }} onClick={handleClick}>
                        <AddCircleIcon sx={{ fontSize: 20 }} />
                    </Button>
                    <NodeMenu
                        anchorOrigin={{
                            vertical: -10,
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                    />
                </Paper>
            </Stack>
        </Panel>
    );
};

export default React.memo(Controls);
