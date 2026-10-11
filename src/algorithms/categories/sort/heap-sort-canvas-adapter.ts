import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import { HSStep } from './heap-sort-step-compiler';

export function renderHeapSortCanvas(container: HTMLElement, step: HSStep): void {
  const { array, heapSize, rootIdx, leftChild, rightChild, largestIdx, settledCount, swapping, phase } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    if (
      (idx === rootIdx || idx === largestIdx || (phase === 'extract-max' && (idx === 0 || idx === heapSize))) &&
      swapping
    ) {
      return 'swapping';
    }
    if (idx === rootIdx && phase !== 'done') return 'pivot';
    if ((idx === leftChild || idx === rightChild) && phase !== 'done') return 'comparing';
    if (idx >= array.length - settledCount || phase === 'done') return 'sorted';
    return 'idle';
  });

  BarsCanvasAdapter.render(container, { values: array, states, emphasisScale: 1.06 });
}
