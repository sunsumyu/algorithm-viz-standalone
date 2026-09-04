import { describe, it, expect } from 'vitest';
import {
  DinicMaxFlowVisualizer,
  buildDinicSteps,
} from './dinic-max-flow-renderer';

// Mock DOM for Testing
class MockElement {
  public tagName: string;
  public id = '';
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public innerHTML = '';
  public onclick: (() => void) | null = null;

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  appendChild(child: MockElement) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: MockElement) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }

  querySelector(sel: string): MockElement | null {
    if (sel.startsWith('#') && this.id === sel.slice(1)) return this;
    for (const c of this.children) {
      if (c.id === sel.replace('#', '')) return c;
      const f = c.querySelector(sel);
      if (f) return f;
    }
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      if (this.innerHTML.includes(`id="${id}"`)) {
        const el = new MockElement('div');
        el.id = id;
        this.appendChild(el);
        return el;
      }
    }
    return null;
  }

  querySelectorAll(sel: string): MockElement[] {
    const res: MockElement[] = [];
    if (sel.startsWith('#') && this.id === sel.slice(1)) res.push(this);
    for (const c of this.children) {
      res.push(...c.querySelectorAll(sel));
    }
    return res;
  }
}

describe('Dinic Max Flow 3D Topology Sandbox Integration', () => {
  it('renders 2D by default and allows switching to 3D topology sandbox', () => {
    const viz = new DinicMaxFlowVisualizer();
    const container = new MockElement('div');
    const steps = buildDinicSteps('diamond');
    const step = steps[2]; // An augmenting path step

    // 默认 2D 渲染
    (viz as any).spec.renderCanvas(container, step);
    expect(container.innerHTML).toContain('btn-dinic-2d');
    expect(container.innerHTML).toContain('btn-dinic-3d');
    expect(container.innerHTML).toContain('<svg');

    // 模拟切换到 3D 模式
    (container as any)._dinicMode = '3d';
    (viz as any).spec.renderCanvas(container, step);

    expect(container.innerHTML).toContain('dinic-3d-canvas-container');
    expect(container.innerHTML).toContain('🪐 3D 沙盘');
    expect((container as any)._dinic3dAdapter).toBeDefined();

    // 验证内部 3D 表现器接收了正确的网络拓扑数据
    const adapter = (container as any)._dinic3dAdapter;
    const state = adapter.getCurrentState();
    expect(state).not.toBeNull();
    expect(state.nodes.length).toBe(4);
    expect(state.edges.length).toBe(4);
    expect(state.layoutMode).toBe('layered');

    // 清理
    adapter.destroy();
  });
});
