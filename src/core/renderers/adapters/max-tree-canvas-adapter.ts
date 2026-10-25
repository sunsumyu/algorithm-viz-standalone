/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree) 表现层画布与指标适配器
 *
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约：
 *   - Card 1: 复合教学沙盘（动态区间扫描切片条带 + 最大二叉树拓扑生长）
 *   - Card 2: 分治极值方程推导、笛卡尔单调栈与显式任务调度监视器
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { MaxTreeStep, collectTreeValues } from './max-tree-step-compiler';

// ============================================================
// 辅助呈现函数：数组动态切片条带沙盘 (Slicing Strip)
// ============================================================
export function renderArrayScanBar(step: MaxTreeStep): HTMLElement {
  const arrayBox = document.createElement('div');
  arrayBox.style.cssText =
    'width: 100%; display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); flex-shrink: 0; box-sizing: border-box;';

  const inRangeText = step.range
    ? `当前分治区间 [${step.range[0]} .. ${step.range[1]}]`
    : '输入数组 nums 全局就绪';

  const headerRow = document.createElement('div');
  headerRow.style.cssText =
    'display: flex; align-items: center; justify-content: space-between; font-family: monospace; font-size: 11px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;';
  headerRow.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-weight: 700; color: #d97706;">🎯 当前焦点: ${step.current != null ? step.current : '—'}</span>
      <span style="color: #cbd5e1;">|</span>
      <span style="color: #475569;">区间最值: <strong style="color: #9333ea; font-family: monospace;">${step.maxVal != null ? step.maxVal : '—'}</strong></span>
      <span style="color: #cbd5e1;">|</span>
      <span style="color: #475569;">${inRangeText}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; font-size: 10px; color: #64748b;">
      <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 3px; background: #a855f7; display: inline-block;"></span>区间最值(根)</span>
      <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 3px; background: #f59e0b; display: inline-block;"></span>扫描比较</span>
      <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 3px; background: #3b82f6; display: inline-block;"></span>活动子区间</span>
    </div>
  `;
  arrayBox.appendChild(headerRow);

  const arrayRow = document.createElement('div');
  arrayRow.style.cssText = 'display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 4px 2px;';

  step.nums.forEach((val, i) => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; flex-direction: column; align-items: center; user-select: none; flex-shrink: 0;';

    const inRange = step.range ? i >= step.range[0] && i <= step.range[1] : true;
    const isMax = step.maxIdx === i;
    const isScan = step.scanIdx === i;
    const isCurrent = step.current === val;

    let cellStyle =
      'width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';

    if (isMax) {
      cellStyle += ' background: #a855f7; color: #ffffff; border: 2px solid #c084fc; box-shadow: 0 0 8px rgba(168,85,247,0.35); position: relative;';
    } else if (isScan) {
      cellStyle += ' background: #f59e0b; color: #ffffff; border: 2px solid #fde68a; box-shadow: 0 0 8px rgba(245,158,11,0.35);';
    } else if (isCurrent) {
      cellStyle += ' background: #eff6ff; border: 1px solid #60a5fa; color: #1e40af;';
    } else if (inRange) {
      cellStyle += ' background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155;';
    } else {
      cellStyle += ' border: 1px dashed #cbd5e1; background: #f8fafc; color: #94a3b8; opacity: 0.5;';
    }

    const idxColor = isMax ? '#9333ea; font-weight: 700;' : isScan ? '#d97706; font-weight: 700;' : '#94a3b8;';

    item.innerHTML = `
      <span style="font-size: 9px; font-family: monospace; line-height: 1; margin-bottom: 2px; color: ${idxColor}">${i}</span>
      <div style="${cellStyle}">
        ${val}
      </div>
    `;
    arrayRow.appendChild(item);
  });
  arrayBox.appendChild(arrayRow);
  return arrayBox;
}

/** 辅助生成推演决策总结框 */
export function renderDecisionSummary(step: MaxTreeStep): HTMLElement {
  const summaryBox = document.createElement('div');
  summaryBox.style.cssText =
    'padding: 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 12px; color: #334155; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: #0284c7; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
      <span>⚡ 决策推演: ${step.action ?? '分治'}</span>
    </div>
    <div style="line-height: 1.5; color: #475569;">${step.message}</div>
  `;
  return summaryBox;
}

