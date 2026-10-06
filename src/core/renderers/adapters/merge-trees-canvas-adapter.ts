/**
 * 合并二叉树 (Merge Two Binary Trees · LeetCode 617) 视觉与监控适配器
 * Card 1: 主画布三树并排沙盘 (T1 + T2 ➔ Merged Tree)
 * Card 2: 节点合并算式推导 + 递归调用栈 / BFS 同步队列监视器
 */

import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import type { MergeTreesStep } from './merge-trees-step-compiler';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';

export function renderMiniTreeSVG(
  container: HTMLElement,
  root: TreeNode | null,
  focusVal: number | null,
  focusColor: string,
  visitedVals: Set<number>,
  visitedColor: string,
  graftedVals?: Set<number>,
  graftColor = '#9333ea',
  badgeText?: string
): void {
  container.innerHTML = '';
  if (!root) {
    container.innerHTML = `
      <div style="height: 100%; min-height: 180px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #94a3b8; font-size: 12px; font-weight: 500;">
        <span style="font-size: 20px; margin-bottom: 4px; opacity: 0.6;">🌱</span>
        <span>(空树 null)</span>
      </div>
    `;
    return;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 240 210');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const lh = 38;

  const draw = (node: TreeNode, x: number, y: number, spread: number) => {
    const isFocus = focusVal !== null && node.val === focusVal;
    const isGrafted = graftedVals ? graftedVals.has(node.val) : false;
    const isVisited = visitedVals ? visitedVals.has(node.val) : false;

    // 连接线绘制
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread));
      line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isVisited || isFocus ? '#64748b' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    }

    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread));
      line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isVisited || isFocus ? '#64748b' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    }

    // 活跃焦点微光外环 (Pulsing Halo)
    if (isFocus) {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', String(x));
      halo.setAttribute('cy', String(y));
      halo.setAttribute('r', '20');
      halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', focusColor);
      halo.setAttribute('stroke-width', '2');
      halo.setAttribute('stroke-opacity', '0.45');
      halo.setAttribute('stroke-dasharray', '3, 2');
      svg.appendChild(halo);
    }

    // 节点实体圆圈
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '15.5');

    // 现代亮色主题自适应高对比色彩
    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let strokeWidth = '2';
    let textColor = '#0f172a';

    if (isFocus) {
      fill = 'rgba(56, 189, 248, 0.25)';
      stroke = focusColor;
      strokeWidth = '3';
      textColor = focusColor;
    } else if (isGrafted) {
      fill = 'rgba(168, 85, 247, 0.2)';
      stroke = graftColor;
      strokeWidth = '2.5';
      textColor = '#7e22ce';
    } else if (isVisited) {
      fill = 'rgba(34, 197, 94, 0.2)';
      stroke = visitedColor;
      strokeWidth = '2.5';
      textColor = '#15803d';
    }

    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', strokeWidth);
    svg.appendChild(circle);

    // 节点数值文字
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y + 4.5));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12.5');
    text.setAttribute('font-weight', '800');
    text.setAttribute('font-family', "'JetBrains Mono', ui-monospace, monospace");
    text.setAttribute('fill', textColor);
    text.textContent = String(node.val);
    svg.appendChild(text);
  };

  draw(root, 120, 28, 52);

  // 顶部完成徽章 (若存在)
  if (badgeText) {
    const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badge.setAttribute('x', '120');
    badge.setAttribute('y', '9');
    badge.setAttribute('text-anchor', 'middle');
    badge.setAttribute('font-size', '11');
    badge.setAttribute('font-weight', '700');
    badge.setAttribute('fill', '#16a34a');
    badge.textContent = badgeText;
    svg.appendChild(badge);
  }

  container.appendChild(svg);
}

/**
 * Card 1: 主画布三树并排沙盘渲染 (彻底消灭垂直折叠，保证全景横向排布)
 */
