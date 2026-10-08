/**
 * 二维二进制/网格探索通用视觉适配器 (BinaryGridCanvasAdapter Deep Module)
 * 遵循 Matt Pocock 的深模块设计哲学：
 * 小接口 (Small Interface)、大实现 (Deep Implementation)。
 *
 * 核心职责：
 * 1. 作为全库网格类算法输入的单一事实来源 (Single Source of Truth)，统一以 `; ` 分行序列化；
 * 2. 统一整合两大视觉表现体系：
 *    - 'topology' (默认)：多态连通块染色、海拔高度、双洋交集、0/1 矩阵沙盘；
 *    - 'adventurer'：探险家小人动效、坐标标尺、终点旗帜 🏁 与边界深水河流 🌊；
 * 3. 智能尺度自适应：根据网格行列数动态计算最佳尺寸与字号，彻底杜绝大面积空白留白与元素局促缩放；
 * 4. 根除业务渲染器内联手写 DOM 拼接，严守零内联画布红线。
 */

import { GridVisualAdapter } from '../grid-visual-adapter';

export type GridCanvasVariant = 'topology' | 'adventurer';

export interface BinaryGridAdventurerConfig {
  r: number;
  c: number;
  state?: 'walking' | 'cheering' | 'jumping' | 'blocked';
  isFinish?: boolean;
}

export interface BinaryGridCellConfig {
  /** 单元格显示文本或符号 (如 '0', '1', '✓', '🛡️', 'ID:2') */
  text: string | number;
  /** 背景色 */
  bg?: string;
  /** 文字颜色 */
  color?: string;
  /** 边框样式 */
  border?: string;
  /** 缩放与位移动画 (如 scale(1.08)) */
  transform?: string;
  /** 阴影与光晕 (如 0 0 0 3px rgba(...)) */
  boxShadow?: string;
  /** 额外内嵌 DOM 片段 */
  extraHtml?: string;
  /** 层级 */
  zIndex?: number;
  /** 字体大小 */
  fontSize?: string;
  /** 字重 */
  fontWeight?: string;
  /** 提示文案 */
  title?: string;
}

export interface BinaryGridRenderOptions {
  rows: number;
  cols: number;
  /** 视觉变体风格：'topology' (多态连通块染色，默认) | 'adventurer' (探险家网格动效) */
  variant?: GridCanvasVariant;
  /** 单元格固定大小或宽高比，默认 'auto' 智能自适应 */
  cellSize?: string;
  /** 单元格间距，若未传则自适应匹配 */
  gap?: string;
  /** 最大宽度限制 (如 560px)，默认 '100%' */
  maxWidth?: string;
  /** 是否在格子左上角显示 (r,c) 坐标标注 */
  showCoords?: boolean;
  /** 探险家小人当前位置及状态 (variant='adventurer' 或显式传入时激活) */
  adventurer?: BinaryGridAdventurerConfig | null;
  /** 终点目标格子坐标（将在右下角显示 🏁 终点旗帜） */
  targetPos?: [number, number] | null;
  /** 底部水流边界防线提示语（如传入或 true 则渲染波浪河流栏） */
  riverBarrierText?: string | boolean;
  /** 单个单元格的配置工厂函数 */
  getCell: (r: number, c: number) => BinaryGridCellConfig;
}

export class BinaryGridCanvasAdapter {
  /**
   * 将二维网格序列化为标准文本（行与行之间统一以分号加空格 `; ` 分隔）
   */
  public static formatGridInput(grid: number[][]): string {
    if (!grid || grid.length === 0) return '';
    return grid.map((row) => row.join('')).join('; ');
  }

  /**
   * 根据矩阵维度动态计算最佳单元格尺寸与排版参数，确保占满沙盘 60%~70% 黄金区域
   */
  public static computeAdaptiveMetrics(rows: number, cols: number): {
    cellSize: string;
    gap: string;
    fontSize: string;
    borderRadius: string;
  } {
    const maxDim = Math.max(rows, cols);
    if (maxDim <= 3) {
      return { cellSize: '68px', gap: '8px', fontSize: '16px', borderRadius: '12px' };
    } else if (maxDim <= 4) {
      return { cellSize: '62px', gap: '8px', fontSize: '15px', borderRadius: '10px' };
    } else if (maxDim <= 5) {
      return { cellSize: '56px', gap: '7px', fontSize: '14px', borderRadius: '9px' };
    } else if (maxDim <= 6) {
      return { cellSize: '50px', gap: '6px', fontSize: '13px', borderRadius: '8px' };
    } else if (maxDim <= 8) {
      return { cellSize: '44px', gap: '5px', fontSize: '12px', borderRadius: '7px' };
    } else {
      return { cellSize: '38px', gap: '4px', fontSize: '11px', borderRadius: '6px' };
    }
  }

