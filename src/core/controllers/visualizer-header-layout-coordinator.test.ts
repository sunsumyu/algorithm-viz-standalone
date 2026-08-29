import { describe, it, expect, beforeEach } from 'vitest';
import { visualizerHeaderLayoutCoordinator } from './visualizer-header-layout-coordinator';

class MockElement {
  public tagName: string;
  public className: string;
  public id: string;
  public textContent: string;
  public children: MockElement[] = [];
  public parentNode: MockElement | null = null;
  public attributes: Record<string, string> = {};
  public style: Record<string, string> = {};

  constructor(tagName = 'div', className = '', id = '', textContent = '') {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    this.id = id;
    this.textContent = textContent;
  }

  public setAttribute(name: string, val: string) {
    this.attributes[name] = val;
  }

  public hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  public appendChild(child: MockElement) {
    if (child.parentNode) {
      const idx = child.parentNode.children.indexOf(child);
      if (idx !== -1) {
        child.parentNode.children.splice(idx, 1);
      }
    }
    this.children.push(child);
    child.parentNode = this;
  }

  public matches(selector: string): boolean {
    const parts = selector.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.startsWith('.') && this.className.includes(part.slice(1))) return true;
      if (part.startsWith('#') && this.id === part.slice(1)) return true;
      if (part === '[class*="-header-right"]' && this.className.includes('-header-right')) return true;
    }
    return false;
  }

  public querySelectorAll<T = MockElement>(selector: string): T[] {
    const results: MockElement[] = [];
    const traverse = (node: MockElement) => {
      for (const child of node.children) {
        if (child.matches(selector)) {
          results.push(child);
        }
        traverse(child);
      }
    };
    traverse(this);
    return results as unknown as T[];
  }

  public querySelector<T = MockElement>(selector: string): T | null {
    const all = this.querySelectorAll<T>(selector);
    return all.length > 0 ? all[0] : null;
  }
}

describe('VisualizerHeaderLayoutCoordinator Deep Module Guard (Normalizer Pattern)', () => {
  beforeEach(() => {
    (globalThis as any).document = {
      createElement: (tag: string) => new MockElement(tag),
      body: new MockElement('body'),
    };
  });

  it('should reorder header controls into canonical order: Presets -> Inputs -> Generate -> Reset', () => {
    const root = new MockElement('div', 'algo-view', 'algo-daily-temperatures-view');
    const headerRight = new MockElement('div', 'dt-header-right');
    root.appendChild(headerRight);

    // 原始倒序排列: InputGroup -> GenerateBtn -> ResetBtn -> PresetChipsContainer
    const inputGroup = new MockElement('div', 'dt-input-group');
    const inputField = new MockElement('input', 'dt-input-str');
    inputGroup.appendChild(inputField);

    const btnGen = new MockElement('button', 'dt-btn-generate', 'btn-generate', '▶ 运行');
    const btnReset = new MockElement('button', 'dt-btn-reset', 'btn-reset', '重置');

    const presetContainer = new MockElement('div', 'preset-chips-container');
    const chip1 = new MockElement('button', 'dt-chip', '', '示例 1');
    chip1.setAttribute('data-temperatures', '73,74,75');
    const chip2 = new MockElement('button', 'dt-chip', '', '示例 2');
    chip2.setAttribute('data-temperatures', '30,40,50');
    presetContainer.appendChild(chip1);
    presetContainer.appendChild(chip2);

    headerRight.appendChild(inputGroup);
    headerRight.appendChild(btnGen);
    headerRight.appendChild(btnReset);
    headerRight.appendChild(presetContainer);

    const modified = visualizerHeaderLayoutCoordinator.normalizeHeaderControls(root as unknown as HTMLElement);
    expect(modified).toBe(true);

    expect(headerRight.children.length).toBe(4);
    expect(headerRight.children[0]).toBe(presetContainer);
    expect(headerRight.children[1]).toBe(inputGroup);
    expect(headerRight.children[2]).toBe(btnGen);
    expect(headerRight.children[3]).toBe(btnReset);
  });

  it('should automatically wrap loose preset buttons and move them to the front', () => {
    const root = new MockElement('div', 'algo-view');
    const headerRight = new MockElement('div', 'header-right');
    root.appendChild(headerRight);

    const inputGroup = new MockElement('div', 'input-group');
    const inputField = new MockElement('input');
    inputGroup.appendChild(inputField);

    const btnGen = new MockElement('button', 'btn-generate', 'btn-generate', '生成');
    const btnReset = new MockElement('button', 'btn-reset', 'btn-reset', '重置');
    const chip1 = new MockElement('button', 'sample-btn', '', '用例 1');
    chip1.setAttribute('data-nums', '1,2,3');
    const chip2 = new MockElement('button', 'sample-btn', '', '用例 2');
    chip2.setAttribute('data-nums', '4,5,6');

    headerRight.appendChild(inputGroup);
    headerRight.appendChild(btnGen);
    headerRight.appendChild(btnReset);
    headerRight.appendChild(chip1);
    headerRight.appendChild(chip2);

    const modified = visualizerHeaderLayoutCoordinator.normalizeHeaderControls(root as unknown as HTMLElement);
    expect(modified).toBe(true);

    const firstChild = headerRight.children[0];
    expect(firstChild.className).toContain('header-preset-group');
    expect(firstChild.children.length).toBe(2);
    expect(firstChild.children[0]).toBe(chip1);
    expect(firstChild.children[1]).toBe(chip2);
    expect(headerRight.children[1]).toBe(inputGroup);
  });

  it('should be idempotent and return false if controls are already in canonical order', () => {
    const root = new MockElement('div', 'algo-view');
    const headerRight = new MockElement('div', 'header-right');
    root.appendChild(headerRight);

    const presetContainer = new MockElement('div', 'preset-chips');
    const chip1 = new MockElement('button', 'chip');
    chip1.setAttribute('data-preset', '1');
    presetContainer.appendChild(chip1);

    const inputGroup = new MockElement('div', 'input-group');
    inputGroup.appendChild(new MockElement('input'));

    const btnGen = new MockElement('button', 'btn-generate', 'btn-generate', '生成');
    const btnReset = new MockElement('button', 'btn-reset', 'btn-reset', '重置');

    headerRight.appendChild(presetContainer);
    headerRight.appendChild(inputGroup);
    headerRight.appendChild(btnGen);
    headerRight.appendChild(btnReset);

    const modified = visualizerHeaderLayoutCoordinator.normalizeHeaderControls(root as unknown as HTMLElement);
    expect(modified).toBe(false);
  });
});
