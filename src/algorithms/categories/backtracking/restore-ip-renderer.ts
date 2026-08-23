/**
 * 复原 IP 地址可视化器（回溯决策树 SVG 版本）
 * LeetCode 93：给定字符串，返回所有有效的 IP 地址
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './restore-ip.html?raw';

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  renderBacktrackLog,
  getBacktrackTreeCSS,
} from './backtracking-tree-helper';

/* ── Build decision tree ──────────────────────────────────── */
function buildIPTree(s: string): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(startIdx: number, segments: string[], parent: BacktrackTreeNode): void {
    if (segments.length === 4) {
      if (startIdx === s.length) parent.isLeaf = true;
      return;
    }

    for (let len = 1; len <= 3; len++) {
      if (startIdx + len > s.length) break;
      const seg = s.substring(startIdx, startIdx + len);
      const val = parseInt(seg, 10);

      // Prune: value > 255
      if (val > 255) break;

      // Prune: leading zero
      if (seg.length > 1 && seg[0] === '0') break;

      // Prune: remaining digits cannot form valid segments
      const remaining = s.length - startIdx - len;
      const neededSegments = 3 - segments.length;
      if (remaining > neededSegments * 3 || remaining < neededSegments) {
        const pruneNode: BacktrackTreeNode = {
          id: `${parent.id}-${seg}`, value: seg,
          path: [...segments, seg], children: [],
          isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        };
        parent.children.push(pruneNode);
        continue;
      }

      const childNode: BacktrackTreeNode = {
        id: `${parent.id}-${seg}`, value: seg,
        path: [...segments, seg], children: [],
        isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(startIdx + len, [...segments, seg], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
interface IPStep extends BacktrackTreeStep {
  startIndex: number;
  depth: number;
  count: number;
}

function ipSteps(s: string): IPStep[] {
  const root = buildIPTree(s);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(n => n.isPruned).map(n => n.id);

  const steps: IPStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [], message: `开始：复原 IP 地址 "${s}"`, codeLine: 3,
    startIndex: 0, depth: 0, count: 0,
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      // 递归进入：先执行 if (dots == 3) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `递归进入：dots == 3 ✓ 凑齐 4 段`, codeLine: 9,
        startIndex: s.length, depth: node.path.length, count: foundIds.length,
      });
      // 进入 if 块：校验末段 + 收集
      foundIds.push(node.id);
      const ip = (node.path as string[]).join('.');
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `找到 IP: ${ip}，校验末段并收集`, codeLine: { from: 10, to: 12 },
        startIndex: s.length, depth: node.path.length, count: foundIds.length,
      });
      return;
    }

    // 递归进入非叶子：每次 backtrack 调用都先执行 if 判断 —— 不成立
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path], message: `递归进入：dots = ${node.path.length} < 3，继续分段`, codeLine: 9,
      startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
    });

    for (const child of node.children) {
      if (child.isPruned) {
        visitedIds.push(child.id);
        steps.push({
          nodes: allNodes, currentNodeId: node.id,
          visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
          prunedNodeIds: [...prunedIds],
          path: [...node.path], message: `剪枝：段 "${child.value}" 无效或后续无法凑成4段（跳过，未下潜）`, codeLine: 16,
          startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
        });
        continue;
      }

      // iterate
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `for 循环：尝试段 "${child.value}"，检查有效性`, codeLine: 14,
        startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
      });

      // Step A: path.add(seg)
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path], message: `path.add("${child.value}")：添加网段`, codeLine: 17,
        startIndex: (node.path as string[]).join('').length, depth: child.path.length, count: foundIds.length,
      });
      // Step B: backtrack(...)
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path], message: `backtrack(...)：进入下一层`, codeLine: 18,
        startIndex: (node.path as string[]).join('').length, depth: child.path.length, count: foundIds.length,
      });

      traverse(child);

      // pop (backtrack)
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `撤销 "${child.value}"，回溯`, codeLine: 19,
        startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
      });
    }
  }

  traverse(root);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
    prunedNodeIds: [...prunedIds],
    path: [], message: `完成！共找到 ${foundIds.length} 个 IP 地址`, codeLine: 4,
    startIndex: s.length, depth: 0, count: foundIds.length,
  });

  return steps;
}

