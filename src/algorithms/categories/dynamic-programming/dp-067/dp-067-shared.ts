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
import { GridVisualAdapter, type GridRenderOptions } from '../../../../core/renderers/grid-visual-adapter';
import { ThreeGridVisualAdapter } from '../../../../core/renderers/three-grid-visual-adapter';
import { ThreeViewControlsAdapter } from '../../../../core/renderers/three-view-controls-adapter';
import type { UniversalStep } from '../../../../core/universal-stage-engine';
import type { StepVar } from '../../../../core/interfaces';

export interface DpCellDep {
  r: number;
  c: number;
  label?: string;
  color?: string;
}

export function makeLcsStage1Vars(params: {
  i: number;
  j: number;
  s1: string;
  s2: string;
  ans?: number;
  isBase?: boolean;
  isMatch?: boolean;
}): StepVar[] {
  const { i, j, s1, s2, ans, isBase, isMatch } = params;
  const list: StepVar[] = [
    { name: 'i', value: String(i), type: 'number' },
    { name: 'j', value: String(j), type: 'number' },
  ];
  if (i >= 0 && i < s1.length) {
    list.push({ name: 's1[i]', value: `"${s1[i]}"`, type: 'string' });
  }
  if (j >= 0 && j < s2.length) {
    list.push({ name: 's2[j]', value: `"${s2[j]}"`, type: 'string' });
  }
  if (isMatch !== undefined) {
    list.push({ name: 'match', value: String(isMatch), type: 'boolean' });
  }
  if (isBase !== undefined) {
    list.push({ name: 'isBase', value: String(isBase), type: 'boolean' });
  }
  if (ans !== undefined) {
    list.push({ name: 'ans', value: String(ans), type: 'number' });
  }
  return list;
}

export function makeLcsStage2Vars(params: {
  i: number;
  j: number;
  s1: string;
  s2: string;
  memoVal?: number;
  hit?: boolean;
  ans?: number;
}): StepVar[] {
  const { i, j, s1, s2, memoVal, hit, ans } = params;
  const list: StepVar[] = [
    { name: 'i', value: String(i), type: 'number' },
    { name: 'j', value: String(j), type: 'number' },
  ];
  if (i >= 0 && i < s1.length) {
    list.push({ name: 's1[i]', value: `"${s1[i]}"`, type: 'string' });
  }
  if (j >= 0 && j < s2.length) {
    list.push({ name: 's2[j]', value: `"${s2[j]}"`, type: 'string' });
  }
  if (memoVal !== undefined) {
    list.push({ name: 'memo[i][j]', value: String(memoVal), type: 'number' });
  }
  if (hit !== undefined) {
    list.push({ name: 'hit', value: String(hit), type: 'boolean' });
  }
  if (ans !== undefined) {
    list.push({ name: 'ans', value: String(ans), type: 'number' });
  }
  return list;
}

export function makeLcsStage3Vars(params: {
  i: number;
  j: number;
  s1: string;
  s2: string;
  val?: number;
  isMatch?: boolean;
  left?: number;
  up?: number;
  diag?: number;
}): StepVar[] {
  const { i, j, s1, s2, val, isMatch, left, up, diag } = params;
  const list: StepVar[] = [
    { name: 'i', value: String(i), type: 'number' },
    { name: 'j', value: String(j), type: 'number' },
  ];
  if (i > 0 && i <= s1.length) {
    list.push({ name: 's1[i-1]', value: `"${s1[i - 1]}"`, type: 'string' });
  }
  if (j > 0 && j <= s2.length) {
    list.push({ name: 's2[j-1]', value: `"${s2[j - 1]}"`, type: 'string' });
  }
  if (isMatch !== undefined) {
    list.push({ name: 'match', value: String(isMatch), type: 'boolean' });
  }
  if (diag !== undefined) {
    list.push({ name: 'dp[i-1][j-1]', value: String(diag), type: 'number' });
  }
  if (up !== undefined) {
    list.push({ name: 'dp[i-1][j]', value: String(up), type: 'number' });
  }
  if (left !== undefined) {
    list.push({ name: 'dp[i][j-1]', value: String(left), type: 'number' });
  }
  if (val !== undefined) {
    list.push({ name: 'dp[i][j]', value: String(val), type: 'number' });
  }
  return list;
}

