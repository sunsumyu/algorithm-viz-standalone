/**
 * DP-067 算法通用可视化渲染组件与辅助工具集 (Light Theme 规范化版本)
 * 包含：
 * 1. 递归调用栈与决策卡片 (Recursion Card)
 * 2. 记忆化缓存命中与热力矩阵卡片 (Memoization Card)
 * 3. 严格二维状态表与依赖指示卡片 (2D DP Table Card)
 * 4. 空间压缩一维滚动向量与暂存寄存器卡片 (Space Optimization Card)
 * 
 * 遵循项目《UI 布局与交互设计规范》：
 * - 纯净单层大卡片，彻底消灭“俄罗斯套娃”嵌套边框与信息重复
 * - 统一 Light Mode 调色板，与主框架自然融合
 * - 语义化状态高亮，强化算法教学可视性
 */

import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';

export interface DpCellDep {
  r: number;
  c: number;
  label?: string;
  color?: string;
}

/**
 * 阶段 1: 递归调用栈与当前动作指示 (Card 1)
 */
export function renderRecursionCard1(
  container: HTMLElement,
  currentCall: string,
  stack: Array<{ label: string; depth?: number }>,
  decisionHtml: string,
  treeRoot?: any,
  activeNodeId?: string
): void {
  if (!container) return;

  if (treeRoot) {
    let treeBox = container.querySelector('#rec-tree-viewport') as HTMLElement | null;
    let callText = container.querySelector('#rec-current-call') as HTMLElement | null;
    let depthText = container.querySelector('#rec-stack-depth') as HTMLElement | null;
    let descBox = container.querySelector('#rec-decision-box') as HTMLElement | null;

    if (!treeBox) {
      container.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 6px;
          box-sizing: border-box;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <!-- 头部：当前探查函数与栈深 -->
          <div style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 6px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            flex-shrink: 0;
          ">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">当前递归:</span>
              <span id="rec-current-call" style="font-size: 12.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${currentCall}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="rec-stack-depth" style="font-size: 10.5px; font-weight: 600; color: #1e40af; background: #eff6ff; border: 1px solid #bfdbfe; padding: 1px 8px; border-radius: 10px;">
                调用栈深度: ${stack.length}
              </span>
            </div>
          </div>

          <!-- 决策详情栏 (紧凑) -->
          <div id="rec-decision-box" style="
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 5px 10px;
            flex-shrink: 0;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          ">
            ${decisionHtml}
          </div>

          <!-- 递归展开树容器 -->
          <div id="rec-tree-viewport" style="
            flex: 1;
            min-height: 0;
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            position: relative;
            overflow: hidden;
          "></div>
        </div>
      `;
      treeBox = container.querySelector('#rec-tree-viewport');
    } else {
      if (callText) callText.textContent = currentCall;
      if (depthText) depthText.textContent = `调用栈深度: ${stack.length}`;
      if (descBox) descBox.innerHTML = decisionHtml;
    }

    if (treeBox) {
      RecursionTreeAdapter.renderRecursionTree(treeBox, treeRoot, activeNodeId, false);
    }
    return;
  }

  const stackItemsHtml = stack.length > 0
    ? stack
        .slice(-8)
        .reverse()
        .map((item, idx) => {
          const isTop = idx === 0;
          return `
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 5px 10px;
              border-radius: 6px;
              background: ${isTop ? '#eff6ff' : '#ffffff'};
              border: 1px solid ${isTop ? '#93c5fd' : '#e2e8f0'};
              color: ${isTop ? '#1d4ed8' : '#475569'};
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              box-shadow: ${isTop ? '0 1px 2px rgba(59, 130, 246, 0.12)' : 'none'};
            ">
              <span style="font-weight: 700;">${isTop ? '👉 TOP (栈顶)' : `FRAME #${stack.length - idx}`}</span>
              <span style="font-weight: ${isTop ? '800' : '600'};">${item.label}</span>
            </div>
          `;
        })
        .join('')
    : `<div style="color: #94a3b8; font-size: 11.5px; text-align: center; padding: 18px;">调用栈为空 (尚未进入递归)</div>`;

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <!-- 头部：当前探查函数 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <span style="font-size: 11px; font-weight: 600; color: #64748b;">当前执行递归函数:</span>
        <span style="font-size: 12.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${currentCall}</span>
      </div>

      <!-- 运行时调用栈列表 -->
      <div style="
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 10px;
        flex: 1;
        min-height: 85px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-size: 11px; font-weight: 700; color: #0f172a;">📚 运行时刻调用栈 (Call Stack)</span>
          <span style="font-size: 10px; font-weight: 600; color: #64748b; background: #ffffff; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 10px;">深度: ${stack.length}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto;">
          ${stackItemsHtml}
        </div>
      </div>

      <!-- 决策详情栏 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        ${decisionHtml}
      </div>
    </div>
  `;
}

/**
 * 阶段 2: 备忘录缓存追踪 (Card 1)
 */
export function renderMemoCard1(
  container: HTMLElement,
  currentCall: string,
  memoHit: boolean,
  hitCount: number,
  missCount: number,
  decision: string,
  message: string,
  cachedVal?: any,
  treeRoot?: any,
  activeNodeId?: string
): void {
  if (!container) return;
  const total = hitCount + missCount;
  const hitRate = total > 0 ? Math.round((hitCount / total) * 100) : 0;

  if (treeRoot) {
    let treeBox = container.querySelector('#memo-tree-viewport') as HTMLElement | null;
    let callText = container.querySelector('#memo-current-call') as HTMLElement | null;
    let hitBadge = container.querySelector('#memo-hit-badge') as HTMLElement | null;
    let statRate = container.querySelector('#memo-stat-rate') as HTMLElement | null;
    let decText = container.querySelector('#memo-decision-text') as HTMLElement | null;

    if (!treeBox) {
      container.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 6px;
          box-sizing: border-box;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <!-- 头部：探查状态与诊断胶囊 -->
          <div style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 6px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            flex-shrink: 0;
          ">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">当前探查:</span>
              <span id="memo-current-call" style="font-size: 12.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${currentCall}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="memo-hit-badge" style="
                font-size: 10.5px;
                font-weight: 800;
                padding: 1px 8px;
                border-radius: 10px;
                background: ${memoHit ? '#ecfdf5' : '#fef2f2'};
                border: 1px solid ${memoHit ? '#a7f3d0' : '#fecaca'};
                color: ${memoHit ? '#047857' : '#b91c1c'};
              ">${memoHit ? '🎯 CACHE HIT' : '🔍 CACHE MISS'}</span>
              <span id="memo-stat-rate" style="
                font-size: 10.5px;
                font-weight: 700;
                padding: 1px 8px;
                border-radius: 10px;
                background: #fffbeb;
                border: 1px solid #fde68a;
                color: #b45309;
                font-family: monospace;
              ">剪枝率 ${hitRate}% (${hitCount}/${total})</span>
            </div>
          </div>

          <!-- 决策推导与剪枝说明 (紧凑) -->
          <div style="
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 5px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
          ">
            <div id="memo-decision-text" style="font-size: 11px; font-weight: 700; color: #0284c7;">${decision}</div>
            ${cachedVal !== undefined ? `
              <span style="font-size: 11px; font-weight: 800; color: #166534; font-family: monospace;">缓存值 = ${cachedVal}</span>
            ` : ''}
          </div>

          <!-- 记忆化剪枝树容器 -->
          <div id="memo-tree-viewport" style="
            flex: 1;
            min-height: 0;
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            position: relative;
            overflow: hidden;
          "></div>
        </div>
      `;
      treeBox = container.querySelector('#memo-tree-viewport');
    } else {
      if (callText) callText.textContent = currentCall;
      if (hitBadge) {
        hitBadge.textContent = memoHit ? '🎯 CACHE HIT' : '🔍 CACHE MISS';
        hitBadge.style.background = memoHit ? '#ecfdf5' : '#fef2f2';
        hitBadge.style.borderColor = memoHit ? '#a7f3d0' : '#fecaca';
        hitBadge.style.color = memoHit ? '#047857' : '#b91c1c';
      }
      if (statRate) statRate.textContent = `剪枝率 ${hitRate}% (${hitCount}/${total})`;
      if (decText) decText.textContent = decision;
    }

    if (treeBox) {
      RecursionTreeAdapter.renderRecursionTree(treeBox, treeRoot, activeNodeId, true);
    }
    return;
  }

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <!-- 探查参数状态行 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <span style="font-size: 11px; font-weight: 600; color: #64748b;">探查状态参数:</span>
        <span style="font-size: 12.5px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${currentCall}</span>
      </div>

      <!-- 缓存诊断与统计胶囊 -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      ">
        <div style="
          background: ${memoHit ? '#ecfdf5' : '#fef2f2'};
          border: 1px solid ${memoHit ? '#a7f3d0' : '#fecaca'};
          border-radius: 8px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span style="font-size: 11px; font-weight: 600; color: ${memoHit ? '#065f46' : '#991b1b'};">缓存命中诊断</span>
          <span style="
            font-size: 11px;
            font-weight: 800;
            color: ${memoHit ? '#047857' : '#b91c1c'};
          ">${memoHit ? '🎯 CACHE HIT' : '⚠️ CACHE MISS'}</span>
        </div>

        <div style="
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        ">
          <span style="font-size: 11px; font-weight: 600; color: #64748b;">全局剪枝命中率</span>
          <span style="font-size: 12px; font-weight: 800; color: #d97706; font-family: 'JetBrains Mono', monospace;">${hitRate}% (${hitCount}/${total})</span>
        </div>
      </div>

      ${cachedVal !== undefined ? `
        <div style="
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span style="font-size: 11px; font-weight: 600; color: #166534;">读取已缓存结果:</span>
          <span style="font-size: 14px; font-weight: 800; color: #15803d; font-family: 'JetBrains Mono', monospace;">${cachedVal}</span>
        </div>
      ` : ''}

      <!-- 决策推导详情 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 9px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="font-size: 11px; font-weight: 700; color: #0284c7;">💡 决策推导与剪枝分析</div>
        <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.4;">${decision}</div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-top: 2px;">${message}</div>
      </div>
    </div>
  `;
}

/**
 * 阶段 2: 备忘录 2D 表格矩阵 (Card 2)
 */
export function renderMemoGridCard(
  container: HTMLElement,
  title: string,
  grid: number[][],
  activeI: number,
  activeJ: number,
  rowLabels?: string[],
  colLabels?: string[]
): void {
  if (!container) return;
  if (!grid || grid.length === 0) {
    container.innerHTML = `<div style="padding: 16px; color: #94a3b8; font-size: 11.5px; text-align: center;">备忘录尚未初始化</div>`;
    return;
  }

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const headerCells = Array.from({ length: cols }, (_, c) => {
    const isCurCol = c === activeJ;
    const txt = colLabels && colLabels[c] !== undefined ? colLabels[c] : `${c}`;
    return `
      <th style="
        padding: 4px 6px;
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: ${isCurCol ? '800' : '600'};
        color: ${isCurCol ? '#1d4ed8' : '#64748b'};
        background: ${isCurCol ? '#dbeafe' : '#f8fafc'};
        border-bottom: 1px solid #cbd5e1;
        border-right: 1px solid #e2e8f0;
        text-align: center;
        white-space: nowrap;
      ">${txt}</th>
    `;
  }).join('');

  const rowHtml = grid.map((row, r) => {
    const isCurRow = r === activeI;
    const rLabel = rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `${r}`;

    const cellTds = row.map((val, c) => {
      const isActive = r === activeI && c === activeJ;
      const hasValue = val !== -1 && val !== undefined && val !== null;
      let bg = '#ffffff';
      let textCol = '#cbd5e1';
      let border = '1px solid #e2e8f0';

      if (isActive) {
        bg = '#dbeafe';
        textCol = '#1e40af';
        border = '2px solid #3b82f6';
      } else if (hasValue) {
        bg = '#ecfdf5';
        textCol = '#047857';
        border = '1px solid #a7f3d0';
      }

      return `
        <td style="
          padding: 4px 8px;
          text-align: center;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          background: ${bg};
          color: ${textCol};
          border: ${border};
          font-weight: ${isActive || hasValue ? '800' : '400'};
        ">${hasValue ? val : '—'}</td>
      `;
    }).join('');

    return `
      <tr>
        <th style="
          padding: 4px 8px;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: ${isCurRow ? '#1d4ed8' : '#64748b'};
          background: ${isCurRow ? '#dbeafe' : '#f8fafc'};
          border-right: 1px solid #cbd5e1;
          border-bottom: 1px solid #e2e8f0;
          font-weight: ${isCurRow ? '800' : '600'};
          text-align: center;
        ">${rLabel}</th>
        ${cellTds}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 4px 2px;
      box-sizing: border-box;
      overflow: hidden;
    ">
      <div style="overflow: auto; flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <table style="border-collapse: collapse; width: 100%; min-width: 220px;">
          <thead>
            <tr>
              <th style="padding: 4px 6px; font-size: 10px; color: #64748b; background: #f1f5f9; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; font-weight: 700;">[n] \\ [m]</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${rowHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 阶段 3: 严格二维表推导决策台 (Card 1)
 */
export function renderDp2DCard1(
  container: HTMLElement,
  currentCell: string,
  currentVal: any,
  depCells: DpCellDep[],
  decision: string,
  message: string,
  treeRoot?: any,
  activeNodeId?: string
): void {
  if (!container) return;

  if (treeRoot) {
    let treeBox = container.querySelector('#dp2d-tree-viewport') as HTMLElement | null;
    let cellText = container.querySelector('#dp2d-current-cell') as HTMLElement | null;
    let decText = container.querySelector('#dp2d-decision-text') as HTMLElement | null;
    let msgText = container.querySelector('#dp2d-message-text') as HTMLElement | null;

    if (!treeBox) {
      container.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 6px;
          box-sizing: border-box;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <!-- 头部：当前递推槽位与状态 -->
          <div style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 6px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            flex-shrink: 0;
          ">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">当前填表槽位:</span>
              <span id="dp2d-current-cell" style="font-size: 13px; font-weight: 800; color: #059669; font-family: 'JetBrains Mono', monospace;">${currentCell} = ${currentVal}</span>
            </div>
            <div id="dp2d-decision-text" style="font-size: 11px; font-weight: 700; color: #0284c7;">${decision}</div>
          </div>

          <!-- 状态转移推导解读 (紧凑) -->
          <div style="
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 11px;
            color: #475569;
            line-height: 1.4;
            flex-shrink: 0;
          ">
            📐 <b>转移推导：</b><span id="dp2d-message-text">${message}</span>
          </div>

          <!-- 状态转移依赖树容器 -->
          <div id="dp2d-tree-viewport" style="
            flex: 1;
            min-height: 160px;
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            position: relative;
            overflow: hidden;
          "></div>
        </div>
      `;
      treeBox = container.querySelector('#dp2d-tree-viewport') as HTMLElement | null;
    } else {
      if (cellText) cellText.textContent = `${currentCell} = ${currentVal}`;
      if (decText) decText.textContent = decision;
      if (msgText) msgText.textContent = message;
    }

    if (treeBox) {
      RecursionTreeAdapter.renderRecursionTree(treeBox, treeRoot, activeNodeId || treeRoot.id, true);
    }
    return;
  }

  const depsHtml = depCells.length > 0
    ? depCells.map((d) => `
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 10px;
          border-radius: 6px;
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #6d28d9;
        ">
          <span style="font-weight: 600;">${d.label || '前驱单元格'}:</span>
          <span style="font-weight: 800;">[${d.r}][${d.c}]</span>
        </div>
      `).join('')
    : `<div style="font-size: 11px; color: #64748b; font-style: italic;">无外部依赖（边界基础初始状态）</div>`;

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <!-- 当前递推位置 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <span style="font-size: 11px; font-weight: 600; color: #64748b;">当前递推格位:</span>
        <span style="font-size: 13px; font-weight: 800; color: #059669; font-family: 'JetBrains Mono', monospace;">${currentCell} = ${currentVal}</span>
      </div>

      <!-- 前驱依赖项 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="font-size: 11px; font-weight: 700; color: #7c3aed;">🔗 前驱依赖格位 (Dependencies):</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${depsHtml}
        </div>
      </div>

      <!-- 状态方程与推导说明 -->
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="font-size: 11px; font-weight: 700; color: #2563eb;">📐 状态转移推导:</div>
        <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.4;">${decision}</div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-top: 2px;">${message}</div>
      </div>
    </div>
  `;
}

/**
 * 阶段 3: 严格二维 DP 状态表 (Card 2)
 */
export function renderDp2DCard2(
  container: HTMLElement,
  title: string,
  dpTable: number[][],
  activeI: number,
  activeJ: number,
  deps: Array<{ r: number; c: number }>,
  rowLabels?: string[],
  colLabels?: string[]
): void {
  if (!container) return;
  if (!dpTable || dpTable.length === 0) {
    container.innerHTML = `<div style="padding: 16px; color: #94a3b8; font-size: 11.5px; text-align: center;">DP 表尚未初始化</div>`;
    return;
  }

  const rows = dpTable.length;
  const cols = dpTable[0]?.length || 0;

  const headerCells = Array.from({ length: cols }, (_, c) => {
    const isCurCol = c === activeJ;
    const txt = colLabels && colLabels[c] !== undefined ? colLabels[c] : `${c}`;
    return `
      <th style="
        padding: 4px 6px;
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: ${isCurCol ? '800' : '600'};
        color: ${isCurCol ? '#065f46' : '#64748b'};
        background: ${isCurCol ? '#d1fae5' : '#f8fafc'};
        border-bottom: 1px solid #cbd5e1;
        border-right: 1px solid #e2e8f0;
        text-align: center;
      ">${txt}</th>
    `;
  }).join('');

  const rowHtml = dpTable.map((row, r) => {
    const isCurRow = r === activeI;
    const rLabel = rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `${r}`;

    const cellTds = row.map((val, c) => {
      const isActive = r === activeI && c === activeJ;
      const isDep = deps && deps.some((d) => d.r === r && d.c === c);
      const isCalculated = (r < activeI) || (r === activeI && c <= activeJ);

      let bg = '#ffffff';
      let textCol = '#94a3b8';
      let border = '1px solid #e2e8f0';

      if (isActive) {
        bg = '#d1fae5';
        textCol = '#065f46';
        border = '2px solid #10b981';
      } else if (isDep) {
        bg = '#ede9fe';
        textCol = '#6d28d9';
        border = '1.5px dashed #8b5cf6';
      } else if (isCalculated) {
        bg = '#f8fafc';
        textCol = '#1e293b';
      }

      return `
        <td style="
          padding: 4px 8px;
          text-align: center;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          background: ${bg};
          color: ${textCol};
          border: ${border};
          font-weight: ${isActive || isDep ? '800' : isCalculated ? '600' : '400'};
        ">${val !== undefined && val !== null ? val : '—'}</td>
      `;
    }).join('');

    return `
      <tr>
        <th style="
          padding: 4px 8px;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: ${isCurRow ? '#065f46' : '#64748b'};
          background: ${isCurRow ? '#d1fae5' : '#f8fafc'};
          border-right: 1px solid #cbd5e1;
          border-bottom: 1px solid #e2e8f0;
          font-weight: ${isCurRow ? '800' : '600'};
          text-align: center;
        ">${rLabel}</th>
        ${cellTds}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 4px 2px;
      box-sizing: border-box;
      overflow: hidden;
    ">
      <div style="overflow: auto; flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <table style="border-collapse: collapse; width: 100%; min-width: 220px;">
          <thead>
            <tr>
              <th style="padding: 4px 6px; font-size: 10px; color: #64748b; background: #f1f5f9; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; font-weight: 700;">行 \\ 列</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${rowHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 阶段 4: 空间压缩一维向量与暂存器监视器 (Card 2)
 */
export function renderSpaceOptCard2(
  container: HTMLElement,
  title: string,
  dp: number[],
  curJ: number,
  backupName?: string,
  backupVal?: any,
  colLabels?: string[]
): void {
  if (!container) return;

  const cellsHtml = dp.map((v, idx) => {
    const isCur = idx === curJ;
    const label = colLabels && colLabels[idx] !== undefined ? colLabels[idx] : `${idx}`;
    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 44px;
      ">
        <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 600; color: ${isCur ? '#2563eb' : '#64748b'};">${label}</span>
        <div style="
          width: 100%;
          padding: 6px 4px;
          border-radius: 6px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 800;
          background: ${isCur ? '#dbeafe' : '#f8fafc'};
          color: ${isCur ? '#1d4ed8' : '#0f172a'};
          border: 1px solid ${isCur ? '#3b82f6' : '#cbd5e1'};
          box-shadow: ${isCur ? '0 1px 3px rgba(59, 130, 246, 0.25)' : 'none'};
        ">${v}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; font-weight: 700; color: #0f172a;">📊 一维滚动状态数组</span>
        <span style="font-size: 10.5px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1.5px 8px; border-radius: 12px; font-family: 'JetBrains Mono', monospace;">长度: ${dp.length}</span>
      </div>

      ${backupName && backupVal !== undefined ? `
        <div style="
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span style="font-size: 11px; font-weight: 700; color: #92400e;">📌 对角线寄存器 ${backupName}:</span>
          <span style="font-size: 13px; font-weight: 800; color: #b45309; font-family: 'JetBrains Mono', monospace;">${backupVal}</span>
        </div>
      ` : ''}

      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        ${cellsHtml}
      </div>
    </div>
  `;
}
