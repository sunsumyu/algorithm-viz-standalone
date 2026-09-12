/**
 * BarsCanvasAdapter (排序柱状沙盘适配器深模块)
 *
 * 收敛排序家族（冒泡/选择/插入/希尔/快排/堆排）各自手写的柱状沙盘 canvas 克隆。
 * 渲染器只负责「何时比较 / 交换 / 就位」的状态推导，本适配器负责
 * 几何（柱高百分比 / 柱宽上限）与配色（经 VisualStateTokens 语义令牌）。
 *
 * 纯计算（computeBarsVisual）与 DOM 呈现（BarsCanvasAdapter.render）分离，
 * 前者可无头单元测试，后者保持极薄。
 */

import { visualState, type VisualStateId } from './visual-state-tokens';

export interface BarsVisualOptions {
  /** 柱 values（决定高度） */
  values: number[];
  /** 每根柱子的语义状态（缺省 idle；与 values 等长对齐） */
  states?: Array<VisualStateId | undefined>;
  /** 数值标签位置：柱内顶部（默认，selection/insertion/shell/quick/heap 家族）或柱上方（bubble 家族） */
  valuePosition?: 'inside' | 'above';
  /**
   * 强调态（swapping / pivot）的缩放系数。
   * 冒泡/插入/希尔家族 1.05，选择/快排/堆排家族 1.06；默认 1.05。
   */
  emphasisScale?: number;
  /** 容器内边距（默认 '16px 12px 10px'） */
  padding?: string;
}

/** 单根柱子的最终视觉（纯数据，可无头断言） */
export interface BarVisualCell {
  index: number;
  value: number;
  heightPct: number;
  bg: string;
  border: string;
  color: string;
  transform: string;
}

const MIN_HEIGHT_PCT = 18;

/**
 * 纯函数：由 options 计算每根柱子的最终视觉。
 * 高度按最大值归一化（上限 100%，下限 18%），状态经 VisualStateTokens 解析。
 */
export function computeBarsVisual(options: BarsVisualOptions): BarVisualCell[] {
  const { values, states = [], emphasisScale = 1.05 } = options;
  const maxVal = Math.max(...values, 1);

  return values.map((value, index) => {
    const style = visualState(states[index] ?? 'idle');
    const emphasized = style.scale !== null;
    return {
      index,
      value,
      heightPct: Math.max(MIN_HEIGHT_PCT, Math.round((value / maxVal) * 100)),
      bg: style.bg,
      border: style.border,
      color: style.text,
      transform: emphasized ? `scale(${emphasisScale})` : 'none',
    };
  });
}

const BAR_TRANSITION = 'transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);';

function barCellHtml(cell: BarVisualCell, valuePosition: 'inside' | 'above'): string {
  const valueLabel = `<span style="font-size: 11px; font-weight: 800; color: #0f172a;">${cell.value}</span>`;
  if (valuePosition === 'above') {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; max-width: 44px; height: 100%; justify-content: flex-end; ${BAR_TRANSITION}">
        ${valueLabel}
        <div style="width: 100%; border-radius: 6px 6px 2px 2px; background: ${cell.bg}; border: 1.5px solid ${cell.border}; min-height: 12px; height: ${cell.heightPct}%; ${BAR_TRANSITION}; transform: ${cell.transform};"></div>
        <span style="font-size: 9.5px; font-family: 'JetBrains Mono', monospace; color: #94a3b8;">${cell.index}</span>
      </div>
    `;
  }
  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; max-width: 44px; height: 100%; justify-content: flex-end; ${BAR_TRANSITION}">
      <div style="width: 100%; border-radius: 6px 6px 2px 2px; background: ${cell.bg}; border: 1.5px solid ${cell.border}; color: ${cell.color}; min-height: 12px; height: ${cell.heightPct}%; ${BAR_TRANSITION}; transform: ${cell.transform}; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; box-sizing: border-box;">${cell.value}</div>
      <span style="font-size: 9.5px; font-family: 'JetBrains Mono', monospace; color: #94a3b8;">${cell.index}</span>
    </div>
  `;
}

/**
 * 排序柱状沙盘适配器（DomainAdapterCatalog 条目 'bars-canvas'）。
 * 消费语义状态声明，统一输出几何与配色一致的柱状沙盘。
 */
export const BarsCanvasAdapter = {
  renderMethodName: 'render',

  render(container: HTMLElement, options: BarsVisualOptions): void {
    const valuePosition = options.valuePosition ?? 'inside';
    const padding = options.padding ?? '16px 12px 10px';
    const cells = computeBarsVisual(options);
    const barsHtml = cells.map((cell) => barCellHtml(cell, valuePosition)).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: flex-end; justify-content: center; gap: 10px; height: 100%; width: 100%; padding: ${padding}; box-sizing: border-box;">
        ${barsHtml}
      </div>
    `;
  },
};
