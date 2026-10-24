/**
 * 从前序/后序与中序构造二叉树视觉与看板呈现适配器 (BuildTreeCanvasAdapter)
 *
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约：
 *   - Card 1: 复合教学沙盘（动态数组切片条带 + 二叉树拓扑生长图）
 *   - Card 2: 领域切分方程推导板与递归栈深监控（杜绝与外层全局指标重复）
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BTStep, collectTreeValues } from './build-tree-step-compiler';

export class BuildTreeCanvasAdapter {
  /**
   * 渲染单个数组的切片条带 HTML (100% 自包含内联样式，脱离 Tailwind 亦自洽稳定)
   */
  private static renderArrayStrip(
    title: string,
    arr: number[],
    rangeStart: number,
    rangeEnd: number,
    rootIdx: number | null,
    leftEnd: number | null,
    isPreorder: boolean = false
  ): string {
    const cells = arr
      .map((val, idx) => {
        const inRange = rangeStart >= 0 && rangeEnd >= 0 && idx >= rangeStart && idx <= rangeEnd;
        if (!inRange) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
              <span style="font-size: 9px; color: #94a3b8; font-family: ui-monospace, monospace; line-height: 1; margin-bottom: 2px;">${idx}</span>
              <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px dashed #cbd5e1; background: #f8fafc; color: #94a3b8; font-family: ui-monospace, monospace; font-size: 11px; user-select: none;">
                ${val}
              </div>
            </div>
          `;
        }

        const isRoot = rootIdx !== null && idx === rootIdx;
        if (isRoot) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
              <span style="font-size: 9px; color: #d97706; font-weight: 700; font-family: ui-monospace, monospace; line-height: 1; margin-bottom: 2px;">${idx}</span>
              <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #f59e0b; color: #ffffff; font-weight: 700; font-family: ui-monospace, monospace; font-size: 12px; box-shadow: 0 1px 3px rgba(245, 158, 11, 0.4); border: 2px solid #fbbf24; user-select: none;" title="当前子树根节点">
                ${val}
              </div>
            </div>
          `;
        }

        // 判断是否属于左子树区间
        const isLeft = isPreorder
          ? rootIdx !== null && idx > rootIdx && leftEnd !== null && idx <= leftEnd
          : leftEnd !== null && idx <= leftEnd;

        if (isLeft) {
          return `
            <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
              <span style="font-size: 9px; color: #2563eb; font-weight: 600; font-family: ui-monospace, monospace; line-height: 1; margin-bottom: 2px;">${idx}</span>
              <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #eff6ff; border: 1.5px solid #60a5fa; color: #1d4ed8; font-weight: 700; font-family: ui-monospace, monospace; font-size: 12px; box-shadow: 0 1px 2px rgba(96, 165, 250, 0.2); user-select: none;" title="左子树区间">
                ${val}
              </div>
            </div>
          `;
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
            <span style="font-size: 9px; color: #7c3aed; font-weight: 600; font-family: ui-monospace, monospace; line-height: 1; margin-bottom: 2px;">${idx}</span>
            <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #faf5ff; border: 1.5px solid #c084fc; color: #7e22ce; font-weight: 700; font-family: ui-monospace, monospace; font-size: 12px; box-shadow: 0 1px 2px rgba(192, 132, 252, 0.2); user-select: none;" title="右子树区间">
              ${val}
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">
        <span style="width: 68px; font-size: 11px; font-family: ui-monospace, monospace; font-weight: 700; color: #475569; text-align: right; flex-shrink: 0;">${title}:</span>
        <div style="display: flex; flex-direction: row; align-items: center; gap: 6px; overflow-x: auto; padding: 2px 2px;">
          ${cells}
        </div>
      </div>
    `;
  }

  /**
   * Card 1: 复合树形与数组切分沙盘渲染 (Array Interval Slicing Strip + Tree Topology)
   * 遵循 Zero-Subbox 契约与反双重镜像原则：
   * 顶部极简双轨切片条带，将状态指标让渡 Card 2，给二叉树 SVG 预留 75%+ 黄金面积
   */
  public static renderCanvas(container: HTMLElement, step: BTStep): void {
    container.innerHTML = '';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.padding = '10px';
    container.style.overflow = 'hidden';

    const isStage2 = step.postorder !== undefined && step.postorder.length > 0;

    // 1. 顶部：极简数组切片条带 (紧凑高度 <= 80px，零白底嵌套大卡片)
    const stripContainer = document.createElement('div');
    stripContainer.style.width = '100%';
    stripContainer.style.display = 'flex';
    stripContainer.style.flexDirection = 'column';
    stripContainer.style.gap = '6px';
    stripContainer.style.padding = '8px 12px';
    stripContainer.style.marginBottom = '8px';
    stripContainer.style.borderRadius = '8px';
    stripContainer.style.background = '#f8fafc';
    stripContainer.style.border = '1px solid #e2e8f0';
    stripContainer.style.flexShrink = '0';

    const otherSeqName = isStage2 ? 'postorder' : 'preorder';
    const otherSeqArr = isStage2 ? step.postorder! : step.preorder;

    let otherRootIdx: number | null = null;
    let otherLeftEnd: number | null = null;
    if (step.rootVal != null) {
      if (isStage2) {
        otherRootIdx = step.pR >= 0 ? step.pR : null;
        otherLeftEnd = step.pL + step.leftLen - 1;
      } else {
        otherRootIdx = step.pL >= 0 ? step.pL : null;
        otherLeftEnd = step.pL + step.leftLen;
      }
    }

    const inRootIdx = step.rootVal != null && step.inRoot >= 0 ? step.inRoot : null;
    const inLeftEnd = step.rootVal != null && step.inRoot >= 0 ? step.inRoot - 1 : null;

    stripContainer.innerHTML = `
      <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        <span style="font-size: 11px; font-family: ui-monospace, monospace; font-weight: 700; color: #334155;">
          ${isStage2 ? '中序 & 后序切片对齐' : '中序 & 前序切片对齐'}
        </span>
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; font-size: 10px; color: #64748b;">
          <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: #f59e0b;"></span>根节点</span>
          <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: #60a5fa;"></span>左子树</span>
          <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 8px; height: 8px; border-radius: 2px; background: #c084fc;"></span>右子树</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 2px;">
        ${BuildTreeCanvasAdapter.renderArrayStrip('inorder', step.inorder, step.iL, step.iR, inRootIdx, inLeftEnd, false)}
        ${BuildTreeCanvasAdapter.renderArrayStrip(otherSeqName, otherSeqArr, step.pL, step.pR, otherRootIdx, otherLeftEnd, !isStage2)}
      </div>
    `;
    container.appendChild(stripContainer);

    // 2. 下部：二叉树拓扑生长画布 (占据 75%+ 核心黄金面积)
    const treeContainer = document.createElement('div');
    treeContainer.style.width = '100%';
    treeContainer.style.flex = '1';
    treeContainer.style.display = 'flex';
    treeContainer.style.alignItems = 'center';
    treeContainer.style.justifyContent = 'center';
    treeContainer.style.minHeight = '220px';
    treeContainer.style.overflow = 'hidden';

    if (step.tree) {
      const allTreeVals = collectTreeValues(step.tree);
      const isDone = step.action === 'done';
      const visited = isDone ? allTreeVals : (step.visitedNodes ?? allTreeVals.filter((v) => v !== step.rootVal));
      const primaryNodes = step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : (step.rootVal != null ? [step.rootVal] : []);

      TreeCanvasAdapter.renderTree(treeContainer, {
        tree: step.tree,
        current: step.rootVal,
        highlightedNodes: primaryNodes,
        visitedNodes: visited,
        primaryColor: '#fbbf24',
        visitedColor: '#34d399',
        secondaryColor: '#60a5fa',
      });
    } else {
      treeContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8;">
          <svg width="180" height="90" viewBox="0 0 180 90">
            <circle cx="90" cy="40" r="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="90" y="44" text-anchor="middle" font-size="10" fill="#94a3b8" font-weight="bold">重构等待中</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 6px; font-family: ui-monospace, monospace;">从首/尾序列获取当前根节点...</span>
        </div>
      `;
    }
    container.appendChild(treeContainer);
  }

  /**
   * Card 2: 领域切分方程推导板与递归栈深监控 (Divide & Conquer Formulas & Stack Monitor)
   */
  public static renderCustomMetrics(container: HTMLElement, step: BTStep): void {
    container.innerHTML = '';
    container.style.padding = '10px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.height = '100%';
    container.style.overflowY = 'auto';

    const isStackStage = step.stackState !== undefined;
    const isStage2 = step.postorder !== undefined && step.postorder.length > 0;

    // 1. 分治切分数学方程与实参代入板
    if (!isStackStage && step.rootVal != null) {
      const leftPrePost = isStage2
        ? `[${step.pL} .. ${step.pL + step.leftLen - 1}]`
        : `[${step.pL + 1} .. ${step.pL + step.leftLen}]`;
      const rightPrePost = isStage2
        ? `[${step.pL + step.leftLen} .. ${step.pR - 1}]`
        : `[${step.pL + step.leftLen + 1} .. ${step.pR}]`;

      const formulaCard = document.createElement('div');
      formulaCard.style.padding = '10px';
      formulaCard.style.borderRadius = '10px';
      formulaCard.style.background = '#f8fafc';
      formulaCard.style.border = '1px solid #e2e8f0';
      formulaCard.style.flexShrink = '0';
      formulaCard.style.fontSize = '12px';

      formulaCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
            <span>📐 分治切分方程与实参代入</span>
          </span>
          <span style="font-family: ui-monospace, monospace; font-size: 10px; color: #0d9488; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;">
            leftLen = inRoot - iL = ${step.inRoot} - ${step.iL} = ${step.leftLen}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; font-family: ui-monospace, monospace;">
          <div style="padding: 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a;">
            <div style="font-weight: 700; color: #1d4ed8; margin-bottom: 4px;">👈 左子树递归实参</div>
            <div style="color: #475569; line-height: 1.4;">
              <div>中序区间: <span style="font-weight: 700; color: #1d4ed8;">[${step.iL} .. ${step.inRoot - 1}]</span></div>
              <div>${isStage2 ? '后序区间' : '前序区间'}: <span style="font-weight: 700; color: #1d4ed8;">${leftPrePost}</span></div>
            </div>
          </div>
          <div style="padding: 8px; border-radius: 6px; background: #faf5ff; border: 1px solid #e9d5ff; color: #581c87;">
            <div style="font-weight: 700; color: #7e22ce; margin-bottom: 4px;">👉 右子树递归实参</div>
            <div style="color: #475569; line-height: 1.4;">
              <div>中序区间: <span style="font-weight: 700; color: #7e22ce;">[${step.inRoot + 1} .. ${step.iR}]</span></div>
              <div>${isStage2 ? '后序区间' : '前序区间'}: <span style="font-weight: 700; color: #7e22ce;">${rightPrePost}</span></div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(formulaCard);
    }

    // 2. 中部：Stage 1/2 递归调用栈追踪 VS Stage 3 显式遍历栈监控
    if (isStackStage) {
      const stackBox = document.createElement('div');
      stackBox.style.padding = '10px';
      stackBox.style.borderRadius = '10px';
      stackBox.style.background = '#f8fafc';
      stackBox.style.border = '1px solid #e2e8f0';
      stackBox.style.flexShrink = '0';
      stackBox.style.fontSize = '12px';

      stackBox.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          <span>🥞 显式单调栈监控 (Explicit Monotonic Stack)</span>
          <span style="font-size: 10px; color: #64748b; font-weight: normal;">inIdx = ${step.inIdx ?? 0}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: ui-monospace, monospace;">
          <span style="color: #64748b;">栈内元素 (栈底 ➔ 栈顶):</span>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            ${
              step.stackState && step.stackState.length > 0
                ? step.stackState
                    .map(
                      (v, idx) => `
                    <span style="padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-weight: 700; ${
                      idx === step.stackState!.length - 1
                        ? 'background: #fef3c7; border: 1px solid #f59e0b; color: #b45309;'
                        : 'background: #eff6ff; border: 1px solid #60a5fa; color: #1d4ed8;'
                    }">
                      ${v}${idx === step.stackState!.length - 1 ? ' (顶)' : ''}
                    </span>
                  `
                    )
                    .join('')
                : '<span style="color: #94a3b8; font-style: italic; font-family: ui-monospace, monospace;">空栈 []</span>'
            }
          </div>
        </div>
      `;
      container.appendChild(stackBox);
    } else if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.style.flex = '1';
      traceBox.style.minHeight = '160px';
      traceBox.style.display = 'flex';
      traceBox.style.flexDirection = 'column';
      traceBox.style.borderRadius = '10px';
      traceBox.style.overflow = 'hidden';
      traceBox.style.border = '1px solid #e2e8f0';
      traceBox.style.background = '#ffffff';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
    }
  }
}

// 向后兼容函数导出
export const renderBuildTreeCanvas = BuildTreeCanvasAdapter.renderCanvas;
export const renderBuildTreeCustomMetrics = BuildTreeCanvasAdapter.renderCustomMetrics;
