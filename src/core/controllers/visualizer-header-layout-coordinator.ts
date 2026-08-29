/**
 * 算法视图顶栏控制区标准化与布局协调器 (VisualizerHeaderLayoutCoordinator)
 * 
 * 设计模式应用：
 * 1. 规范化器模式 (Normalizer Pattern) + 装饰器模式 (Decorator Pattern)
 * 2. 策略模式 (Strategy Pattern)：根据不同算法分类的 DOM 结构特征自适应提取预设用例与输入控件
 * 
 * 核心职责：
 * 1. 统一协调顶栏控制区布局，确保所有算法页面均符合规范：
 *    [ 预设典型用例组 (Preset Chips) ] ➔ [ 自定义参数输入框 (Input Group) ] ➔ [ 运行/生成按钮 (Generate/Run) ] ➔ [ 重置按钮 (Reset) ]
 * 2. 自动兼容并识别松散放置与容器包裹的预设按钮，提升容错性
 * 3. 幂等执行，支持挂载期自动规范化与动态插拔
 */

export interface HeaderControlElements {
  container: HTMLElement;
  presetGroup: HTMLElement | null;
  inputGroup: HTMLElement | null;
  generateBtn: HTMLElement | null;
  resetBtn: HTMLElement | null;
  otherElements: HTMLElement[];
}

export class VisualizerHeaderLayoutCoordinator {
  private static instance: VisualizerHeaderLayoutCoordinator | null = null;

  private constructor() {}

  public static getInstance(): VisualizerHeaderLayoutCoordinator {
    if (!VisualizerHeaderLayoutCoordinator.instance) {
      VisualizerHeaderLayoutCoordinator.instance = new VisualizerHeaderLayoutCoordinator();
    }
    return VisualizerHeaderLayoutCoordinator.instance;
  }

  /**
   * 对指定的根容器执行顶栏控件顺序标准化
   * 目标标准顺序：Presets ➔ Inputs ➔ Generate/Run ➔ Reset ➔ Others
   */
  public normalizeHeaderControls(root?: HTMLElement | null): boolean {
    const targetRoot = root || (typeof document !== 'undefined' ? document.body : null);
    if (!targetRoot) return false;

    const headerRights = this.findHeaderRightContainers(targetRoot);
    if (headerRights.length === 0) return false;

    let modifiedAny = false;

    for (const headerRight of headerRights) {
      const isModified = this.reorderContainerControls(headerRight);
      if (isModified) modifiedAny = true;
    }

    return modifiedAny;
  }

  /**
   * 查找所有可能的 Header 控制区域
   */
  private findHeaderRightContainers(root: HTMLElement): HTMLElement[] {
    const selector = [
      '[class*="-header-right"]',
      '.header-right',
      '.controls-right',
      'header > div:last-child',
      '.card-header-controls',
    ].join(', ');

    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    
    // 如果根容器本身就是 header-right
    if (root.matches && root.matches(selector)) {
      if (!elements.includes(root)) {
        elements.unshift(root);
      }
    }

    return elements;
  }

  /**
   * 解析并重排单个 header-right 容器中的子元素
   */
  private reorderContainerControls(container: HTMLElement): boolean {
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length <= 1) return false;

    // 1. 识别并归类各个组件
    let presetContainer: HTMLElement | null = null;
    const loosePresetChips: HTMLElement[] = [];
    let inputGroup: HTMLElement | null = null;
    let generateBtn: HTMLElement | null = null;
    let resetBtn: HTMLElement | null = null;
    const otherElements: HTMLElement[] = [];

    for (const child of children) {
      // 预设用例容器 (包裹层)
      if (this.isPresetChipsContainer(child)) {
        presetContainer = child;
        continue;
      }

      // 松散放置的单个预设用例按钮
      if (this.isSinglePresetChip(child)) {
        loosePresetChips.push(child);
        continue;
      }

      // 输入框组
      if (this.isInputGroup(child)) {
        if (!inputGroup) {
          inputGroup = child;
        } else {
          otherElements.push(child);
        }
        continue;
      }

      // 生成/运行按钮
      if (this.isGenerateButton(child)) {
        if (!generateBtn) {
          generateBtn = child;
        } else {
          otherElements.push(child);
        }
        continue;
      }

      // 重置按钮
      if (this.isResetButton(child)) {
        if (!resetBtn) {
          resetBtn = child;
        } else {
          otherElements.push(child);
        }
        continue;
      }

      // 其他未分类元素
      otherElements.push(child);
    }

    // 如果发现松散的 preset chips，将其打包为一个标准的 Flex 容器
    if (loosePresetChips.length > 0 && !presetContainer) {
      presetContainer = document.createElement('div');
      presetContainer.className = 'header-preset-group';
      presetContainer.style.display = 'flex';
      presetContainer.style.alignItems = 'center';
      presetContainer.style.gap = '4px';

      for (const chip of loosePresetChips) {
        presetContainer.appendChild(chip);
      }
    } else if (loosePresetChips.length > 0 && presetContainer) {
      for (const chip of loosePresetChips) {
        presetContainer.appendChild(chip);
      }
    }

