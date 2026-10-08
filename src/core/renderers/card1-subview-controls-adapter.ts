/**
 * Card 1 复合子视图切换控制栏适配器深模块 (Card1SubViewControlsAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 
 * 核心职责：
 * 1. 统一作为全库 Card 1 子视图切换胶囊栏的单一事实来源；
 * 2. 彻底消灭散落在各个模板里的脆弱 class 拼接与原生黑框缺陷；
 * 3. 采用类名 + 自包含内联样式双重防御，100% 像素级对齐《不同路径》黄金基准。
 */

import {
  Card1SubViewControlsConfig,
  DEFAULT_CARD1_SUBVIEW_CONTROLS_CONFIG,
} from './card1-subview-controls.config';
import { DomainPresentationMeta } from '../resolvers/domain-view-presentation-resolver';

export interface RenderCard1BarParams {
  visible?: boolean;
  activeView?: 'primary' | 'deduction';
  meta?: Partial<DomainPresentationMeta>;
  config?: Card1SubViewControlsConfig;
}

export class Card1SubViewControlsAdapter {
  /**
   * 编译生成 Card 1 子视图切换胶囊栏完整 HTML
   */
  public static renderBarHtml(params: RenderCard1BarParams): string {
    const {
      visible = true,
      activeView = 'primary',
      meta,
      config = DEFAULT_CARD1_SUBVIEW_CONTROLS_CONFIG,
    } = params;

    if (!visible) return '';

    const { container, primaryButton, deductionButton } = config;

    const primaryLabel = meta?.primaryTabLabel || '主沙盘';
    const primaryIcon = meta?.primaryTabIcon || 'fa-table-cells';
    const deductionLabel = meta?.deductionTabLabel || deductionButton.label;
    const deductionIcon = meta?.deductionTabIcon || 'fa-diagram-project';

    const isPrimaryActive = activeView === 'primary';

    const primaryClass = `${primaryButton.baseClass} ${
      isPrimaryActive ? primaryButton.activeClass : primaryButton.inactiveClass
    }`;
    const primaryStyle = isPrimaryActive
      ? primaryButton.activeStyle
      : primaryButton.inactiveStyle;

    const deductionClass = `${deductionButton.baseClass} ${
      !isPrimaryActive ? deductionButton.activeClass : deductionButton.inactiveClass
    }`;
    const deductionStyle = !isPrimaryActive
      ? deductionButton.activeStyle
      : deductionButton.inactiveStyle;

    return `
      <div id="${container.id}" class="${container.baseClass}" style="${container.baseStyle}">
        <button id="${primaryButton.id}" title="${primaryButton.title}" class="${primaryClass}" style="${primaryStyle}">
          <i class="fa-solid ${primaryIcon} text-[10px]" style="font-size: 10px; line-height: 1;"></i>
          <span>${primaryLabel}</span>
        </button>
        <button id="${deductionButton.id}" title="${deductionButton.title}" class="${deductionClass}" style="${deductionStyle}">
          <i class="fa-solid ${deductionIcon} text-[10px]" style="font-size: 10px; line-height: 1;"></i>
          <span>${deductionLabel}</span>
        </button>
      </div>
    `;
  }

  /**
   * 动态同步两个按钮的高亮、样式与微阴影状态
   */
  public static syncBarState(
    container: HTMLElement | Document | null,
    activeView: 'primary' | 'deduction',
    config: Card1SubViewControlsConfig = DEFAULT_CARD1_SUBVIEW_CONTROLS_CONFIG
  ): void {
    if (!container) return;

    const { primaryButton, deductionButton } = config;
    const btnPrimary = container.querySelector(`#${primaryButton.id}`) as HTMLElement | null;
    const btnDeduction = container.querySelector(`#${deductionButton.id}`) as HTMLElement | null;

    if (!btnPrimary || !btnDeduction) return;

    const isPrimaryActive = activeView === 'primary';

    // 1. 同步主沙盘按钮
    btnPrimary.className = `${primaryButton.baseClass} ${
      isPrimaryActive ? primaryButton.activeClass : primaryButton.inactiveClass
    }`;
    btnPrimary.setAttribute(
      'style',
      isPrimaryActive ? primaryButton.activeStyle : primaryButton.inactiveStyle
    );

    // 2. 同步推演树按钮
    btnDeduction.className = `${deductionButton.baseClass} ${
      !isPrimaryActive ? deductionButton.activeClass : deductionButton.inactiveClass
    }`;
    btnDeduction.setAttribute(
      'style',
      !isPrimaryActive ? deductionButton.activeStyle : deductionButton.inactiveStyle
    );
  }
}