export function makeLcsStage4Vars(params: {
  i: number;
  j: number;
  s1: string;
  s2: string;
  dpVal?: number;
  leftUp?: number;
  backup?: number;
  isMatch?: boolean;
}): StepVar[] {
  const { i, j, s1, s2, dpVal, leftUp, backup, isMatch } = params;
  const list: StepVar[] = [
    { name: 'i', value: String(i), type: 'number' },
    { name: 'j', value: String(j), type: 'number' },
  ];
  if (i > 0 && i <= s1.length) {
    list.push({ name: 's1[i-1]', value: `"${s1[i - 1]}"`, type: 'string' });
  }
  if (j > 0 && j <= s2.length) {
    list.push({ name: 's2[j-1]', value: `"${s2[j - 1]}"`, type: 'string' });
  }
  if (leftUp !== undefined) {
    list.push({ name: 'leftUp', value: String(leftUp), type: 'number' });
  }
  if (backup !== undefined) {
    list.push({ name: 'backup', value: String(backup), type: 'number' });
  }
  if (isMatch !== undefined) {
    list.push({ name: 'match', value: String(isMatch), type: 'boolean' });
  }
  if (dpVal !== undefined) {
    list.push({ name: 'dp[j]', value: String(dpVal), type: 'number' });
  }
  return list;
}

let lcs3DModeActive = false;

export function setLcs3DMode(enabled: boolean): void {
  lcs3DModeActive = enabled;
}

export function isLcs3DMode(): boolean {
  return lcs3DModeActive;
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
 * LCS 通用 2D/3D 双模沙盘容器调度器
 * 100% 委托系统级公共组件 ThreeViewControlsAdapter 与 ThreeGridVisualAdapter
 */
function renderLcsDualSandboxContainer(
  container: HTMLElement,
  stepData: UniversalStep,
  renderOpts: GridRenderOptions,
  is3DExplicit: boolean | undefined,
  render2DContent: (wrapper: HTMLElement) => void
): void {
  if (!container) return;

  const is3D = is3DExplicit !== undefined ? is3DExplicit : lcs3DModeActive;
  lcs3DModeActive = is3D;

  // 1. 检查或构建外层双模容器结构
  let outer = container.querySelector('.lcs-sandbox-outer') as HTMLElement | null;
  let threeContainer = container.querySelector('#lcs-three-canvas-container') as HTMLElement | null;
  let board2DWrapper = container.querySelector('#lcs-2d-board-wrapper') as HTMLElement | null;

  if (!outer || !threeContainer || !board2DWrapper) {
    container.innerHTML = `
      <div class="lcs-sandbox-outer relative w-full h-full flex flex-col items-center justify-start overflow-hidden select-none" style="position: relative; width: 100%; height: 100%; min-height: 240px;">
        <!-- 3D Three.js WebGL 画布容器 (左上角挂载公共半透明悬浮控制栏) -->
        <div id="lcs-three-canvas-container" class="absolute inset-0 w-full h-full ${is3D ? '' : 'hidden'} z-10" style="position: absolute; inset: 0; width: 100%; height: 100%;">
          ${ThreeViewControlsAdapter.renderFloatingBarHtml(true)}
        </div>

        <!-- 2D 经典平面沙盘容器 -->
        <div id="lcs-2d-board-wrapper" class="w-full h-full flex flex-col items-center justify-center p-2 overflow-auto ${is3D ? 'hidden' : ''}" style="width: 100%; height: 100%;"></div>
      </div>
    `;

    outer = container.querySelector('.lcs-sandbox-outer') as HTMLElement;
    threeContainer = container.querySelector('#lcs-three-canvas-container') as HTMLElement;
    board2DWrapper = container.querySelector('#lcs-2d-board-wrapper') as HTMLElement;

    // 绑定复位视角事件 (委托系统公共适配器)
    if (threeContainer) {
      ThreeViewControlsAdapter.bindResetCamera(threeContainer);
    }
  }

  // 2. 状态分发与实时同步
  if (is3D) {
    threeContainer?.classList.remove('hidden');
    board2DWrapper?.classList.add('hidden');
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const adapter = ThreeGridVisualAdapter.getInstance();
        adapter.mount(threeContainer!);
        adapter.updateStep(stepData, renderOpts);
      } catch (err) {
        console.warn('[LCS 3D] WebGL 更新异常:', err);
      }
    }
  } else {
    threeContainer?.classList.add('hidden');
    board2DWrapper?.classList.remove('hidden');
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        ThreeGridVisualAdapter.getInstance().dispose();
      } catch {}
    }
    if (board2DWrapper) {
      render2DContent(board2DWrapper);
    }
  }
}

/**
 * 阶段 2: 备忘录 2D/3D 双模虚拟地图沙盘 (Card 1)
 * 接入 ThreeGridVisualAdapter WebGL 立体沙盘与 2D 立体浮岛卡片网格
 */
