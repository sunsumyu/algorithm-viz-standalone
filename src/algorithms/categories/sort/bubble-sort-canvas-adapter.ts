import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import { BSStep } from './bubble-sort-step-compiler';

export function renderBubbleSortCanvas(container: HTMLElement, step: BSStep): void {
  const { array, j, jNext, sortedTail, phase, swapping } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    const isSwapping = (idx === j || idx === jNext) && swapping;
    if (isSwapping) return 'swapping';
    const isComparing = (idx === j || idx === jNext) && !swapping && phase === 'compare';
    if (isComparing) return 'comparing';
    const isSorted = idx >= array.length - sortedTail || phase === 'done';
    if (isSorted) return 'sorted';
    return 'idle';
  });

  BarsCanvasAdapter.render(container, { values: array, states, valuePosition: 'above', emphasisScale: 1.05 });
}
