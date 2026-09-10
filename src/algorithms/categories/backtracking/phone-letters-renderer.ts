/**
 * 电话号码字母组合可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 17：给定数字字符串，返回所有可能的字母组合
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
  PHONE_LETTERS_PROBLEM_HTML,
  PHONE_LETTERS_ANALYSIS_HTML,
  PHONE_LETTERS_CODE_LANGUAGES,
} from './phone-letters-problem-content';
import template from './phone-letters.html?raw';

/* ── Phone digit mapping ──────────────────────────────────── */
export const PHONE_MAP: Record<string, string> = {
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz',
};

/* ── Build decision tree ──────────────────────────────────── */
export function buildPhoneTree(digits: string): BacktrackTreeNode {
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

  function dfs(index: number, path: string[], parent: BacktrackTreeNode): void {
    if (index === digits.length) {
      parent.isLeaf = true;
      return;
    }

    const digit = digits[index];
    const letters = PHONE_MAP[digit] || '';

    for (const letter of letters) {
      nodeIdCounter++;
      const childNode: BacktrackTreeNode = {
        id: `${parent.id}-${letter}-${nodeIdCounter}`,
        value: letter,
        path: [...path, letter],
        children: [],
        isLeaf: false,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(index + 1, [...path, letter], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
export function buildPhoneLettersSteps(digits: string): BacktrackTreeStep[] {
  if (digits.length === 0) {
    return [
      {
        nodes: [],
        currentNodeId: 'root',
        visitedNodeIds: ['root'],
        foundPathIds: [],
        prunedNodeIds: [],
        path: [],
        message: '输入为空，直接返回空组合列表 []',
        codeLine: 7,
        stats: { remaining: 0, depth: 0, count: 0 },
        vars: [
          { name: 'digits', value: '""', type: 'string' },
          { name: 'res', value: '[]', type: 'array' },
        ],
      },
    ];
  }

  const root = buildPhoneTree(digits);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const solutions: string[] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：输入 digits = "${digits}"，跨集合展开回溯`,
    codeLine: 8,
    stats: { remaining: digits.length, depth: 0, count: 0 },
    vars: [
      { name: 'digits', value: `"${digits}"`, type: 'string' },
      { name: 'index', value: '0', type: 'number' },
      { name: 'path', value: '""', type: 'string' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, index: number): void {
    if (index === digits.length) {
      const combo = (node.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `递归进入：index == digits.length (${digits.length}) ✓ 字母组合构造完毕: "${combo}"`,
        codeLine: 13,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'index', value: String(index), type: 'number' },
          { name: 'path', value: `"${combo}"`, type: 'string' },
        ],
      });

      foundIds.push(node.id);
      solutions.push(combo);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🎉 收集字母组合: "${combo}"，收集并返回`,
        codeLine: 14,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `"${combo}"`, type: 'string' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    const curDigit = digits[index];
    const letters = PHONE_MAP[curDigit] || '';

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      const childNode = node.children.find((c) => c.value === char);
      if (!childNode) continue;

      // 做选择
      visitedIds.push(childNode.id);
      const curPathStr = (childNode.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `做选择：按键 '${curDigit}' 选取字母 '${char}'，当前组合: "${curPathStr}"`,
        codeLine: 18,
        stats: { remaining: digits.length - (index + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'digit', value: `'${curDigit}'`, type: 'string' },
          { name: 'letter', value: `'${char}'`, type: 'string' },
          { name: 'path', value: `"${curPathStr}"`, type: 'string' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `向下递归：backtrack(digits, index=${index + 1}, path, res)`,
        codeLine: 19,
        stats: { remaining: digits.length - (index + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'index', value: String(index + 1), type: 'number' },
        ],
      });

      traverse(childNode, index + 1);

      // 回溯撤销
      const restoredPathStr = (node.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🔙 回溯撤销：path.deleteCharAt('${char}')，恢复组合: "${restoredPathStr || '空'}"`,
        codeLine: 20,
        stats: { remaining: digits.length - index, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.delete()', value: `'${char}'`, type: 'string' },
          { name: 'path', value: `"${restoredPathStr}"`, type: 'string' },
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
    prunedNodeIds: [],
    path: [],
    message: `🎉 搜索完成！共生成 ${solutions.length} 种字母组合`,
    codeLine: 9,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'digits', value: `"${digits}"`, type: 'string' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class PhoneLettersVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = PHONE_LETTERS_CODE_LANGUAGES;
  protected codeLines = PHONE_LETTERS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '电话号码字母组合 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private keypadContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#phone-letters-tree-display');
    this.pathStackContainer = this.root.querySelector('#pl-path-stack-container');
    this.keypadContainer = this.root.querySelector('#pl-keypad-container');
    this.resultCollectionContainer = this.root.querySelector('#pl-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.pl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const digEl = this.root?.querySelector('#input-digits') as HTMLInputElement | null;
        if (digEl) digEl.value = btn.dataset.digits || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: PHONE_LETTERS_PROBLEM_HTML,
      analysisHtml: PHONE_LETTERS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const digEl = this.root?.querySelector('#input-digits') as HTMLInputElement | null;
    let digits = (digEl?.value || '23').trim().replace(/[^2-9]/g, '');
    if (!digits) digits = '23';
    if (digits.length > 4) digits = digits.slice(0, 4);

    const steps = buildPhoneLettersSteps(digits);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集字母组合')) type = 'collect';

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
        cssPrefix: 'pl',
        nodeLabel: (nd) => (nd.id === 'root' ? '""' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 高亮九宫格按键 (Card 2 Center)
    if (this.keypadContainer) {
      const digEl = this.root?.querySelector('#input-digits') as HTMLInputElement | null;
      const digits = digEl?.value || '23';
      const curDepth = (step.path || []).length;
      const activeDigit = curDepth < digits.length ? digits[curDepth] : null;

      this.keypadContainer.querySelectorAll('.pl-key-btn').forEach((btn) => {
        const key = btn.getAttribute('data-key');
        if (key && key === activeDigit) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集字母组合')) {
        const match = st.message.match(/"([^"]+)"/);
        if (match) {
          solutionsUpToNow.push([match[1]]);
        }
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
              this.steps[stepIdx].message.includes('收集字母组合') &&
              this.steps[stepIdx].message.includes(String(solutionsUpToNow[solIdx][0]))
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
  id: 'phone-letters',
  name: '电话号码的字母组合',
  viewId: 'algo-phone-letters-view',
  category: 'backtracking',
  description: '经典电话按键九宫格跨集合字母回溯组合',
  icon: '📱',
  template,
  Visualizer: PhoneLettersVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '理解跨多个独立集合枚举与深度递进的回溯遍历范式',
});