    // 2. 如果没有预设用例，或者没有输入框，无需调整
    if (!presetContainer && !inputGroup) {
      return false;
    }

    // 3. 构建理想排序数组
    const ordered: HTMLElement[] = [];
    if (presetContainer) ordered.push(presetContainer);
    if (inputGroup) ordered.push(inputGroup);
    if (generateBtn) ordered.push(generateBtn);
    if (resetBtn) ordered.push(resetBtn);
    ordered.push(...otherElements);

    // 4. 检查当前顺序是否与理想顺序一致（幂等性检测）
    const currentOrderedChildren = Array.from(container.children);
    let isSameOrder = currentOrderedChildren.length === ordered.length;
    if (isSameOrder) {
      for (let i = 0; i < ordered.length; i++) {
        if (currentOrderedChildren[i] !== ordered[i]) {
          isSameOrder = false;
          break;
        }
      }
    }

    if (isSameOrder) {
      return false; // 顺序已完全规范，无需重排
    }

    // 5. 执行 DOM 重新排序
    for (const el of ordered) {
      container.appendChild(el);
    }

    return true;
  }

  /**
   * 判断是否为预设用例容器 (包含 chip 或 preset 等关键词)
   */
  private isPresetChipsContainer(el: HTMLElement): boolean {
    const cls = el.className || '';
    if (typeof cls === 'string' && (
      cls.includes('preset-chips') ||
      cls.includes('preset-group') ||
      cls.includes('chip-group')
    )) {
      return true;
    }

    // 检查子元素是否主要由 chip 按钮组成
    const chips = el.querySelectorAll('button[class*="-chip"], button[class*="chip"], button[data-nums], button[data-temperatures], button[data-heights], button[data-preset], button[data-candidates], button[data-digits], button[data-s], button[data-val], button[data-target], button[data-n], button[data-k]');
    if (chips.length >= 2 && el.children.length === chips.length) {
      return true;
    }

    return false;
  }

  /**
   * 判断是否为单个松散的预设用例按钮
   */
  private isSinglePresetChip(el: HTMLElement): boolean {
    if (el.tagName !== 'BUTTON') return false;

    const cls = el.className || '';
    if (typeof cls === 'string' && (
      cls.includes('-chip') ||
      cls.includes('chip') ||
      cls.includes('preset-btn') ||
      cls.includes('sample-btn')
    )) {
      return true;
    }

    // 属性特征
    const hasPresetData = el.hasAttribute('data-nums') ||
      el.hasAttribute('data-temperatures') ||
      el.hasAttribute('data-heights') ||
      el.hasAttribute('data-preset') ||
      el.hasAttribute('data-candidates') ||
      el.hasAttribute('data-digits') ||
      el.hasAttribute('data-s') ||
      el.hasAttribute('data-val') ||
      el.hasAttribute('data-arr') ||
      el.hasAttribute('data-grid') ||
      el.hasAttribute('data-target') ||
      el.hasAttribute('data-n') ||
      el.hasAttribute('data-k') ||
      el.hasAttribute('data-example');

    return hasPresetData;
  }

  /**
   * 判断是否为输入框组
   */
  private isInputGroup(el: HTMLElement): boolean {
    const cls = el.className || '';
    if (typeof cls === 'string' && (
      cls.includes('input-group') ||
      cls.includes('-input-group')
    )) {
      return true;
    }

    if (el.querySelector('input')) {
      return true;
    }

    return false;
  }

  /**
   * 判断是否为生成/运行按钮
   */
  private isGenerateButton(el: HTMLElement): boolean {
    if (el.tagName !== 'BUTTON') return false;

    const id = el.id || '';
    const cls = el.className || '';
    const text = el.textContent || '';

    if (id === 'btn-generate' || id === 'btn-run' || id === 'btn-apply-size' || id === 'btn-apply') {
      return true;
    }

    if (cls.includes('-btn-generate') || cls.includes('btn-generate') || cls.includes('btn-run')) {
      return true;
    }

    if (text.includes('生成') || text.includes('运行') || text.includes('求解') || text.includes('执行')) {
      return true;
    }

    return false;
  }

  /**
   * 判断是否为重置按钮
   */
  private isResetButton(el: HTMLElement): boolean {
    if (el.tagName !== 'BUTTON') return false;

    const id = el.id || '';
    const cls = el.className || '';
    const text = el.textContent || '';

    if (id === 'btn-reset' || cls.includes('-btn-reset') || cls.includes('btn-reset')) {
      return true;
    }

    if (text.trim() === '重置' || text.trim() === 'Reset') {
      return true;
    }

    return false;
  }
}

export const visualizerHeaderLayoutCoordinator = VisualizerHeaderLayoutCoordinator.getInstance();
