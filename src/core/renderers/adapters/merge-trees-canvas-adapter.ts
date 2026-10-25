/**
 * 合并二叉树 (Merge Two Binary Trees · LeetCode 617) 视觉与监控适配器
 *
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约：
 *   - Card 1: 主画布三树并排沙盘 (T1 + T2 ➔ Merged Tree)，基于拓扑路径精准寻址高亮，杜绝同值节点串色
 *   - Card 2: 节点合并算式推导 + 当前递归帧明细 + 递归调用栈 / BFS 队列全景监视器 (消除大片空白)
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
  badgeText?: string,
  focusPath?: string
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
  svg.setAttribute('viewBox', '0 0 240 220');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  // 舒展的树形层距，避免分支紧贴水平线
  const lh = 46;

  const draw = (node: TreeNode, x: number, y: number, spread: number, curPath: string) => {
    // 🌟 核心高亮不变式：优先基于拓扑唯一路径匹配，彻底根除同值节点（如两个 5）双焦点串色冲突！
    const isFocus =
      focusPath !== undefined && focusPath !== null
        ? curPath === focusPath
        : focusVal !== null && node.val === focusVal;

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
      draw(node.left, x - spread, y + lh, spread / 2, `${curPath}/L`);
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
      draw(node.right, x + spread, y + lh, spread / 2, `${curPath}/R`);
    }

    // 活跃焦点微光外环 (Pulsing Halo)
    if (isFocus) {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', String(x));
      halo.setAttribute('cy', String(y));
      halo.setAttribute('r', '21');
      halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', focusColor);
      halo.setAttribute('stroke-width', '2.5');
      halo.setAttribute('stroke-opacity', '0.75');
      halo.setAttribute('stroke-dasharray', '4, 2');
      svg.appendChild(halo);
    }

    // 节点实体圆圈
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '15.5');

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

  draw(root, 120, 26, 54, 'root');

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
 * Card 1: 主画布三树并排沙盘渲染 (去套娃、轻量扁平、横向舒展)
 */
