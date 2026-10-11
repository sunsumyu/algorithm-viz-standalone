import { BarsCanvasAdapter } from '../../../core/renderers/bars-canvas-adapter';
import type { VisualStateId } from '../../../core/renderers/visual-state-tokens';
import { ShellStep } from './shell-sort-step-compiler';

export function renderShellSortCanvas(container: HTMLElement, step: ShellStep): void {
  const { array, gap, i, key, j, phase } = step;

  const states: VisualStateId[] = array.map((_, idx) => {
    if (idx === i && phase === 'pick-key') return 'pivot';
    if (idx === j && phase === 'shift') return 'swapping';
    if (j >= gap && idx === j - gap && phase === 'compare') return 'comparing';
    if (phase === 'done') return 'sorted';
    return 'idle';
  });

  BarsCanvasAdapter.render(container, { values: array, states, emphasisScale: 1.05 });
}