// ============================================================
// Card 1: 复合树形与数组切片沙盘渲染 (Array Slicing Strip + Tree Topology)
// ============================================================
export function renderMaxTreeCanvas(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; padding: 12px; overflow: hidden; box-sizing: border-box;';

  // 1. 顶部：数组切片条带沙盘 (Slicing Strip)
  container.appendChild(renderArrayScanBar(step));

  // 2. 下部：二叉树拓扑生长画布
  const treeContainer = document.createElement('div');
  treeContainer.style.cssText =
    'width: 100%; flex: 1; display: flex; align-items: center; justify-content: center; min-height: 220px; overflow: hidden;';

  if (!step.tree) {
    treeContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8;">
        <svg width="180" height="90" viewBox="0 0 180 90">
          <circle cx="90" cy="40" r="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="90" y="44" text-anchor="middle" font-size="10" fill="#94a3b8" font-weight="bold">重构等待中</text>
        </svg>
        <span style="font-size: 12px; color: #64748b; margin-top: 8px; font-family: monospace;">线性扫描寻找当前区间最大值作为根...</span>
      </div>
    `;
  } else {
    const isDone = step.action === 'done' || step.message.includes('完成');
    const allTreeVals = collectTreeValues(step.tree);

    let primaryNode = step.current;
    let visitedNodes = step.visitedNodes ?? [];
    let secondaryNodes: number[] = [];

    if (isDone) {
      visitedNodes = allTreeVals;
      if (primaryNode === null && step.tree) {
        primaryNode = step.tree.val;
      }
    } else if (step.maxIdx != null && step.nums && step.nums[step.maxIdx] != null) {
      secondaryNodes = [step.nums[step.maxIdx]];
    }

    TreeCanvasAdapter.renderTree(treeContainer, {
      tree: step.tree,
      current: primaryNode,
      secondaryHighlightedNodes: secondaryNodes,
      visitedNodes: visitedNodes,
      primaryColor: '#fbbf24', // 金黄: 当前焦点/考察元素
      secondaryColor: '#c084fc', // 紫罗兰: 区间最大值节点
      visitedColor: '#34d399', // 翡翠绿: 已建树收尾高亮
    });
  }
  container.appendChild(treeContainer);
}

// ============================================================
// Card 2 自定义指标与推演栈渲染器 (Card 2 Presentation Adapters)
// ============================================================

/**
 * Stage 1: Card 2 分治极值方程推导与递归调用推演跟踪栈
 */
export function renderStage1CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; padding: 12px; font-size: 12px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; box-sizing: border-box;';

  // 1. 分治极值方程推导板
  if (step.range && step.maxIdx != null) {
    const [l, r] = step.range;
    const formulaCard = document.createElement('div');
    formulaCard.style.cssText =
      'padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';
    formulaCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
        <span style="font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
          <span>📐 分治最值方程与实参代入</span>
        </span>
        <span style="font-family: monospace; font-size: 10px; color: #7e22ce; background: #faf5ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e9d5ff;">
          root = TreeNode(${step.maxVal ?? '?'}) @ idx=${step.maxIdx}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px; font-family: monospace;">
        <div style="padding: 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a;">
          <div style="font-weight: 700; color: #1d4ed8; margin-bottom: 4px;">👈 左子树分治区间 [Left]</div>
          <div>区间: <span style="font-weight: 700; color: #1d4ed8;">[${l} .. ${step.maxIdx - 1}]</span></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${l > step.maxIdx - 1 ? '区间越界 (返回 null)' : `元素数: ${step.maxIdx - l}`}</div>
        </div>
        <div style="padding: 8px; border-radius: 6px; background: #faf5ff; border: 1px solid #e9d5ff; color: #581c87;">
          <div style="font-weight: 700; color: #7e22ce; margin-bottom: 4px;">👉 右子树分治区间 [Right]</div>
          <div>区间: <span style="font-weight: 700; color: #7e22ce;">[${step.maxIdx + 1} .. ${r}]</span></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${step.maxIdx + 1 > r ? '区间越界 (返回 null)' : `元素数: ${r - step.maxIdx}`}</div>
        </div>
      </div>
    `;
    container.appendChild(formulaCard);
  }

  // 2. 递归调用推演跟踪栈
  const traceBox = document.createElement('div');
  traceBox.style.cssText =
    'flex: 1; min-height: 140px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';
  if (step.callTrace) {
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '📜 分治递归调用推演栈',
      theme: 'light',
      maxHeight: '100%',
      showTerminalHeader: true,
    });
  } else {
    traceBox.innerHTML = '<span style="color: #94a3b8; font-style: italic; font-size: 12px;">无活动调用栈</span>';
  }
  container.appendChild(traceBox);

  // 3. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * Stage 2: Card 2 单调栈笛卡尔树监视器
 */
