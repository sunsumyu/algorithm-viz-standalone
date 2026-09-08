/**
 * 3D 视口控制栏与交互按钮统一公共配置文件
 * (ThreeViewControls System Configuration)
 * 
 * 作用：
 * 1. 抽取所有位置参数 (Positioning)、间距尺寸 (Spacing & Dimensions)、层级 (Z-Index)；
 * 2. 统一 Tailwind 样式、毛玻璃视觉滤镜、配色与微胶囊规范；
 * 3. 提供开箱即用的位置预设 (TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT) 与配置合并机制；
 * 4. 彻底消灭魔法数字，确保与《不同路径》100% 视觉对齐与代码共用。
 */

export type ThreeControlPositionPreset = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * 浮动操作栏位置与布局参数接口
 */
export interface FloatingBarLayoutConfig {
  /** 锚点位置预设 */
  preset: ThreeControlPositionPreset;
  /** 布局定位 Tailwind 类名 (如 absolute top-2 left-2 z-20) */
  positionClass: string;
  /** 像素级外边距偏移 (可选) */
  offset?: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
  };
  /** 层级 Z-index (默认 20，确保高于 WebGL Canvas) */
  zIndex: number;
}

/**
 * 统一位置参数字典
 */
export const THREE_VIEW_POSITION_PRESETS: Record<ThreeControlPositionPreset, string> = {
  'top-left': 'absolute top-2 left-2 z-20',
  'top-right': 'absolute top-2 right-2 z-20',
  'bottom-left': 'absolute bottom-2 left-2 z-20',
  'bottom-right': 'absolute bottom-2 right-2 z-20',
};

/**
 * 控件外观、文案与事件配置接口
 */
export interface ThreeViewControlsConfig {
  /**
   * Card 1 标题旁的 2D/3D 模式切换按钮配置 (100% 对齐《不同路径》)
   */
  toggleButton: {
    id: string;
    labelId: string;
    baseClass: string;
    activeClass: string;
    inactiveClass: string;
    activeStyle: string;
    inactiveStyle: string;
    iconHtml: string;
    label2D: string;
    label3D: string;
    title: string;
  };
  /**
   * 3D 画布内部悬浮操作栏配置
   */
  floatingBar: {
    id: string;
    resetBtnId: string;
    layout: FloatingBarLayoutConfig;
    containerClass: string;
    hintText: string;
    resetBtnClass: string;
    resetBtnText: string;
    resetBtnIconHtml: string;
    resetBtnTitle: string;
  };
}

/**
 * 全局统一标准配置 (100% 像素级对齐《不同路径》规范)
 */
export const DEFAULT_THREE_VIEW_CONTROLS_CONFIG: ThreeViewControlsConfig = {
  toggleButton: {
    id: 'btn-toggle-3d',
    labelId: 'label-toggle-3d',
    baseClass: 'three-view-toggle-btn px-2 py-0.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer select-none',
    activeClass: 'border border-indigo-500 bg-indigo-600 text-white shadow-xs',
    inactiveClass: 'border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700',
    // 内联样式保证无论是否有 Tailwind JIT 环境均 100% 完美呈现
    activeStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; background: #4f46e5; border: 1px solid #4338ca; color: #ffffff; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2); margin-left: 8px; line-height: 1.2;',
    inactiveStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; background: rgba(238, 242, 255, 0.85); border: 1px solid #c7d2fe; color: #4338ca; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); margin-left: 8px; line-height: 1.2;',
    iconHtml: '<i class="fa-solid fa-cube" style="font-size: 11px; line-height: 1; display: inline-block;"></i><span style="font-size: 11px; line-height: 1; display: none;" class="cube-emoji">🧊</span>',
    label2D: '2D平面',
    label3D: '3D立体',
    title: '切换 3D 立体沙盘 / 2D 经典平面视角',
  },
  floatingBar: {
    id: 'three-controls-bar',
    resetBtnId: 'btn-reset-3d-cam',
    layout: {
      preset: 'top-left',
      positionClass: THREE_VIEW_POSITION_PRESETS['top-left'],
      zIndex: 20,
    },
    containerClass: 'flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/90 shadow-sm text-xs font-medium text-slate-700 select-none pointer-events-auto',
    hintText: '🖱️ 拖拽旋转 · 滚轮缩放',
    resetBtnClass: 'px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer',
    resetBtnText: '复位视角',
    resetBtnIconHtml: '<span style="font-size:11px; line-height:1; display:inline-block; color:#2563eb;">🔄</span>',
    resetBtnTitle: '重置等轴测 3D 黄金视角',
  },
};
