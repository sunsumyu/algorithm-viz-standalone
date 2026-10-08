/**
 * Card 1 复合子视图切换控制栏统一设计规范配置 (Card1SubViewControlsConfig)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 
 * 作用：
 * 1. 抽取胶囊容器、激活态药丸与未激活态的样式、尺寸、字体与配色标准；
 * 2. 提供自包含内联样式 (Self-Contained Inline Styles) 兜底，防止在隔离 iframe 或无 Tailwind JIT 环境中漏出原生黑边框；
 * 3. 100% 像素级对齐《不同路径》黄金基准外观与交互质感。
 */

export interface Card1SubViewControlsConfig {
  container: {
    id: string;
    baseClass: string;
    baseStyle: string;
  };
  primaryButton: {
    id: string;
    baseClass: string;
    activeClass: string;
    inactiveClass: string;
    activeStyle: string;
    inactiveStyle: string;
    title: string;
  };
  deductionButton: {
    id: string;
    baseClass: string;
    activeClass: string;
    inactiveClass: string;
    activeStyle: string;
    inactiveStyle: string;
    title: string;
    iconHtml: string;
    label: string;
  };
}

export const DEFAULT_CARD1_SUBVIEW_CONTROLS_CONFIG: Card1SubViewControlsConfig = {
  container: {
    id: 'card1-subview-bar',
    baseClass: 'card1-subview-bar inline-flex flex-row items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold whitespace-nowrap flex-shrink-0 ml-1',
    baseStyle: 'display: inline-flex; flex-direction: row; align-items: center; gap: 2px; background: #f1f5f9; padding: 2px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; white-space: nowrap; flex-shrink: 0; margin-left: 4px; box-sizing: border-box;',
  },
  primaryButton: {
    id: 'btn-card1-view-grid',
    baseClass: 'subview-tab-btn px-2 py-0.5 rounded-md transition flex items-center gap-1 whitespace-nowrap cursor-pointer select-none',
    activeClass: 'active shadow-2xs bg-white text-blue-700 font-extrabold',
    inactiveClass: 'text-slate-600 hover:text-slate-900 font-semibold',
    // 强制消除原生 button 边框，自包含胶囊微阴影与白底蓝字
    activeStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: #ffffff; color: #1d4ed8; border: none; outline: none; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); line-height: 1.2; box-sizing: border-box;',
    inactiveStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: transparent; color: #475569; border: none; outline: none; cursor: pointer; transition: all 0.15s ease; box-shadow: none; line-height: 1.2; box-sizing: border-box;',
    title: '主沙盘视角',
  },
  deductionButton: {
    id: 'btn-card1-view-deduction',
    baseClass: 'subview-tab-btn px-2 py-0.5 rounded-md transition flex items-center gap-1 whitespace-nowrap cursor-pointer select-none',
    activeClass: 'active shadow-2xs bg-white text-blue-700 font-extrabold',
    inactiveClass: 'text-slate-600 hover:text-slate-900 font-semibold',
    activeStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: #ffffff; color: #1d4ed8; border: none; outline: none; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); line-height: 1.2; box-sizing: border-box;',
    inactiveStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: transparent; color: #475569; border: none; outline: none; cursor: pointer; transition: all 0.15s ease; box-shadow: none; line-height: 1.2; box-sizing: border-box;',
    title: '全景静态推演树与填表全过程',
    iconHtml: '<i class="fa-solid fa-diagram-project text-[10px]"></i>',
    label: '全景推演树',
  },
};
