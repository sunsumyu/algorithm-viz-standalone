/**
 * 节点数 n 高度不大于 m 的二叉树结构数 (牛客网 / 左神 Class067 Code05)
 * Canvas Adapter: 树形结构拆解与 4-Card 表现层生命周期挂载
 */

import {
  TREE_COUNT_STAGE1_CODE_LANGUAGES,
  TREE_COUNT_STAGE2_CODE_LANGUAGES,
  TREE_COUNT_STAGE3_CODE_LANGUAGES,
  TREE_COUNT_STAGE4_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  type DpCellDep,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-shared';
import {
  buildTreeCountStage1Steps,
  buildTreeCountStage2Steps,
  buildTreeCountStage3Steps,
  buildTreeCountStage4Steps,
  type TreeCountRecStep,
  type TreeCountMemoStep,
  type TreeCount2DStep,
  type TreeCountSpaceOptStep,
} from './tree-count-height-m-step-compiler';

export function renderTreeSplitView(
  container: HTMLElement,
  curN: number,
  curM: number,
  curK?: number
): void {
  if (!container) return;
  const leftN = curK !== undefined ? curK : 'k';
  const rightN = curK !== undefined ? curN - 1 - curK : 'n-1-k';

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11.5px;
        font-weight: 700;
        color: #475569;
      ">
        <span>当前规模：节点总数 <strong style="color: #2563eb; font-size: 13px;">${curN}</strong></span>
        <span style="color: #cbd5e1;">|</span>
        <span>高度上限 <strong style="color: #d97706; font-size: 13px;">${curM}</strong></span>
      </div>

      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 18px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        width: 92%;
        max-width: 480px;
      ">
        <!-- 👑 根节点 -->
        <div style="
          padding: 6px 14px;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1.5px solid #10b981;
          color: #047857;
          font-weight: 800;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 2px rgba(16, 185, 129, 0.15);
        ">
          <span>👑 根节点</span>
          <span style="font-size: 10px; background: #ffffff; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 6px; color: #065f46;">固定占用 1 个节点</span>
        </div>

        <!-- 左右子树分支连线与乘积 -->
        <div style="display: flex; gap: 16px; align-items: center; width: 100%; justify-content: center;">
          <!-- 左子树 -->
          <div style="
            flex: 1;
            max-width: 170px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 8px 12px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(37, 99, 235, 0.08);
          ">
            <span style="font-size: 10.5px; font-weight: 800; color: #1e40af;">🌱 左子树</span>
            <span style="font-size: 14px; font-weight: 900; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${leftN} 节点</span>
            <span style="font-size: 10px; color: #64748b; font-weight: 600;">高度 ≤ ${Math.max(0, curM - 1)}</span>
          </div>

          <span style="font-size: 18px; font-weight: 900; color: #d97706;">×</span>

          <!-- 右子树 -->
          <div style="
            flex: 1;
            max-width: 170px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 8px 12px;
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(124, 58, 237, 0.08);
          ">
            <span style="font-size: 10.5px; font-weight: 800; color: #6b21a8;">🌿 右子树</span>
            <span style="font-size: 14px; font-weight: 900; color: #7c3aed; font-family: 'JetBrains Mono', monospace;">${rightN} 节点</span>
            <span style="font-size: 10px; color: #64748b; font-weight: 600;">高度 ≤ ${Math.max(0, curM - 1)}</span>
          </div>
        </div>

        <div style="
          font-size: 10.5px;
          color: #64748b;
          text-align: center;
          padding: 4px 8px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px dashed #e2e8f0;
          width: 90%;
        ">
          左右子树独立互不影响，当前划分形态总数 = <strong>f(${leftN}, ${Math.max(0, curM - 1)}) × f(${rightN}, ${Math.max(0, curM - 1)})</strong>
        </div>
      </div>
    </div>
  `;
}

export function createTreeCountStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(指数级)',
      theme: 'bg-blue',
      badge: {
        mode: '树形规模拆解 · 暴力递归',
        complexity: 'O(Catalan(N))',
      },
      legend: [
        { label: '根节点 (1)', color: '#10b981' },
        { label: '左子树 (k)', color: '#2563eb' },
        { label: '右子树 (n-1-k)', color: '#7c3aed' },
      ],
      codeLanguages: TREE_COUNT_STAGE1_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage1Steps,
      primaryVisual: {
        title: '🌲 左右子树规模拆分示图',
        desc: '固定 1 个根节点，左右分配子树节点规模递推',
        render: (container: HTMLElement, step: TreeCountRecStep) => {
          renderTreeSplitView(container, step.n, step.m, step.k);
        },
      },
      auxiliaryVisual: {
        title: '🌿 规模拆解递归调用树',
        desc: '固定 1 个根节点，左右分配子树节点规模递推',
        render: (container: HTMLElement, step: TreeCountRecStep) => {
          renderRecursionCard1(
            container,
            step.currentCall,
            step.callStack,
            `<div style="font-size:12px; font-weight:700; color:#0f172a;">${step.decision}</div>
             <div style="font-size:11px; color:#64748b; margin-top:3px;">${step.message}</div>`,
            step.treeRoot,
            step.activeNodeId
          );
        },
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M×N^2)',
      theme: 'bg-blue',
      badge: {
        mode: '树形规模拆解 · 记忆化搜索',
        complexity: 'O(M×N^2) · O(M×N) 备忘录',
      },
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中 (Miss)', color: '#ef4444' },
        { label: '已缓存单元格', color: '#34d399' },
      ],
      codeLanguages: TREE_COUNT_STAGE2_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage2Steps,
      primaryVisual: {
        title: '🎯 2D 备忘录矩阵 memo[n][m]',
        desc: '以 memo[n][m] 缓存对应规模的形态总数，消除重复搜索',
        render: (container: HTMLElement, step: TreeCountMemoStep) => {
          renderMemoGridCard(
            container,
            '结构数备忘录 memo[n][m]',
            step.memoGrid,
            step.n,
            step.m
          );
        },
      },
      auxiliaryVisual: {
        title: '💾 备忘录缓存与剪枝树',
        desc: '以 memo[n][m] 缓存对应规模的形态总数，消除重复搜索',
        render: (container: HTMLElement, step: TreeCountMemoStep) => {
          renderMemoCard1(
            container,
            step.currentCall,
            step.memoHit,
            step.hitCount,
            step.missCount,
            step.decision,
            step.message,
            step.cachedVal,
            step.treeRoot,
            step.activeNodeId
          );
        },
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格二维表',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M×N^2)',
      theme: 'bg-emerald',
      badge: {
        mode: '树形规模拆解 · 列优先严格填表',
        complexity: 'O(M×N^2) · O(M×N)',
      },
      legend: [
        { label: '当前填充格', color: '#10b981' },
        { label: '前一列依赖', color: '#8b5cf6' },
        { label: '空树基底', color: '#38bdf8' },
      ],
      codeLanguages: TREE_COUNT_STAGE3_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage3Steps,
      primaryVisual: {
        title: '📊 严格二维状态表 dp[i][j]',
        desc: '展示形态计数表 dp[节点数i][高度j]',
        render: (container: HTMLElement, step: TreeCount2DStep) => {
          renderDp2DCard2(
            container,
            '形态计数表 dp[节点数i][高度j]',
            step.dpTable,
            step.curI,
            step.curJ,
            step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c }))
          );
        },
      },
      auxiliaryVisual: {
        title: '📐 笛卡尔乘积状态依赖树',
        desc: '展示以 1 为根拆解规模、左右子树独立形态笛卡尔乘积及列依赖递推',
        render: (container: HTMLElement, step: TreeCount2DStep) => {
          renderDp2DCard1(
            container,
            step.currentCell,
            step.currentVal,
            step.depCells,
            step.decision,
            step.message,
            step.treeRoot,
            step.activeNodeId
          );
        },
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(N) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '树形规模拆解 · 双列滚动优化',
        complexity: 'O(M×N^2) · O(N) 空间',
      },
      legend: [
        { label: '当前生成列', color: '#2563eb' },
        { label: '前一列依赖', color: '#8b5cf6' },
        { label: '基础形态', color: '#10b981' },
      ],
      codeLanguages: TREE_COUNT_STAGE4_CODE_LANGUAGES,
      buildSteps: buildTreeCountStage4Steps,
      primaryVisual: {
        title: '📈 双列滚动向量 dp[i]',
        desc: '仅保留前一列形态，双列交替滚动将空间优化至 O(N)',
        render: (container: HTMLElement, step: TreeCountSpaceOptStep) => {
          renderSpaceOptCard2(
            container,
            `空间压缩向量 dp[0..${step.dp.length - 1}]`,
            step.dp,
            step.curI
          );
        },
      },
      auxiliaryVisual: {
        title: '🌲 双列滚动状态依赖树解构舱',
        desc: '展示双列依赖与当前左右子树组合形态',
        render: (container: HTMLElement, step: TreeCountSpaceOptStep) => {
          renderDp2DCard1(
            container,
            step.currentCell || `curr[${step.curI}]`,
            step.currentVal ?? step.dp[step.curI],
            step.depCells || [],
            step.decision,
            step.message,
            step.treeRoot,
            step.activeNodeId
          );
        },
      },
    },
  ];
}