/* ── Visualizer ───────────────────────────────────────────── */
export class RestoreIPVisualizer extends StepVisualizer<IPStep> {
  protected codeLines = [
    'public List<String> restoreIpAddresses(String s) {',
    '    List<String> res = new ArrayList<>();',
    '    backtrack(s, 0, new ArrayList<>(), res, 0);',
    '    return res;',
    '}',
    '',
    'void backtrack(String s, int start, List<String> path,',
    '               List<String> res, int dots) {',
    '    if (dots == 3) {',
    '        String last = s.substring(start);',
    '        if (isValid(last)) res.add(String.join(".", path) + "." + last);',
    '        return;',
    '    }',
    '    for (int len = 1; len <= 3 && start + len <= s.length(); len++) {',
    '        String seg = s.substring(start, start + len);',
    '        if (!isValid(seg)) continue;',
    '        path.add(seg);',
    '        backtrack(s, start + len, path, res, dots + 1);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '复原 IP 地址 Java 代码';

  private inputText: HTMLInputElement | null = null;
  private treeDisplay: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    // Inject shared tree CSS
    const styleEl = this.root.querySelector('#cs-tree-style');
    if (styleEl) styleEl.textContent = getBacktrackTreeCSS('cs');
    this.inputText = this.root.querySelector('#bt-text');
    this.treeDisplay = this.root.querySelector('#bt-tree-display');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#bt-start')?.addEventListener('click', () => this.start());

    this.root.querySelectorAll<HTMLButtonElement>('.bt-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        if (text && this.inputText) this.inputText.value = text;
        this.start();
      });
    });

    this.root.querySelector('#bt-log-clear')?.addEventListener('click', () => {
      const logEl = this.root?.querySelector('#bt-log');
      if (logEl) logEl.innerHTML = '';
    });
  }

  protected buildSteps(): IPStep[] {
    let text = (this.inputText?.value || '25525511135').trim();
    text = text.replace(/\D/g, '').slice(0, 12);
    if (text.length === 0) text = '25525511135';
    if (this.inputText) this.inputText.value = text;
    return ipSteps(text);
  }

  protected renderStep(step: IPStep): void {
    const depthEl = this.root?.querySelector('[data-metric="depth"]');
    const startEl = this.root?.querySelector('[data-metric="start"]');
    const countEl = this.root?.querySelector('[data-metric="count"]');
    const remainEl = this.root?.querySelector('[data-metric="remain"]');

    if (depthEl) depthEl.textContent = String(step.depth);
    if (startEl) startEl.textContent = String(step.startIndex);
    if (countEl) countEl.textContent = String(step.count);
    if (remainEl) {
      const s = (this.inputText?.value || '').trim().replace(/\D/g, '');
      remainEl.textContent = String(Math.max(0, s.length - step.startIndex));
    }

    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs',
        nodeLabel: (nd) => nd.id === 'root' ? '[]' : nd.value,
      });
    }

    const logEl = this.root?.querySelector('#bt-log');
    renderBacktrackLog(logEl as HTMLElement | null, this.steps, this.currentIndex, 'cs');
  }
}

registerAlgorithm({
  id: 'restore-ip',
  name: '复原IP地址',
  viewId: 'algo-restore-ip-view',
  category: 'backtracking',
  description: 'LeetCode 93 · 字符串切 3 个点，每段 0–255',
  icon: '\uD83C\uDF10',
  template,
  Visualizer: RestoreIPVisualizer,
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '掌握 IP 地址分割的回溯加合法性校验',
});
