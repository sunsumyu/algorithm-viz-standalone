/**
 * 二维二进制/网格探索通用视觉适配器 (BinaryGridCanvasAdapter Deep Module)
 * 遵循 Matt Pocock 的深模块设计哲学：
 * 小接口 (Small Interface)、大实现 (Deep Implementation)。
 *
 * 核心职责：
 * 1. 作为全库网格类算法输入的单一事实来源 (Single Source of Truth)，统一以 `; ` 分行序列化；
 * 2. 统一接管网格沙盘 DOM 渲染、CSS Grid 矩阵居中排布、动态视口缩放与多态单元格着色；
 * 3. 根除业务渲染器内联手写 60+ 行 DOM 拼接与内边距冲突，严守零内联画布红线。
 */

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
  /** 额外内嵌 DOM 片段 (如海岸线外露红色边框条) */
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
  /** 单元格固定大小或宽高比，默认 '44px' */
  cellSize?: string;
  /** 单元格间距，默认 '6px' */
  gap?: string;
  /** 最大宽度限制 (如 560px)，默认 '100%' */
  maxWidth?: string;
  /** 单个单元格的配置工厂函数 */
  getCell: (r: number, c: number) => BinaryGridCellConfig;
}

export class BinaryGridCanvasAdapter {
  /**
   * 将二维网格序列化为标准文本（行与行之间统一以分号加空格 `; ` 分隔）
   * 彻底避免单行 <input type="text"> 强行剥离 \n 导致数据被压扁为 1xN
   */
  public static formatGridInput(grid: number[][]): string {
    if (!grid || grid.length === 0) return '';
    return grid.map((row) => row.join('')).join('; ');
  }

  /**
   * 通用网格沙盘渲染核心（自动处理 Grid 模板排布、响应式居中、零套娃纯净 DOM）
   */
  public static renderGridCanvas(
    container: HTMLElement,
    options: BinaryGridRenderOptions
  ): void {
    if (!container) return;
    const { rows, cols, cellSize = '44px', gap = '6px', maxWidth = '100%', getCell } = options;

    let cellsHtml = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cfg = getCell(r, c);
        const bg = cfg.bg || '#f1f5f9';
        const color = cfg.color || '#64748b';
        const border = cfg.border || '1.5px solid #cbd5e1';
        const transform = cfg.transform || 'none';
        const boxShadow = cfg.boxShadow || 'none';
        const zIndex = cfg.zIndex ?? 1;
        const fontSize = cfg.fontSize || '13px';
        const fontWeight = cfg.fontWeight || '800';
        const extra = cfg.extraHtml || '';
        const titleAttr = cfg.title ? ` title="${cfg.title}"` : '';

        const isAspect = cellSize.includes('fr') || cellSize === 'auto';
        const sizeStyle = isAspect
          ? 'aspect-ratio: 1; width: 100%;'
          : `width: ${cellSize}; height: ${cellSize};`;

        cellsHtml += `<div class="bga-cell" style="${sizeStyle} border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}; font-weight: ${fontWeight}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: ${border}; background: ${bg}; color: ${color}; transform: ${transform}; box-shadow: ${boxShadow}; position: relative; z-index: ${zIndex}; box-sizing: border-box;"${titleAttr}>${extra}<span>${cfg.text}</span></div>`;
      }
    }

    container.innerHTML = `
      <div class="bga-grid-container" style="display: grid; grid-template-columns: repeat(${cols}, ${cellSize}); gap: ${gap}; justify-content: center; align-content: center; height: 100%; width: 100%; max-width: ${maxWidth}; margin: 0 auto; padding: 8px; box-sizing: border-box;">
        ${cellsHtml}
      </div>
    `;
  }
}
