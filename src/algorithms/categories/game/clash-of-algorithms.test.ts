import { describe, it, expect } from 'vitest';
import { buildClashBattleSteps } from './clash-of-algorithms-renderer';

describe('ClashOfAlgorithms (Game Algorithm Visualizer)', () => {
  it('should simulate open trap preset with A* pathfinding and battle progression', () => {
    const steps = buildClashBattleSteps('open_trap');

    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].tick).toBe(0);
    expect(steps[0].troops.length).toBeGreaterThan(0);
    expect(steps[0].buildings.length).toBeGreaterThan(0);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.tick).toBeGreaterThan(0);
    expect(lastStep.destructionRate).toBeGreaterThanOrEqual(0);
  });

  it('should simulate loop box preset with wall breaking and defense targeting', () => {
    const steps = buildClashBattleSteps('loop_box');

    expect(steps.length).toBeGreaterThan(1);
    const initialStep = steps[0];
    const giant = initialStep.troops.find((t) => t.type === 'GIANT');
    expect(giant).toBeDefined();

    const walls = initialStep.buildings.filter((b) => b.type === 'WALL');
    expect(walls.length).toBeGreaterThan(0);
  });
});
