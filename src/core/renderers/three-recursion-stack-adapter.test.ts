import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThreeRecursionStackAdapter } from './three-recursion-stack-adapter';

// 轻量级 Mock 容器 (供 Node/Vitest 环境测试)
class MockContainer {
  public clientWidth = 600;
  public clientHeight = 400;
  public style: Record<string, any> = {};
  public children: any[] = [];
  public innerHTML = '';
  public querySelector(_selector: string) {
    return null;
  }
  public appendChild(child: any) {
    this.children.push(child);
    return child;
  }
  public removeChild(child: any) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }
}

describe('ThreeRecursionStackAdapter (3D 递归代码栈样板)', () => {
  let adapter: ThreeRecursionStackAdapter;
  let mockContainer: any;

  beforeEach(() => {
    adapter = ThreeRecursionStackAdapter.getInstance();
    mockContainer = new MockContainer();
  });

  afterEach(() => {
    adapter.dispose();
  });

  it('应该正确拥有单例 ID 与实例', () => {
    expect(adapter.id).toBe('three-recursion-stack-adapter');
    expect(adapter).toBe(ThreeRecursionStackAdapter.getInstance());
  });

  it('在无异常情况下能够安全挂载和销毁', () => {
    expect(() => adapter.mount(mockContainer)).not.toThrow();
    expect(() => adapter.dispose()).not.toThrow();
  });

  it('能够支持切换布局模式 (tree / stack)', () => {
    expect(adapter.getLayoutMode()).toBe('tree');
    adapter.setLayoutMode('stack');
    expect(adapter.getLayoutMode()).toBe('stack');
    adapter.setLayoutMode('tree');
    expect(adapter.getLayoutMode()).toBe('tree');
  });

  it('能够安全渲染 3D 递归调用栈与树节点数据', () => {
    const mockData = {
      rootNode: {
        id: 'root',
        depth: 1,
        funcName: 'f(0, 0)',
        r: 0,
        c: 0,
        val: '3',
        status: 'current' as const,
        children: [
          {
            id: 'child-1',
            depth: 2,
            funcName: 'f(1, 1)',
            r: 1,
            c: 1,
            val: '2',
            status: 'done' as const,
            children: [],
          },
        ],
      },
      s1: 'abcde',
      s2: 'ace',
      i: 0,
      j: 0,
    };

    expect(() => adapter.render(mockContainer, mockData)).not.toThrow();
  });
});
