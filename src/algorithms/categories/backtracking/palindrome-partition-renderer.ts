/**
 * 分割回文串可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 131：把字符串分割成若干子串，要求每个子串都是回文串
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BacktrackStateSpacePresenter,
  BacktrackLogItem,
} from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  PALINDROME_PARTITION_PROBLEM_HTML,
  PALINDROME_PARTITION_ANALYSIS_HTML,
  PALINDROME_PARTITION_CODE_LANGUAGES,
} from './palindrome-partition-problem-content';
import template from './palindrome-partition.html?raw';

/* ── Helpers ────────────────────────────────────────────────── */
export function isPalindrome(text: string): boolean {
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
export function buildPalTree(s: string): BacktrackTreeNode {
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

  function dfs(startIndex: number, path: string[], parent: BacktrackTreeNode): void {
    if (startIndex === s.length) {
      parent.isLeaf = true;
      return;
    }

    for (let end = startIndex; end < s.length; end++) {
      nodeIdCounter++;
      const substring = s.slice(startIndex, end + 1);
      const isPal = isPalindrome(substring);
      const childId = `${parent.id}-${substring}-${nodeIdCounter}`;

      if (!isPal) {
        // Prune: not a palindrome
        const pruneNode: BacktrackTreeNode = {
          id: childId,
          value: `"${substring}"`,
          path: [...path, substring],
          children: [],
          isLeaf: false,
          isPruned: true,
          isDirectPrune: true,
          parentId: parent.id,
          depth: parent.depth + 1,
        };
        parent.children.push(pruneNode);
        continue;
      }

      const childNode: BacktrackTreeNode = {
        id: childId,
        value: `"${substring}"`,
        path: [...path, substring],
        children: [],
        isLeaf: false,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(end + 1, [...path, substring], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
export function buildPalindromePartitionSteps(s: string): BacktrackTreeStep[] {
  const root = buildPalTree(s);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: string[][] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：分割字符串 s = "${s}"，要求每段子串均为回文串`,
    codeLine: 4,
    stats: { remaining: s.length, depth: 0, count: 0 },
    vars: [
      { name: 's', value: `"${s}"`, type: 'string' },
      { name: 'startIndex', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, startIndex: number): void {
    if (startIndex >= s.length) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：startIndex (${startIndex}) >= s.length (${s.length})，切割线已达末尾 ✓ 找到全回文分割`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(startIndex), type: 'number' },
          { name: 'path', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
        ],
      });

      foundIds.push(node.id);
      solutions.push([...(node.path as string[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 收集回文分割方案：[${node.path.map((p) => `"${p}"`).join(', ')}]，收集并返回`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = startIndex; i < s.length; i++) {
      const sub = s.slice(startIndex, i + 1);
      const isPal = isPalindrome(sub);
      const childNode = node.children.find((c) => c.value === `"${sub}"`);

      // 1. 判断是否回文
      if (!isPal) {
        if (childNode && !dynamicPrunedIds.includes(childNode.id)) {
          dynamicPrunedIds.push(childNode.id);
        }
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 非回文剪枝：子串 s[${startIndex}..${i}] = "${sub}" 不是回文串，continue 跳过该分支`,
          codeLine: 14,
          stats: { remaining: s.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sub', value: `"${sub}"`, type: 'string' },
            { name: 'isPalindrome', value: 'false', type: 'boolean' },
          ],
        });
        continue;
      }

      if (!childNode) continue;

      // 2. 做选择
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `做选择：截取回文子串 path.add("${sub}")，当前路径：[${childNode.path.map((p) => `"${p}"`).join(', ')}]`,
        codeLine: 16,
        stats: { remaining: s.length - (i + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'str', value: `"${sub}"`, type: 'string' },
          { name: 'path', value: `[${childNode.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
        ],
      });

      // 3. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `向下递归：backtrack(s, startIndex=${i + 1}, path, res)`,
        codeLine: 17,
        stats: { remaining: s.length - (i + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(i + 1), type: 'number' },
        ],
      });

      traverse(childNode, i + 1);

      // 4. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove("${sub}")，恢复路径至：[${node.path.map((p) => `"${p}"`).join(', ') || '空'}]`,
        codeLine: 18,
        stats: { remaining: s.length - startIndex, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: `"${sub}"`, type: 'string' },
          { name: 'path', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 种全回文分割方案`,
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
export class PalindromePartitionVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = PALINDROME_PARTITION_CODE_LANGUAGES;
  protected codeLines = PALINDROME_PARTITION_CODE_LANGUAGES['java'];
  protected codePanelTitle = '分割回文串 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private palindromeMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#palindrome-partition-tree-display');
    this.pathStackContainer = this.root.querySelector('#pp-path-stack-container');
    this.palindromeMonitorContainer = this.root.querySelector('#pp-palindrome-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#pp-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.pp-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
        if (strEl) strEl.value = btn.dataset.s || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: PALINDROME_PARTITION_PROBLEM_HTML,
      analysisHtml: PALINDROME_PARTITION_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
    let s = (strEl?.value || 'aab').trim();
    if (!s) s = 'aab';
    if (s.length > 8) s = s.slice(0, 8); // 防止爆炸

    const steps = buildPalindromePartitionSteps(s);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集回文分割方案')) type = 'collect';
      else if (st.message.includes('剪枝')) type = 'prune';

      return {
        stepIndex: idx + 1,
        type,
        text: st.message,
      };
    });

    return steps;
  }

  protected renderStep(step: BacktrackTreeStep): void {
    const index = this.currentIndex;

    // 1. 渲染 SVG 决策树沙盘
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'pp',
        nodeLabel: (nd) => (nd.id === 'root' ? '""' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染回文判定监视器 (Card 2 Center)
    if (this.palindromeMonitorContainer) {
      const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
      const s = strEl?.value || 'aab';
      const lastSlice = step.path.length > 0 ? String(step.path[step.path.length - 1]) : '';
      const isPal = lastSlice ? isPalindrome(lastSlice) : true;

      let subDisplay = '';
      if (step.message.includes('剪枝') || step.message.includes('做选择')) {
        const match = step.message.match(/"([^"]+)"/);
        const examinedStr = match ? match[1] : lastSlice;
        const valid = isPalindrome(examinedStr);

        subDisplay = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>当前探测子串: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">"${examinedStr}"</strong></span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; background: ${valid ? '#ecfdf5' : '#fef2f2'}; color: ${valid ? '#059669' : '#dc2626'}; border: 1px solid ${valid ? '#a7f3d0' : '#fecaca'};">
              ${valid ? '✓ 是回文串' : '✕ 非回文串 (剪枝)'}
            </span>
          </div>
        `;
      } else {
        subDisplay = `
          <div style="color: #64748b; font-size: 11px;">
            原串: <code style="color: #0f172a; font-family: monospace; font-weight: 700;">"${s}"</code> (长度 ${s.length})
          </div>
        `;
      }

      this.palindromeMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          ${subDisplay}
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 切割区间: <code style="color:#b45309; font-family:monospace;">s[startIndex..i]</code></div>
            <div>• 回文判定: <code style="color:#b45309; font-family:monospace;">!isPalindrome(sub) => continue</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集回文分割方案')) {
        solutionsUpToNow.push([...st.path]);
      }
    }

    if (this.resultCollectionContainer) {
      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        solutionsUpToNow,
        -1,
        (solIdx: number) => {
          for (let stepIdx = 0; stepIdx < this.steps.length; stepIdx++) {
            if (
              this.steps[stepIdx].message.includes('收集回文分割方案') &&
              JSON.stringify(this.steps[stepIdx].path) === JSON.stringify(solutionsUpToNow[solIdx])
            ) {
              this.goToStep(stepIdx);
              break;
            }
          }
        }
      );
    }

    const badgeCount = this.root?.querySelector('#badge-result-count');
    if (badgeCount) {
      badgeCount.textContent = `解集: ${solutionsUpToNow.length}`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      BacktrackStateSpacePresenter.renderBacktrackLogStream(
        this.logContainer,
        this.cachedLogs.slice(0, this.currentIndex + 1),
        this.currentIndex
      );
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    resetContainerViewState(this.treeDisplay);
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'palindrome-partition',
  name: '分割回文串',
  viewId: 'algo-palindrome-partition-view',
  category: 'backtracking',
  description: '将字符串分割为若干回文子串，回文判定剪枝',
  icon: '✂️',
  template,
  Visualizer: PalindromePartitionVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解字符串切割问题到树形回溯的建模与即时回文剪枝',
});
