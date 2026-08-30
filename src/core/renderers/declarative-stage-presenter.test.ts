import { describe, it, expect } from 'vitest';
import {
  DeclarativeStagePresenter,
  DeclarativeAlgorithmSpec,
} from './declarative-stage-presenter';
import { createDeclarativeVisualizer } from '../declarative-algorithm-visualizer';

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

    // 3. 验证单框包裹预设案例栏与模式切换栏
    expect(template).toContain('class="dsp-preset-bar"');
    expect(template).toContain('class="dsp-preset-list"');
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
});
