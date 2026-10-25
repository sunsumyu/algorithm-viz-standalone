import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizerInteractionBinder, extractCleanCodeFromContainer } from './visualizer-interaction-binder';

class MockDomElement {
  public value = '';
  public classList = {
    classes: new Set<string>(),
    add(cls: string) { this.classes.add(cls); },
    remove(cls: string) { this.classes.delete(cls); },
    contains(cls: string) { return this.classes.has(cls); }
  };
  public attributes: Record<string, string> = {};
  public listeners: Record<string, Function[]> = {};

  constructor(public id: string) {}

  public getAttribute(name: string) {
    return this.attributes[name];
  }

  public setAttribute(name: string, val: string) {
    this.attributes[name] = val;
  }

  public addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public click() {
    this.listeners['click']?.forEach(fn => fn({ target: this }));
  }

  public trigger(event: string, e: any = {}) {
    this.listeners[event]?.forEach(fn => fn(e));
  }
}

const mockDocMap: Record<string, MockDomElement> = {};
const docListeners: Record<string, Function[]> = {};

(globalThis as any).document = {
  getElementById: (id: string) => mockDocMap[id] || null,
  querySelectorAll: (selector: string) => {
    if (selector === '.preset-btn') {
      return Object.values(mockDocMap).filter(el => el.id.startsWith('preset-'));
    }
    return [];
  },
  addEventListener: (event: string, fn: Function) => {
    if (!docListeners[event]) docListeners[event] = [];
    docListeners[event].push(fn);
  }
};

describe('VisualizerInteractionBinder (画板全局交互事件绑定深模块)', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockDocMap)) delete mockDocMap[key];
    for (const key of Object.keys(docListeners)) delete docListeners[key];

    mockDocMap['btn-play-pause'] = new MockDomElement('btn-play-pause');
    mockDocMap['btn-step-next'] = new MockDomElement('btn-step-next');
    mockDocMap['btn-subview-tree'] = new MockDomElement('btn-subview-tree');
    mockDocMap['btn-toggle-3d'] = new MockDomElement('btn-toggle-3d');
    mockDocMap['modal-problem'] = new MockDomElement('modal-problem');
    mockDocMap['btn-open-problem-modal'] = new MockDomElement('btn-open-problem-modal');
  });

  it('应该正确将播放控制事件分发给对应动作回调', () => {
    const onPlay = vi.fn();
    const onNext = vi.fn();
    VisualizerInteractionBinder.bind({
      onPlayToggle: onPlay,
      onStepNext: onNext
    });

    mockDocMap['btn-play-pause'].click();
    expect(onPlay).toHaveBeenCalledTimes(1);

    mockDocMap['btn-step-next'].click();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('应该正确将 3D 透视与子视图切换分发给对应动作回调', () => {
    const onToggle3D = vi.fn();
    const onSubView = vi.fn();
    VisualizerInteractionBinder.bind({
      onToggle3D,
      onStage3SubView: onSubView
    });

    mockDocMap['btn-toggle-3d'].click();
    expect(onToggle3D).toHaveBeenCalledTimes(1);

    mockDocMap['btn-subview-tree'].click();
    expect(onSubView).toHaveBeenCalledWith('tree');
  });

  it('应该正确响应 Escape 键关闭未隐藏的题目弹窗', () => {
    const onClose = vi.fn();
    VisualizerInteractionBinder.bind({
      onCloseProblemModal: onClose
    });

    // 弹窗未包含 hidden 类时触发 Escape
    docListeners['keydown']?.forEach(fn => fn({ key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('extractCleanCodeFromContainer 纯净代码提取门禁', () => {
    it('应优先从 data-raw-code 提取原始源码，严格保留换行和缩进，杜绝乱码粘连', () => {
      const container = {
        querySelectorAll: (selector: string) => {
          if (selector.includes('.code-line')) {
            return [
              {
                getAttribute: (k: string) => k === 'data-raw-code' ? 'public class Solution {' : null,
                dataset: {},
                cloneNode: () => ({ querySelectorAll: () => [], querySelector: () => null, textContent: '' })
              },
              {
                getAttribute: (k: string) => k === 'data-raw-code' ? '    int ans = 0;' : null,
                dataset: {},
                cloneNode: () => ({ querySelectorAll: () => [], querySelector: () => null, textContent: '' })
              },
              {
                getAttribute: (k: string) => k === 'data-raw-code' ? '}' : null,
                dataset: {},
                cloneNode: () => ({ querySelectorAll: () => [], querySelector: () => null, textContent: '' })
              }
            ];
          }
          return [];
        },
        querySelector: () => null,
        textContent: 'public class Solution { int ans = 0; }'
      };

      const clean = extractCleanCodeFromContainer(container as any);
      expect(clean).toBe('public class Solution {\n    int ans = 0;\n}');
    });

    it('当缺失 data-raw-code 时，应克隆节点并彻底剔除行号与调试幽灵变量提示', () => {
      const mockHint = { remove: vi.fn() };
      const mockNum = { remove: vi.fn() };
      const cloneEl = {
        querySelectorAll: (sel: string) => {
          if (sel.includes('.algo-code-inline-hint') || sel.includes('.code-line-num')) {
            return [mockHint, mockNum];
          }
          return [];
        },
        querySelector: (sel: string) => sel.includes('.code-line-text') ? { textContent: 'dp[i] = dp[i-1];' } : null,
        textContent: '1 dp[i] = dp[i-1]; // i: 0'
      };

      const container = {
        querySelectorAll: (selector: string) => {
          if (selector.includes('.code-line')) {
            return [
              {
                getAttribute: () => null,
                dataset: {},
                cloneNode: () => cloneEl
              }
            ];
          }
          return [];
        },
        querySelector: () => null,
        textContent: '1 dp[i] = dp[i-1]; // i: 0'
      };

      const clean = extractCleanCodeFromContainer(container as any);
      expect(clean).toBe('dp[i] = dp[i-1];');
      expect(mockHint.remove).toHaveBeenCalled();
      expect(mockNum.remove).toHaveBeenCalled();
    });
  });
});