  /**
   * 通用网格沙盘渲染核心（双风格架构：多态拓扑染色 vs 探险家动效）
   */
  public static renderGridCanvas(
    container: HTMLElement,
    options: BinaryGridRenderOptions
  ): void {
    if (!container) return;
    const {
      rows,
      cols,
      variant = 'topology',
      cellSize: requestedCellSize,
      gap: requestedGap,
      maxWidth = '100%',
      showCoords = variant === 'adventurer',
      adventurer,
      targetPos,
      riverBarrierText,
      getCell,
    } = options;

    const isAdventurerMode = variant === 'adventurer' || Boolean(adventurer);
    const adaptive = this.computeAdaptiveMetrics(rows, cols);

    const isExplicitAspect =
      requestedCellSize && (requestedCellSize.includes('fr') || requestedCellSize === '100%');
    const finalCellSize = requestedCellSize && requestedCellSize !== 'auto'
      ? requestedCellSize
      : adaptive.cellSize;
    const finalGap = requestedGap ?? adaptive.gap;

    let cellsHtml = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cfg = getCell(r, c);
        const bg = cfg.bg || (isAdventurerMode ? '#ffffff' : '#f1f5f9');
        const color = cfg.color || '#64748b';
        const border = cfg.border || (isAdventurerMode ? '1.5px solid #cbd5e1' : '1.5px solid #cbd5e1');
        const transform = cfg.transform || 'none';
        const boxShadow = cfg.boxShadow || 'none';
        const zIndex = cfg.zIndex ?? 1;
        const fontSize = cfg.fontSize || adaptive.fontSize;
        const fontWeight = cfg.fontWeight || '800';
        const extra = cfg.extraHtml || '';
        const titleAttr = cfg.title ? ` title="${cfg.title}"` : '';

        // 探险家小人装载
        let adventurerOverlay = '';
        if (adventurer && adventurer.r === r && adventurer.c === c) {
          const advSvg = GridVisualAdapter.getAdventurerSvgHtml({
            state: adventurer.state || 'walking',
            isFinish: adventurer.isFinish || false,
          });
          adventurerOverlay = `<div class="adventurer-char-holder" style="position: absolute; top: -24px; left: 50%; transform: translateX(-50%); pointer-events: none; z-index: 30;">${advSvg}</div>`;
        }

        // 终点旗帜
        let targetFlagOverlay = '';
        if (targetPos && targetPos[0] === r && targetPos[1] === c) {
          targetFlagOverlay = `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 11px; opacity: 0.85; pointer-events: none;">🏁</span>`;
        }

        // 坐标角标 (r,c)
        let coordBadge = '';
        if (showCoords) {
          coordBadge = `<span style="position: absolute; top: 2px; left: 4px; font-size: 9px; font-weight: 700; color: #94a3b8; font-family: 'JetBrains Mono', monospace; pointer-events: none;">${r},${c}</span>`;
        }

        const sizeStyle = isExplicitAspect
          ? 'aspect-ratio: 1; width: 100%;'
          : `width: ${finalCellSize}; height: ${finalCellSize};`;

        cellsHtml += `
          <div class="bga-cell" style="${sizeStyle} border-radius: ${adaptive.borderRadius}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}; font-weight: ${fontWeight}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: ${border}; background: ${bg}; color: ${color}; transform: ${transform}; box-shadow: ${boxShadow}; position: relative; z-index: ${zIndex}; box-sizing: border-box;"${titleAttr}>
            ${adventurerOverlay}
            ${coordBadge}
            ${targetFlagOverlay}
            ${extra}
            <span style="${showCoords ? 'margin-top: 6px;' : ''}">${cfg.text}</span>
          </div>
        `;
      }
    }

    // 边界深水河流横条（若开启）
    let riverBarHtml = '';
    if (riverBarrierText) {
      const riverLabel = typeof riverBarrierText === 'string'
        ? riverBarrierText
        : '🌊 边界深水河流 · 越界反弹 🚫';
      riverBarHtml = `
        <div style="width: 100%; max-width: 320px; margin-top: 10px; position: relative; overflow: hidden; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.8); background: linear-gradient(to right, #0369a1, #0284c7, #075985); padding: 4px 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-shrink: 0;">
          <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.4;" preserveAspectRatio="none">
            <path d="M -60 6 Q -30 2, 0 6 T 60 6 T 120 6 T 180 6 T 240 6 T 300 6 T 360 6 T 420 6 T 480 6 T 540 6 T 600 6 T 660 6 T 720 6 T 780 6 T 840 6" fill="none" stroke="#ffffff" stroke-width="1.3" />
            <path d="M -60 14 Q -30 10, 0 14 T 60 14 T 120 14 T 180 14 T 240 14 T 300 14 T 360 14 T 420 14 T 480 14 T 540 14 T 600 14 T 660 14 T 720 14 T 780 14" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" />
          </svg>
          <span style="position: relative; z-index: 10; font-size: 11px; font-weight: 700; color: #f0f9ff; display: flex; align-items: center; gap: 4px; user-select: none;">
            ${riverLabel}
          </span>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="bga-grid-wrapper" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box;">
        <div class="bga-grid-container" style="display: grid; grid-template-columns: repeat(${cols}, ${finalCellSize}); gap: ${finalGap}; justify-content: center; align-content: center; max-width: ${maxWidth}; margin: 0 auto; box-sizing: border-box;">
          ${cellsHtml}
        </div>
        ${riverBarHtml}
      </div>
    `;
  }
}