export function renderMergeTreesCanvas(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';

  // 强制创建独立横向容器包装，消除外部 CSS flex-direction: column 的影响
  const mainRow = document.createElement('div');
  mainRow.style.cssText = [
    'width: 100%',
    'height: 100%',
    'min-height: 280px',
    'display: flex !important',
    'flex-direction: row !important',
    'align-items: stretch',
    'justify-content: space-between',
    'gap: 8px',
    'padding: 4px',
    'box-sizing: border-box',
    'background: #ffffff',
  ].join(';');

  const isFinalComplete = step.opType === 'complete';

  // 1. 树 1 区域 (T1)
  const col1 = document.createElement('div');
  col1.style.cssText = 'flex: 1; display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; min-width: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';

  const t1Header = document.createElement('div');
  t1Header.style.cssText = 'font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;';
  const t1StatusText = isFinalComplete ? '✓ 全部合并' : (step.focus1 !== null ? `焦点: ${step.focus1}` : '焦点: 无');
  t1Header.innerHTML = `<span>🌳 输入树 1</span><span style="font-size: 11px; font-weight: 600; color: ${isFinalComplete ? '#16a34a' : '#64748b'};">${t1StatusText}</span>`;
  col1.appendChild(t1Header);

  const t1TreeBox = document.createElement('div');
  t1TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(t1TreeBox, step.tree1, step.focus1, '#0284c7', step.tree1Visited, '#16a34a', step.graftedVals);
  col1.appendChild(t1TreeBox);

  // 2. 加号操作符
  const opPlus = document.createElement('div');
  opPlus.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #94a3b8; width: 24px; flex-shrink: 0; user-select: none;';
  opPlus.textContent = '+';

  // 3. 树 2 区域 (T2)
  const col2 = document.createElement('div');
  col2.style.cssText = 'flex: 1; display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; min-width: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';

  const t2Header = document.createElement('div');
  t2Header.style.cssText = 'font-size: 12px; font-weight: 700; color: #9333ea; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;';
  const t2StatusText = isFinalComplete ? '✓ 全部合并' : (step.focus2 !== null ? `焦点: ${step.focus2}` : '焦点: 无');
  t2Header.innerHTML = `<span>🌿 输入树 2</span><span style="font-size: 11px; font-weight: 600; color: ${isFinalComplete ? '#16a34a' : '#64748b'};">${t2StatusText}</span>`;
  col2.appendChild(t2Header);

  const t2TreeBox = document.createElement('div');
  t2TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(t2TreeBox, step.tree2, step.focus2, '#9333ea', step.tree2Visited, '#16a34a', step.graftedVals);
  col2.appendChild(t2TreeBox);

  // 4. 等号/箭头操作符
  const opArrow = document.createElement('div');
  opArrow.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #16a34a; width: 24px; flex-shrink: 0; user-select: none;';
  opArrow.textContent = '➔';

  // 5. 合并结果树区域 (Merged)
  const col3 = document.createElement('div');
  col3.style.cssText = 'flex: 1.25; display: flex; flex-direction: column; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 8px; min-width: 0; box-shadow: 0 1px 3px rgba(34,197,94,0.08);';

  const t3Header = document.createElement('div');
  t3Header.style.cssText = 'font-size: 12px; font-weight: 700; color: #15803d; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;';
  const t3StatusText = isFinalComplete ? '🏆 100% 完成' : (step.sum !== null ? `当前生成: ${step.sum}` : '等待就绪');
  t3Header.innerHTML = `<span>✨ 合并演进树</span><span style="font-size: 11px; font-weight: 700; color: #16a34a;">${t3StatusText}</span>`;
  col3.appendChild(t3Header);

  const t3TreeBox = document.createElement('div');
  t3TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(
    t3TreeBox,
    step.mergedTree,
    step.focusMerged,
    '#eab308',
    step.highlightedMergedVals,
    '#16a34a',
    step.graftedVals,
    '#9333ea',
    isFinalComplete ? '🏆 完成' : undefined
  );
  col3.appendChild(t3TreeBox);

  mainRow.appendChild(col1);
  mainRow.appendChild(opPlus);
  mainRow.appendChild(col2);
  mainRow.appendChild(opArrow);
  mainRow.appendChild(col3);

  container.appendChild(mainRow);
}

/**
 * Card 2: 辅助推演动态与状态卡片
 */
