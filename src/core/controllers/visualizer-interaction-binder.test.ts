import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizerInteractionBinder } from './visualizer-interaction-binder';

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
});