export function renderMergeTreesCanvas(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';

  const mainRow = document.createElement('div');
  mainRow.style.cssText =
    'width: 100%; height: 100%; display: flex; flex-direction: row; align-items: stretch; justify-content: space-between; gap: 8px; padding: 8px; box-sizing: border-box; background: #ffffff; border-radius: 12px;';

  const isFinalComplete = step.opType === 'complete';

  // 1. 树 1 区域 (T1)
  const col1 = document.createElement('div');
  col1.style.cssText =
    'flex: 1; display: flex; flex-direction: column; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; min-width: 0; box-sizing: border-box;';

  const t1Header = document.createElement('div');
  t1Header.style.cssText =
    'font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;';
  const t1StatusText = isFinalComplete
    ? '✓ 全部合并'
    : step.focus1 !== null
    ? `焦点: ${step.focus1}`
    : '焦点: 无';
  t1Header.innerHTML = `<span>🌳 输入树 1</span><span style="font-size: 11px; font-weight: 600; color: ${isFinalComplete ? '#16a34a' : '#64748b'};">${t1StatusText}</span>`;
  col1.appendChild(t1Header);

  const t1TreeBox = document.createElement('div');
  t1TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(
    t1TreeBox,
    step.tree1,
    step.focus1,
    '#0284c7',
    step.tree1Visited,
    '#16a34a',
    step.graftedVals,
    '#9333ea',
    undefined,
    step.focus1Path
  );
  col1.appendChild(t1TreeBox);

  // 2. 加号操作符
  const opPlus = document.createElement('div');
  opPlus.style.cssText =
    'display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #94a3b8; width: 24px; flex-shrink: 0; user-select: none;';
  opPlus.textContent = '+';

  // 3. 树 2 区域 (T2)
  const col2 = document.createElement('div');
  col2.style.cssText =
    'flex: 1; display: flex; flex-direction: column; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; min-width: 0; box-sizing: border-box;';

  const t2Header = document.createElement('div');
  t2Header.style.cssText =
    'font-size: 12px; font-weight: 700; color: #9333ea; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;';
  const t2StatusText = isFinalComplete
    ? '✓ 全部合并'
    : step.focus2 !== null
    ? `焦点: ${step.focus2}`
    : '焦点: 无';
  t2Header.innerHTML = `<span>🌿 输入树 2</span><span style="font-size: 11px; font-weight: 600; color: ${isFinalComplete ? '#16a34a' : '#64748b'};">${t2StatusText}</span>`;
  col2.appendChild(t2Header);

  const t2TreeBox = document.createElement('div');
  t2TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(
    t2TreeBox,
    step.tree2,
    step.focus2,
    '#9333ea',
    step.tree2Visited,
    '#16a34a',
    step.graftedVals,
    '#9333ea',
    undefined,
    step.focus2Path
  );
  col2.appendChild(t2TreeBox);

  // 4. 等号/箭头操作符
  const opArrow = document.createElement('div');
  opArrow.style.cssText =
    'display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: #16a34a; width: 24px; flex-shrink: 0; user-select: none;';
  opArrow.textContent = '➔';

  // 5. 合并结果树区域 (Merged Tree)
  const col3 = document.createElement('div');
  col3.style.cssText =
    'flex: 1.25; display: flex; flex-direction: column; padding: 8px; border-radius: 8px; background: #f0fdf4; border: 1px solid #86efac; min-width: 0; box-sizing: border-box;';

  const t3Header = document.createElement('div');
  t3Header.style.cssText =
    'font-size: 12px; font-weight: 700; color: #15803d; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;';
  const t3StatusText = isFinalComplete
    ? '🏆 100% 完成'
    : step.sum !== null
    ? `当前生成: ${step.sum}`
    : '等待就绪';
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
    isFinalComplete ? '🏆 完成' : undefined,
    step.focusPath
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
 * Card 2: 辅助推演动态与状态卡片 (充实饱满，消除大面积空白)
 */
export function renderMergeTreesCard2(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';
  container.style.cssText = 'height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 8px; overflow-y: auto; box-sizing: border-box; font-size: 12px; font-family: system-ui, -apple-system, sans-serif;';

  const isFinalComplete = step.opType === 'complete';

  // 1. 顶部：节点合并算式推导卡片
  const formulaBox = document.createElement('div');
  formulaBox.style.cssText =
    'padding: 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';

  const formulaTitle = document.createElement('div');
  formulaTitle.style.cssText = 'font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px; display: flex; align-items: gap: 4px;';
  formulaTitle.innerHTML = '<span>📐 节点合并算式推导</span>';
  formulaBox.appendChild(formulaTitle);

  const formulaRow = document.createElement('div');
  formulaRow.style.cssText = 'display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 12px; font-weight: 700; flex-wrap: wrap;';

  if (isFinalComplete) {
    formulaRow.innerHTML = `
      <span style="color: #15803d; background: #dcfce7; padding: 4px 10px; border-radius: 6px; border: 1px solid #86efac;">
        🎉 两棵二叉树同步遍历合并成功完成！全树所有对应节点累加与单边继承已全部就绪。
      </span>
    `;
  } else if (step.val1 !== null && step.val2 !== null && step.sum !== null) {
    formulaRow.innerHTML = `
      <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #7dd3fc;">T1: ${step.val1}</span>
      <span style="color: #94a3b8;">+</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #d8b4fe;">T2: ${step.val2}</span>
      <span style="color: #16a34a;">=</span>
      <span style="color: #92400e; background: #fef3c7; padding: 2px 8px; border-radius: 4px; border: 1px solid #fcd34d;">合并新节点: ${step.sum}</span>
    `;
  } else if (step.val1 !== null && step.val2 === null) {
    formulaRow.innerHTML = `
      <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #7dd3fc;">T1: ${step.val1}</span>
      <span style="color: #94a3b8;">+</span>
      <span style="color: #94a3b8;">null</span>
      <span style="color: #16a34a;">➜</span>
      <span style="color: #15803d; background: #f0fdf4; padding: 2px 8px; border-radius: 4px; border: 1px solid #bbf7d0;">单边保留 T1 子树 (根节点 ${step.val1})</span>
    `;
  } else if (step.val1 === null && step.val2 !== null) {
    formulaRow.innerHTML = `
      <span style="color: #94a3b8;">null</span>
      <span style="color: #94a3b8;">+</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #d8b4fe;">T2: ${step.val2}</span>
      <span style="color: #16a34a;">➜</span>
      <span style="color: #7e22ce; background: #faf5ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e9d5ff;">单边嫁接 T2 子树 (根节点 ${step.val2})</span>
    `;
  } else {
    formulaRow.innerHTML = `<span style="color: #94a3b8;">(准备启动同步遍历)</span>`;
  }
  formulaBox.appendChild(formulaRow);
  container.appendChild(formulaBox);

  // 2. 中部：当前递归帧状态明细卡 (Current Frame Detail)
  const frameCard = document.createElement('div');
  frameCard.style.cssText =
    'padding: 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';
  frameCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; font-size: 11px; font-weight: 600; color: #334155;">
      <span style="display: flex; align-items: center; gap: 4px;">🧭 递归帧状态明细 (Stack Frame)</span>
      <span style="font-family: monospace; color: #0d9488;">Depth: ${step.depth} | Path: ${step.focusPath ?? 'root'}</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px; font-family: monospace;">
      <div style="padding: 6px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a;">
        <span style="color: #64748b;">T1 指针:</span> <span style="font-weight: 700;">${step.val1 !== null ? `Node(${step.val1})` : 'null'}</span>
      </div>
      <div style="padding: 6px 8px; border-radius: 6px; background: #faf5ff; border: 1px solid #e9d5ff; color: #581c87;">
        <span style="color: #64748b;">T2 指针:</span> <span style="font-weight: 700;">${step.val2 !== null ? `Node(${step.val2})` : 'null'}</span>
      </div>
    </div>
  `;
  container.appendChild(frameCard);

  // 3. 下部：BFS 队列状态 OR 递归调用推演树 (自适应撑满剩余高度)
  if (step.queueState && step.queueState.length > 0) {
    const qBox = document.createElement('div');
    qBox.style.cssText =
      'padding: 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;';

    const qTitle = document.createElement('div');
    qTitle.style.cssText = 'font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;';
    qTitle.textContent = `📋 BFS 待处理节点对队列 (Size: ${step.queueState.length})`;
    qBox.appendChild(qTitle);

    const qRow = document.createElement('div');
    qRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; align-items: center;';

    step.queueState.forEach((item, idx) => {
      const pill = document.createElement('span');
      const isFirst = idx === 0;
      pill.style.cssText = `padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 600; ${
        isFirst
          ? 'background: #fef3c7; border: 1px solid #f59e0b; color: #92400e;'
          : 'background: #ffffff; border: 1px solid #cbd5e1; color: #334155;'
      }`;
      pill.textContent = isFirst ? `${item} (头)` : item;
      qRow.appendChild(pill);
    });
    qBox.appendChild(qRow);
    container.appendChild(qBox);
  } else if (step.callTrace) {
    const traceHost = document.createElement('div');
    traceHost.className = 'merge-trees-trace-host';
    traceHost.style.cssText =
      'flex: 1; min-height: 140px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; flex-direction: column; box-sizing: border-box;';
    container.appendChild(traceHost);
    RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
      title: '📜 递归 DFS 同步下潜调用推演栈',
      theme: 'light',
      maxHeight: '100%',
      showTerminalHeader: true,
    });
  }

  // 4. 底部：当前步骤决策动态解释
  const summaryBox = document.createElement('div');
  summaryBox.style.cssText = `padding: 10px; border-radius: 10px; border: 1px solid ${
    isFinalComplete ? '#86efac' : '#e2e8f0'
  }; font-size: 12px; line-height: 1.5; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); background: ${
    isFinalComplete ? '#f0fdf4' : '#f8fafc'
  }; color: ${isFinalComplete ? '#166534' : '#334155'}; box-sizing: border-box;`;
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: ${
      isFinalComplete ? '#15803d' : '#0284c7'
    }; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
      <span>⚡ 操作决策: ${step.opType}</span>
    </div>
    <div style="color: ${isFinalComplete ? '#15803d' : '#334155'};">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

export class MergeTreesCanvasAdapter {
  public static renderMiniTreeSVG = renderMiniTreeSVG;
  public static renderCanvas = renderMergeTreesCanvas;
  public static renderCard2 = renderMergeTreesCard2;
}
