/**
 * 电话号码字母组合可视化器（回溯决策树 SVG 版本）
 * LeetCode 17：给定数字字符串，返回所有可能的字母组合
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './phone-letters.html?raw';

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  renderBacktrackLog,
  getBacktrackTreeCSS,
} from './backtracking-tree-helper';

/* ── Phone digit mapping ──────────────────────────────────── */
const PHONE_MAP: Record<string, string> = {
  '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
  '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
};

/* ── Build decision tree ──────────────────────────────────── */
function buildPhoneTree(digits: string): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(index: number, path: string[], parent: BacktrackTreeNode): void {
    if (index === digits.length) {
      parent.isLeaf = true;
      return;
    }

    const digit = digits[index];
    const letters = PHONE_MAP[digit] || '';

    for (const letter of letters) {
      const childNode: BacktrackTreeNode = {
        id: `${parent.id}-${letter}`, value: letter,
        path: [...path, letter], children: [],
        isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(index + 1, [...path, letter], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
interface PhoneStep extends BacktrackTreeStep {
  currentDigitIndex: number;
  currentLetter: string | null;
}

function phoneSteps(digits: string): PhoneStep[] {
  if (digits.length === 0) {
    return [{
      nodes: [], currentNodeId: 'root', visitedNodeIds: ['root'],
      foundPathIds: [], prunedNodeIds: [],
      path: [], message: '输入为空，返回空列表', codeLine: 2,
      currentDigitIndex: -1, currentLetter: null,
    }];
  }

  const root = buildPhoneTree(digits);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: PhoneStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [],
    path: [], message: `开始：处理数字串 "${digits}"`, codeLine: 8,
    currentDigitIndex: 0, currentLetter: null,
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      // 递归进入：先执行 if (index == digits.length()) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path], message: `递归进入：index == ${digits.length} ✓ 处理完所有数字`, codeLine: 14,
        currentDigitIndex: digits.length, currentLetter: null,
      });
      // 进入 if 块：收集并 return
      foundIds.push(node.id);
      const combo = (node.path as string[]).join('');
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path], message: `找到组合："${combo}"，收集并返回`, codeLine: { from: 15, to: 16 },
        currentDigitIndex: digits.length, currentLetter: null,
      });
      return;
    }

    // 递归进入非叶子：每次 backtrack 调用都先执行 if 判断 —— 不成立
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
      prunedNodeIds: [],
      path: [...node.path], message: `递归进入：index = ${node.path.length} < ${digits.length}，处理下一个数字`, codeLine: 14,
      currentDigitIndex: node.path.length, currentLetter: null,
    });

    for (const child of node.children) {
      // iterate
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path], message: `for 循环：数字 ${digits[child.depth - 1]} 的字母 "${child.value}"`, codeLine: 19,
        currentDigitIndex: child.depth - 1, currentLetter: child.value,
      });

      // Step A: path.append(c)
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path], message: `path.append('${child.value}')：路径变为 "${(child.path as string[]).join('')}"`, codeLine: 20,
        currentDigitIndex: child.depth - 1, currentLetter: child.value,
      });
      // Step B: backtrack(...)
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path], message: `backtrack(..., index + 1)：递归处理下一个数字`, codeLine: 21,
        currentDigitIndex: child.depth - 1, currentLetter: child.value,
      });

      traverse(child);

      // pop (backtrack)
      if (child.depth < digits.length) {
        steps.push({
          nodes: allNodes, currentNodeId: node.id,
          visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
          prunedNodeIds: [],
          path: [...node.path], message: `撤销 "${child.value}"，回溯`, codeLine: 22,
          currentDigitIndex: node.depth, currentLetter: child.value,
        });
      }
    }
  }

  traverse(root);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds], foundPathIds: [...foundIds],
    prunedNodeIds: [],
    path: [], message: `完成！共找到 ${foundIds.length} 个组合`, codeLine: 9,
    currentDigitIndex: digits.length, currentLetter: null,
  });

  return steps;
}

