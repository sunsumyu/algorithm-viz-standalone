import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PanelCollapseCoordinator, panelCollapseCoordinator } from './panel-collapse-coordinator';

class MockElement {
  public tagName: string;
  public className = '';
  public id = '';
  public title = '';
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public previousElementSibling: MockElement | null = null;
  private listeners: Record<string, Array<(e: any) => void>> = {};

  constructor(tagName = 'DIV') {
    this.tagName = tagName.toUpperCase();
  }

  get classList() {
    const self = this;
    return {
      add(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.add(c));
        self.className = Array.from(set).join(' ');
      },
      remove(...cls: string[]) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        cls.forEach((c) => set.delete(c));
        self.className = Array.from(set).join(' ');
      },
      contains(cls: string): boolean {
        return self.className.split(' ').filter(Boolean).includes(cls);
      },
    };
  }

  appendChild<T extends MockElement>(child: T): T {
    if (this.children.length > 0) {
      child.previousElementSibling = this.children[this.children.length - 1];
    }
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  addEventListener(event: string, handler: (e: any) => void): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: (e: any) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
    }
  }

  dispatchEvent(event: { type: string; target?: any; preventDefault?: () => void; stopPropagation?: () => void }): boolean {
    const handlers = this.listeners[event.type] || [];
    event.target = event.target || this;
    event.preventDefault = event.preventDefault || (() => {});
    event.stopPropagation = event.stopPropagation || (() => {});
    for (const h of handlers) {
      h(event);
    }
    return true;
  }

  closest(selector: string): MockElement | null {
    let cur: MockElement | null = this;
    while (cur) {
      if (cur.matches(selector)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  matches(selector: string): boolean {
    const parts = selector.split(',').map((s) => s.trim());
    return parts.some((p) => {
      if (p.startsWith('.')) {
        const cls = p.slice(1);
        return this.classList.contains(cls);
      }
      if (p.startsWith('#')) {
        return this.id === p.slice(1);
      }
      if (p === 'button' || p === 'select' || p === 'input' || p === 'a' || p === 'textarea') {
        return this.tagName.toLowerCase() === p;
      }
      if (p.includes('[class*="')) {
        const match = p.match(/\[class\*="([^"]+)"\]/);
        if (match && this.className.includes(match[1])) return true;
      }
      return false;
    });
  }

  querySelectorAll(selector: string): MockElement[] {
    const res: MockElement[] = [];
    const check = (el: MockElement) => {
      for (const child of el.children) {
        if (child.matches(selector)) {
          res.push(child);
        }
        check(child);
      }
    };
    check(this);
    return res;
  }
}

describe('PanelCollapseCoordinator (Universal Double-Click Panel Collapse)', () => {
  let coordinator: PanelCollapseCoordinator;

  beforeEach(() => {
    coordinator = PanelCollapseCoordinator.getInstance();
  });

  it('should be a singleton instance', () => {
    const instance1 = PanelCollapseCoordinator.getInstance();
    const instance2 = panelCollapseCoordinator;
    expect(instance1).toBe(instance2);
  });

  it('should collapse and expand standard .dsp-card on double-clicking header', () => {
    const root = new MockElement('div') as any;
    root.id = 'algo-view';

    const card = new MockElement('div') as any;
    card.id = 'card-sandbox';
    card.className = 'dsp-card';

    const header = new MockElement('div') as any;
    header.className = 'dsp-card-header';
    card.appendChild(header);

    const body = new MockElement('div') as any;
    body.className = 'dsp-sandbox-wrap';
    card.appendChild(body);

    root.appendChild(card);

    coordinator.bind(root);

    expect(coordinator.isCollapsed(card)).toBe(false);
    expect(card.classList.contains('algo-panel-collapsed')).toBe(false);

    // 第一次双击标题行 -> 折叠
    header.dispatchEvent({ type: 'dblclick', target: header });
    expect(coordinator.isCollapsed(card)).toBe(true);
    expect(card.classList.contains('algo-panel-collapsed')).toBe(true);
    expect(card.dataset.collapsed).toBe('true');

    // 第二次双击标题行 -> 展开
    header.dispatchEvent({ type: 'dblclick', target: header });
    expect(coordinator.isCollapsed(card)).toBe(false);
    expect(card.classList.contains('algo-panel-collapsed')).toBe(false);
    expect(card.dataset.collapsed).toBe('false');
  });

  it('should collapse and expand dark code terminal on double clicking terminal-auto-header', () => {
    const root = new MockElement('div') as any;
    const terminalCard = new MockElement('div') as any;
    terminalCard.className = 'dsp-terminal-card';

    const terminalFrame = new MockElement('div') as any;
    terminalFrame.className = 'dark-terminal-auto-frame';

    const header = new MockElement('div') as any;
    header.className = 'terminal-auto-header';
    terminalFrame.appendChild(header);

    const body = new MockElement('div') as any;
    body.className = 'terminal-body';
    terminalFrame.appendChild(body);

    terminalCard.appendChild(terminalFrame);
    root.appendChild(terminalCard);

    coordinator.bind(root);

    expect(coordinator.isCollapsed(terminalFrame)).toBe(false);

    // 双击终端头部
    header.dispatchEvent({ type: 'dblclick', target: header });
    expect(coordinator.isCollapsed(terminalFrame)).toBe(true);
    expect(terminalFrame.classList.contains('algo-panel-collapsed')).toBe(true);

    // 再次双击展开
    header.dispatchEvent({ type: 'dblclick', target: header });
    expect(coordinator.isCollapsed(terminalFrame)).toBe(false);
    expect(terminalFrame.classList.contains('algo-panel-collapsed')).toBe(false);
  });

  it('should NOT collapse when double clicking interactive elements inside the header', () => {
    const root = new MockElement('div') as any;
    const card = new MockElement('div') as any;
    card.className = 'dsp-card';

    const header = new MockElement('div') as any;
    header.className = 'dsp-card-header';

    const btn = new MockElement('button') as any;
    btn.className = 'three-view-toggle-btn';
    header.appendChild(btn);

    const input = new MockElement('input') as any;
    header.appendChild(input);

    const langBtn = new MockElement('button') as any;
    langBtn.className = 'lang-btn';
    header.appendChild(langBtn);

    const copyBtn = new MockElement('button') as any;
    copyBtn.className = 'btn-code-copy';
    header.appendChild(copyBtn);

    card.appendChild(header);
    root.appendChild(card);

    coordinator.bind(root);

    // 双击 3D 切换按钮不触发折叠
    btn.dispatchEvent({ type: 'dblclick', target: btn });
    expect(coordinator.isCollapsed(card)).toBe(false);

    // 双击输入框不触发折叠
    input.dispatchEvent({ type: 'dblclick', target: input });
    expect(coordinator.isCollapsed(card)).toBe(false);

    // 双击语言按钮不触发折叠
    langBtn.dispatchEvent({ type: 'dblclick', target: langBtn });
    expect(coordinator.isCollapsed(card)).toBe(false);

    // 双击复制按钮不触发折叠
    copyBtn.dispatchEvent({ type: 'dblclick', target: copyBtn });
    expect(coordinator.isCollapsed(card)).toBe(false);
  });

  it('should preserve and restore inline height and flex style on collapse/expand', () => {
    const card = new MockElement('div') as any;
    card.className = 'dsp-card';
    card.style = { height: '280px', flex: '0 0 280px' };

    const header = new MockElement('div') as any;
    header.className = 'dsp-card-header';
    card.appendChild(header);

    // 折叠
    coordinator.collapse(card);
    expect(card.dataset.savedHeight).toBe('280px');
    expect(card.dataset.savedFlex).toBe('0 0 280px');
    expect(card.classList.contains('algo-panel-collapsed')).toBe(true);

    // 展开
    coordinator.expand(card);
    expect(card.style.height).toBe('280px');
    expect(card.style.flex).toBe('0 0 280px');
    expect(card.classList.contains('algo-panel-collapsed')).toBe(false);
  });

  it('should hide and restore adjacent splitter handle', () => {
    const root = new MockElement('div') as any;
    const splitter = new MockElement('div') as any;
    splitter.className = 'algo-splitter algo-splitter-vertical';
    root.appendChild(splitter);

    const card = new MockElement('div') as any;
    card.className = 'dsp-card';
    const header = new MockElement('div') as any;
    header.className = 'dsp-card-header';
    card.appendChild(header);
    root.appendChild(card);

    coordinator.collapse(card);
    expect(splitter.style.display).toBe('none');

    coordinator.expand(card);
    expect(splitter.style.display).toBe('');
  });

  it('should ignore top-level navigation headers (dsp-header, titlebar, sidebar)', () => {
    const root = new MockElement('div') as any;
    const dspHeader = new MockElement('header') as any;
    dspHeader.className = 'dsp-header';

    const dspHeaderInner = new MockElement('div') as any;
    dspHeaderInner.className = 'dsp-header-left';
    dspHeader.appendChild(dspHeaderInner);
    root.appendChild(dspHeader);

    coordinator.bind(root);

    dspHeaderInner.dispatchEvent({ type: 'dblclick', target: dspHeaderInner });
    expect(dspHeader.classList.contains('algo-panel-collapsed')).toBe(false);
  });

  it('should expand sibling uncollapsed panel to fill remaining space and restore it on expand', () => {
    const section = new MockElement('div') as any;
    section.className = 'dsp-left-section';

    const cardTop = new MockElement('div') as any;
    cardTop.className = 'dsp-card';
    cardTop.style = { flex: '1 1 0' };
    const headerTop = new MockElement('div') as any;
    headerTop.className = 'dsp-card-header';
    cardTop.appendChild(headerTop);

    const cardBottom = new MockElement('div') as any;
    cardBottom.className = 'dsp-card';
    cardBottom.style = { height: '240px', flex: '0 0 240px' };
    const headerBottom = new MockElement('div') as any;
    headerBottom.className = 'dsp-card-header';
    cardBottom.appendChild(headerBottom);

    section.appendChild(cardTop);
    section.appendChild(cardBottom);

    coordinator.bind(section);

    // 折叠上方 Card 1
    coordinator.collapse(cardTop);
    expect(coordinator.isCollapsed(cardTop)).toBe(true);

    // 下方 Card 2 应该自动弹性占满空间 (flex: 1 1 0, height: auto)，消除底部大片空白
    expect(cardBottom.style.flex).toBe('1 1 0');
    expect(cardBottom.style.height).toBe('auto');

    // 重新展开上方 Card 1
    coordinator.expand(cardTop);
    expect(coordinator.isCollapsed(cardTop)).toBe(false);

    // 下方 Card 2 应该无缝恢复原有保存的高度和 flex (0 0 240px, 240px)
    expect(cardBottom.style.flex).toBe('0 0 240px');
    expect(cardBottom.style.height).toBe('240px');
  });

  it('should support unbind safely', () => {
    const root = new MockElement('div') as any;
    const card = new MockElement('div') as any;
    card.className = 'dsp-card';

    const header = new MockElement('div') as any;
    header.className = 'dsp-card-header';
    card.appendChild(header);
    root.appendChild(card);

    coordinator.bind(root);
    coordinator.unbind(root);

    // 解绑后再双击不会触发折叠
    header.dispatchEvent({ type: 'dblclick', target: header });
    expect(coordinator.isCollapsed(card)).toBe(false);
  });
});

