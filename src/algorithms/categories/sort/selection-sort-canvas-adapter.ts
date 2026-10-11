import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import { SSStep } from './selection-sort-step-compiler';

export function renderSelectionSortCanvas(container: HTMLElement, step: SSStep): void {
  const { array, i, minIdx, j, sortedCount, phase, swapping } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    if ((idx === i || idx === minIdx) && swapping) return 'swapping';
    if (idx === minIdx && phase !== 'done') return 'pivot';
    if (idx === j && !swapping && phase === 'compare') return 'scanning';
    if (idx < sortedCount || phase === 'done') return 'sorted';
    return 'comparing';
  });

  BarsCanvasAdapter.render(container, { values: array, states, emphasisScale: 1.06 });
}
