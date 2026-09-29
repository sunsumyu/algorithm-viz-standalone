// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  JUMP_POINT_SEARCH_CODE_LANGUAGES,
  JPS_CODE_LINES,
} from './jump-point-search-problem-content';
import { buildJumpPointSearchSteps } from './jump-point-search-renderer';

describe('JPS Problem Content & Code Panel', () => {
  it('应包含完备的教学讲义与分析 HTML', () => {
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('Jump Point Search');
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('强迫邻居');
    expect(JUMP_POINT_SEARCH_ANALYSIS_HTML).toContain('复杂度');
  });

  it('四语言代码中必须覆盖 Java / C++ / Python / JavaScript', () => {
    const langs = Object.keys(JUMP_POINT_SEARCH_CODE_LANGUAGES);
    expect(langs).toContain('java');
    expect(langs).toContain('cpp');
    expect(langs).toContain('python');
    expect(langs).toContain('javascript');
  });

  it('所有锚点行号必须在有效代码行数范围内且为正整数', () => {
    for (const [action, langMap] of Object.entries(JPS_CODE_LINES)) {
      for (const [lang, lineOrLines] of Object.entries(langMap)) {
        const code = JUMP_POINT_SEARCH_CODE_LANGUAGES[lang];
        expect(code, `代码语言 ${lang} 必须存在`).toBeDefined();
        const lineCount = code.split('\n').length;
        const lines = Array.isArray(lineOrLines) ? lineOrLines : [lineOrLines];
        for (const l of lines) {
          expect(l, `Action ${action} in ${lang} line ${l} 必须大于 0`).toBeGreaterThan(0);
          expect(l, `Action ${action} in ${lang} line ${l} 必须小于等于总行数 ${lineCount}`).toBeLessThanOrEqual(lineCount);
        }
      }
    }
  });
});

describe('JPS 4-Stage Step Generation', () => {
  it('应能针对默认预设生成全部 4 阶段步骤', () => {
    const steps = buildJumpPointSearchSteps('corner');
    expect(steps.length).toBeGreaterThan(15);
    const stages = new Set(steps.map(s => s.stage));
    expect(stages).toContain('stage1_astar');
    expect(stages).toContain('stage2_prune');
    expect(stages).toContain('stage3_jump_ray');
    expect(stages).toContain('stage4_jps_full');
  });

  it('Stage 4 必须成功搜索到终点并重构出最终路径', () => {
    const steps = buildJumpPointSearchSteps('corner', 'stage4');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.finalPath.length).toBeGreaterThan(0);
    expect(lastStep.stage).toBe('stage4_jps_full');
  });

  it('JPS 探索节点数应显著少于 A* 探索节点数', () => {
    const steps = buildJumpPointSearchSteps('plain');
    const astarStep = steps.find(s => s.stage === 'stage1_astar' && s.action === 'reach-goal');
    const jpsStep = steps.find(s => s.stage === 'stage4_jps_full' && s.action === 'reach-goal');
    expect(astarStep).toBeDefined();
    expect(jpsStep).toBeDefined();
    expect(jpsStep!.jpsVisitedCount).toBeLessThan(astarStep!.astarVisitedCount);
  });
});

describe('JPS Canvas Presentation & Registry', () => {
  it('应成功自注册到 algorithmRegistry 并具有正确的属性', async () => {
    const { algorithmRegistry } = await import('../../../core/algorithm-registry');
    const manifest = algorithmRegistry.getManifest('jump-point-search');
    expect(manifest).toBeDefined();
    expect(manifest?.name).toContain('跳点搜索');
    expect(manifest?.category).toBe('graph');
    expect(manifest?.aliases).toContain('jps');
  });

  it('渲染函数应在 DOM 容器中构建合法的网格沙盘与样式', async () => {
    const { renderJumpPointSearchCanvas } = await import('./jump-point-search-renderer');
    const container = document.createElement('div');
    const steps = buildJumpPointSearchSteps('corner');
    renderJumpPointSearchCanvas(container, steps[steps.length - 1]);
    expect(container.innerHTML).toContain('grid');
    expect(container.innerHTML).not.toContain('[object Object]');
    expect(container.innerHTML).not.toContain('undefined');
    expect(container.innerHTML).not.toContain('NaN');
  });
});

