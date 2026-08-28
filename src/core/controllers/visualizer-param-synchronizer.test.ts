import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizerParamSynchronizer } from './visualizer-param-synchronizer';
import type { IYamlAlgorithmModel } from '../interfaces';

class MockHtmlElement {
  public value = '';
  public style: Record<string, string> = {};
  public previousElementSibling: any = null;
  public nextElementSibling: any = null;
}

const mockDoc: Record<string, any> = {};

(globalThis as any).document = {
  getElementById: (id: string) => mockDoc[id] || null
};

(globalThis as any).localStorage = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, val: string) { this.store[key] = val; },
  clear() { this.store = {}; }
};

describe('VisualizerParamSynchronizer (参数归一化与持久化状态同步深模块)', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    for (const k of Object.keys(mockDoc)) delete mockDoc[k];
  });

  const mockModel: IYamlAlgorithmModel = {
    id: 'unique-paths',
    name: '不同路径',
    category: '动态规划',
    difficulty: '中等',
    stages: {
      'stage-1': {} as any,
      'stage-2': {} as any,
      'stage-3': {} as any,
      'stage-4': {} as any
    },
    directions: {
      forward: { label: '顺推' },
      reverse: { label: '逆推' }
    },
    defaultParams: { m: 3, n: 7 }
  } as unknown as IYamlAlgorithmModel;

  it('应该正确从模型解析默认网格与状态', () => {
    const resolved = VisualizerParamSynchronizer.resolveInitialState(mockModel);
    expect(resolved.m).toBe(3);
    expect(resolved.n).toBe(7);
    expect(resolved.is1D).toBe(false);
    expect(resolved.stage).toBe('stage-3');
    expect(resolved.dir).toBe('forward');
  });

  it('当 URL 提供合法状态时应优先覆盖模型默认值', () => {
    const restored = {
      algo: 'unique-paths',
      stage: 'stage-4',
      dir: 'reverse' as const,
      m: 4,
      n: 5,
      step: 12,
      theme: 'neon'
    };
    const resolved = VisualizerParamSynchronizer.resolveInitialState(mockModel, restored);
    expect(resolved.m).toBe(4);
    expect(resolved.n).toBe(5);
    expect(resolved.stage).toBe('stage-4');
    expect(resolved.dir).toBe('reverse');
    expect(resolved.theme).toBe('neon');
    expect(resolved.step).toBe(12);
  });

  it('应该对读取的 DOM 输入框数据进行 [1, 10] 范围钳制', () => {
    const inputM = new MockHtmlElement();
    const inputN = new MockHtmlElement();
    inputM.value = '99';
    inputN.value = '-5';
    mockDoc['input-m'] = inputM;
    mockDoc['input-n'] = inputN;

    const dims = VisualizerParamSynchronizer.readInputDimensions();
    expect(dims.m).toBe(10);
    expect(dims.n).toBe(3); // -5 is invalid, falls back to defaultN (3)
  });

  it('针对 1D 线性问题应隐藏 m 尺寸输入框', () => {
    const inputM = new MockHtmlElement();
    const inputN = new MockHtmlElement();
    const prev = new MockHtmlElement();
    const next = new MockHtmlElement();
    inputM.previousElementSibling = prev;
    inputM.nextElementSibling = next;
    mockDoc['input-m'] = inputM;
    mockDoc['input-n'] = inputN;

    VisualizerParamSynchronizer.syncControlsToDom({ m: 1, n: 6 }, true);
    expect(inputM.style.display).toBe('none');
    expect(prev.style.display).toBe('none');
    expect(next.style.display).toBe('none');
    expect(inputN.value).toBe('6');

    VisualizerParamSynchronizer.syncControlsToDom({ m: 3, n: 4 }, false);
    expect(inputM.style.display).toBe('');
    expect(prev.style.display).toBe('');
  });

  it('LocalStorage 读写应具备异常容错', () => {
    VisualizerParamSynchronizer.setPreference('test-key', 'test-val');
    expect(VisualizerParamSynchronizer.getPreference('test-key', 'default')).toBe('test-val');
    expect(VisualizerParamSynchronizer.getPreference('non-existent', 'fallback')).toBe('fallback');
  });
});
