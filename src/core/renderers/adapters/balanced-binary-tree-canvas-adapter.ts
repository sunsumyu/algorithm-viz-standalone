/**
 * Balanced Binary Tree Canvas Adapter (LeetCode 110 / Class 037 Code01)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (<150 LOC)。
 * Card 1: 委托 TreeCanvasAdapter 渲染二叉树拓扑沙盘 (支持全景高亮与收尾守卫)；
 * Card 2: 扁平化【后序信息流转沙盘】：消灭俄罗斯套娃，直观呈现左右子树汇报与决策交付。
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { BalancedTree037Step, collectTreeValues } from './balanced-binary-tree-step-compiler';
import { renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { RecursionTreeAdapter } from '../recursion-tree-adapter';

/** 递归检索以特定节点值为根的局部子树 */
export function findSubtree(root: any, valOrId: number | string | null): any {
  if (!root || valOrId == null) return null;
  if (root.id === valOrId || root.val === valOrId) return root;
  const left = findSubtree(root.left, valOrId);
  if (left) return left;
  return findSubtree(root.right, valOrId);
}

export class BalancedBinaryTreeCanvasAdapter {
  /** 当前 Card 1 复合子视图模式 (路线 E 递归分层树 vs 路线 F 全景调用链合一树 vs 路线 D 分屏 vs 路线 C 递归展开树) */
  public static activeSubView: 'stack-depth' | 'unified-tree' | 'split' | 'call-tree' = 'stack-depth';

