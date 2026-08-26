import { describe, it, expect, vi } from 'vitest';
import { VisualizerMediator } from './visualizer-mediator';
import type { IVisualRenderer } from '../renderers/visual-renderer';

describe('VisualizerMediator Mediator Pattern Guard', () => {
  it('coordinates timeline step changes and notifies registered renderers', () => {
    const mediator = new VisualizerMediator();
    const mockRenderer: IVisualRenderer = {
      id: 'mock-renderer',
      mount: vi.fn(),
      updateStep: vi.fn(),
      dispose: vi.fn()
    };

    mediator.registerRenderer(mockRenderer);

    const steps = [
      { type: 'entry', line: 1, i: 0, j: 0, tag: 'step0', log: '', msg: '' },
      { type: 'branch-1', line: 2, i: 1, j: 0, tag: 'step1', log: '', msg: '' }
    ];

    mediator.setSteps(steps);
    expect(mediator.getState().steps.length).toBe(2);

    // Step forward
    mediator.getTimeline().stepForward();
    expect(mediator.getState().currentStepIndex).toBe(1);
    expect(mockRenderer.updateStep).toHaveBeenCalledWith(steps[1], expect.anything());

    mediator.dispose();
    expect(mockRenderer.dispose).toHaveBeenCalled();
  });
});
