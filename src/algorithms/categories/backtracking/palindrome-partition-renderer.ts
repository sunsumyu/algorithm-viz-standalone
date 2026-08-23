/**
 * 分割回文串可视化器（回溯决策树 SVG 版本）
 * LeetCode 131：把字符串分割成若干子串，要求每个子串都是回文串
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './palindrome-partition.html?raw';

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  renderBacktrackLog,
  getBacktrackTreeCSS,
} from './backtracking-tree-helper';

/* ── Helpers ────────────────────────────────────────────────── */
function isPalindrome(text: string): boolean {
  let left = 0;
  let right = text.length - 1;
  while (left < right) {
    if (text[left] !== text[right]) return false;
    left++;
    right--;
  }
  return true;
}

/* ── Build decision tree ──────────────────────────────────── */
function buildPalTree(s: string): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(startIndex: number, path: string[], parent: BacktrackTreeNode): void {
    if (startIndex === s.length) {
      parent.isLeaf = true;
      return;
    }

    for (let end = startIndex; end < s.length; end++) {
      const substring = s.slice(startIndex, end + 1);

      if (!isPalindrome(substring)) {
        // Prune: not a palindrome
        const pruneNode: BacktrackTreeNode = {
          id: `${parent.id}-${substring}`, value: substring,
          path: [...path, substring], children: [],
          isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        };
        parent.children.push(pruneNode);
        continue;
      }

      const childNode: BacktrackTreeNode = {
        id: `${parent.id}-${substring}`, value: substring,
        path: [...path, substring], children: [],
        isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(end + 1, [...path, substring], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
interface PalStep extends BacktrackTreeStep {
  startIndex: number;
  depth: number;
  count: number;
}

function palPartitionSteps(s: string): PalStep[] {
  const root = buildPalTree(s);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(n => n.isPruned).map(n => n.id);

  const steps: PalStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [], message: `开始：分割回文串 "${s}"`, codeLine: 4,
    startIndex: 0, depth: 0, count: 0,
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      // 递归进入：先执行 if (startIndex == s.length()) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `递归进入：startIndex == ${s.length} ✓ 到达末尾`, codeLine: 10,
        startIndex: s.length, depth: node.path.length, count: foundIds.length,
      });
      // 进入 if 块：收集并 return
      foundIds.push(node.id);
      const partition = (node.path as string[]).join(' | ');
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `找到方案：[${partition}]，收集并返回`, codeLine: { from: 11, to: 12 },
        startIndex: s.length, depth: node.path.length, count: foundIds.length,
      });
      return;
    }

    // 递归进入非叶子：每次 backtrack 调用都先执行 if 判断 —— 不成立
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path], message: `递归进入：startIndex = ${(node.path as string[]).join('').length} < ${s.length}，继续分割`, codeLine: 10,
      startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
    });

    for (const child of node.children) {
      if (child.isPruned) {
        visitedIds.push(child.id);
        steps.push({
          nodes: allNodes, currentNodeId: node.id,
          visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
          prunedNodeIds: [...prunedIds],
          path: [...node.path], message: `剪枝："${child.value}" 不是回文（跳过，未下潜）`, codeLine: 16,
          startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
        });
        continue;
      }

      // iterate
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], message: `for 循环：取到 "${child.value}"，检查回文`, codeLine: 14,
        startIndex: (node.path as string[]).join('').length, depth: node.path.length, count: foundIds.length,
      });

      // Step A: path.add(str)
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path], message: `path.add("${child.value}")：path 添加回文串`, codeLine: 17,
        startIndex: (node.path as string[]).join('').length, depth: child.path.length, count: foundIds.length,
      });
      // Step B: backtrack(...)
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path], message: `backtrack(${(child.path as string[]).join('').length}, ...)：进入下一层分割`, codeLine: 18,
        startIndex: (node.path as string[]).join('').length, depth: child.path.length, count: foundIds.length,
      });

      traverse(child);

      // pop
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
    path: [], message: `完成！共找到 ${foundIds.length} 个分割方案`, codeLine: 5,
    startIndex: s.length, depth: 0, count: foundIds.length,
  });

  return steps;
}

/* ── Visualizer ───────────────────────────────────────────── */
export class PalindromePartitionVisualizer extends StepVisualizer<PalStep> {
  protected codeLines = [
    'public List<List<String>> partition(String s) {',
    '    List<List<String>> result = new ArrayList<>();',
    '    List<String> path = new ArrayList<>();',
    '    backtrack(s, 0, path, result);',
    '    return result;',
    '}',
    '',
    'void backtrack(String s, int startIndex, List<String> path,',
    '               List<List<String>> result) {',
    '    if (startIndex == s.length()) {',
    '        result.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = startIndex; i < s.length(); i++) {',
    '        String str = s.substring(startIndex, i + 1);',
    '        if (!isPalindrome(str)) continue;',
    '        path.add(str);',
    '        backtrack(s, i + 1, path, result);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '分割回文串 Java 代码';

  private inputEl: HTMLInputElement | null = null;
  private treeDisplay: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    // Inject shared tree CSS
    const styleEl = this.root.querySelector('#cs-tree-style');
    if (styleEl) styleEl.textContent = getBacktrackTreeCSS('cs');
    this.inputEl = this.root.querySelector('#pal-input');
    this.treeDisplay = this.root.querySelector('#pal-tree-display');
    this.bindPlaybackControls({ message: 'pal-message' });
    this.root.querySelector('#pal-start')?.addEventListener('click', () => this.start());

    this.root.querySelectorAll<HTMLButtonElement>('.pal-example-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        if (val && this.inputEl) this.inputEl.value = val;
        this.start();
      });
    });

    this.root.querySelector('#pal-log-clear')?.addEventListener('click', () => {
      const logEl = this.root?.querySelector('#pal-log');
      if (logEl) logEl.innerHTML = '';
    });
  }

  protected buildSteps(): PalStep[] {
    let source = (this.inputEl?.value || 'aab').trim();
    source = source.replace(/\s+/g, '').slice(0, 8) || 'aab';
    if (this.inputEl) this.inputEl.value = source;
    return palPartitionSteps(source);
  }

  protected renderStep(step: PalStep): void {
    const startEl = this.root?.querySelector('#pal-start-index');
    const pathSizeEl = this.root?.querySelector('#pal-path-size');
    const depthEl = this.root?.querySelector('#pal-depth');
    const resultSizeEl = this.root?.querySelector('#pal-result-size');

    if (startEl) startEl.textContent = String(step.startIndex);
    if (pathSizeEl) pathSizeEl.textContent = String(step.path.length);
    if (depthEl) depthEl.textContent = String(step.depth);
    if (resultSizeEl) resultSizeEl.textContent = String(step.count);

    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs',
        nodeLabel: (nd) => nd.id === 'root' ? '[]' : nd.value,
      });
    }

    const logEl = this.root?.querySelector('#pal-log');
    renderBacktrackLog(logEl as HTMLElement | null, this.steps, this.currentIndex, 'cs');
  }
}

registerAlgorithm({
  id: 'palindrome-partition',
  name: '分割回文串',
  viewId: 'algo-palindrome-partition-view',
  category: 'backtracking',
  description: 'LeetCode 131：回溯算法，通过回溯枚举所有回文切割方案',
  icon: '\uD83E\uDE9F',
  template,
  Visualizer: PalindromePartitionVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '理解回文分割的回溯搜索策略',
});
