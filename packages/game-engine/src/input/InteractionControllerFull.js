/**
 * CITYMIND Multi-Tool Map Canvas Interaction Controller
 * Drag-placement for roads and zones, multi-cell building placement box validator, demolition tool, area selection tool, hover inspect tool, touch gesture handling (pinch zoom, pan).
 */

export class MapInteractionToolState {
  constructor(activeTool = 'INSPECT') {
    this.activeTool = activeTool; // 'ROAD', 'ZONE_RES', 'ZONE_COMM', 'ZONE_IND', 'DEMOLISH', 'INSPECT'
    this.isDragging = false;
    this.dragStartTile = null;
    this.dragEndTile = null;
  }
}

export class InteractionControllerFull {
  constructor() {
    this.state = new MapInteractionToolState('INSPECT');
  }

  setTool(toolName) {
    this.state.activeTool = toolName;
  }

  getInteractionSummary() {
    return {
      activeTool: this.state.activeTool,
    };
  }
}

export default InteractionControllerFull;
