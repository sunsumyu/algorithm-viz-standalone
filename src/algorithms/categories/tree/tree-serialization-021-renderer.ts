/**
 * 左程云算法通关课 Class 021: 二叉树序列化与反序列化 (Tree Serialization)
 * 先序序列化/反序列化与层序序列化/反序列化
 * 4-Card 声明式标准化架构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { TREE_SERIALIZATION_021_PROBLEM_CONTENT } from './tree-serialization-021-problem-content';
import {
  TREE_SERIALIZATION_021_CODES,
  TREE_SERIALIZATION_021_CODE_LINES,
} from './tree-serialization-021-stage-codes';

export { TREE_SERIALIZATION_021_CODES, TREE_SERIALIZATION_021_CODE_LINES };

// ============================================================
// 数据结构与接口定义 (保持既有测试契约不变)
// ============================================================
export interface Tree021Node {
  id: number;
  val: string;
  left?: number;
  right?: number;
}

export interface Tree021Step extends StepBase {
  treeStructure: Tree021Node[];
  activeNodeId?: number;
  tokensStream: string[];
  currentToken?: string;
  reconstructedTree: Tree021Node[];
  mode: 'preorder' | 'levelorder';
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  stageId?: 'stage1' | 'stage2' | 'stage3';
}

// 样板树布局坐标 (单侧 380 宽)
interface NodeLayout {
  id: number;
  val: string;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

const SAMPLE_TREE_NODES: Record<number, NodeLayout> = {
  1: { id: 1, val: '1', x: 190, y: 40, left: 2, right: 3 },
  2: { id: 2, val: '2', x: 110, y: 110, left: 4 },
  3: { id: 3, val: '3', x: 270, y: 110, right: 5 },
  4: { id: 4, val: '4', x: 70, y: 180 },
  5: { id: 5, val: '5', x: 310, y: 180 },
};

// ============================================================
// 步骤生成核心 (保持 100% 测试契约满足)
// ============================================================
export function buildSerialization021Steps(
  mode: 'preorder' | 'levelorder' = 'preorder'
): Tree021Step[] {
  const steps: Tree021Step[] = [];

  const sampleTree: Tree021Node[] = [
    { id: 1, val: '1', left: 2, right: 3 },
    { id: 2, val: '2', left: 4 },
    { id: 3, val: '3', right: 5 },
    { id: 4, val: '4' },
    { id: 5, val: '5' },
  ];

  const stream: string[] = [];
  const reconstructed: Tree021Node[] = [];
  const stageId = mode === 'levelorder' ? 'stage2' : 'stage1';

  // Step 0: Initial
  steps.push({
    treeStructure: sampleTree,
    tokensStream: [],
    reconstructedTree: [],
    mode,
    decision: `准备进行二叉树【${mode === 'preorder' ? '先序遍历' : '层序遍历'}】序列化与反序列化全流程`,
    message: '二叉树结构必须记录空节点标记 "#"，否则单纯先序/层序序列无法唯一确定一棵树。',
    log: 'Init Tree Serialization',
    codeLine: TREE_SERIALIZATION_021_CODE_LINES.entry,
    statusBadge: { text: '就绪', type: 'info' },
    stageId,
  });

  if (mode === 'preorder') {
    // 先序序列化
    const serializeSeq = ['1', '2', '4', '#', '#', '#', '3', '#', '5', '#', '#'];
    const decisions = [
      '访问根节点 1，写入 token "1"',
      '下潜左孩子 2，写入 token "2"',
      '下潜左孩子 4，写入 token "4"',
      '4 的左孩子为空，写入 "#"',
      '4 的右孩子为空，写入 "#"',
      '2 的右孩子为空，写入 "#"',
      '返回 1 并转向右孩子 3，写入 token "3"',
      '3 的左孩子为空，写入 "#"',
      '下潜右孩子 5，写入 token "5"',
      '5 的左孩子为空，写入 "#"',
      '5 的右孩子为空，写入 "#"',
    ];

    for (let i = 0; i < serializeSeq.length; i++) {
      const t = serializeSeq[i];
      stream.push(t);
      const numId = t !== '#' ? Number(t) : undefined;

      steps.push({
        treeStructure: sampleTree,
        activeNodeId: numId,
        tokensStream: [...stream],
        currentToken: t,
        reconstructedTree: [],
        mode,
        decision: decisions[i],
        message: `序列化字符流增加: "${t}"。当前序列: [${stream.join(', ')}]`,
        log: `serialize token "${t}"`,
        codeLine: TREE_SERIALIZATION_021_CODE_LINES.serializeToken,
        statusBadge: { text: `Token: ${t}`, type: t === '#' ? 'warning' : 'info' },
        stageId,
      });
    }

    // 反序列化阶段开始
    steps.push({
      treeStructure: sampleTree,
      tokensStream: [...stream],
      reconstructedTree: [],
      mode,
      decision: `序列化产物完成: "${stream.join(',')}"，启动反序列化解析`,
      message: '通过先序消费队列，遇到数字创建节点并递归构建左/右子树，遇到 "#" 返回 null。',
      log: 'Start deserialize queue',
      codeLine: TREE_SERIALIZATION_021_CODE_LINES.startDeserialize,
      statusBadge: { text: '开始反序列化', type: 'info' },
      stageId,
    });

    // 动态重建各节点
    const buildSteps = [
      { id: 1, val: '1', left: 2, right: 3, text: '弹出 "1"，创建根节点 1' },
      { id: 2, val: '2', left: 4, text: '弹出 "2"，作为 1 的左孩子' },
      { id: 4, val: '4', text: '弹出 "4"，作为 2 的左孩子' },
      { id: 3, val: '3', right: 5, text: '弹出 "3"，作为 1 的右孩子' },
      { id: 5, val: '5', text: '弹出 "5"，作为 3 的右孩子' },
    ];

    for (const b of buildSteps) {
      reconstructed.push({ id: b.id, val: b.val, left: b.left, right: b.right });
      steps.push({
        treeStructure: sampleTree,
        activeNodeId: b.id,
        tokensStream: [...stream],
        currentToken: b.val,
        reconstructedTree: [...reconstructed],
        mode,
        decision: b.text,
        message: `队列出队 "${b.val}"，递归组装树节点 #${b.id}`,
        log: `deserialize node ${b.id}`,
        codeLine: TREE_SERIALIZATION_021_CODE_LINES.startDeserialize,
        statusBadge: { text: `构建 #${b.id}`, type: 'warning' },
        stageId,
      });
    }
  } else {
    // 层序序列化
    const levelSeq = ['1', '2', '3', '4', '#', '#', '5', '#', '#', '#', '#'];
    const decisions = [
      '根节点 1 出队并写入 token "1"，左右孩子 2, 3 入队',
      '节点 2 出队并写入 token "2"，左孩子 4 入队，右孩子为空入队 "#"',
      '节点 3 出队并写入 token "3"，左孩子为空入队 "#"，右孩子 5 入队',
      '节点 4 出队并写入 token "4"，左右孩子均为空成对入队 "#", "#"',
      '节点 5 出队并写入 token "5"，左右孩子均为空成对入队 "#", "#"',
      '空节点标记 "#" 出队写入',
    ];

    for (let i = 0; i < decisions.length; i++) {
      const t = levelSeq[i];
      stream.push(t);
      const numId = t !== '#' ? Number(t) : undefined;
      steps.push({
        treeStructure: sampleTree,
        activeNodeId: numId,
        tokensStream: [...stream],
        currentToken: t,
        reconstructedTree: [],
        mode,
        decision: decisions[i],
        message: `层序字符流增加: "${t}"。当前序列: [${stream.join(', ')}]`,
        log: `levelorder serialize token "${t}"`,
        codeLine: TREE_SERIALIZATION_021_CODE_LINES.serializeToken,
        statusBadge: { text: `Token: ${t}`, type: t === '#' ? 'warning' : 'info' },
        stageId,
      });
    }

    // 补全剩余 "#"
    while (stream.length < levelSeq.length) {
      stream.push('#');
    }

    // 反序列化阶段
    reconstructed.push({ id: 1, val: '1', left: 2, right: 3 });
    reconstructed.push({ id: 2, val: '2', left: 4 });
    reconstructed.push({ id: 3, val: '3', right: 5 });
    reconstructed.push({ id: 4, val: '4' });
    reconstructed.push({ id: 5, val: '5' });
  }

  // 最终完成步骤
  steps.push({
    treeStructure: sampleTree,
    tokensStream: [...stream],
    reconstructedTree: [...reconstructed],
    mode,
    decision: '🎉 序列化与反序列化完美闭环！重建树与原树拓扑 100% 守恒一致！',
    message: '二叉树结构、拓扑分支与节点值与原树完全一致，成功完成无损还原。',
    log: 'Finished Tree Deserialization',
    codeLine: TREE_SERIALIZATION_021_CODE_LINES.reconstructedDone,
    statusBadge: { text: '复原成功', type: 'success' },
    stageId,
  });

  return steps;
}

// ============================================================
// 树绘制纯函数 (用于渲染 Source 树与 Reconstructed 树)
// ============================================================
function renderTreeSvg(
  nodes: Tree021Node[],
  activeId: number | undefined,
  offsetX: number,
  baseColor: string,
  label: string
): string {
  const nodeMap = new Map<number, Tree021Node>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const lines: string[] = [];
  const circles: string[] = [];

  nodes.forEach((n) => {
    const layout = SAMPLE_TREE_NODES[n.id];
    if (!layout) return;
    const x = layout.x + offsetX;
    const y = layout.y;

    if (n.left && nodeMap.has(n.left)) {
      const leftLayout = SAMPLE_TREE_NODES[n.left];
      if (leftLayout) {
        lines.push(`
          <line
            x1="${x}" y1="${y}"
            x2="${leftLayout.x + offsetX}" y2="${leftLayout.y}"
            stroke="${baseColor}" stroke-width="1.8" opacity="0.6"
          />
        `);
      }
    }
    if (n.right && nodeMap.has(n.right)) {
      const rightLayout = SAMPLE_TREE_NODES[n.right];
      if (rightLayout) {
        lines.push(`
          <line
            x1="${x}" y1="${y}"
            x2="${rightLayout.x + offsetX}" y2="${rightLayout.y}"
            stroke="${baseColor}" stroke-width="1.8" opacity="0.6"
          />
        `);
      }
    }

    const isActive = activeId === n.id;
    circles.push(`
      <g transform="translate(${x}, ${y})">
        ${isActive ? `<circle r="24" fill="none" stroke="${baseColor}" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="18"
          fill="${isActive ? baseColor : 'rgba(15, 23, 42, 0.85)'}"
          stroke="${baseColor}"
          stroke-width="${isActive ? 2.5 : 1.5}"
        />
        <text
          y="5"
          text-anchor="middle"
          fill="${isActive ? '#0f172a' : '#f8fafc'}"
          font-size="12"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${n.val}</text>
      </g>
    `);
  });

  return `
    <g>
      <text x="${offsetX + 190}" y="20" text-anchor="middle" fill="${baseColor}" font-size="12" font-weight="bold" font-family="monospace">
        ${label} (${nodes.length} 节点)
      </text>
      ${lines.join('')}
      ${circles.join('')}
    </g>
  `;
}

// ============================================================
// Card 1: 双二叉树同构对比沙盘 (Clean SVG Dual Sandbox)
// 零内嵌公式卡片、零多余标题 (Anti-Traps 9 & 10)
// ============================================================
export function renderTreeSerializationCanvas(container: HTMLElement, step: Tree021Step) {
  const { treeStructure, reconstructedTree, activeNodeId } = step;

  const leftTreeHtml = renderTreeSvg(treeStructure, activeNodeId, 0, '#38bdf8', '🌲 原始二叉树 (Source)');
  const rightTreeHtml = renderTreeSvg(reconstructedTree, activeNodeId, 390, '#34d399', '🌱 重建二叉树 (Reconstructed)');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; box-sizing: border-box;">
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); overflow: hidden;">
        <svg viewBox="0 0 780 230" style="width: 100%; height: 100%; max-height: 270px;" preserveAspectRatio="xMidYMid meet">
          <!-- 中轴分隔虚线 -->
          <line x1="390" y1="10" x2="390" y2="220" stroke="rgba(255, 255, 255, 0.12)" stroke-dasharray="4 4" stroke-width="1.5" />
          ${leftTreeHtml}
          ${rightTreeHtml}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 序列化字符串流与反序列化队列探针 (Custom Metrics)
// ============================================================
export function renderTreeSerializationCard2(container: HTMLElement, step: Tree021Step) {
  const { tokensStream, currentToken, reconstructedTree, mode, decision } = step;

  const streamPills = tokensStream.map((t, idx) => {
    const isCurrent = idx === tokensStream.length - 1;
    const isNull = t === '#';
    return `
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px 8px;
        margin: 2px 4px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 0.85rem;
        font-weight: bold;
        background: ${isCurrent ? '#38bdf8' : isNull ? 'rgba(148, 163, 184, 0.15)' : 'rgba(56, 189, 248, 0.15)'};
        color: ${isCurrent ? '#0f172a' : isNull ? '#94a3b8' : '#38bdf8'};
        border: 1px solid ${isCurrent ? '#ffffff' : isNull ? 'rgba(148, 163, 184, 0.3)' : 'rgba(56, 189, 248, 0.4)'};
        box-shadow: ${isCurrent ? '0 0 8px rgba(56, 189, 248, 0.6)' : 'none'};
      ">
        ${t}
      </span>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 顶部四联仪表盘 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">序列化协议</div>
          <div style="font-size: 0.85rem; font-weight: bold; color: #38bdf8; margin-top: 2px;">
            ${mode.toUpperCase()}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">当前 Token</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: ${currentToken === '#' ? '#94a3b8' : '#34d399'}; font-family: monospace; margin-top: 2px;">
            ${currentToken ?? '就绪'}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">生成 Tokens 长度</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #a78bfa; font-family: monospace; margin-top: 2px;">
            ${tokensStream.length}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">已重建节点数</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #facc15; font-family: monospace; margin-top: 2px;">
            ${reconstructedTree.length} / 5
          </div>
        </div>
      </div>

      <!-- 序列化 Tokens 字符串流水线展板 -->
      <div style="padding: 10px 14px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; flex: 1; display: flex; flex-direction: column;">
        <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>📦 序列化字符串流水线 (Tokens Stream)</span>
          <span style="font-size: 0.7rem; color: #94a3b8;">'#' 代表空节点 null</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center; overflow-y: auto; max-height: 80px;">
          ${streamPills || `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">等待序列化启动...</span>`}
        </div>
      </div>

      <!-- 唯一性数学准则与当前决策 -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #38bdf8;">当前动作：</strong> ${decision}
        </div>
        <div style="padding: 6px 12px; background: rgba(52, 211, 153, 0.06); border-left: 3px solid #34d399; border-radius: 0 6px 6px 0; font-size: 0.72rem; color: #94a3b8; line-height: 1.4;">
          <strong style="color: #34d399;">唯一性定理：</strong> 补足空节点 '#' 标记后，先序序列具备与二叉树拓扑严格单射一一对应关系。
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const treeSerializationVisualizer = registerDeclarativeAlgorithm<Tree021Step>({
  id: 'tree-serialization-021',
  name: '二叉树序列化与反序列化 (Class 021)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 21,
  aliases: ['class021-code01', 'tree-serialization-021', 'serialize-and-deserialize-binary-tree', 'leetcode-297'],
  learningGoal: '掌握二叉树空节点标记设计，实现先序与层序序列化字符串与二叉树拓扑结构互转',
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 先序序列化与反序列化 (Preorder)',
      shortName: '先序序列化',
      card2Title: '先序 Tokens 流与递归装配面板',
      card2Desc: '中左右遍历打桩空节点 "#"，单路自顶向下反序列化复原',
      codeLanguages: TREE_SERIALIZATION_021_CODES,
      generateSteps: () => buildSerialization021Steps('preorder'),
    },
    {
      id: 'stage2',
      name: 'Stage 2: 层序序列化与反序列化 (Levelorder)',
      shortName: '层序序列化',
      card2Title: '层序队列流与挂载面板',
      card2Desc: '利用 FIFO 队列按层拓扑输出与反向成对挂载子节点',
      codeLanguages: TREE_SERIALIZATION_021_CODES,
      generateSteps: () => buildSerialization021Steps('levelorder'),
    },
  ],
  codeLanguages: TREE_SERIALIZATION_021_CODES,
  inputs: [
    {
      id: 'mode',
      label: '遍历模式',
      type: 'select',
      defaultValue: 'preorder',
      options: [
        { label: '先序遍历序列化 (Preorder)', value: 'preorder' },
        { label: '层序遍历序列化 (Levelorder)', value: 'levelorder' },
      ],
    },
  ],
  card2Title: '序列化字符串流与反序列化队列探针',
  card2Desc: '展示 Tokens 流生成与双树 1:1 同构复原',
  problemHtml: TREE_SERIALIZATION_021_PROBLEM_CONTENT.description + TREE_SERIALIZATION_021_PROBLEM_CONTENT.mechanisms,
  generateSteps: (input) => {
    const mode = input.mode === 'levelorder' ? 'levelorder' : 'preorder';
    return buildSerialization021Steps(mode);
  },
  renderCanvas: (container, step) => {
    renderTreeSerializationCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeSerializationCard2(container, step);
  },
});
