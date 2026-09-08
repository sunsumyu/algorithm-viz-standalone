/**
 * 3D 视口与沙盘交互控制公共适配器 (ThreeViewControlsAdapter Deep Module)
 * 遵循单一职责与统一规范：
 * 1. 统筹 Card 1 标题旁的 2D/3D 视角切换按钮 (Toggle Button)；
 * 2. 统筹 3D 画布内部半透明磨砂悬浮交互条 (Floating Controls Bar)；
 * 3. 抽取全部位置参数、类名、文案与图标配置至公用配置文件 three-view-controls.config.ts，杜绝魔法数字；
 * 4. 供《不同路径》StateSpacePresenter 与全库 4-Card 声明式算法演示 100% 共同调用。
 */

import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';
import {
  ThreeViewControlsConfig,
  DEFAULT_THREE_VIEW_CONTROLS_CONFIG,
  ThreeControlPositionPreset,
  THREE_VIEW_POSITION_PRESETS,
} from './three-view-controls.config';

export * from './three-view-controls.config';

export class ThreeViewControlsAdapter {
  /**
   * 生成 Card 1 标题旁的 2D/3D 模式切换按钮 HTML
   * 100% 对齐《不同路径》外观、圆角、内边距、字体与图标规范
   */
  public static renderToggleButtonHtml(
    is3D: boolean = false,
    visible: boolean = true,
    config: ThreeViewControlsConfig = DEFAULT_THREE_VIEW_CONTROLS_CONFIG
  ): string {
    const { toggleButton } = config;
    const currentClass = `${toggleButton.baseClass} ${is3D ? toggleButton.activeClass : toggleButton.inactiveClass}`;
    const baseStyle = is3D ? toggleButton.activeStyle : toggleButton.inactiveStyle;
    const styleAttr = visible ? baseStyle : `${baseStyle} display: none;`;
    const currentLabel = is3D ? toggleButton.label3D : toggleButton.label2D;

    return `
      <button id="${toggleButton.id}" title="${toggleButton.title}" class="${currentClass}" style="${styleAttr}">
        ${toggleButton.iconHtml}
        <span id="${toggleButton.labelId}">${currentLabel}</span>
      </button>
    `;
  }

  /**
   * 生成 3D 画布内部的标准半透明悬浮操作栏 HTML
   * 位置与层级参数 100% 由公用配置文件驱动
   */
  public static renderFloatingBarHtml(
    visible: boolean = true,
    config: ThreeViewControlsConfig = DEFAULT_THREE_VIEW_CONTROLS_CONFIG,
    positionPresetOverride?: ThreeControlPositionPreset
  ): string {
    const { floatingBar } = config;
    const displayStyle = visible ? 'display: flex;' : 'display: none;';
    const positionClass = positionPresetOverride
      ? THREE_VIEW_POSITION_PRESETS[positionPresetOverride]
      : (floatingBar.layout?.positionClass || THREE_VIEW_POSITION_PRESETS['top-left']);
    const zIndex = floatingBar.layout?.zIndex ?? 20;

    return `
      <div id="${floatingBar.id}" class="${positionClass} ${floatingBar.containerClass}" style="${displayStyle} z-index: ${zIndex};">
        <span class="text-[11px] text-slate-500 font-sans hidden sm:inline">${floatingBar.hintText}</span>
        <button id="${floatingBar.resetBtnId}" title="${floatingBar.resetBtnTitle}" class="${floatingBar.resetBtnClass}">
          ${floatingBar.resetBtnIconHtml}
          <span>${floatingBar.resetBtnText}</span>
        </button>
      </div>
    `;
  }

  /**
   * 同步更新 2D/3D 切换按钮的 DOM 状态、类名与文案
   * 供《不同路径》和各声明式算法统一调用
   */
  public static syncToggleButtonState(
    btnEl: HTMLElement | null,
    is3D: boolean,
    config: ThreeViewControlsConfig = DEFAULT_THREE_VIEW_CONTROLS_CONFIG
  ): void {
    if (!btnEl) return;
    const { toggleButton } = config;
    btnEl.className = `${toggleButton.baseClass} ${is3D ? toggleButton.activeClass : toggleButton.inactiveClass}`;
    
    // 如果当前处于可见状态，更新内联样式
    if (btnEl.style.display !== 'none') {
      const targetStyle = is3D ? toggleButton.activeStyle : toggleButton.inactiveStyle;
      btnEl.setAttribute('style', targetStyle);
    }

    const labelEl = btnEl.querySelector(`#${toggleButton.labelId}`) || btnEl.querySelector('span:last-child');
    if (labelEl) {
      labelEl.textContent = is3D ? toggleButton.label3D : toggleButton.label2D;
    }
  }

  /**
   * 绑定复位视角按钮点击事件
   */
  public static bindResetCamera(
    container: HTMLElement | null,
    onCustomReset?: () => void,
    config: ThreeViewControlsConfig = DEFAULT_THREE_VIEW_CONTROLS_CONFIG
  ): void {
    if (!container || typeof container.querySelector !== 'function') return;
    const resetBtn = container.querySelector(`#${config.floatingBar.resetBtnId}`) as HTMLElement | null;
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        if (onCustomReset) {
          onCustomReset();
        } else if (typeof window !== 'undefined') {
          try {
            ThreeGridVisualAdapter.getInstance().resetCameraPosition();
          } catch (err) {
            console.warn('[ThreeViewControls] Reset camera error:', err);
          }
        }
      };
    }
  }
}
