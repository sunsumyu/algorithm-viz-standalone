import { describe, it, expect } from 'vitest';
import { ThreeActorStateMachine, ActorVisualState } from './three-actor-state-machine';
import { UniversalStep } from '../universal-stage-engine';

describe('ThreeActorStateMachine (TDD Invariant Suite)', () => {
  const stride = 1.14;
  const blockBaseH = 0.42;

  it('正常格点步骤应解算为 ON_CELL 状态，且 visible 恒为 true', () => {
    const step: UniversalStep = {
      type: 'dfs-call',
      i: 1,
      j: 2,
      gridHighlight: { i: 1, j: 2 }
    };

    const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
    expect(res.state).toBe(ActorVisualState.ON_CELL);
    expect(res.visible).toBe(true);
    expect(res.targetPosition.x).toBeCloseTo(2 * stride);
    expect(res.targetPosition.z).toBeCloseTo(1 * stride);
    expect(res.targetPosition.y).toBeCloseTo(blockBaseH / 2 + 0.45);
    expect(res.splashWater).toBe(false);
    expect(res.squash).toBe(1.0);
  });

  it('越界探索函数入口步 (dfs-call 进入 dfs(3,1) in 3x3) 必须稳立于合法边缘方块 (2,1) 并朝向下方河道 (3,1)', () => {
    const step: UniversalStep = {
      type: 'dfs-call',
      i: 3,
      j: 1,
      fromI: 2,
      fromJ: 1
    };

    const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
    expect(res.state).toBe(ActorVisualState.HOPPING);
    expect(res.visible).toBe(true);
    expect(res.targetPosition.x).toBeCloseTo(1 * stride);
    expect(res.targetPosition.z).toBeCloseTo(2 * stride); // 稳立于起跳方块第 2 行
    expect(res.targetPosition.y).toBeCloseTo(blockBaseH / 2 + 0.45); // 陆地顶面高度
    expect(res.targetFacing?.z).toBeCloseTo(3 * stride); // 朝向前方第 3 行河道
    expect(res.splashWater).toBe(false);
  });

  it('越界落水拦截返回步 (out-of-bounds in 3x3) 探险家执行从 (2,1) 跳向河水 (3,1) 触水后反弹跳回 (2,1)', () => {
    const step: UniversalStep = {
      type: 'out-of-bounds',
      i: 3,
      j: 1,
      fromI: 2,
      fromJ: 1,
      outOfBoundsDir: 'river',
      isOutOfBounds: true
    };

    const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
    expect(res.state).toBe(ActorVisualState.IN_RIVER);
    expect(res.visible).toBe(true); // 🛡️ 恒存不变式断言
    expect(res.isBounceJump).toBe(true);
    expect(res.bounceApexPosition?.z).toBeCloseTo(3 * stride); // 中间触水点在河面第 3 行
    expect(res.bounceApexPosition?.y).toBeCloseTo(-0.05); // 河面高度
    expect(res.targetPosition.x).toBeCloseTo(1 * stride);
    expect(res.targetPosition.z).toBeCloseTo(2 * stride); // 最终落脚点在第 2 行陆地方块
    expect(res.targetPosition.y).toBeCloseTo(blockBaseH / 2 + 0.45);
    expect(res.splashWater).toBe(true); // 激起水花
    expect(res.splashPosition?.z).toBeCloseTo(3 * stride);
  });

  it('越界撞墙拦截返回步 (dfs(1,3) in 3x3) 探险家撞墙后反弹弹回合法方块 (1,2)', () => {
    const step: UniversalStep = {
      type: 'out-of-bounds',
      i: 1,
      j: 3,
      fromI: 1,
      fromJ: 2,
      outOfBoundsDir: 'right-wall',
      isOutOfBounds: true
    };

    const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
    expect(res.state).toBe(ActorVisualState.WALL_COLLISION);
    expect(res.visible).toBe(true);
    expect(res.isBounceJump).toBe(true);
    expect(res.bounceApexPosition?.x).toBeCloseTo(3 * stride); // 撞墙点在第 3 列
    expect(res.targetPosition.x).toBeCloseTo(2 * stride); // 弹回原第 2 列
    expect(res.targetPosition.z).toBeCloseTo(1 * stride);
    expect(res.splashWater).toBe(false);
  });

  it('遭遇障碍物步必须解算为 OBSTACLE_BLOCKED 状态且位置适度升高', () => {
    const step: UniversalStep = {
      type: 'obstacle-hit',
      i: 1,
      j: 1,
      obstacleGrid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    };

    const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
    expect(res.state).toBe(ActorVisualState.OBSTACLE_BLOCKED);
    expect(res.visible).toBe(true);
    expect(res.targetPosition.y).toBeGreaterThan(blockBaseH / 2 + 0.45);
  });

  it('目标达成步应解算为 CELEBRATING_GOAL 状态且 visible 恒为 true', () => {
    const step: UniversalStep = {
      type: 'boundary',
      i: 2,
      j: 2,
      line: 10
    };

    const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
    expect(res.state).toBe(ActorVisualState.CELEBRATING_GOAL);
    expect(res.visible).toBe(true);
  });

  it('批量状态遍历必须保证所有步骤 visible 恒为 true 且坐标为有限数值', () => {
    const mockSteps: UniversalStep[] = [
      { type: 'entry', i: 0, j: 0 },
      { type: 'branch-down', i: 0, j: 0 },
      { type: 'dfs-call', i: 1, j: 0 },
      { type: 'dfs-call', i: 2, j: 0 },
      { type: 'out-of-bounds', i: 3, j: 0, isOutOfBounds: true, outOfBoundsDir: 'river' },
      { type: 'dfs-call', i: 2, j: 1 },
      { type: 'out-of-bounds', i: 2, j: 3, isOutOfBounds: true, outOfBoundsDir: 'right-wall' },
      { type: 'boundary', i: 2, j: 2 }
    ];

    for (const step of mockSteps) {
      const res = ThreeActorStateMachine.resolve(step, 3, 3, stride, blockBaseH);
      expect(res.visible).toBe(true);
      expect(Number.isFinite(res.targetPosition.x)).toBe(true);
      expect(Number.isFinite(res.targetPosition.y)).toBe(true);
      expect(Number.isFinite(res.targetPosition.z)).toBe(true);
      expect(Number.isNaN(res.squash)).toBe(false);
    }
  });
});
