import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisualThemeManager } from './visual-theme-manager';
import { THEME_PRESETS } from './theme-presets';

// Lightweight Mock DOM for node vitest
class MockElement {
  public id = '';
  public value = '';
  public textContent = '';
  public innerHTML = '';
  public className = '';
  public style: any = {
    setProperty: (k: string, v: string) => { this.style[k] = v; },
    getPropertyValue: (k: string) => this.style[k] || ''
  };
  public children: MockElement[] = [];
  public attributes: Record<string, string> = {};
  public listeners: Record<string, Function[]> = {};
  public classList = {
    _classes: new Set<string>(),
    add: (c: string) => this.classList._classes.add(c),
    remove: (c: string) => this.classList._classes.delete(c),
    toggle: (c: string, force?: boolean) => {
      if (force === true) this.classList._classes.add(c);
      else if (force === false) this.classList._classes.delete(c);
      else if (this.classList._classes.has(c)) this.classList._classes.delete(c);
      else this.classList._classes.add(c);
      return this.classList._classes.has(c);
    },
    contains: (c: string) => this.classList._classes.has(c)
  };

  constructor(id = '') {
    this.id = id;
  }

  public setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  public getAttribute(name: string) {
    return this.attributes[name] || null;
  }

  public appendChild(child: MockElement) {
    this.children.push(child);
    return child;
  }

  public addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  public click() {
    this.listeners['click']?.forEach(fn => fn({ stopPropagation: () => {} }));
  }

  public querySelector(sel: string): MockElement | null {
    if (sel === 'button') return this.children.find(c => c.id.startsWith('btn') || c.className.includes('btn') || true) || null;
    if (sel === '.theme-menu') return this.children.find(c => c.className.includes('theme-menu')) || null;
    return null;
  }

  public querySelectorAll(sel: string): MockElement[] {
    if (sel === 'button') return this.children.filter(c => c.className.includes('btn') || true);
    return [];
  }

  public contains(el: any): boolean {
    return true;
  }
}

describe('VisualThemeManager (Deep Module)', () => {
  beforeEach(() => {
    (globalThis as any).document = {
      documentElement: new MockElement('root'),
      createElement: (tag: string) => new MockElement(tag),
      addEventListener: vi.fn()
    };
    (globalThis as any).localStorage = {
      _store: {} as Record<string, string>,
      getItem: (k: string) => (globalThis as any).localStorage._store[k] || null,
      setItem: (k: string, v: string) => { (globalThis as any).localStorage._store[k] = v; },
      clear: () => { (globalThis as any).localStorage._store = {}; }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default leetcode-light theme', () => {
    const manager = new VisualThemeManager();
    expect(manager.getCurrentThemeId()).toBe('leetcode-light');
    expect(manager.getCurrentTheme().name).toBe('力扣经典 (Light)');
  });

  it('should list all available theme presets', () => {
    const themes = VisualThemeManager.getAvailableThemes();
    expect(themes.length).toBe(4);
    const themeIds = themes.map(t => t.id);
    expect(themeIds).toContain('leetcode-light');
    expect(themeIds).toContain('dark-cyberpunk');
    expect(themeIds).toContain('academic-paper');
    expect(themeIds).toContain('retro-arcade');
  });

  it('should switch theme and notify subscribers', () => {
    const manager = new VisualThemeManager();
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    const ok = manager.setTheme('dark-cyberpunk');
    expect(ok).toBe(true);
    expect(manager.getCurrentThemeId()).toBe('dark-cyberpunk');
    expect(manager.getCurrentTheme().isDark).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ id: 'dark-cyberpunk' }));

    unsubscribe();
    manager.setTheme('retro-arcade');
    expect(listener).toHaveBeenCalledTimes(1); // Unsubscribed
  });

  it('should reject invalid theme IDs gracefully', () => {
    const manager = new VisualThemeManager();
    const ok = manager.setTheme('non-existent-theme');
    expect(ok).toBe(false);
    expect(manager.getCurrentThemeId()).toBe('leetcode-light');
  });

  it('should inject CSS custom properties and data-theme to target DOM', () => {
    const manager = new VisualThemeManager();
    const testEl = new MockElement('target');
    manager.setTheme('dark-cyberpunk');
    manager.applyThemeToDom(testEl as any);

    expect(testEl.getAttribute('data-theme')).toBe('dark-cyberpunk');
    expect(testEl.classList.contains('dark')).toBe(true);
    expect(testEl.style.getPropertyValue('--viz-app-bg')).toBe('#090d16');
    expect(testEl.style.getPropertyValue('--viz-primary')).toBe('#00f0ff');
  });

  it('should render interactive theme selector widget', () => {
    const manager = new VisualThemeManager();
    const widgetBox = new MockElement('widget-box');
    manager.renderThemeSelector(widgetBox as any);

    expect(widgetBox.children.length).toBe(1); // wrapper
    const wrapper = widgetBox.children[0];
    expect(wrapper.children.length).toBe(2); // btn + menu
  });

  it('should return theme-specific voxel palettes for 2D/3D visual renderers', () => {
    const manager = new VisualThemeManager();
    const lightPalette = manager.getCurrentVoxelPalette();
    expect(lightPalette.themeId).toBe('leetcode-light');
    expect(lightPalette.isDark).toBe(false);
    expect(lightPalette.cellCurBorder).toBe('#0284c7');

    manager.setTheme('dark-cyberpunk');
    const cyberPalette = manager.getCurrentVoxelPalette();
    expect(cyberPalette.themeId).toBe('dark-cyberpunk');
    expect(cyberPalette.isDark).toBe(true);
    expect(cyberPalette.cellCurBorder).toBe('#00f0ff');

    const retroPalette = VisualThemeManager.getVoxelPalette('retro-arcade');
    expect(retroPalette.themeId).toBe('retro-arcade');
    expect(retroPalette.isDark).toBe(true);
  });
});
