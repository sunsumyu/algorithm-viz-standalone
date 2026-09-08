import { describe, it, expect } from 'vitest';
import {
  DeclarativeStagePresenter,
  DeclarativeAlgorithmSpec,
} from './declarative-stage-presenter';
import {
  createDeclarativeVisualizer,
  registerDeclarativeAlgorithm,
} from '../declarative-algorithm-visualizer';
import { getManifest } from '../registry';

describe('DeclarativeStagePresenter Engine Guard', () => {
  const dummySpec: DeclarativeAlgorithmSpec = {
    id: 'test-algo',
    name: '测试算法',
    category: 'test',
    icon: '⚡',
    badge: { mode: '测试模式', complexity: 'O(1)' },
    card1Title: '沙盘标题',
    card2Title: '监控标题',
    inputs: [
      { id: 'input-num', label: '数字', type: 'number', defaultValue: 10, width: '45px' },
      { id: 'input-text', label: '文本', type: 'text', defaultValue: 'hello', width: '120px' },
    ],
    presets: [
      { label: '案例1', values: { 'input-num': 10, 'input-text': 'hello' } },
      { label: '案例2', values: { 'input-num': 20, 'input-text': 'world' } },
    ],
    modes: [
      { id: 'mode-a', label: '模式A' },
      { id: 'mode-b', label: '模式B' },
    ],
    metrics: [
      { id: 'cnt', label: '计数', color: '#2563eb' },
    ],
    codeLanguages: { java: ['public class Test {}'] },
    problemHtml: '<div>题目</div>',
    analysisHtml: '<div>解析</div>',
    buildSteps: (inputs, mode) => [{ step: 1, val: inputs['input-num'], mode }],
  };

  it('should generate standard 4-card template with flat sandbox wrap and zero subboxes', () => {
    const template = DeclarativeStagePresenter.generateTemplate(dummySpec);

    // 1. 验证 ID 与标题
    expect(template).toContain('id="algo-test-algo-view"');
    expect(template).toContain('测试算法');
    expect(template).toContain('测试模式');

    // 2. 验证紧凑输入框宽度与标签
    expect(template).toContain('style="width: 45px;"');
    expect(template).toContain('style="width: 120px;"');

    // 3. 验证预设案例下拉选框与模式切换栏
    expect(template).toContain('dsp-preset-select-group');
    expect(template).toContain('id="dsp-preset-select"');
    expect(template).toContain('案例1');
    expect(template).toContain('案例2');
    expect(template).toContain('模式A');

    // 4. 验证扁平沙盘容器（绝无旧版嵌套子卡片类名）
    expect(template).toContain('id="dsp-sandbox-container"');
    expect(template).not.toContain('.mq-subcard');
    expect(template).not.toContain('.tt-subcard');

    // 5. 验证暗色代码终端与执行日志卡片
    expect(template).toContain('id="dsp-terminal-container"');
    expect(template).toContain('id="log-container"');
  });

  it('should instantiate declarative visualizer class via factory', () => {
    const { template, Visualizer } = createDeclarativeVisualizer(dummySpec);
    expect(typeof template).toBe('string');
    expect(Visualizer).toBeDefined();

    const instance = new Visualizer();
    expect(instance).toBeDefined();
  });

  it('should remember stage in localStorage and reset to stage 1 upon reset()', () => {
    const stageSpec: DeclarativeAlgorithmSpec = {
      id: 'test-staged-algo',
      name: '分阶段算法',
      category: 'test',
      codeLanguages: { java: ['code'] },
      problemHtml: '<div></div>',
      analysisHtml: '<div></div>',
      buildSteps: () => [],
      stages: [
        {
          id: 'stage-1',
          name: '阶段 1: 递归',
          shortName: '递归',
          codeLanguages: { java: ['stage1 code'] },
          buildSteps: () => [{ action: 'step1' }],
        },
        {
          id: 'stage-2',
          name: '阶段 2: 记忆化',
          shortName: '记忆化',
          codeLanguages: { java: ['stage2 code'] },
          buildSteps: () => [{ action: 'step2' }],
        },
        {
          id: 'stage-3',
          name: '阶段 3: 二维DP',
          shortName: '二维DP',
          codeLanguages: { java: ['stage3 code'] },
          buildSteps: () => [{ action: 'step3' }],
        },
      ],
    };

    const mockStorage: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
    };

    // 1. 无存储时默认在阶段 1
    const { Visualizer } = createDeclarativeVisualizer(stageSpec);
    const viz1 = new Visualizer();
    expect(viz1.getCurrentStage()).toBe('stage-1');

    // 2. 切换到阶段 3 时自动持久化到 localStorage
    viz1.switchStage('stage-3');
    expect(viz1.getCurrentStage()).toBe('stage-3');
    expect(mockStorage['algo-stage-test-staged-algo']).toBe('stage-3');

    // 3. 下次打开时从阶段 3 开始
    const viz2 = new Visualizer();
    expect(viz2.getCurrentStage()).toBe('stage-3');

    // 4. 点击重置后，必须回到阶段 1 并持久化为阶段 1
    viz2.reset();
    expect(viz2.getCurrentStage()).toBe('stage-1');
    expect(mockStorage['algo-stage-test-staged-algo']).toBe('stage-1');
  });

  it('should strictly enforce primaryVisual (Card 1) and auxiliaryVisual (Card 2) layout invariant', () => {
    let card1Rendered = false;
    let card2Rendered = false;

    const visualSlotSpec: DeclarativeAlgorithmSpec = {
      id: 'test-visual-slot-algo',
      name: '结构化槽位算法',
      category: 'test',
      codeLanguages: { java: ['code'] },
      problemHtml: '<div></div>',
      analysisHtml: '<div></div>',
      buildSteps: () => [{ step: 1 }],
      primaryVisual: {
        title: '🪞 主视觉顶部沙盘',
        render: (container, step) => {
          card1Rendered = true;
          container.innerHTML = '<div class="c1-content">Primary</div>';
        },
      },
      auxiliaryVisual: {
        title: '📊 辅助视觉底部栈',
        desc: '辅助诊断与决策调用栈',
        render: (container, step) => {
          card2Rendered = true;
          container.innerHTML = '<div class="c2-content">Auxiliary</div>';
        },
      },
    };

    const template = DeclarativeStagePresenter.generateTemplate(visualSlotSpec);
    expect(template).toContain('🪞 主视觉顶部沙盘');
    expect(template).toContain('📊 辅助视觉底部栈');
    expect(template).toContain('辅助诊断与决策调用栈');

    const result = registerDeclarativeAlgorithm(visualSlotSpec);
    expect(result.template).toBe(template);
    expect(result.Visualizer).toBeDefined();

    const manifest = getManifest('test-visual-slot-algo');
    expect(manifest).toBeDefined();
    expect(manifest?.name).toBe('结构化槽位算法');
    expect(manifest?.template).toBe(template);
  });
});

