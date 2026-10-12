/**
 * Grid Explorer Physical Stage Renderer (迷宫探险与网格物理实景渲染器 - 薄门面适配器)
 */

import { DpThematicMeta } from './types';
import {
  createCartoonAdventurer,
  renderGridExplorerStageSVG as renderGridExplorerStageSVGImpl,
} from '../../../../core/renderers/adapters/grid-explorer-svg-adapter';

export { createCartoonAdventurer };

export function renderGridExplorerStageSVG(container: HTMLElement, meta?: DpThematicMeta['grid']): void {
  renderGridExplorerStageSVGImpl(container, meta);
}
