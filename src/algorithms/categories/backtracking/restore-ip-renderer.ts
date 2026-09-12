/**
 * 复原 IP 地址可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 93：给定数字字符串，返回所有有效的 IP 地址
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  RESTORE_IP_PROBLEM_HTML,
  RESTORE_IP_ANALYSIS_HTML,
  RESTORE_IP_CODE_LANGUAGES,
} from './restore-ip-problem-content';

/* ── Build decision tree ──────────────────────────────────── */
export function buildIPTree(s: string): BacktrackTreeNode {
  let nodeIdCounter = 0;
  const root: BacktrackTreeNode = {
    id: 'root',
    value: '""',
    path: [],
    children: [],
    isLeaf: false,
    isPruned: false,
    parentId: null,
    depth: 0,
  };

  function dfs(startIdx: number, segments: string[], parent: BacktrackTreeNode): void {
    if (segments.length === 4) {
      if (startIdx === s.length) parent.isLeaf = true;
      return;
    }

    for (let len = 1; len <= 3; len++) {
      if (startIdx + len > s.length) break;
      nodeIdCounter++;
      const seg = s.substring(startIdx, startIdx + len);
      const val = parseInt(seg, 10);
      const childId = `${parent.id}-${seg}-${nodeIdCounter}`;

      // 剪枝判定
      const isExceed = val > 255;
      const isLeadingZero = seg.length > 1 && seg[0] === '0';
      const remaining = s.length - startIdx - len;
      const neededSegments = 3 - segments.length;
      const isLengthInvalid = remaining > neededSegments * 3 || remaining < neededSegments;

      const isDirectPrune = !parent.isPruned && (isExceed || isLeadingZero || isLengthInvalid);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: seg,
        path: [...segments, seg],
        children: [],
        isLeaf: false,
        isPruned,
        isDirectPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);

      if (!isPruned) {
        dfs(startIdx + len, [...segments, seg], node);
      }
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
export function buildRestoreIPSteps(s: string): BacktrackTreeStep[] {
  const root = buildIPTree(s);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: string[] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：复原 IP 地址 s = "${s}"，要求恰好分成 4 段且每段 0~255`,
    codeLine: 4,
    stats: { remaining: s.length, depth: 0, count: 0 },
    vars: [
      { name: 's', value: `"${s}"`, type: 'string' },
      { name: 'segments', value: '[]', type: 'array' },
      { name: 'startIndex', value: '0', type: 'number' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, startIdx: number): void {
    const segments = node.path as string[];

    if (segments.length === 4) {
      if (startIdx === s.length) {
        const ipStr = segments.join('.');
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...segments],
          message: `递归进入：segments.size() == 4 且已用尽字符串 ✓ 组成有效 IP: ${ipStr}`,
          codeLine: 9,
          stats: { remaining: 0, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'IP 地址', value: `"${ipStr}"`, type: 'string' },
            { name: 'segments', value: `[${segments.map((seg) => `"${seg}"`).join(', ')}]`, type: 'array' },
          ],
        });

        foundIds.push(node.id);
        solutions.push(ipStr);

        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...segments],
          message: `🎉 收集有效 IP: "${ipStr}"，收集并返回`,
          codeLine: 10,
          stats: { remaining: 0, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'res.add()', value: `"${ipStr}"`, type: 'string' },
            { name: 'res.size()', value: String(solutions.length), type: 'number' },
          ],
        });
      } else {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...segments],
          message: `递归终止：已切出 4 段但字符串尚未耗尽 (剩余 ${s.length - startIdx} 字符)，直接返回`,
          codeLine: 11,
          stats: { remaining: s.length - startIdx, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'segments.size()', value: '4', type: 'number' },
            { name: 'startIndex', value: String(startIdx), type: 'number' },
          ],
        });
      }
      return;
    }

    for (let len = 1; len <= 3; len++) {
      if (startIdx + len > s.length) break;
      const seg = s.substring(startIdx, startIdx + len);
      const val = parseInt(seg, 10);
      const childNode = node.children.find((c) => c.value === seg);

      // 1. 数值超出 255
      if (val > 255) {
        if (childNode && !dynamicPrunedIds.includes(childNode.id)) dynamicPrunedIds.push(childNode.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...segments],
          message: `✂️ 数值超额剪枝：段 "${seg}" (${val}) > 255，break 终止本层`,
          codeLine: 16,
          stats: { remaining: s.length - startIdx, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'seg', value: `"${seg}"`, type: 'string' },
            { name: 'val > 255', value: 'true', type: 'boolean' },
          ],
        });
        break;
      }

      // 2. 前导零
      if (seg.length > 1 && seg[0] === '0') {
        if (childNode && !dynamicPrunedIds.includes(childNode.id)) dynamicPrunedIds.push(childNode.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...segments],
          message: `✂️ 前导零剪枝：段 "${seg}" 含前导零非法，break 终止本层`,
          codeLine: 17,
          stats: { remaining: s.length - startIdx, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'seg', value: `"${seg}"`, type: 'string' },
            { name: 'leadingZero', value: 'true', type: 'boolean' },
          ],
        });
        break;
      }

      // 3. 剩余字符数量约束
      const remaining = s.length - startIdx - len;
      const neededSegments = 3 - segments.length;
      if (remaining > neededSegments * 3 || remaining < neededSegments) {
        if (childNode && !dynamicPrunedIds.includes(childNode.id)) dynamicPrunedIds.push(childNode.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...segments],
          message: `✂️ 长度剪枝：剩余 ${remaining} 字符无法恰好填满剩余 ${neededSegments} 段，continue 跳过`,
          codeLine: 21,
          stats: { remaining: s.length - startIdx, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'rem', value: String(remaining), type: 'number' },
            { name: 'need', value: String(neededSegments), type: 'number' },
          ],
        });
        continue;
      }

      if (!childNode) continue;

      // 4. 做选择
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `做选择：segments.add("${seg}")，当前段组合：[${childNode.path.map((p) => `"${p}"`).join(', ')}]`,
        codeLine: 22,
        stats: { remaining, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'seg', value: `"${seg}"`, type: 'string' },
          { name: 'segments', value: `[${childNode.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
        ],
      });

      // 5. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `向下递归：backtrack(s, startIndex=${startIdx + len}, segments, res)`,
        codeLine: 23,
        stats: { remaining, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(startIdx + len), type: 'number' },
        ],
      });

      traverse(childNode, startIdx + len);

      // 6. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：segments.remove("${seg}")，恢复段组合：[${node.path.map((p) => `"${p}"`).join(', ') || '空'}]`,
        codeLine: 24,
        stats: { remaining: s.length - startIdx, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'segments.remove()', value: `"${seg}"`, type: 'string' },
          { name: 'segments', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
        ],
      });
    }
  }

  traverse(root, 0);

  // End step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `🎉 搜索完成！共找到 ${solutions.length} 个合法有效 IP 地址`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 's', value: `"${s}"`, type: 'string' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: BacktrackTreeStep[]): BacktrackTreeStep[] {
  return steps.map((s) => ({
    ...s,
    log: s.message,
    metrics: {
      path: (s.path || []).length ? `[${(s.path || []).join(' → ')}]` : '[]',
      visited: String(s.visitedNodeIds.length),
      results: String(s.foundPathIds.length),
      pruned: String(s.prunedNodeIds.length),
    },
  }));
}