export function renderMemoGridCard(
  container: HTMLElement,
  title: string,
  grid: number[][],
  activeI: number,
  activeJ: number,
  rowLabels?: string[],
  colLabels?: string[],
  is3DExplicit?: boolean
): void {
  if (!container) return;
  if (!grid || grid.length === 0) {
    container.innerHTML = `<div style="padding: 16px; color: #94a3b8; font-size: 11.5px; text-align: center;">备忘录尚未初始化</div>`;
    return;
  }

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const stepData: UniversalStep = {
    i: activeI,
    j: activeJ,
    grid: grid.map((row) => row.map((v) => (v === -1 ? null : v))),
    type: '记忆化计算',
    msg: `memo[${activeI}][${activeJ}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'longest-common-subsequence',
  };

  renderLcsDualSandboxContainer(container, stepData, renderOpts, is3DExplicit, (wrapper) => {
    const isFinish = (activeI === 0 && activeJ === 0) || (activeI === rows - 1 && activeJ === cols - 1);
    const cellPx = Math.min(48, Math.max(34, Math.floor(250 / Math.max(rows, cols))));

    // 1. 顶部列标尺 (s2 字符列轴)
    const headerColsHtml = Array.from({ length: cols }, (_, c) => {
      const isCurCol = c === activeJ;
      const txt = colLabels && colLabels[c] !== undefined ? colLabels[c] : `${c}`;
      return `
        <div style="
          width: ${cellPx}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1px 0;
          font-family: 'JetBrains Mono', monospace;
          font-weight: ${isCurCol ? '800' : '600'};
          color: ${isCurCol ? '#1d4ed8' : '#64748b'};
          background: ${isCurCol ? '#dbeafe' : 'transparent'};
          border-radius: 6px;
          transition: all 0.15s ease;
        ">
          <span style="font-size: 11px; font-weight: 800;">${txt}</span>
          <span style="font-size: 8px; opacity: 0.65;">col${c}</span>
        </div>
      `;
    }).join('');

    // 2. 网格行与立体浮岛单元格
    const rowsHtml = grid.map((row, r) => {
      const isCurRow = r === activeI;
      const rLabel = rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `${r}`;

      const cellsHtml = row.map((val, c) => {
        const isActive = r === activeI && c === activeJ;
        const hasValue = val !== -1 && val !== undefined && val !== null;

        let style = `
          width: ${cellPx}px;
          height: ${cellPx}px;
          border-radius: 8px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        `;

        if (isActive) {
          style += `
            background: #dbeafe;
            border: 2px solid #2563eb;
            color: #1e40af;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25), 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            transform: scale(1.06);
            z-index: 20;
          `;
        } else if (hasValue) {
          style += `
            background: #ecfdf5;
            border: 1.5px solid #a7f3d0;
            color: #047857;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          `;
        } else {
          style += `
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #94a3b8;
          `;
        }

        const adventurerHtml = isActive
          ? `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              ${GridVisualAdapter.getAdventurerSvgHtml({ state: isFinish ? 'cheering' : 'walking', isFinish })}
            </div>
          `
          : '';

        return `
          <div class="viz-cell ${isActive ? 'is-cur' : ''}" style="${style}">
            ${adventurerHtml}
            <span style="
              position: absolute;
              top: 2px;
              left: 3px;
              font-size: 8px;
              font-weight: 700;
              font-family: 'JetBrains Mono', monospace;
              color: ${isActive ? '#2563eb' : '#94a3b8'};
              line-height: 1;
            ">${r},${c}</span>
            <span style="
              font-size: ${cellPx >= 44 ? '13px' : '11px'};
              font-weight: 800;
              font-family: 'JetBrains Mono', monospace;
              margin-top: 5px;
              z-index: 10;
            ">${hasValue ? val : '·'}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; align-items: center; gap: 4px;">
          <!-- 左侧行标尺 (s1 字符行轴) -->
          <div style="
            width: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 5px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: ${isCurRow ? '800' : '600'};
            color: ${isCurRow ? '#1d4ed8' : '#64748b'};
            background: ${isCurRow ? '#dbeafe' : 'transparent'};
            border-radius: 6px;
            flex-shrink: 0;
          ">
            <span style="font-size: 11px; font-weight: 800;">${rLabel}</span>
            <span style="font-size: 8px; opacity: 0.65;">r${r}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            ${cellsHtml}
          </div>
        </div>
      `;
    }).join('');

    wrapper.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 4px;
        box-sizing: border-box;
        overflow: auto;
        user-select: none;
      ">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px 12px; background: rgba(248, 250, 252, 0.75); border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <!-- 顶部列标尺对齐行 -->
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <div style="width: 44px; flex-shrink: 0; text-align: center; font-size: 9px; font-weight: 700; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">s1 \\ s2</div>
            <div style="display: flex; gap: 4px;">
              ${headerColsHtml}
            </div>
          </div>

          <!-- 网格主体行 -->
          ${rowsHtml}
        </div>

        <!-- 底部微胶囊状态提示 -->
        <div style="
          margin-top: 8px;
          padding: 3px 12px;
          border-radius: 999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          <span>🧭 探险家正位于 <b>[${activeI}, ${activeJ}]</b> 处考察备忘录状态</span>
        </div>
      </div>
    `;
  });
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
 * 阶段 3: 严格二维 DP 状态表虚拟地图沙盘 (Card 1)
 * 接入 ThreeGridVisualAdapter WebGL 立体沙盘与 2D 立体浮岛卡片网格
 */
export function renderDp2DCard2(
  container: HTMLElement,
  title: string,
  dpTable: number[][],
  activeI: number,
  activeJ: number,
  deps: Array<{ r: number; c: number }>,
  rowLabels?: string[],
  colLabels?: string[],
  is3DExplicit?: boolean
): void {
  if (!container) return;
  if (!dpTable || dpTable.length === 0) {
    container.innerHTML = `<div style="padding: 16px; color: #94a3b8; font-size: 11.5px; text-align: center;">DP 表尚未初始化</div>`;
    return;
  }

  const rows = dpTable.length;
  const cols = dpTable[0]?.length || 0;

  const topDep = deps?.find((d) => (d.r === activeI - 1 && d.c === activeJ) || (d.r === activeI + 1 && d.c === activeJ));
  const leftDep = deps?.find((d) => (d.r === activeI && d.c === activeJ - 1) || (d.r === activeI && d.c === activeJ + 1));
  const diagDep = deps?.find((d) => Math.abs(d.r - activeI) === 1 && Math.abs(d.c - activeJ) === 1);

  const stepData: UniversalStep = {
    i: activeI,
    j: activeJ,
    grid: dpTable,
    topI: topDep?.r ?? (diagDep?.r ?? -1),
    topJ: topDep?.c ?? (diagDep?.c ?? -1),
    leftI: leftDep?.r ?? -1,
    leftJ: leftDep?.c ?? -1,
    type: '二维DP推导',
    msg: `dp[${activeI}][${activeJ}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'longest-common-subsequence',
  };

  renderLcsDualSandboxContainer(container, stepData, renderOpts, is3DExplicit, (wrapper) => {
    const isFinish = (activeI === rows - 1 && activeJ === cols - 1) || (activeI === 0 && activeJ === 0);
    const cellPx = Math.min(48, Math.max(34, Math.floor(250 / Math.max(rows, cols))));

    // 1. 顶部列标尺 (s2 字符列轴)
    const headerColsHtml = Array.from({ length: cols }, (_, c) => {
      const isCurCol = c === activeJ;
      const txt = colLabels && colLabels[c] !== undefined ? colLabels[c] : `${c}`;
      return `
        <div style="
          width: ${cellPx}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1px 0;
          font-family: 'JetBrains Mono', monospace;
          font-weight: ${isCurCol ? '800' : '600'};
          color: ${isCurCol ? '#065f46' : '#64748b'};
          background: ${isCurCol ? '#d1fae5' : 'transparent'};
          border-radius: 6px;
          transition: all 0.15s ease;
        ">
          <span style="font-size: 11px; font-weight: 800;">${txt}</span>
          <span style="font-size: 8px; opacity: 0.65;">col${c}</span>
        </div>
      `;
    }).join('');

    // 2. 网格行与立体浮岛单元格
    const rowsHtml = dpTable.map((row, r) => {
      const isCurRow = r === activeI;
      const rLabel = rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `${r}`;

      const cellsHtml = row.map((val, c) => {
        const isActive = r === activeI && c === activeJ;
        const isDep = deps && deps.some((d) => d.r === r && d.c === c);
        const isCalculated = (r < activeI) || (r === activeI && c <= activeJ);

        // 判断前驱依赖方向标签
        let depBadge = '';
        if (isDep) {
          if (r === activeI - 1 && c === activeJ - 1) {
            depBadge = '↖️+1';
          } else if (r === activeI + 1 && c === activeJ + 1) {
            depBadge = '↘️+1';
          } else if (r === activeI - 1 && c === activeJ) {
            depBadge = '⬆️';
          } else if (r === activeI + 1 && c === activeJ) {
            depBadge = '⬇️';
          } else if (r === activeI && c === activeJ - 1) {
            depBadge = '⬅️';
          } else if (r === activeI && c === activeJ + 1) {
            depBadge = '➡️';
          } else {
            depBadge = '🔗';
          }
        }

        let style = `
          width: ${cellPx}px;
          height: ${cellPx}px;
          border-radius: 8px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        `;

        if (isActive) {
          style += `
            background: #d1fae5;
            border: 2px solid #10b981;
            color: #065f46;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25), 0 4px 6px -1px rgba(16, 185, 129, 0.2);
            transform: scale(1.06);
            z-index: 20;
          `;
        } else if (isDep) {
          style += `
            background: #ede9fe;
            border: 1.5px dashed #8b5cf6;
            color: #6d28d9;
            box-shadow: 0 1px 3px rgba(139, 92, 246, 0.15);
            z-index: 10;
          `;
        } else if (isCalculated) {
          style += `
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            color: #1e293b;
          `;
        } else {
          style += `
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #94a3b8;
          `;
        }

        const adventurerHtml = isActive
          ? `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              ${GridVisualAdapter.getAdventurerSvgHtml({ state: isFinish ? 'cheering' : 'walking', isFinish })}
            </div>
          `
          : '';

        const depBadgeHtml = depBadge
          ? `<span style="position: absolute; top: 1px; right: 2px; font-size: 8px; font-weight: 800; color: #7c3aed; line-height: 1;">${depBadge}</span>`
          : '';

        return `
          <div class="viz-cell ${isActive ? 'is-cur' : isDep ? 'is-top' : ''}" style="${style}">
            ${adventurerHtml}
            ${depBadgeHtml}
            <span style="
              position: absolute;
              top: 2px;
              left: 3px;
              font-size: 8px;
              font-weight: 700;
              font-family: 'JetBrains Mono', monospace;
              color: ${isActive ? '#059669' : isDep ? '#7c3aed' : '#94a3b8'};
              line-height: 1;
            ">${r},${c}</span>
            <span style="
              font-size: ${cellPx >= 44 ? '13px' : '11px'};
              font-weight: 800;
              font-family: 'JetBrains Mono', monospace;
              margin-top: 5px;
              z-index: 10;
            ">${val !== undefined && val !== null ? val : '·'}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; align-items: center; gap: 4px;">
          <!-- 左侧行标尺 (s1 字符行轴) -->
          <div style="
            width: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 5px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: ${isCurRow ? '800' : '600'};
            color: ${isCurRow ? '#065f46' : '#64748b'};
            background: ${isCurRow ? '#d1fae5' : 'transparent'};
            border-radius: 6px;
            flex-shrink: 0;
          ">
            <span style="font-size: 11px; font-weight: 800;">${rLabel}</span>
            <span style="font-size: 8px; opacity: 0.65;">r${r}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            ${cellsHtml}
          </div>
        </div>
      `;
    }).join('');

    wrapper.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 4px;
        box-sizing: border-box;
        overflow: auto;
        user-select: none;
      ">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px 12px; background: rgba(248, 250, 252, 0.75); border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <!-- 顶部列标尺对齐行 -->
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <div style="width: 44px; flex-shrink: 0; text-align: center; font-size: 9px; font-weight: 700; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">s1 \\ s2</div>
            <div style="display: flex; gap: 4px;">
              ${headerColsHtml}
            </div>
          </div>

          <!-- 网格主体行 -->
          ${rowsHtml}
        </div>

        <!-- 底部微胶囊状态提示 -->
        <div style="
          margin-top: 8px;
          padding: 3px 12px;
          border-radius: 999px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          <span>✨ 探险家正位于 <b>[${activeI}, ${activeJ}]</b> 处填表，综合前驱状态推导最优解</span>
        </div>
      </div>
    `;
  });
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

/**
 * 阶段 1: 暴力递归状态空间探索沙盘 (Card 1)
 * 探险家根据当前探索的 (i, j) 坐标在网格中动态移动，呈现搜索轨迹
 */
export function renderStage1GridCard(
  container: HTMLElement,
  title: string,
  rows: number,
  cols: number,
  activeI: number,
  activeJ: number,
  rowLabels?: string[],
  colLabels?: string[],
  is3DExplicit?: boolean
): void {
  if (!container) return;

  const dummyGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
  if (activeI >= 0 && activeI < rows && activeJ >= 0 && activeJ < cols) {
    dummyGrid[activeI][activeJ] = 1;
  }

  const stepData: UniversalStep = {
    i: activeI >= 0 ? activeI : 0,
    j: activeJ >= 0 ? activeJ : 0,
    grid: dummyGrid,
    type: '递归探索',
    msg: `f(${activeI}, ${activeJ})`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'longest-common-subsequence',
  };

  renderLcsDualSandboxContainer(container, stepData, renderOpts, is3DExplicit, (wrapper) => {
    const isFinish = (activeI === rows - 1 && activeJ === cols - 1) || (activeI === 0 && activeJ === 0);
    const cellPx = Math.min(48, Math.max(34, Math.floor(250 / Math.max(rows, cols))));

    // 1. 顶部列标尺 (s2 字符列轴)
    const headerColsHtml = Array.from({ length: cols }, (_, c) => {
      const isCurCol = c === activeJ;
      const txt = colLabels && colLabels[c] !== undefined ? colLabels[c] : `${c}`;
      return `
        <div style="
          width: ${cellPx}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1px 0;
          font-family: 'JetBrains Mono', monospace;
          font-weight: ${isCurCol ? '800' : '600'};
          color: ${isCurCol ? '#2563eb' : '#64748b'};
          background: ${isCurCol ? '#dbeafe' : 'transparent'};
          border-radius: 6px;
          transition: all 0.15s ease;
        ">
          <span style="font-size: 11px; font-weight: 800;">${txt}</span>
          <span style="font-size: 8px; opacity: 0.65;">col${c}</span>
        </div>
      `;
    }).join('');

    // 2. 网格主体行
    const rowsHtml = Array.from({ length: rows }, (_, r) => {
      const isCurRow = r === activeI;
      const rLabel = rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `${r}`;

      const cellsHtml = Array.from({ length: cols }, (_, c) => {
        const isActive = r === activeI && c === activeJ;
        let style = `
          width: ${cellPx}px;
          height: ${cellPx}px;
          border-radius: 8px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        if (isActive) {
          style += `
            background: #eff6ff;
            border: 2px solid #3b82f6;
            color: #1d4ed8;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 2px 8px rgba(37, 99, 235, 0.25);
            transform: scale(1.06);
            z-index: 20;
          `;
        } else {
          style += `
            background: #ffffff;
            border: 1px dashed #cbd5e1;
            color: #94a3b8;
          `;
        }

        const adventurerHtml = isActive
          ? `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              ${GridVisualAdapter.getAdventurerSvgHtml({ state: isFinish ? 'cheering' : 'walking', isFinish })}
            </div>
          `
          : '';

        return `
          <div class="viz-cell ${isActive ? 'is-cur' : ''}" style="${style}">
            ${adventurerHtml}
            <span style="
              position: absolute;
              top: 2px;
              left: 3px;
              font-size: 8px;
              font-weight: 700;
              font-family: 'JetBrains Mono', monospace;
              color: ${isActive ? '#2563eb' : '#94a3b8'};
              line-height: 1;
            ">${r},${c}</span>
            <span style="
              font-size: ${cellPx >= 44 ? '13px' : '11px'};
              font-weight: 800;
              font-family: 'JetBrains Mono', monospace;
              margin-top: 5px;
              z-index: 10;
            ">${isActive ? '👣' : '·'}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="
            width: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 5px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: ${isCurRow ? '800' : '600'};
            color: ${isCurRow ? '#2563eb' : '#64748b'};
            background: ${isCurRow ? '#dbeafe' : 'transparent'};
            border-radius: 6px;
            flex-shrink: 0;
          ">
            <span style="font-size: 11px; font-weight: 800;">${rLabel}</span>
            <span style="font-size: 8px; opacity: 0.65;">r${r}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            ${cellsHtml}
          </div>
        </div>
      `;
    }).join('');

    wrapper.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 4px;
        box-sizing: border-box;
        overflow: auto;
        user-select: none;
      ">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px 12px; background: rgba(248, 250, 252, 0.75); border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <div style="width: 44px; flex-shrink: 0; text-align: center; font-size: 9px; font-weight: 700; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">s1 \\ s2</div>
            <div style="display: flex; gap: 4px;">
              ${headerColsHtml}
            </div>
          </div>
          ${rowsHtml}
        </div>

        <div style="
          margin-top: 8px;
          padding: 3px 12px;
          border-radius: 999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          <span>🧭 递归探索指针正考察状态坐标 <b>[${activeI}, ${activeJ}]</b></span>
        </div>
      </div>
    `;
  });
}

/**
 * 阶段 4: 空间压缩切片滚动沙盘 (Card 1)
 * 当前递推行鲜亮高亮，历史已回收行半透明淡化，直观呈现 leftUp 暂存源格点
 */
export function renderStage4RollingGridCard(
  container: HTMLElement,
  title: string,
  dpGrid: number[][],
  curI: number,
  curJ: number,
  leftUpVal: number | undefined,
  rowLabels?: string[],
  colLabels?: string[],
  is3DExplicit?: boolean
): void {
  if (!container) return;
  const rows = dpGrid.length;
  const cols = dpGrid[0]?.length || 0;

  const stepData: UniversalStep = {
    i: curI,
    j: curJ,
    grid: dpGrid,
    type: '空间压缩滚动',
    msg: `dp[${curJ}], leftUp=${leftUpVal}`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'longest-common-subsequence',
  };

  renderLcsDualSandboxContainer(container, stepData, renderOpts, is3DExplicit, (wrapper) => {
    const isFinish = curI === rows - 1 && curJ === cols - 1;
    const cellPx = Math.min(48, Math.max(34, Math.floor(250 / Math.max(rows, cols))));

    // 1. 顶部列标尺
    const headerColsHtml = Array.from({ length: cols }, (_, c) => {
      const isCurCol = c === curJ;
      const txt = colLabels && colLabels[c] !== undefined ? colLabels[c] : `${c}`;
      return `
        <div style="
          width: ${cellPx}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1px 0;
          font-family: 'JetBrains Mono', monospace;
          font-weight: ${isCurCol ? '800' : '600'};
          color: ${isCurCol ? '#d97706' : '#64748b'};
          background: ${isCurCol ? '#fef3c7' : 'transparent'};
          border-radius: 6px;
        ">
          <span style="font-size: 11px; font-weight: 800;">${txt}</span>
          <span style="font-size: 8px; opacity: 0.65;">col${c}</span>
        </div>
      `;
    }).join('');

    // 2. 网格行 (历史已回收行 opacity: 0.4，当前行高亮)
    const rowsHtml = dpGrid.map((row, r) => {
      const isCurRow = r === curI;
      const isHistorical = r < curI;
      const rLabel = rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `${r}`;

      const cellsHtml = row.map((val, c) => {
        const isActive = r === curI && c === curJ;
        const isLeftUpSource = r === curI - 1 && c === curJ - 1;
        const hasValue = val !== undefined && val !== null;

        let style = `
          width: ${cellPx}px;
          height: ${cellPx}px;
          border-radius: 8px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s ease;
        `;

        if (isActive) {
          style += `
            background: #fffbeb;
            border: 2px solid #f59e0b;
            color: #b45309;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25), 0 2px 8px rgba(217, 119, 6, 0.25);
            transform: scale(1.06);
            z-index: 20;
          `;
        } else if (isLeftUpSource) {
          style += `
            background: #ede9fe;
            border: 1.5px dashed #8b5cf6;
            color: #6d28d9;
            box-shadow: 0 1px 3px rgba(139, 92, 246, 0.15);
            z-index: 15;
          `;
        } else if (isCurRow) {
          style += `
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            color: #1e293b;
          `;
        } else if (isHistorical) {
          style += `
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            color: #94a3b8;
            opacity: 0.45;
          `;
        } else {
          style += `
            background: #fafafa;
            border: 1px dashed #e2e8f0;
            color: #cbd5e1;
          `;
        }

        const adventurerHtml = isActive
          ? `
            <div class="adventurer-char-holder absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30">
              ${GridVisualAdapter.getAdventurerSvgHtml({ state: isFinish ? 'cheering' : 'walking', isFinish })}
            </div>
          `
          : '';

        const badgeHtml = isLeftUpSource
          ? `<span style="position: absolute; top: 1px; right: 2px; font-size: 7.5px; font-weight: 800; color: #7c3aed; line-height: 1;">leftUp</span>`
          : '';

        return `
          <div class="viz-cell ${isActive ? 'is-cur' : ''}" style="${style}">
            ${adventurerHtml}
            ${badgeHtml}
            <span style="
              position: absolute;
              top: 2px;
              left: 3px;
              font-size: 8px;
              font-weight: 700;
              font-family: 'JetBrains Mono', monospace;
              color: ${isActive ? '#b45309' : isLeftUpSource ? '#7c3aed' : '#94a3b8'};
              line-height: 1;
            ">${r},${c}</span>
            <span style="
              font-size: ${cellPx >= 44 ? '13px' : '11px'};
              font-weight: 800;
              font-family: 'JetBrains Mono', monospace;
              margin-top: 5px;
              z-index: 10;
            ">${hasValue ? val : '·'}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="
            width: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 5px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: ${isCurRow ? '800' : '600'};
            color: ${isCurRow ? '#b45309' : '#64748b'};
            background: ${isCurRow ? '#fef3c7' : 'transparent'};
            border-radius: 6px;
            flex-shrink: 0;
            ${isHistorical ? 'opacity: 0.5;' : ''}
          ">
            <span style="font-size: 11px; font-weight: 800;">${rLabel}</span>
            <span style="font-size: 8px; opacity: 0.65;">${isCurRow ? '⚡' : isHistorical ? '回收' : `r${r}`}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            ${cellsHtml}
          </div>
        </div>
      `;
    }).join('');

    wrapper.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 4px;
        box-sizing: border-box;
        overflow: auto;
        user-select: none;
      ">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px 12px; background: rgba(248, 250, 252, 0.75); border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <div style="width: 44px; flex-shrink: 0; text-align: center; font-size: 9px; font-weight: 700; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">s1 \\ s2</div>
            <div style="display: flex; gap: 4px;">
              ${headerColsHtml}
            </div>
          </div>
          ${rowsHtml}
        </div>

        <div style="
          margin-top: 8px;
          padding: 3px 12px;
          border-radius: 999px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span>⚡ 当前滚动推导行: <b>row ${curI}</b> (历史行已内存回收) | 📌 <b>leftUp</b> 暂存左上角: <b>${leftUpVal ?? '0'}</b></span>
        </div>
      </div>
    `;
  });
}

