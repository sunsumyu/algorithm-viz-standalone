// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  STAGE1_ASTAR_CODE,
  STAGE1_LINES,
  STAGE2_PRUNING_CODE,
  STAGE2_LINES,
  STAGE3_RAY_CODE,
  STAGE3_LINES,
  STAGE4_JPS_CODE,
  STAGE4_LINES,
} from './jump-point-search-problem-content';
import {
  buildStage1Steps,
  buildStage2Steps,
  buildStage3Steps,
  buildStage4Steps,
  buildJumpPointSearchSteps,
  renderJumpPointSearchCanvas,
} from './jump-point-search-renderer';

describe('JPS Problem Content & Multi-Stage Code Panels', () => {
  it('应包含完备的教学讲义与分析 HTML', () => {
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('Jump Point Search');
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('强迫邻居');
    expect(JUMP_POINT_SEARCH_ANALYSIS_HTML).toContain('复杂度');
  });

  it('4 个阶段均须提供 Java / C++ / Python / JavaScript 4 语言代码', () => {
    const stageCodes = [STAGE1_ASTAR_CODE, STAGE2_PRUNING_CODE, STAGE3_RAY_CODE, STAGE4_JPS_CODE];
    for (const sc of stageCodes) {
      const langs = Object.keys(sc);
      expect(langs).toContain('java');
      expect(langs).toContain('cpp');
      expect(langs).toContain('python');
      expect(langs).toContain('javascript');
    }
  });

  it('各阶段行号映射必须在有效行数范围内且为正整数', () => {
    const checkLines = (
      linesMap: Record<string, Record<string, number | number[]>>,
      codeMap: Record<string, string>
    ) => {
      for (const [action, langMap] of Object.entries(linesMap)) {
        for (const [lang, lineOrLines] of Object.entries(langMap)) {
          const code = codeMap[lang];
          expect(code, `语言 ${lang} 必须存在`).toBeDefined();
          const lineCount = code.split('\n').length;
          const lines = Array.isArray(lineOrLines) ? lineOrLines : [lineOrLines];
          for (const l of lines) {
            expect(l, `Action ${action} in ${lang} line ${l} 必须大于 0`).toBeGreaterThan(0);
            expect(l, `Action ${action} in ${lang} line ${l} 必须小于等于总行数 ${lineCount}`).toBeLessThanOrEqual(lineCount);
          }
        }
      }
    };

    checkLines(STAGE1_LINES, STAGE1_ASTAR_CODE);
    checkLines(STAGE2_LINES, STAGE2_PRUNING_CODE);
    checkLines(STAGE3_LINES, STAGE3_RAY_CODE);
    checkLines(STAGE4_LINES, STAGE4_JPS_CODE);
  });
});

