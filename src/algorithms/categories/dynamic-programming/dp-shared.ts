/**
 * 动态规划全类目统一视觉出口模块 (Dynamic Programming Shared Visual Layer)
 * 
 * 作为整个 dynamic-programming 类目的统一顶层基础设施出口：
 * 1. 纳管并重导出底层深模块网格适配器 (GridVisualAdapter / SpatialFlowVisualAdapter / DpTableVisualAdapter / MemoSlotVisualAdapter)
 * 2. 统一收敛 Class 067、背包系列 (073/074/075) 以及字符串双串 DP 的阶段卡片组件
 * 3. 提供开箱即用的 UniversalDpGrid 快速渲染门面函数，彻底杜绝后续新 DP 算法裸写 table 拼接
 */

import { GridVisualAdapter, type GridRenderOptions } from '../../../core/renderers/grid-visual-adapter';
import { SpatialFlowVisualAdapter } from '../../../core/renderers/spatial-flow-visual-adapter';
import { DpTableVisualAdapter } from '../../../core/renderers/dp-table-visual-adapter';
import { MemoSlotVisualAdapter } from '../../../core/renderers/memo-slot-visual-adapter';

// 1. 底层视觉表现适配器统一重导出
export {
  GridVisualAdapter,
  type GridRenderOptions,
  SpatialFlowVisualAdapter,
  DpTableVisualAdapter,
  MemoSlotVisualAdapter,
};

// 2. Class 067 经典递归到 DP 共享渲染器与算力助手
export {
  computeLcsMatchedIndices,
  type DpCellDep,
  renderMemoGridCard,
  renderMemoCard1,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  renderStage1GridCard,
} from './dp-067/dp-067-shared';

// 3. 背包专题变种 (Class 073/074/075) 通用演化卡片
export {
  type SpecialMemoCard2Options,
  renderSpecialMemoCard2,
  type Special2DCard2Options,
  renderSpecial2DCard2,
  type SpecialRecursionCard1Options,
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecial2DCard1,
} from '../../../core/renderers/special-stage-cards';

// 4. 背包核心模板四阶段演化卡片
export {
  renderKnapsackMemoCard2,
  renderKnapsack2DCard1,
} from '../../../core/renderers/knapsack-stage-evolution';

// 5. 字符串双串 DP (正则 / 通配符匹配) 演化卡片
export {
  renderStringDpMemoCard2,
  renderStringDp2DCard2,
} from '../../../core/renderers/string-dp-stage-evolution';

// 6. 全局通用 DP 网格一站式门面接口与实现
export interface UniversalDpGridOptions {
  title: string;
  badgeText?: string;
  grid: (number | string | boolean | null)[][];
  activeI: number;
  activeJ: number;
  activeStack?: string[];
  rowLabels?: string[];
  colLabels?: string[];
  deps?: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }>;
  isMatch?: (r: number, c: number) => boolean;
  legend?: Array<{ label: string; color: string }>;
  subTitle?: string;
  modelId?: string;
}

/**
 * 通用 DP 网格卡片一站式渲染函数
 * 自动装配顶层卡片 Header、图例、包裹容器并委托 GridVisualAdapter 渲染
 */
export function renderUniversalDpGrid(
  container: HTMLElement,
  options: UniversalDpGridOptions
): void {
  if (!container) return;

  const {
    title,
    badgeText,
    grid,
    activeI,
    activeJ,
    rowLabels,
    colLabels,
    deps,
    isMatch,
    legend = [
      { label: '当前格', color: '#2563eb' },
      { label: '依赖格', color: '#d97706' },
      { label: '已解格', color: '#059669' },
    ],
    subTitle,
    modelId = 'universal-dp-grid',
  } = options;

  const rows = grid?.length || 0;
  const cols = grid?.[0]?.length || 0;

  const legendHtml = legend
    .map(
      (item) => `
      <span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#475569;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:2px; background:${item.color};"></span>
        ${item.label}
      </span>
    `
    )
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12.5px; font-weight:700; color:#0f172a;">${title}</span>
          ${badgeText ? `<span style="font-size:10.5px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:1px 6px; border-radius:4px; font-family:'JetBrains Mono', monospace;">${badgeText}</span>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          ${subTitle ? `<span style="font-size:11px; color:#64748b;">${subTitle}</span>` : ''}
          <div style="display:flex; gap:8px;">
            ${legendHtml}
          </div>
        </div>
      </div>
      <div class="universal-dp-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.universal-dp-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    const stepData = {
      i: activeI,
      j: activeJ,
      grid: grid || [],
      activeStack: options.activeStack || [],
      deps,
      msg: `${title} [${activeI}, ${activeJ}]`,
    };

    const renderOpts: GridRenderOptions = {
      m: rows,
      n: cols,
      isReverse: false,
      isGridProblem: false,
      modelId,
      rowLabels,
      colLabels,
      deps,
      isMatch,
    };

    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}