export function renderMergeTreesCard2(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  container.style.padding = '4px 2px';

  const isFinalComplete = step.opType === 'complete';

  // 1. 算式推演视窗
  const formulaBox = document.createElement('div');
  formulaBox.style.background = '#f8fafc';
  formulaBox.style.border = '1px solid #e2e8f0';
  formulaBox.style.borderRadius = '8px';
  formulaBox.style.padding = '8px 10px';

  const formulaTitle = document.createElement('div');
  formulaTitle.style.fontSize = '11px';
  formulaTitle.style.fontWeight = '700';
  formulaTitle.style.color = '#475569';
  formulaTitle.style.marginBottom = '4px';
  formulaTitle.textContent = '📐 节点合并算式推导';
  formulaBox.appendChild(formulaTitle);

  const formulaRow = document.createElement('div');
  formulaRow.style.display = 'flex';
  formulaRow.style.alignItems = 'center';
  formulaRow.style.gap = '8px';
  formulaRow.style.fontFamily = "'JetBrains Mono', ui-monospace, monospace";
  formulaRow.style.fontSize = '12.5px';
  formulaRow.style.fontWeight = '700';

  if (isFinalComplete) {
    formulaRow.innerHTML = `
      <span style="color: #16a34a; background: #dcfce7; padding: 3px 10px; border-radius: 4px; border: 1px solid #86efac;">
        🎉 两棵二叉树同步遍历合并成功完成！全树所有对应节点累加与单边继承已全部就绪。
      </span>
    `;
  } else if (step.val1 !== null && step.val2 !== null && step.sum !== null) {
    formulaRow.innerHTML = `
      <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd;">T1: ${step.val1}</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e9d5ff;">T2: ${step.val2}</span>
      <span style="color: #16a34a;">=</span>
      <span style="color: #854d0e; background: #fef9c3; padding: 2px 8px; border-radius: 4px; border: 1px solid #fde047;">合并新节点: ${step.sum}</span>
    `;
  } else if (step.val1 !== null && step.val2 === null) {
    formulaRow.innerHTML = `
      <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd;">T1: ${step.val1}</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #94a3b8;">null</span>
      <span style="color: #16a34a;">➜</span>
      <span style="color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 4px;">单边保留 T1 子树 (根节点 ${step.val1})</span>
    `;
  } else if (step.val1 === null && step.val2 !== null) {
    formulaRow.innerHTML = `
      <span style="color: #94a3b8;">null</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e9d5ff;">T2: ${step.val2}</span>
      <span style="color: #16a34a;">➜</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px;">单边嫁接 T2 子树 (根节点 ${step.val2})</span>
    `;
  } else {
    formulaRow.innerHTML = `<span style="color: #64748b;">(准备启动同步遍历)</span>`;
  }
  formulaBox.appendChild(formulaRow);
  container.appendChild(formulaBox);

  // 2. 状态队列/调用栈沙盘
  if (step.queueState && step.queueState.length > 0) {
    const qBox = document.createElement('div');
    qBox.style.background = '#f8fafc';
    qBox.style.border = '1px solid #e2e8f0';
    qBox.style.borderRadius = '8px';
    qBox.style.padding = '8px 10px';

    const qTitle = document.createElement('div');
    qTitle.style.fontSize = '11px';
    qTitle.style.fontWeight = '700';
    qTitle.style.color = '#475569';
    qTitle.style.marginBottom = '4px';
    qTitle.textContent = `📋 BFS 待处理节点对队列 (Size: ${step.queueState.length})`;
    qBox.appendChild(qTitle);

    const qRow = document.createElement('div');
    qRow.style.display = 'flex';
    qRow.style.flexWrap = 'wrap';
    qRow.style.gap = '6px';

    step.queueState.forEach((item, idx) => {
      const pill = document.createElement('span');
      pill.style.padding = '2px 8px';
      pill.style.borderRadius = '4px';
      pill.style.fontSize = '11px';
      pill.style.fontFamily = "'JetBrains Mono', ui-monospace, monospace";
      pill.style.fontWeight = '600';
      if (idx === 0) {
        pill.style.background = '#fef9c3';
        pill.style.border = '1px solid #facc15';
        pill.style.color = '#854d0e';
        pill.textContent = `${item} (头)`;
      } else {
        pill.style.background = '#ffffff';
        pill.style.border = '1px solid #cbd5e1';
        pill.style.color = '#334155';
        pill.textContent = item;
      }
      qRow.appendChild(pill);
    });
    qBox.appendChild(qRow);
    container.appendChild(qBox);
  }

  // 3. 递归调用推演栈 (DFS)
  if (step.callTrace) {
    const traceHost = document.createElement('div');
    traceHost.className = 'merge-trees-trace-host';
    traceHost.style.cssText = 'flex: 1; min-height: 140px; overflow: hidden;';
    container.appendChild(traceHost);
    RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
      title: '📜 递归 DFS 同步下潜调用推演栈',
      theme: 'light',
      maxHeight: '100%',
      showTerminalHeader: true,
    });
  }

  // 4. 步骤决策与动态解释
  const summaryBox = document.createElement('div');
  summaryBox.style.background = isFinalComplete ? '#f0fdf4' : '#f8fafc';
  summaryBox.style.padding = '8px 10px';
  summaryBox.style.borderRadius = '8px';
  summaryBox.style.border = isFinalComplete ? '1px solid #86efac' : '1px solid #e2e8f0';
  summaryBox.style.fontSize = '12px';
  summaryBox.style.lineHeight = '1.5';
  summaryBox.style.color = '#334155';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: ${isFinalComplete ? '#16a34a' : '#0284c7'}; margin-bottom: 2px;">⚡ 当前操作动作</div>
    <div style="color: #0f172a;">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// ----------------------------------------------------
// 注册声明式多阶段二叉树合并算法
// ----------------------------------------------------

export class MergeTreesCanvasAdapter {
  public static renderMiniTreeSVG = renderMiniTreeSVG;
  public static renderCanvas = renderMergeTreesCanvas;
  public static renderCard2 = renderMergeTreesCard2;
}