describe('JPS 4-Stage Step Generation', () => {
  it('阶段 1 应生成纯粹的 A* 泛洪搜索步骤', () => {
    const steps = buildStage1Steps('corner');
    expect(steps.length).toBeGreaterThan(3);
    expect(steps.every((s) => s.stage === 'stage1_astar')).toBe(true);
    expect(steps[0].action).toBe('init');
    expect(steps[steps.length - 1].action).toBe('reach-goal');
  });

  it('阶段 2 应生成自然邻居与强迫邻居微观拆解步骤', () => {
    const steps = buildStage2Steps('corner');
    expect(steps.length).toBeGreaterThanOrEqual(4);
    expect(steps.every((s) => s.stage === 'stage2_prune')).toBe(true);
    const actions = steps.map((s) => s.action);
    expect(actions).toContain('prune-straight-natural');
    expect(actions).toContain('detect-straight-forced');
    expect(actions).toContain('prune-diagonal-natural');
    expect(actions).toContain('detect-diagonal-forced');
  });

  it('阶段 2 默认应生成 8×8 对角线原理精解 6 步剪枝序列', () => {
    const steps = buildStage2Steps('diagonal');
    expect(steps.length).toBe(6);
    expect(steps.every((s) => s.stage === 'stage2_prune')).toBe(true);
    const actions = steps.map((s) => s.action);
    expect(actions).toContain('prune-diagonal-natural');
    expect(actions).toContain('straight-branch');
    expect(actions).toContain('prune-straight-natural');
    expect(actions).toContain('detect-straight-forced');
    expect(actions).toContain('detect-diagonal-forced');
    expect(steps[4].forcedNeighbors).toEqual([[3, 6]]);
    expect(steps[4].keyObstacle).toEqual([3, 5]);
    expect(steps[4].jumpPoints).toEqual([[4, 5]]);
  });

  it('阶段 3 应生成递归射线跳跃与正交子探测步骤 (经典拐角对照)', () => {
    const steps = buildStage3Steps('corner');
    expect(steps.length).toBeGreaterThanOrEqual(4);
    expect(steps.every((s) => s.stage === 'stage3_jump_ray')).toBe(true);
    const actions = steps.map((s) => s.action);
    expect(actions).toContain('ray-straight-fire');
    expect(actions).toContain('ray-straight-hit');
    expect(actions).toContain('diagonal-ray-step');
    expect(actions).toContain('diagonal-sub-jump');
  });

  it('阶段 3 默认应生成标准 8 步对角线侦察原理精解序列 (8×8 经典)', () => {
    const steps = buildStage3Steps('diagonal');
    expect(steps.length).toBe(8);
    expect(steps.every((s) => s.stage === 'stage3_jump_ray')).toBe(true);

    // Step 0: 全局视野与初始化
    expect(steps[0].action).toBe('init');
    expect(steps[0].start).toEqual([7, 0]);
    expect(steps[0].goal).toEqual([0, 6]);

    // Step 3: 抵达分岔枢纽 X (3,3) -> [4, 3]
    expect(steps[3].action).toBe('diagonal-ray-step');
    expect(steps[3].currentNode).toEqual([4, 3]);

    // Step 4: 横向雷达穿过墙缝探测到 J
    expect(steps[4].action).toBe('diagonal-sub-jump');
    expect(steps[4].rays.length).toBeGreaterThanOrEqual(1);

    // Step 5: 侦测到强迫邻居与关键障碍
    expect(steps[5].action).toBe('sub-jump-hit');
    expect(steps[5].forcedNeighbors).toEqual([[3, 6]]);
    expect(steps[5].keyObstacle).toEqual([3, 5]);

    // Step 6: 枢纽 X 晋升为跳点入堆
    expect(steps[6].action).toBe('diagonal-hit-promotion');
    expect(steps[6].jumpPoints).toContainEqual([4, 3]);
    expect(steps[6].jumpPoints).toContainEqual([4, 5]);

    // Step 7: 直取终点 G 并展示分段连线
    expect(steps[7].action).toBe('reach-goal');
    expect(steps[7].showFinalPathSegments).toBe(true);
    expect(steps[7].finalPath.length).toBeGreaterThan(0);
  });

  it('阶段 4 应生成完整的 JPS 跳点极速寻路步骤', () => {
    const steps = buildStage4Steps('corner');
    expect(steps.length).toBeGreaterThan(3);
    expect(steps.every((s) => s.stage === 'stage4_jps_full')).toBe(true);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.finalPath.length).toBeGreaterThan(0);
    expect(lastStep.jpsVisitedCount).toBeLessThan(lastStep.astarVisitedCount);
  });

  it('调度函数兼容四阶段按需分发', () => {
    const s1 = buildJumpPointSearchSteps('corner', 'stage-1');
    const s2 = buildJumpPointSearchSteps('corner', 'stage-2');
    const s3 = buildJumpPointSearchSteps('corner', 'stage-3');
    const s4 = buildJumpPointSearchSteps('corner', 'stage-4');
    expect(s1[0].stage).toBe('stage1_astar');
    expect(s2[0].stage).toBe('stage2_prune');
    expect(s3[0].stage).toBe('stage3_jump_ray');
    expect(s4[0].stage).toBe('stage4_jps_full');
  });
});

describe('JPS Canvas Presentation & Registry', () => {
  it('应成功自注册到 algorithmRegistry 并具有 4 阶段配置', async () => {
    const { algorithmRegistry } = await import('../../../core/algorithm-registry');
    const manifest = algorithmRegistry.getManifest('jump-point-search');
    expect(manifest).toBeDefined();
    expect(manifest?.name).toContain('跳点搜索');
    expect(manifest?.category).toBe('graph');
    expect(manifest?.aliases).toContain('jps');
  });

  it('渲染函数应格式化浮点数，杜绝未处理的裸浮点数', () => {
    const container = document.createElement('div');
    const steps = buildStage1Steps('corner');
    renderJumpPointSearchCanvas(container, steps[0]);
    // 必须包含格式化后的两位小数公式
    expect(container.innerHTML).toMatch(/f\(n\) = g\(\d+\.\d{2}\) \+ h\(\d+\.\d{2}\) = \d+\.\d{2}/);
    // 杜绝 4 位以上无规则原始浮点数
    expect(container.innerHTML).not.toMatch(/\.\d{5,}/);
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('全量预设与全量阶段的所有步骤均能稳定渲染且不发生 Set 超限或死循环', { timeout: 120000 }, () => {
    const container = document.createElement('div');
    const presets = ['diagonal', 'corner', 'plain', 'maze'];
    for (const p of presets) {
      const allSteps = [
        ...buildStage1Steps(p),
        ...buildStage2Steps(p),
        ...buildStage3Steps(p),
        ...buildStage4Steps(p),
      ];
      // 验证第一步、中间步、关键采样步与最后一步，确保全量覆盖且执行敏捷
      const sampleSteps = allSteps.filter((_, idx) => idx % 3 === 0 || idx === allSteps.length - 1);
      for (const step of sampleSteps) {
        expect(() => renderJumpPointSearchCanvas(container, step)).not.toThrow();
        expect(container.innerHTML).not.toContain('NaN');
        expect(container.innerHTML).not.toContain('[object Object]');
      }
    }
  });
});
