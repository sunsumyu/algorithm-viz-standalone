/**
 * 快捷键动作调度中枢与上下文执行器 (ShortcutActionDispatcher)
 * 职责：
 * 接收标准化的动作 ID，结合当前激活视图、时间轴控制器、导航器与 DOM 结构进行精准执行。
 */

import { algoNavigation } from '../algo-navigation';
import { algorithmManager } from '../algorithm-manager';

export class ShortcutActionDispatcher {
  private static instance: ShortcutActionDispatcher | null = null;
  private openShortcutModalHandler: (() => void) | null = null;
  private closeAllModalsHandler: (() => boolean) | null = null;

  private constructor() {}

  public static getInstance(): ShortcutActionDispatcher {
    if (!ShortcutActionDispatcher.instance) {
      ShortcutActionDispatcher.instance = new ShortcutActionDispatcher();
    }
    return ShortcutActionDispatcher.instance;
  }

  /**
   * 注册快捷键弹窗打开钩子
   */
  public registerModalHooks(openModal: () => void, closeAll: () => boolean): void {
    this.openShortcutModalHandler = openModal;
    this.closeAllModalsHandler = closeAll;
  }

  /**
   * 调度并执行指定动作
   */
  public dispatch(actionId: string, event?: Event): boolean {
    switch (actionId) {
      // 1. 播放控制
      case 'playback.toggle':
        return this.dispatchPlayToggle();

      case 'playback.stepForward':
        return this.dispatchStepForward();

      case 'playback.stepBackward':
        return this.dispatchStepBackward();

      case 'playback.reset':
        return this.dispatchReset();

      case 'playback.speedCycle':
        return this.dispatchSpeedCycle();

      // 2. 算法导航 (上一题 / 下一题 / 目录 / 搜索 / 主页)
      case 'navigation.prevAlgo':
        algoNavigation.navigateToPrevious();
        return true;

      case 'navigation.nextAlgo':
        algoNavigation.navigateToNext();
        return true;

      case 'navigation.toggleDrawer':
        algoNavigation.toggleDrawer();
        return true;

      case 'navigation.search':
        return this.dispatchSearch();

      case 'navigation.backHome':
        algorithmManager.showAlgorithmSelector();
        return true;

      // 3. 代码与终端
      case 'terminal.tabCode':
        return this.clickElement(['#btn-tab-code', '.tab-code']);

      case 'terminal.tabProblem':
        return this.clickElement(['#btn-tab-problem', '.tab-problem']);

      case 'terminal.tabAnalysis':
        return this.clickElement(['#btn-tab-analysis', '.tab-analysis']);

      case 'terminal.fontIncrease':
        return this.clickElement(['#btn-code-font-inc']);

      case 'terminal.fontDecrease':
        return this.clickElement(['#btn-code-font-dec']);

      case 'terminal.switchLang':
        return this.dispatchSwitchLang();

      // 4. 全局辅助
      case 'general.openShortcuts':
        if (this.openShortcutModalHandler) {
          this.openShortcutModalHandler();
          return true;
        }
        return false;

      case 'general.closeModal':
        return this.dispatchCloseModal();

      default:
        console.warn(`[ShortcutActionDispatcher] 未知动作: ${actionId}`);
        return false;
    }
  }

  private clickElement(selectors: string[]): boolean {
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el && typeof el.click === 'function') {
        el.click();
        return true;
      }
    }
    return false;
  }

  private dispatchPlayToggle(): boolean {
    return this.clickElement(['#btn-play-pause', '#btn-play', '#algo-play-btn']);
  }

  private dispatchStepForward(): boolean {
    return this.clickElement([
      '#btn-step-next',
      '#btn-step-forward',
      '#btn-step',
      '#btn-next-step'
    ]);
  }

  private dispatchStepBackward(): boolean {
    return this.clickElement([
      '#btn-step-prev',
      '#btn-prev',
      '#btn-prev-step'
    ]);
  }

  private dispatchReset(): boolean {
    return this.clickElement(['#btn-reset', '#algo-reset-btn']);
  }

  private dispatchSpeedCycle(): boolean {
    const select = document.querySelector(
      '#select-speed, #speed-select, #playback-speed'
    ) as HTMLSelectElement | null;
    if (select && select.options && select.options.length > 0) {
      const nextIdx = (select.selectedIndex + 1) % select.options.length;
      select.selectedIndex = nextIdx;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  private dispatchSearch(): boolean {
    const searchInput = document.querySelector(
      '#algo-search-input, #search-input, .header-search-input'
    ) as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      return true;
    }
    return false;
  }

  private dispatchSwitchLang(): boolean {
    const langGroup = document.querySelector('#code-lang-tabs') || document.querySelector('[class*="-lang-group"]');
    if (!langGroup) return false;

    const langBtns = Array.from(langGroup.querySelectorAll('button')) as HTMLButtonElement[];
    if (langBtns.length === 0) return false;

    const activeIdx = langBtns.findIndex((btn) => btn.classList.contains('active'));
    const nextIdx = (activeIdx + 1) % langBtns.length;
    langBtns[nextIdx]?.click();
    return true;
  }

  private dispatchCloseModal(): boolean {
    // 1. 若有已注册的弹窗关闭钩子（如快捷键弹窗）
    if (this.closeAllModalsHandler && this.closeAllModalsHandler()) {
      return true;
    }

    // 2. 原题描述弹窗
    const problemModal = document.getElementById('modal-problem');
    if (problemModal && !problemModal.classList.contains('hidden') && problemModal.style.display !== 'none') {
      const closeBtn = document.getElementById('btn-close-problem-modal');
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
    }

    // 3. 目录抽屉
    algoNavigation.closeDrawer();

    // 4. 输入框失焦
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
      return true;
    }

    return false;
  }
}

export const shortcutDispatcher = ShortcutActionDispatcher.getInstance();
