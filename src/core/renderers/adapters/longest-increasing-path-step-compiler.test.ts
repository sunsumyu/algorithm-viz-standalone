// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildLipStage1Steps,
  buildLipStage2Steps,
  buildLipStage3Steps,
  buildLipStage4Steps,
  parseMatrix,
} from './longest-increasing-path-step-compiler';
import {
  renderLipStage1Canvas,
  renderLipStage2Canvas,
  renderLipStage3Canvas,
  renderLipStage4Canvas,
  renderMatrixTerrain,
} from './longest-increasing-path-canvas-adapter';

describe('LongestIncreasingPathStepCompiler & CanvasAdapter 伴生测试', () => {
  const matrix = [
    [9, 9, 4],
    [6, 6, 8],
    [2, 1, 1],
  ];
  const inputs = { 'input-matrix': JSON.stringify(matrix) };

  it('parseMatrix 应对合法/非法输入具备鲁棒解析', () => {
    expect(parseMatrix(JSON.stringify(matrix))).toEqual(matrix);
    expect(parseMatrix(null)).toEqual([[9, 9, 4], [6, 6, 8], [2, 1, 1]]);
  });

  it('Stage 1 暴力 DFS 步骤生成应包含入口与递推返回', () => {
    const steps = buildLipStage1Steps(inputs);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].currentCall).toContain('longestIncreasingPath1');
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 2 记忆化搜索应能记录 memo 备忘录并触发命中', () => {
    const steps = buildLipStage2Steps(inputs);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.memoGrid[2][1]).toBeGreaterThanOrEqual(1);
    expect(steps.some(s => s.memoHit)).toBe(true);
  });

  it('Stage 3 拓扑排序应正确统计出度并按拓扑层递推', () => {
    const steps = buildLipStage3Steps(inputs);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.dpTable[2][1]).toBe(4);
  });

  it('Stage 4 最优路径回溯应正确重构最优链', () => {
    const steps = buildLipStage4Steps(inputs);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.maxLen).toBe(4);
    expect(lastStep.bestPath.length).toBe(4);
  });

  it('CanvasAdapter 应安全渲染 Stage 1-4 各阶段卡片', () => {
    const container = document.createElement('div');
    const s1 = buildLipStage1Steps(inputs);
    renderLipStage1Canvas(container, s1[0]);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const s2 = buildLipStage2Steps(inputs);
    renderLipStage2Canvas(container, s2[0]);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const s3 = buildLipStage3Steps(inputs);
    renderLipStage3Canvas(container, s3[0]);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    const s4 = buildLipStage4Steps(inputs);
    renderLipStage4Canvas(container, s4[0]);
    expect(container.innerHTML.length).toBeGreaterThan(0);

    renderMatrixTerrain(container, matrix, 0, 0, [[2, 1], [2, 0], [1, 0], [0, 0]]);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
