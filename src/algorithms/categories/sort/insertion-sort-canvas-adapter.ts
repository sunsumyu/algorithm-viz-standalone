import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import { ISStep } from './insertion-sort-step-compiler';

export function renderInsertionSortCanvas(container: HTMLElement, step: ISStep): void {
  const { array, i, key, j, sortedCount, phase } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    if (idx === i && phase === 'pick-key') return 'pivot';
    if (idx === j + 1 && phase === 'shift') return 'swapping';
    if (idx === j && phase === 'compare') return 'comparing';
    if (idx < sortedCount || phase === 'done') return 'sorted';
    return 'idle';
  });

  BarsCanvasAdapter.render(container, { values: array, states, emphasisScale: 1.05 });
}