/** 主视觉：SVG 决策树沙盘（backtracking-tree-helper 自注入样式） */
export function renderRestoreIpCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'ip',
    nodeLabel: (nd) => (nd.id === 'root' ? "" : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'restore-ip',
  name: '复原 IP 地址',
  category: 'backtracking',
  description: '在数字串中插入点号复原合法有效 IP 地址',
  icon: '🌐',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握 4 段式点分十进制切割与前导零、255 上限等全方位剪枝',
  inputs: [
    { id: 'str', label: '数字字符串', type: 'text', defaultValue: '25525511135' },
  ],
  presets: [
    { label: '示例 1', values: { 's': '25525511135' } },
    { label: '示例 2', values: { 's': '0000' } },
    { label: '示例 3', values: { 's': '101023' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集方案', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  codeLanguages: RESTORE_IP_CODE_LANGUAGES,
  problemHtml: RESTORE_IP_PROBLEM_HTML,
  analysisHtml: RESTORE_IP_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let s = String(inputs.str ?? '25525511135').trim().replace(/[^0-9]/g, '');
    if (!s) s = '25525511135';
    if (s.length > 12) s = s.slice(0, 12);
    return withMetrics(buildRestoreIPSteps(s));
  },
  renderCanvas: (container, step) => renderRestoreIpCanvas(container, step as BacktrackTreeStep),
});