/* ── Visualizer ───────────────────────────────────────────── */
export class PhoneLettersVisualizer extends StepVisualizer<PhoneStep> {
  protected codeLines = [
    'public List<String> letterCombinations(String digits) {',
    '    if (digits.isEmpty()) return new ArrayList<>();',
    '    Map<Character, String> map = Map.of(',
    '        \'2\', "ABC", \'3\', "DEF", \'4\', "GHI",',
    '        \'5\', "JKL", \'6\', "MNO", \'7\', "PQRS",',
    '        \'8\', "TUV", \'9\', "WXYZ");',
    '    List<String> result = new ArrayList<>();',
    '    backtrack(digits, map, 0, new StringBuilder(), result);',
    '    return result;',
    '}',
    '',
    'void backtrack(String digits, Map<Character, String> map,',
    '               int index, StringBuilder path, List<String> result) {',
    '    if (index == digits.length()) {',
    '        result.add(path.toString());',
    '        return;',
    '    }',
    '    String letters = map.get(digits.charAt(index));',
    '    for (char c : letters.toCharArray()) {',
    '        path.append(c);',
    '        backtrack(digits, map, index + 1, path, result);',
    '        path.deleteCharAt(path.length() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '电话号码字母组合 Java 代码';

  private inputField: HTMLInputElement | null = null;
  private treeDisplay: HTMLElement | null = null;
  private currentDigitEl: HTMLElement | null = null;
  private currentLettersEl: HTMLElement | null = null;
  private keypad: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    // Inject shared tree CSS
    const styleEl = this.root.querySelector('#cs-tree-style');
    if (styleEl) styleEl.textContent = getBacktrackTreeCSS('cs');
    this.inputField = this.root.querySelector('#phone-input');
    this.treeDisplay = this.root.querySelector('#phone-tree-display');
    this.currentDigitEl = this.root.querySelector('#phone-current-digit');
    this.currentLettersEl = this.root.querySelector('#phone-current-letters');
    this.keypad = this.root.querySelector('#phone-keypad');
    this.bindPlaybackControls({
      reset: 'phone-reset',
      prev: 'phone-prev',
      play: 'phone-play',
      next: 'phone-next',
      speed: 'phone-speed',
      speedLabel: 'phone-speed-label',
      counter: 'phone-counter',
      message: 'step-message',
    });
    this.root.querySelector('#phone-start')?.addEventListener('click', () => this.start());

    // Interactive Keypad Keys Click
    if (this.keypad) {
      this.keypad.querySelectorAll<HTMLElement>('.phone-key').forEach(k => {
        k.addEventListener('click', () => {
          const digit = k.dataset.digit;
          if (digit && this.inputField) {
            let current = this.inputField.value.replace(/[^2-9]/g, '');
            if (current.length >= 6) current = digit;
            else current += digit;
            this.inputField.value = current;
            this.start();
          }
        });
      });
    }

    this.root.querySelectorAll<HTMLButtonElement>('.phone-example-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        if (val && this.inputField) this.inputField.value = val;
        this.start();
      });
    });

    this.root.querySelector('#phone-log-clear')?.addEventListener('click', () => {
      const logEl = this.root?.querySelector('#phone-log');
      if (logEl) logEl.innerHTML = '';
    });

    const speedSlider = this.root.querySelector('#phone-speed') as HTMLInputElement | null;
    if (speedSlider) {
      this.playbackSpeed = parseInt(speedSlider.value, 10) || 700;
      const speedLabel = this.root.querySelector('#phone-speed-label');
      if (speedLabel) speedLabel.textContent = (this.playbackSpeed / 1000).toFixed(1) + 's';
    }
  }

  protected buildSteps(): PhoneStep[] {
    let digits = (this.inputField?.value || '23').trim().replace(/[^2-9]/g, '');
    if (digits.length === 0) {
      digits = '23';
      if (this.inputField) this.inputField.value = '23';
    }
    return phoneSteps(digits);
  }

  protected renderStep(step: PhoneStep): void {
    const pathValEl = this.root?.querySelector('#phone-path-val');
    const digitValEl = this.root?.querySelector('#phone-digit-val');
    const availValEl = this.root?.querySelector('#phone-avail-val');
    const collectedEl = this.root?.querySelector('#phone-collected');

    const digits = (this.inputField?.value || '23').trim().replace(/[^2-9]/g, '');

    if (pathValEl) pathValEl.textContent = `"${(step.path as string[]).join('')}"`;
    if (digitValEl) {
      const d = step.currentDigitIndex >= 0 && step.currentDigitIndex < digits.length
        ? digits[step.currentDigitIndex]
        : '-';
      digitValEl.textContent = d;
    }
    if (availValEl) {
      const d = step.currentDigitIndex >= 0 && step.currentDigitIndex < digits.length
        ? digits[step.currentDigitIndex]
        : '-';
      availValEl.textContent = PHONE_MAP[d] ? `(${PHONE_MAP[d]})` : '(-)';
    }
    if (collectedEl) collectedEl.textContent = String(step.foundPathIds.length);

    // Highlight keypad key
    if (this.keypad) {
      this.keypad.querySelectorAll('.phone-key').forEach(k => k.classList.remove('current'));
      if (step.currentDigitIndex >= 0 && step.currentDigitIndex < digits.length) {
        const currentDigit = digits[step.currentDigitIndex];
        const key = this.keypad.querySelector(`[data-digit="${currentDigit}"]`);
        if (key) key.classList.add('current');
      }
    }

    if (this.currentDigitEl) {
      const d = step.currentDigitIndex >= 0 && step.currentDigitIndex < digits.length
        ? digits[step.currentDigitIndex] : '-';
      this.currentDigitEl.textContent = d;
    }
    if (this.currentLettersEl) {
      const d = step.currentDigitIndex >= 0 && step.currentDigitIndex < digits.length
        ? digits[step.currentDigitIndex] : '-';
      this.currentLettersEl.textContent = PHONE_MAP[d] || '-';
    }

    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs',
        nodeLabel: (nd) => nd.id === 'root' ? '[]' : nd.value,
      });
    }

    const logEl = this.root?.querySelector('#phone-log');
    renderBacktrackLog(logEl as HTMLElement | null, this.steps, this.currentIndex, 'cs');
  }
}

registerAlgorithm({
  id: 'phone-letters',
  name: '电话号码字母组合',
  viewId: 'algo-phone-letters-view',
  category: 'backtracking',
  description: 'LeetCode 17：回溯算法，给定数字字符串，返回所有可能的字母组合',
  icon: '\uD83D\uDCDE',
  template,
  Visualizer: PhoneLettersVisualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握多组字符组合的回溯展开',
});