  /**
   * Card 1: 表现层画板渲染器 (Presentation Canvas Renderer)
   */
  static renderCanvas(container: HTMLElement, step: BalancedTree037Step): void {
    if (step.tree) {
      const isDone =
        step.decision.includes('完成') ||
        step.decision.includes('最终判定') ||
        step.decision.includes('完毕') ||
        step.statusBadge?.type === 'success' ||
        step.statusBadge?.type === 'danger';
      const allTreeVals = collectTreeValues(step.tree);
      let current = step.current;
      let visitedNodes = step.visitedNodes;
      const secondaryHighlightedNodes =
        step.secondaryCurrent != null ? [step.secondaryCurrent] : [];

      if (isDone) {
        if (current === null) current = step.tree.val;
        if (!visitedNodes || visitedNodes.length === 0) visitedNodes = allTreeVals;
      }

      // 路线 B 动态生命树：根据 step.heightMap 构造高度与状态胶囊徽章 (Capsule Badges)
      const labels = new Map<number | string, string>();
      if (step.heightMap) {
        for (const [k, v] of Object.entries(step.heightMap)) {
          const numK = Number(k);
          if (v === -1) {
            labels.set(numK, '🚨 -1 熔断');
          } else {
            labels.set(numK, `h=${v}`);
          }
        }
      }

      container.innerHTML = '';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.boxSizing = 'border-box';
      container.style.position = 'relative';

      // 物理数据生命树渲染闭包
      const renderLivingDataTree = (targetBox: HTMLElement, focusNode?: number | null, isCurrentFrame: boolean = true) => {
        TreeCanvasAdapter.renderTree(targetBox, {
          tree: step.tree,
          current: focusNode !== undefined ? focusNode : current,
          visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
          secondaryHighlightedNodes: !isCurrentFrame && focusNode != null ? [focusNode] : (secondaryHighlightedNodes.length > 0 ? secondaryHighlightedNodes : []),
          primaryColor: isCurrentFrame ? '#f59e0b' : '#38bdf8',
          secondaryColor: '#38bdf8',
          visitedColor: '#34d399',
          labels: labels.size > 0 ? labels : undefined,
          dimUnvisited: true,
          nullProbe: isCurrentFrame ? step.nullProbe : undefined,
        });
      };

      // 1. 顶部子视图切换胶囊栏 (仅在具备 callTree 或 treeStackFrames 时展示自由切换)
      if (step.callTree || (step.treeStackFrames && step.treeStackFrames.length > 0)) {
        const toolbar = document.createElement('div');
        toolbar.style.cssText =
          'display: flex; justify-content: flex-end; align-items: center; width: 100%; padding: 2px 6px; flex-shrink: 0; z-index: 10;';
        const curMode = BalancedBinaryTreeCanvasAdapter.activeSubView;
        const isUnified = curMode === 'unified-tree';
        const isStack = curMode === 'stack-depth';
        const isSplit = curMode === 'split';
        const isCall = curMode === 'call-tree';

        toolbar.innerHTML = `
          <div style="display: inline-flex; background: #f1f5f9; padding: 2px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 11px;">
            <button id="btn-subview-stack" style="border: none; background: ${isStack ? '#ffffff' : 'transparent'}; color: ${isStack ? '#1d4ed8' : '#64748b'}; font-weight: ${isStack ? '700' : '500'}; padding: 2px 8px; border-radius: 4px; cursor: pointer; box-shadow: ${isStack ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; font-size: 10.5px;">🥞 递归分层树 (一层一树 · 推荐)</button>
            <button id="btn-subview-unified" style="border: none; background: ${isUnified ? '#ffffff' : 'transparent'}; color: ${isUnified ? '#1d4ed8' : '#64748b'}; font-weight: ${isUnified ? '700' : '500'}; padding: 2px 8px; border-radius: 4px; cursor: pointer; box-shadow: ${isUnified ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; font-size: 10.5px;">🌲 全景合一树 (整树全局态)</button>
            <button id="btn-subview-split" style="border: none; background: ${isSplit ? '#ffffff' : 'transparent'}; color: ${isSplit ? '#1d4ed8' : '#64748b'}; font-weight: ${isSplit ? '700' : '500'}; padding: 2px 8px; border-radius: 4px; cursor: pointer; box-shadow: ${isSplit ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; font-size: 10.5px;">🌓 双视口分屏</button>
            <button id="btn-subview-call" style="border: none; background: ${isCall ? '#ffffff' : 'transparent'}; color: ${isCall ? '#1d4ed8' : '#64748b'}; font-weight: ${isCall ? '700' : '500'}; padding: 2px 8px; border-radius: 4px; cursor: pointer; box-shadow: ${isCall ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; font-size: 10.5px;">🌳 递归展开树</button>
          </div>
        `;
        const btnUnified = toolbar.querySelector('#btn-subview-unified') as HTMLButtonElement | null;
        const btnStack = toolbar.querySelector('#btn-subview-stack') as HTMLButtonElement | null;
        const btnSplit = toolbar.querySelector('#btn-subview-split') as HTMLButtonElement | null;
        const btnCall = toolbar.querySelector('#btn-subview-call') as HTMLButtonElement | null;

        if (btnUnified) {
          btnUnified.onclick = (e) => {
            e.stopPropagation();
            BalancedBinaryTreeCanvasAdapter.activeSubView = 'unified-tree';
            BalancedBinaryTreeCanvasAdapter.renderCanvas(container, step);
          };
        }
        if (btnStack) {
          btnStack.onclick = (e) => {
            e.stopPropagation();
            BalancedBinaryTreeCanvasAdapter.activeSubView = 'stack-depth';
            BalancedBinaryTreeCanvasAdapter.renderCanvas(container, step);
          };
        }
        if (btnSplit) {
          btnSplit.onclick = (e) => {
            e.stopPropagation();
            BalancedBinaryTreeCanvasAdapter.activeSubView = 'split';
            BalancedBinaryTreeCanvasAdapter.renderCanvas(container, step);
          };
        }
        if (btnCall) {
          btnCall.onclick = (e) => {
            e.stopPropagation();
            BalancedBinaryTreeCanvasAdapter.activeSubView = 'call-tree';
            BalancedBinaryTreeCanvasAdapter.renderCanvas(container, step);
          };
        }
        container.appendChild(toolbar);
      }

      // 2. 主绘图画板挂载区
      if (BalancedBinaryTreeCanvasAdapter.activeSubView === 'unified-tree') {
        // 路线 F：全画幅调用链合一树 (整棵树占满画板，挂载所有调用栈深度、光流连线与状态徽标)
        const canvasBox = document.createElement('div');
        canvasBox.style.cssText =
          'flex: 1; width: 100%; height: 100%; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative;';
        container.appendChild(canvasBox);

        TreeCanvasAdapter.renderTree(canvasBox, {
          tree: step.tree,
          current,
          visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
          secondaryHighlightedNodes: secondaryHighlightedNodes.length > 0 ? secondaryHighlightedNodes : [],
          primaryColor: '#f59e0b',
          secondaryColor: '#38bdf8',
          visitedColor: '#34d399',
          labels: labels.size > 0 ? labels : undefined,
          dimUnvisited: true,
          nullProbe: step.nullProbe,
          stackFrames: step.treeStackFrames,
          // 全画幅合一树契约：唯一一棵完整 SVG，禁用 TreeOfTrees 卡片网格分流
          disableTreeOfTrees: true,
        });
      } else if (BalancedBinaryTreeCanvasAdapter.activeSubView === 'stack-depth') {
        // 路线 E/G：固定全深度多树全展 (固定全深度列展示，绝不随调用栈弹出动态增减或消失)
        const getMaxTreeDepth = (node: any): number => {
          if (!node) return 0;
          return 1 + Math.max(getMaxTreeDepth(node.left), getMaxTreeDepth(node.right));
        };
        const totalDepths = Math.max(1, getMaxTreeDepth(step.tree));
        const stackFrames = step.treeStackFrames || [];
        const activeDepthMap = new Map<number, typeof stackFrames[0]>();
        stackFrames.forEach((f) => activeDepthMap.set(f.depth + 1, f));

        const depthLevels = Array.from({ length: totalDepths }, (_, i) => i + 1);

        const stackContainer = document.createElement('div');
        stackContainer.style.cssText =
          'flex: 1; width: 100%; height: 100%; min-height: 0; box-sizing: border-box; display: flex; gap: 8px; overflow-x: auto; padding: 2px; align-items: stretch;';

        depthLevels.forEach((lvl) => {
          const frame = activeDepthMap.get(lvl);
          const inStack = Boolean(frame);
          const isCurrent = Boolean(frame?.isCurrent);
          const curStackMax = stackFrames.length > 0 ? Math.max(...stackFrames.map((f) => f.depth + 1)) : 0;
          const isPending = lvl > curStackMax && !step.visitedNodes?.length;

          const minWidth = totalDepths <= 3 ? '0' : '260px';
          const frameCard = document.createElement('div');
          frameCard.style.cssText = `
            flex: 1 1 ${minWidth};
            min-width: ${minWidth};
            border: 1px solid ${isCurrent ? '#93c5fd' : inStack ? '#bfdbfe' : '#e2e8f0'};
            border-radius: 8px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
            box-shadow: ${isCurrent ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none'};
            position: relative;
            opacity: ${inStack ? '1' : '0.85'};
          `;

          // 纯净卡片顶部微标 (零 h1~h6 违规)
          const header = document.createElement('div');
          header.style.cssText = `padding: 4px 8px; background: ${isCurrent ? '#eff6ff' : inStack ? '#f0f9ff' : '#f8fafc'}; border-bottom: 1px solid ${isCurrent ? '#bfdbfe' : inStack ? '#bae6fd' : '#e2e8f0'}; font-size: 10.5px; font-weight: 700; color: ${isCurrent ? '#1d4ed8' : inStack ? '#0369a1' : '#64748b'}; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;`;

          const funcText = frame?.funcCall ?? `第 ${lvl} 层`;
          const statusText = isCurrent
            ? '⚡ 活跃执行'
            : inStack
            ? '⏳ 等待回溯'
            : isPending
            ? '💤 待递归深入'
            : '✅ 本层回溯已结算';
          const statusColor = isCurrent ? '#2563eb' : inStack ? '#0284c7' : isPending ? '#94a3b8' : '#15803d';

          header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="background: ${isCurrent ? '#3b82f6' : inStack ? '#0284c7' : '#94a3b8'}; color: #ffffff; padding: 0 4px; border-radius: 3px; font-size: 9.5px; font-family: monospace;">d=${lvl}</span>
              <span style="font-family: monospace;">${funcText}</span>
            </div>
            <span style="font-size: 9.5px; color: ${statusColor}; font-weight: 600;">${statusText}</span>
          `;
          frameCard.appendChild(header);

          const canvasBox = document.createElement('div');
          canvasBox.style.cssText =
            'flex: 1; width: 100%; height: 100%; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center;';
          frameCard.appendChild(canvasBox);

          // 一层递归一个树：呈现当前层级专属子树
          if (inStack && frame) {
            if (frame.nodeVal == null) {
              // 判空基底帧：绘制专属空节点 SVG 沙盘
              canvasBox.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                  <svg width="100%" height="220" viewBox="0 0 300 160" style="max-height: 220px; display: block; margin: auto;">
                    <rect x="50" y="45" width="200" height="66" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,4"/>
                    <circle cx="85" cy="78" r="15" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
                    <text x="85" y="83" text-anchor="middle" font-size="13" font-weight="700" fill="#1d4ed8">∅</text>
                    <text x="175" y="73" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13.5" font-weight="700" fill="#1e40af">node == null</text>
                    <text x="175" y="93" text-anchor="middle" font-size="11" font-weight="600" fill="#3b82f6">空节点基底 · return 0</text>
                  </svg>
                </div>
              `;
            } else {
              // 非空节点帧：提取以当前帧参数 node 为根的独立子树进行渲染
              const subTree = findSubtree(step.tree, frame.nodeVal);
              if (subTree) {
                TreeCanvasAdapter.renderTree(canvasBox, {
                  tree: subTree,
                  current: isCurrent ? frame.nodeVal : undefined,
                  secondaryHighlightedNodes: !isCurrent ? [frame.nodeVal] : [],
                  primaryColor: '#f59e0b',
                  secondaryColor: '#38bdf8',
                  visitedColor: '#34d399',
                  labels: labels.size > 0 ? labels : undefined,
                  dimUnvisited: false,
                  initialDepth: lvl,
                  nullProbe: (isCurrent && step.nullProbe?.parentVal === frame.nodeVal) ? step.nullProbe : undefined,
                  // 一层递归一个树契约：每层严格一棵专属 SVG，禁用卡片网格分流
                  disableTreeOfTrees: true,
                });
              } else {
                renderLivingDataTree(canvasBox, frame.nodeVal, isCurrent);
              }
            }
          } else if (isPending) {
            canvasBox.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <svg width="100%" height="220" viewBox="0 0 300 160" style="max-height: 220px; display: block; margin: auto;">
                  <rect x="50" y="45" width="200" height="66" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>
                  <text x="150" y="74" text-anchor="middle" font-size="12" font-weight="600" fill="#64748b">💤 待递归深入第 ${lvl} 层</text>
                  <text x="150" y="94" text-anchor="middle" font-size="10.5" font-weight="500" fill="#94a3b8">等待进入此深度子树</text>
                </svg>
              </div>
            `;
          } else {
            canvasBox.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <svg width="100%" height="220" viewBox="0 0 300 160" style="max-height: 220px; display: block; margin: auto;">
                  <rect x="50" y="45" width="200" height="66" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" stroke-dasharray="4,4"/>
                  <circle cx="85" cy="78" r="14" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
                  <text x="85" y="82" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">✓</text>
                  <text x="175" y="74" text-anchor="middle" font-size="12" font-weight="700" fill="#15803d">第 ${lvl} 层已结算返回</text>
                  <text x="175" y="94" text-anchor="middle" font-size="10.5" font-weight="500" fill="#16a34a">计算完成 · 结果已交付父层</text>
                </svg>
              </div>
            `;
          }
          stackContainer.appendChild(frameCard);
        });

        container.appendChild(stackContainer);
      } else if (BalancedBinaryTreeCanvasAdapter.activeSubView === 'split' && step.callTree) {
        // 路线 D：双视口联动分屏模式 (左侧物理数据树 ⟷ 右侧递归展开树)
        const splitGrid = document.createElement('div');
        splitGrid.style.cssText =
          'flex: 1; width: 100%; height: 100%; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; box-sizing: border-box;';

        // 左视口：物理数据树
        const leftPane = document.createElement('div');
        leftPane.style.cssText =
          'border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; display: flex; flex-direction: column; min-height: 0; overflow: hidden;';
        leftPane.innerHTML = `
          <div style="padding: 3px 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 10.5px; font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
            <span>🌲 物理数据树 (Physical Data Tree)</span>
            <span style="font-size: 9.5px; color: #94a3b8; font-weight: 500;">带探针 & 徽标</span>
          </div>
          <div id="split-left-canvas" style="flex: 1; width: 100%; height: 100%; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center;"></div>
        `;

        // 右视口：递归调用树
        const rightPane = document.createElement('div');
        rightPane.style.cssText =
          'border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; display: flex; flex-direction: column; min-height: 0; overflow: hidden;';
        rightPane.innerHTML = `
          <div style="padding: 3px 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 10.5px; font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
            <span>🌳 递归调用栈 (Call Stack Forest)</span>
            <span style="font-size: 9.5px; color: #94a3b8; font-weight: 500;">带深入 & 归约</span>
          </div>
          <div id="split-right-canvas" style="flex: 1; width: 100%; height: 100%; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center;"></div>
        `;

        splitGrid.appendChild(leftPane);
        splitGrid.appendChild(rightPane);
        container.appendChild(splitGrid);

        const leftCanvas = leftPane.querySelector('#split-left-canvas') as HTMLElement | null;
        const rightCanvas = rightPane.querySelector('#split-right-canvas') as HTMLElement | null;
        if (leftCanvas) renderLivingDataTree(leftCanvas, current, true);
        if (rightCanvas) RecursionTreeAdapter.renderRecursionTree(rightCanvas, step.callTree, step.activeCallId);
      } else if (BalancedBinaryTreeCanvasAdapter.activeSubView === 'call-tree' && step.callTree) {
        // 路线 C：全画幅递归展开树
        const canvasBox = document.createElement('div');
        canvasBox.style.cssText =
          'flex: 1; width: 100%; height: 100%; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative;';
        container.appendChild(canvasBox);
        RecursionTreeAdapter.renderRecursionTree(canvasBox, step.callTree, step.activeCallId);
      } else {
        // 路线 B：全画幅动态生命树
        const canvasBox = document.createElement('div');
        canvasBox.style.cssText =
          'flex: 1; width: 100%; height: 100%; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative;';
        container.appendChild(canvasBox);
        renderLivingDataTree(canvasBox, current, true);
      }
    } else if ((step.extraData as any)?.treeNodes) {
      const treeNodes = (step.extraData as any).treeNodes;
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
          ${renderTreeSvg(treeNodes, step.activeNodeId ?? step.current, step.secondaryNodeId ?? step.secondaryCurrent)}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
          </svg>
        </div>
      `;
    }
  }

  /**
   * Card 2: 扁平化【后序信息流转与聚合沙盘】(Postorder Synthesis Flow)
   * 零套娃、零镜像复读：清晰呈现【左树汇报 vs 右树汇报 -> 本层差值代入 -> 向上交付】
   */
  static renderCustomMetrics(container: HTMLElement, step: BalancedTree037Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; padding: 4px; font-family: system-ui, -apple-system, sans-serif;';

    const stageId = step.stageId || 'stage-1';
    const curVal = step.current !== null && step.current !== undefined ? `Node(${step.current})` : 'null (空基底)';
    const callStack = step.callStack || [];

    // 1. 递归路径面包屑 (Call Chain Path)
    const breadcrumbs = document.createElement('div');
    breadcrumbs.style.cssText =
      'display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 2px 4px; flex-shrink: 0;';
    const chipsHtml = callStack.length > 0
      ? callStack.map((name, i) => `<span style="padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; ${i === callStack.length - 1 ? 'background: #dbeafe; color: #1e40af; font-weight: 700; border: 1px solid #bfdbfe;' : 'background: #f1f5f9; color: #64748b;'}">${name}</span>${i < callStack.length - 1 ? '<span style="color: #cbd5e1;">➔</span>' : ''}`).join('')
      : '<span style="color: #94a3b8; font-style: italic;">根调用入口</span>';
    breadcrumbs.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px; overflow-x: auto; white-space: nowrap;">
        <span style="color: #64748b; font-weight: 600;">递归路径:</span> ${chipsHtml}
      </div>
      <span style="font-size: 10.5px; color: #64748b; font-family: monospace; flex-shrink: 0;">Depth: ${callStack.length}</span>
    `;
    container.appendChild(breadcrumbs);

    // 2. Stage 3 显式栈专有呈现
    if (stageId === 'stage-3') {
      const stack = step.stackState || [];
      const heightMap = step.heightMap || {};
      const heightEntries = Object.entries(heightMap);

      const stackView = document.createElement('div');
      stackView.style.cssText =
        'display: grid; grid-template-columns: 1fr 1.2fr; gap: 8px; flex: 1; min-height: 0;';
      stackView.innerHTML = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px;">
          <div style="font-weight: 700; color: #475569; font-size: 11px;">🥞 后序显式栈 (Size: ${stack.length})</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center; overflow-y: auto;">
            ${stack.length > 0 ? stack.map((val, idx) => `<span style="padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; font-weight: 600; background: ${idx === stack.length - 1 ? '#dbeafe; color: #1d4ed8; border: 1px solid #93c5fd;' : '#f8fafc; color: #334155; border: 1px solid #e2e8f0;'}">${idx === stack.length - 1 ? '🔝 ' : ''}Node(${val})</span>`).join('') : '<span style="color: #94a3b8; font-style: italic; font-size: 10.5px;">当前显式栈为空</span>'}
          </div>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; overflow-y: auto;">
          <div style="font-weight: 700; color: #475569; font-size: 11px;">🗺️ 节点高度映射表 (已结算 ${heightEntries.length} 项)</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${heightEntries.length > 0 ? heightEntries.map(([k, v]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; color: #334155;"><b style="color: #0284c7;">Node(${k})</b>: h=${v}</span>`).join('') : '<span style="color: #94a3b8; font-style: italic; font-size: 10.5px;">自底向上逐步回填中...</span>'}
          </div>
        </div>
      `;
      container.appendChild(stackView);
      return;
    }

    // 3. Stage 1 & 2: 三栏式【后序信息流转沙盘】
    const info = step.infoDetail;
    const prune = step.pruneDetail;
    const isStage1 = stageId === 'stage-1';

    // 提炼左子树信息
    let leftHtml = '<span style="color: #94a3b8;">⏳ 待索取</span>';
    if (isStage1 && info?.left) {
      leftHtml = `<div style="font-weight: 700; color: #0284c7; font-size: 13px;">高度 h = ${info.left.height}</div><div style="font-size: 10.5px; color: ${info.left.isBalanced ? '#16a34a' : '#dc2626'}; font-weight: 600;">${info.left.isBalanced ? '🟢 平衡' : '🔴 失衡'}</div>`;
    } else if (!isStage1 && prune?.left !== undefined) {
      const isP = prune.left === -1;
      leftHtml = `<div style="font-weight: 700; color: ${isP ? '#dc2626' : '#0284c7'}; font-size: 13px;">${isP ? '🔴 -1 (剪枝)' : `h = ${prune.left}`}</div><div style="font-size: 10.5px; color: ${isP ? '#dc2626' : '#16a34a'}; font-weight: 600;">${isP ? '失衡击穿' : '正常'}</div>`;
    } else if (step.action === 'base-null') {
      leftHtml = '<div style="font-weight: 600; color: #64748b; font-size: 11.5px;">null (h=0)</div><div style="font-size: 10.5px; color: #16a34a; font-weight: 600;">🟢 基准平衡</div>';
    } else if (step.action === 'left-call' || step.action === 'check-left') {
      leftHtml = '<span style="color: #2563eb; font-weight: 600;">🔍 深入探测中...</span>';
    }

    // 提炼右子树信息
    let rightHtml = '<span style="color: #94a3b8;">⏳ 待索取</span>';
    if (isStage1 && info?.right) {
      rightHtml = `<div style="font-weight: 700; color: #0284c7; font-size: 13px;">高度 h = ${info.right.height}</div><div style="font-size: 10.5px; color: ${info.right.isBalanced ? '#16a34a' : '#dc2626'}; font-weight: 600;">${info.right.isBalanced ? '🟢 平衡' : '🔴 失衡'}</div>`;
    } else if (!isStage1 && prune?.right !== undefined) {
      const isP = prune.right === -1;
      rightHtml = `<div style="font-weight: 700; color: ${isP ? '#dc2626' : '#0284c7'}; font-size: 13px;">${isP ? '🔴 -1 (剪枝)' : `h = ${prune.right}`}</div><div style="font-size: 10.5px; color: ${isP ? '#dc2626' : '#16a34a'}; font-weight: 600;">${isP ? '失衡击穿' : '正常'}</div>`;
    } else if (step.action === 'base-null') {
      rightHtml = '<div style="font-weight: 600; color: #64748b; font-size: 11.5px;">null (h=0)</div><div style="font-size: 10.5px; color: #16a34a; font-weight: 600;">🟢 基准平衡</div>';
    } else if (step.action === 'right-call' || step.action === 'check-right') {
      rightHtml = '<span style="color: #2563eb; font-weight: 600;">🔍 深入探测中...</span>';
    }

    // 提炼中枢本层后序判定
    const isPruned = Boolean(step.pruned || prune?.isPruned);
    const combined = info?.combined;
    const diffVal = combined?.diff ?? prune?.diff ?? (info?.left && info?.right ? Math.abs(info.left.height - info.right.height) : (prune?.left !== undefined && prune?.right !== undefined && prune.left >= 0 && prune.right >= 0 ? Math.abs(prune.left - prune.right) : null));
    const isEvaluated = combined !== undefined || (prune?.left !== undefined && prune?.right !== undefined) || step.action === 'base-null';

    let centerCalcHtml = '';
    let centerVerdictHtml = '';
    if (step.action === 'base-null') {
      centerCalcHtml = '<div style="font-size: 11px; color: #64748b;">空节点递归基底 (x == null)</div>';
      centerVerdictHtml = '<div style="font-size: 12px; font-weight: 700; color: #16a34a;">返回自身高度 0 (天然平衡)</div>';
    } else if (isPruned) {
      centerCalcHtml = `<div style="font-size: 11px; font-weight: 600; color: #e11d48;">${prune?.reason || '探测到失衡信号或高度差 > 1'}</div>`;
      centerVerdictHtml = '<div style="font-size: 12px; font-weight: 700; color: #be123c;">🚨 触发极速熔断，返回 -1</div>';
    } else if (isEvaluated && diffVal !== null) {
      const leftH = info?.left?.height ?? prune?.left ?? 0;
      const rightH = info?.right?.height ?? prune?.right ?? 0;
      const curH = Math.max(leftH, rightH) + 1;
      centerCalcHtml = `
        <div style="font-size: 11px; color: #475569; font-family: monospace;">|h_L - h_R| = |${leftH} - ${rightH}| = <b>${diffVal}</b> ≤ 1</div>
        <div style="font-size: 10.5px; color: #64748b;">h = max(${leftH}, ${rightH}) + 1 = <b>${curH}</b></div>
      `;
      centerVerdictHtml = `<div style="font-size: 12px; font-weight: 700; color: #15803d;">🟢 局部平衡，返回高度 ${curH}</div>`;
    } else {
      centerCalcHtml = '<div style="font-size: 11px; color: #94a3b8;">等待左右子树信息回传...</div>';
      centerVerdictHtml = '<div style="font-size: 11.5px; font-weight: 600; color: #2563eb;">递归推演中</div>';
    }

    const flowSandbox = document.createElement('div');
    flowSandbox.style.cssText =
      'display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 8px; flex: 1; min-height: 0;';
    flowSandbox.innerHTML = `
      <!-- 左子树汇报 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px;">
          <span>🍃</span> <span>左子树汇报 (Left)</span>
        </div>
        <div style="margin: 4px 0;">${leftHtml}</div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">process(x.left)</div>
      </div>

      <!-- 中枢本层决策聚合 -->
      <div style="background: ${isPruned ? '#fff1f2' : '#f8fafc'}; border: 1px solid ${isPruned ? '#fecdd3' : '#cbd5e1'}; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span>⚖️</span> <span>本层后序判定 (${curVal})</span>
        </div>
        <div style="margin: 4px 0;">${centerCalcHtml}</div>
        <div>${centerVerdictHtml}</div>
      </div>

      <!-- 右子树汇报 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px;">
          <span>🍃</span> <span>右子树汇报 (Right)</span>
        </div>
        <div style="margin: 4px 0;">${rightHtml}</div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">process(x.right)</div>
      </div>
    `;
    container.appendChild(flowSandbox);

    // 4. 向上交付动效指示条 (Upward Delivery Action)
    const deliveryBar = document.createElement('div');
    deliveryBar.style.cssText =
      'background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 5px 8px; font-size: 10.5px; color: #475569; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;';
    const deliverySummary = isPruned
      ? '<b style="color: #dc2626;">🚨 逐层击穿调用栈，直接返回 -1</b>'
      : isEvaluated
      ? `<b style="color: #16a34a;">✓ 交付本层结算：${isStage1 ? `Info(bal=${combined?.isBalanced ?? true}, h=${combined?.height ?? 1})` : `高度 h=${step.result ?? 1}`}</b>`
      : '<span style="color: #64748b;">递归深入中，暂未向上交付</span>';
    deliveryBar.innerHTML = `
      <span>⬆️ <b>向上交付行为：</b>${deliverySummary}</span>
      <span style="font-size: 10px; color: #94a3b8;">Tree DP Info Model</span>
    `;
    container.appendChild(deliveryBar);
  }
}

export const renderBalancedTreeCanvas = BalancedBinaryTreeCanvasAdapter.renderCanvas;
export const renderBalancedCustomMetrics = BalancedBinaryTreeCanvasAdapter.renderCustomMetrics;

