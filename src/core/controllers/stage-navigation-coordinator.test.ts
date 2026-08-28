import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StageNavigationCoordinator } from './stage-navigation-coordinator';
import type { IYamlAlgorithmModel } from '../interfaces';

class MockDomElement {
  public innerHTML = '';
  public children: any[] = [];
  public classList = {
    classes: new Set<string>(),
    add(cls: string) { this.classes.add(cls); },
    remove(cls: string) { this.classes.delete(cls); },
    contains(cls: string) { return this.classes.has(cls); }
  };
  public className = '';
  public dataset: Record<string, string> = {};
  public title = '';
  public listeners: Record<string, Function[]> = {};

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    this.children.push(child);
    return child;
  }

  public addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public click() {
    this.listeners['click']?.forEach(fn => fn());
  }
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockDomElement(tag)
};

describe('StageNavigationCoordinator (阶段演化导航与 Tab 状态协调深模块)', () => {
  let container: MockDomElement;

  beforeEach(() => {
    container = new MockDomElement('div');
  });

  const mockModel: IYamlAlgorithmModel = {
    id: 'unique-paths',
    name: '不同路径',
    category: '动态规划',
    difficulty: '中等',
    stages: {
      'stage-1': { name: '暴力递归', timeBadge: 'O(2^(m+n))' } as any,
      'stage-2': { name: '记忆化搜索', timeBadge: 'O(m*n)' } as any,
      'stage-3': { name: '二维DP', timeBadge: 'O(m*n)' } as any,
      'stage-4': { name: '一维压缩', timeBadge: 'O(n)' } as any
    },
    directions: {
      forward: { label: '顺推 (左上到右下)' },
      reverse: { label: '逆推 (右下到左上)' }
    }
  } as unknown as IYamlAlgorithmModel;

  it('应该正确渲染所有阶段 Tab 并绑定点击回调', () => {
    const onSelect = vi.fn();
    StageNavigationCoordinator.renderStageTabs(container as any, {
      model: mockModel,
      currentStage: 'stage-3',
      onSelectStage: onSelect
    });

    expect(container.children.length).toBe(4);
    expect(container.children[2].className).toContain('active bg-emerald-600');
    expect(container.children[3].className).toContain('border-transparent');

    // 触发点击
    container.children[3].click();
    expect(onSelect).toHaveBeenCalledWith('stage-4');
  });

  it('应该正确渲染双向推导 Tab 并支持点击切换', () => {
    const onSelectDir = vi.fn();
    StageNavigationCoordinator.renderDirectionTabs(container as any, {
      model: mockModel,
      currentDirection: 'forward',
      onSelectDirection: onSelectDir
    });

    expect(container.children.length).toBe(2);
    expect(container.children[0].className).toContain('active bg-blue-600');

    container.children[1].click();
    expect(onSelectDir).toHaveBeenCalledWith('reverse');
  });

  it('应该在只有单向或无方向时自动隐藏方向 Tab 容器', () => {
    const singleDirModel = {
      ...mockModel,
      directions: { forward: { label: '顺推' } }
    } as any;

    StageNavigationCoordinator.renderDirectionTabs(container as any, {
      model: singleDirModel,
      currentDirection: 'forward',
      onSelectDirection: vi.fn()
    });

    expect(container.classList.contains('hidden')).toBe(true);
  });

  it('应该正确更新 Stage 3 子视图切换按钮高亮状态', () => {
    const mockBar = new MockDomElement('div');
    const mockBtnMatrix = new MockDomElement('button');
    const mockBtnTree = new MockDomElement('button');

    const domMap: Record<string, MockDomElement> = {
      'stage3-subview-bar': mockBar,
      'btn-subview-matrix': mockBtnMatrix,
      'btn-subview-tree': mockBtnTree
    };

    (globalThis as any).document.getElementById = (id: string) => domMap[id] || null;

    StageNavigationCoordinator.updateStage3SubViewTabs('stage-3', 'tree', true);

    expect(mockBar.classList.contains('hidden')).toBe(false);
    expect(mockBtnTree.className).toContain('active');
    expect(mockBtnMatrix.className).not.toContain('active');

    // 非 stage-3 时隐藏
    StageNavigationCoordinator.updateStage3SubViewTabs('stage-4', 'tree', false);
    expect(mockBar.classList.contains('hidden')).toBe(true);
  });
});