export function renderStage2CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; padding: 12px; font-size: 12px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; box-sizing: border-box;';

  // 1. 单调栈槽监视器
  const stackBox = document.createElement('div');
  stackBox.style.cssText =
    'padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';

  const stackHeader = document.createElement('div');
  stackHeader.style.cssText =
    'display: flex; align-items: center; justify-content: space-between; color: #334155; font-size: 11px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;';
  stackHeader.innerHTML = `
    <span>🧭 单调递减栈槽 (栈底 ➔ 栈顶 · 维护右侧倾斜链)</span>
    <span style="color: #0d9488; font-family: monospace;">Size: ${step.stackVals?.length ?? 0}</span>
  `;
  stackBox.appendChild(stackHeader);

  const stackRow = document.createElement('div');
  stackRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center;';

  if (!step.stackVals || step.stackVals.length === 0) {
    stackRow.innerHTML = `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">(栈为空)</span>`;
  } else {
    step.stackVals.forEach((v, idx) => {
      const isTop = idx === step.stackVals!.length - 1;
      const slot = document.createElement('div');
      const slotStyle = isTop
        ? 'background: #fef3c7; border: 1px solid #f59e0b; color: #b45309; box-shadow: 0 1px 2px rgba(0,0,0,0.05);'
        : 'background: #f3e8ff; border: 1px solid #c084fc; color: #6b21a8;';
      slot.style.cssText = `padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700; transition: all 0.2s ease; ${slotStyle}`;
      slot.innerHTML = `<span>${v}</span>${
        isTop ? '<span style="font-size: 9px; color: #d97706; margin-left: 4px; font-weight: normal;">(顶)</span>' : ''
      }`;
      stackRow.appendChild(slot);
    });
  }
  stackBox.appendChild(stackRow);
  container.appendChild(stackBox);

  // 2. 状态说明
  const detailBox = document.createElement('div');
  detailBox.style.cssText =
    'flex: 1; min-height: 120px; padding: 12px; border-radius: 10px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: center; gap: 6px; box-sizing: border-box;';
  detailBox.innerHTML = `
    <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">💡 笛卡尔树线性建树核心法则：</div>
    <div style="color: #475569; font-size: 11px; line-height: 1.6; display: flex; flex-direction: column; gap: 4px;">
      <div>1. 若当前元素大于栈顶，栈顶弹出成为当前节点的 <strong style="color: #2563eb;">左孩子</strong>（左侧最大值归位）。</div>
      <div>2. 弹栈停止后，若栈非空，当前节点挂为新栈顶的 <strong style="color: #7e22ce;">右孩子</strong>。</div>
      <div>3. 当前节点压栈，整树根节点始终由最终的 <strong style="color: #d97706;">栈底元素</strong> 统领。</div>
    </div>
  `;
  container.appendChild(detailBox);

  // 3. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * Stage 3: Card 2 显式任务栈监视器
 */
export function renderStage3CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; padding: 12px; font-size: 12px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; box-sizing: border-box;';

  // 1. 任务队列状态监视器
  const taskBox = document.createElement('div');
  taskBox.style.cssText =
    'padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';

  const taskHeader = document.createElement('div');
  taskHeader.style.cssText =
    'display: flex; align-items: center; justify-content: space-between; color: #334155; font-size: 11px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;';
  taskHeader.innerHTML = `
    <span>🧱 显式任务栈调度器 (TaskStack)</span>
    <span style="color: #0d9488; font-family: monospace;">Tasks: ${step.depth}</span>
  `;
  taskBox.appendChild(taskHeader);

  const taskContent = document.createElement('div');
  taskContent.style.cssText = 'font-size: 12px; color: #475569; display: flex; flex-direction: column; gap: 6px;';
  taskContent.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: #64748b;">当前任务区间:</span>
      <span style="font-family: monospace; color: #0891b2; font-weight: 600;">${
        step.range ? `[${step.range[0]}, ${step.range[1]}]` : '(全域调度)'
      }</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: #64748b;">操作节点:</span>
      <span style="font-family: monospace; color: #d97706; font-weight: 600;">${step.current != null ? step.current : '—'}</span>
    </div>
  `;
  taskBox.appendChild(taskContent);
  container.appendChild(taskBox);

  // 2. 说明框
  const guardBox = document.createElement('div');
  guardBox.style.cssText =
    'flex: 1; min-height: 120px; padding: 12px; border-radius: 10px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: center; gap: 6px; box-sizing: border-box;';
  guardBox.innerHTML = `
    <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">🛡️ 显式栈防御性工程设计：</div>
    <div style="color: #475569; font-size: 11px; line-height: 1.6; display: flex; flex-direction: column; gap: 4px;">
      <div>• 将系统递归调用栈转化为堆内存显式数据结构。</div>
      <div>• 彻底规避单调降序等极端链化数据导致的 JVM / V8 栈溢出错误 (StackOverflowError)。</div>
      <div>• 任务单元解耦分治拆解与子树挂载逻辑，支持异步中断与逐步推演。</div>
    </div>
  `;
  container.appendChild(guardBox);

  // 3. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * 领域画布与视觉统一门面 (MaxTreeCanvasAdapter)
 */
export class MaxTreeCanvasAdapter {
  static renderCanvas = renderMaxTreeCanvas;
  static renderStage1Metrics = renderStage1CustomMetrics;
  static renderStage2Metrics = renderStage2CustomMetrics;
  static renderStage3Metrics = renderStage3CustomMetrics;
  static renderArrayScanBar = renderArrayScanBar;
  static renderDecisionSummary = renderDecisionSummary;
}