let lcsCard2ActiveSubView: 'tree' | 'strings' = 'tree';

/**
 * Card 2 复合视图调度器 (支持【决策展开树】与【双字符串比对卡片】一键平滑切换)
 */
export function renderLcsCard2CompoundView(
  container: HTMLElement,
  renderTree: (subContainer: HTMLElement) => void,
  renderStrings: (subContainer: HTMLElement) => void
): void {
  if (!container) return;

  let compoundRoot = container.querySelector('.lcs-card2-compound') as HTMLElement | null;
  if (!compoundRoot) {
    container.innerHTML = `
      <div class="lcs-card2-compound" style="width: 100%; height: 100%; display: flex; flex-direction: column; min-height: 0; overflow: hidden;">
        <!-- 顶部子视图 Tab 切换药丸栏 -->
        <div class="lcs-card2-tab-bar" style="display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 5px 4px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 4px; background: #f1f5f9; padding: 2px 3px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <button id="lcs-tab-tree" style="padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; outline: none;">
              🌲 决策依赖树
            </button>
            <button id="lcs-tab-strings" style="padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; outline: none;">
              🔤 双字符串比对
            </button>
          </div>
          <span style="font-size: 10px; color: #94a3b8; font-weight: 500;">
            点击切换卡片 2 视图
          </span>
        </div>

        <!-- 动态子视图内容容器 -->
        <div id="lcs-card2-subview-content" style="flex: 1; min-height: 0; width: 100%; overflow: hidden; display: flex; flex-direction: column;"></div>
      </div>
    `;
    compoundRoot = container.querySelector('.lcs-card2-compound') as HTMLElement;
  }

  const btnTree = compoundRoot.querySelector('#lcs-tab-tree') as HTMLButtonElement | null;
  const btnStrings = compoundRoot.querySelector('#lcs-tab-strings') as HTMLButtonElement | null;
  const contentWrapper = compoundRoot.querySelector('#lcs-card2-subview-content') as HTMLElement | null;

  const updateTabStyles = () => {
    const isTree = lcsCard2ActiveSubView === 'tree';
    if (btnTree) {
      btnTree.style.background = isTree ? '#ffffff' : 'transparent';
      btnTree.style.color = isTree ? '#4f46e5' : '#64748b';
      btnTree.style.boxShadow = isTree ? '0 1px 2px rgba(0,0,0,0.06)' : 'none';
      btnTree.style.border = isTree ? '1px solid #c7d2fe' : '1px solid transparent';
    }
    if (btnStrings) {
      btnStrings.style.background = !isTree ? '#ffffff' : 'transparent';
      btnStrings.style.color = !isTree ? '#4f46e5' : '#64748b';
      btnStrings.style.boxShadow = !isTree ? '0 1px 2px rgba(0,0,0,0.06)' : 'none';
      btnStrings.style.border = !isTree ? '1px solid #c7d2fe' : '1px solid transparent';
    }
  };

  if (btnTree) {
    btnTree.onclick = (e) => {
      e.stopPropagation();
      lcsCard2ActiveSubView = 'tree';
      updateTabStyles();
      if (contentWrapper) {
        contentWrapper.innerHTML = '';
        renderTree(contentWrapper);
      }
    };
  }

  if (btnStrings) {
    btnStrings.onclick = (e) => {
      e.stopPropagation();
      lcsCard2ActiveSubView = 'strings';
      updateTabStyles();
      if (contentWrapper) {
        contentWrapper.innerHTML = '';
        renderStrings(contentWrapper);
      }
    };
  }

  updateTabStyles();
  if (contentWrapper) {
    if (lcsCard2ActiveSubView === 'tree') {
      renderTree(contentWrapper);
    } else {
      renderStrings(contentWrapper);
    }
  }
}
