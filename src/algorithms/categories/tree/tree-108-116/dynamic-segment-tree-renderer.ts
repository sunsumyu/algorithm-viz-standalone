/**
 * Class 111: 动态开点线段树 (Dynamic Segment Tree)
 * LeetCode 715 / 洛谷 P2781
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import { DYNAMIC_SEGMENT_TREE_CODES, DYNAMIC_SEGMENT_TREE_LINES } from './tree-108-116-stage-codes';
import {
  Tree108Step,
  renderSegmentTreeVisual,
} from './tree-108-116-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';
import { SegTreeNode } from './segment-tree-renderer';

export interface DynamicSegTreeStep extends Tree108Step {
  nodes: SegTreeNode[];
  activeNodeId: number;
  totalAllocated: number;
  maxDomain: number;
  queryL: number;
  queryR: number;
}

export class DynamicNode {
  id: number;
  l: number;
  r: number;
  val: number = 0;
  lazy: number = 0;
  left: DynamicNode | null = null;
  right: DynamicNode | null = null;
  constructor(id: number, l: number, r: number) {
    this.id = id;
    this.l = l;
    this.r = r;
  }
}

export function buildDynamicSegTreeSteps(
  ql: number,
  qr: number,
  val: number,
  maxDomain: number = 1000
): DynamicSegTreeStep[] {
  const steps: DynamicSegTreeStep[] = [];
  const lines = DYNAMIC_SEGMENT_TREE_LINES;

  let nextId = 1;
  const root = new DynamicNode(nextId++, 1, maxDomain);
  const allNodes: DynamicNode[] = [root];

  const getSnapshot = (): SegTreeNode[] => {
    return allNodes.map(n => ({
      id: n.id,
      l: n.l,
      r: n.r,
      val: n.val,
      lazy: n.lazy,
    })).sort((a, b) => a.id - b.id);
  };

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot(),
    activeNodeId: root.id,
    totalAllocated: allNodes.length,
    maxDomain,
    queryL: ql,
    queryR: qr,
    decision: `主函数入口：值域为 [1..${maxDomain}]（模拟 10^9 极大坐标空间），当前仅分配根节点 #${root.id}`,
    message: '面对超大值域，动态开点按需分配子节点，空间复杂度由 O(V) 骤降至 O(Q log V)',
    log: `init dynamic root: [1..${maxDomain}]`,
    codeLine: lines.entry,
    metrics: { '坐标值域': `[1..${maxDomain}]`, '目标区间': `[${ql}..${qr}]`, '当前已开点数': 1 },
  });

  function updateDynamic(cur: DynamicNode, l: number, r: number) {
    if (ql <= l && r <= qr) {
      cur.val += (r - l + 1) * val;
      cur.lazy += val;

      steps.push({
        nodes: getSnapshot(),
        activeNodeId: cur.id,
        totalAllocated: allNodes.length,
        maxDomain,
        queryL: ql,
        queryR: qr,
        decision: `🎯 命中包含区间：动态节点 #${cur.id} [${l}..${r}] 完全被目标包含，增加懒标记 lazy += ${val}，无需继续向下分裂开点`,
        message: '惰性创建最大化节约内存开销',
        log: `hit dynamic node #${cur.id} [${l}..${r}]`,
        codeLine: lines.splitLeft,
        metrics: { '当前节点': `#${cur.id}`, '已开点数': allNodes.length, '节点和': cur.val },
        statusBadge: { text: `命中 #${cur.id}`, type: 'success' },
      });
      return;
    }

    const mid = Math.floor((l + r) / 2);

    // 动态按需分配左子点
    if (!cur.left && ql <= mid) {
      cur.left = new DynamicNode(nextId++, l, mid);
      allNodes.push(cur.left);

      steps.push({
        nodes: getSnapshot(),
        activeNodeId: cur.left.id,
        totalAllocated: allNodes.length,
        maxDomain,
        queryL: ql,
        queryR: qr,
        decision: `🌱 动态开点：目标区间覆盖左半区，按需实例化左子节点 #${cur.left.id} [${l}..${mid}]`,
        message: `总节点开辟数增至 ${allNodes.length}`,
        log: `alloc left child #${cur.left.id} [${l}..${mid}]`,
        codeLine: lines.allocChild,
        metrics: { '新增节点': `#${cur.left.id}`, '已开点数': allNodes.length },
        statusBadge: { text: `开点 #${cur.left.id}`, type: 'info' },
      });
    }

    // 动态按需分配右子点
    if (!cur.right && qr > mid) {
      cur.right = new DynamicNode(nextId++, mid + 1, r);
      allNodes.push(cur.right);

      steps.push({
        nodes: getSnapshot(),
        activeNodeId: cur.right.id,
        totalAllocated: allNodes.length,
        maxDomain,
        queryL: ql,
        queryR: qr,
        decision: `🌱 动态开点：目标区间覆盖右半区，按需实例化右子节点 #${cur.right.id} [${mid + 1}..${r}]`,
        message: `总节点开辟数增至 ${allNodes.length}`,
        log: `alloc right child #${cur.right.id} [${mid + 1}..${r}]`,
        codeLine: lines.allocChild,
        metrics: { '新增节点': `#${cur.right.id}`, '已开点数': allNodes.length },
        statusBadge: { text: `开点 #${cur.right.id}`, type: 'info' },
      });
    }

    if (cur.left && ql <= mid) {
      updateDynamic(cur.left, l, mid);
    }
    if (cur.right && qr > mid) {
      updateDynamic(cur.right, mid + 1, r);
    }

    // pushUp
    cur.val = (cur.left?.val ?? 0) + (cur.right?.val ?? 0);
  }

  updateDynamic(root, 1, maxDomain);

  // Step End: 终局
  steps.push({
    nodes: getSnapshot(),
    activeNodeId: root.id,
    totalAllocated: allNodes.length,
    maxDomain,
    queryL: ql,
    queryR: qr,
    decision: `🏆 动态开点修改完成：整个坐标系 [1..${maxDomain}] 仅开辟了 ${allNodes.length} 个节点，有效避免了超大值域数组溢出`,
    message: '动态开点线段树空间与时间均稳定维持在 O(log V)',
    log: `update finished, totalNodes=${allNodes.length}`,
    codeLine: lines.pushUp,
    metrics: { '已分配节点总数': allNodes.length, '节省内存比例': `> 99%` },
    statusBadge: { text: `共开点 ${allNodes.length} 个`, type: 'success' },
  });

  return steps;
}

export const dynamicSegmentTreeVisualizer = registerDeclarativeAlgorithm<DynamicSegTreeStep>({
  id: 'dynamic-segment-tree-111',
  name: '动态开点线段树 (Class 111)',
  category: 'tree',
  icon: '🌱',
  difficulty: 3,
  levelOrder: 111,
  learningGoal: '理解动态开点在处理 10^9 等超大坐标轴时按需分配节点的空间优化思想',
  problemHtml: TREE_108_116_PROBLEMS.dynamicSegmentTree.html,
  analysisHtml: TREE_108_116_PROBLEMS.dynamicSegmentTree.html,
  inputs: [
    {
      id: 'domain',
      label: '值域上限 (模拟超大坐标)',
      type: 'number',
      defaultValue: 1000,
      min: 100,
      max: 100000,
    },
    {
      id: 'ql',
      label: '修改左端点 ql',
      type: 'number',
      defaultValue: 120,
      min: 1,
      max: 10000,
    },
    {
      id: 'qr',
      label: '修改右端点 qr',
      type: 'number',
      defaultValue: 350,
      min: 1,
      max: 10000,
    },
    {
      id: 'val',
      label: '增加数值 val',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 99,
    },
  ],
  codeLanguages: DYNAMIC_SEGMENT_TREE_CODES,
  generateSteps: (input) => {
    const domain = Number(input.domain) || 1000;
    const ql = Math.max(1, Number(input.ql) || 120);
    const qr = Math.max(ql, Math.min(domain, Number(input.qr) || 350));
    const val = Number(input.val) || 5;
    return buildDynamicSegTreeSteps(ql, qr, val, domain);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderSegmentTreeVisual(step.nodes, step.activeNodeId, step.queryL, step.queryR)}

        ${renderFormulaCard(
          '动态开点内存监控',
          `坐标空间: [1..${step.maxDomain}] | 目标区间: [${step.queryL}..${step.queryR}] | 当前已分配节点数: ${step.totalAllocated} 个 (传统线段树需 ${step.maxDomain * 4} 个)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
