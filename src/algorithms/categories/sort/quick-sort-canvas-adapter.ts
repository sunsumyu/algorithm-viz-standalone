import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import { QSStep } from './quick-sort-step-compiler';

export function renderQuickSortCanvas(container: HTMLElement, step: QSStep): void {
  const { array, left, right, pivotIdx, i, j, settledIndices, swapping, phase } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    if (
      (idx === i || idx === j || (phase === 'pivot-settled' && (idx === left || idx === i))) &&
      swapping
    ) {
      return 'swapping';
    }
    if (idx === pivotIdx && phase !== 'done') return 'pivot';
    if (idx === i && phase !== 'done') return 'comparing';
    if (idx === j && phase !== 'done') return 'secondary';
    if (settledIndices.includes(idx) || phase === 'done') return 'sorted';
    return 'idle';
  });

  BarsCanvasAdapter.render(container, { values: array, states, emphasisScale: 1.06 });
}
