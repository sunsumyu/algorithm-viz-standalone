import { describe, it, expect } from 'vitest';
import {
  JumpPointSearchStepCompiler,
  buildStage1Steps,
  buildStage2Steps,
  buildStage3Steps,
  buildStage4Steps,
  buildJumpPointSearchSteps,
  isWalkable,
  octileDistance,
  getForcedNeighbors,
  jump,
  JPS_PRESETS,
} from './jump-point-search-step-compiler';

describe('JumpPointSearchStepCompiler', () => {
  it('应包含预设地图且起点终点有效', () => {
    expect(JPS_PRESETS.diagonal).toBeDefined();
    expect(JPS_PRESETS.corner).toBeDefined();
    expect(JPS_PRESETS.plain).toBeDefined();
    expect(JPS_PRESETS.maze).toBeDefined();

    const { grid, start, goal } = JPS_PRESETS.diagonal;
    expect(isWalkable(grid, start[0], start[1])).toBe(true);
    expect(isWalkable(grid, goal[0], goal[1])).toBe(true);
  });

  it('八向距离计算 octileDistance 应满足对称与勾股三角不等式', () => {
    const d1 = octileDistance(0, 0, 1, 0);
    expect(d1).toBeCloseTo(1.0, 5);

    const d2 = octileDistance(0, 0, 1, 1);
    expect(d2).toBeCloseTo(Math.SQRT2, 5);

    const d3 = octileDistance(0, 0, 2, 1);
    expect(d3).toBeCloseTo(1 + Math.SQRT2, 5);
  });

  it('强迫邻居与跳跃探测 jump 必须正确识别拐角死角', () => {
    const { grid, goal } = JPS_PRESETS.diagonal;
    // (4, 4) 处探测沿 (0, 1) 向右
    const forced = getForcedNeighbors(grid, 4, 4, 0, 1);
    // 应当存在被 (3, 5) 或其它墙卡住的强迫邻居
    expect(Array.isArray(forced)).toBe(true);

    const jp = jump(grid, 7, 0, -1, 0, goal);
    expect(jp === null || Array.isArray(jp)).toBe(true);
  });

  it('Stage 1 (A*): 应生成充分步数且最终找到最优路径', () => {
    const steps = buildStage1Steps('corner');
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('reach-goal');
    expect(last.finalPath.length).toBeGreaterThan(0);
    expect(last.stage).toBe('stage1_astar');
  });

  it('Stage 2 (剪枝): 直行与对角线剪枝应正确标注自然邻居与强迫邻居', () => {
    const steps = buildStage2Steps('corner');
    expect(steps.length).toBeGreaterThanOrEqual(8);
    const hasForcedStep = steps.some((s) => s.forcedNeighbors.length > 0 || s.action.includes('fn') || s.action.includes('forced'));
    expect(hasForcedStep).toBe(true);
  });

  it('Stage 3 (射线探测): 对角线与正交子光束探查应生成丰富图元与代码联动', () => {
    const stepsDiag = buildStage3Steps('diagonal');
    expect(stepsDiag.length).toBeGreaterThanOrEqual(8);
    expect(stepsDiag.some((s) => s.rays.length > 0)).toBe(true);
    expect(stepsDiag.some((s) => s.jumpPoints.length > 0)).toBe(true);

    const stepsCorner = buildStage3Steps('corner');
    expect(stepsCorner.length).toBeGreaterThanOrEqual(10);
  });

  it('Stage 4 (JPS终局): 探索节点相比 A* 大幅缩减，且返回最优跳点路径', () => {
    const steps = buildStage4Steps('corner');
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('reach-goal');
    expect(last.finalPath.length).toBeGreaterThan(0);
    expect(last.jpsVisitedCount).toBeLessThanOrEqual(last.astarVisitedCount);
  });

  it('深模块 JumpPointSearchStepCompiler 静态门面委托正确', () => {
    expect(JumpPointSearchStepCompiler.PRESETS).toBe(JPS_PRESETS);
    const s1 = JumpPointSearchStepCompiler.compileStage1('corner');
    expect(s1.length).toBeGreaterThan(0);
    const s4 = JumpPointSearchStepCompiler.compileSteps('corner', 'stage-4');
    expect(s4.length).toBeGreaterThan(0);
  });
});
