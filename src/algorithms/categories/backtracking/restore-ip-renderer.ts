/**
 * 复原 IP 地址可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 93：给定数字字符串，返回所有有效的 IP 地址
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
  RESTORE_IP_PROBLEM_HTML,
  RESTORE_IP_ANALYSIS_HTML,
  RESTORE_IP_CODE_LANGUAGES,
} from './restore-ip-problem-content';
import template from './restore-ip.html?raw';

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
export class RestoreIPVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = RESTORE_IP_CODE_LANGUAGES;
  protected codeLines = RESTORE_IP_CODE_LANGUAGES['java'];
  protected codePanelTitle = '复原 IP 地址 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private validationMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#restore-ip-tree-display');
    this.pathStackContainer = this.root.querySelector('#ip-path-stack-container');
    this.validationMonitorContainer = this.root.querySelector('#ip-validation-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#ip-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ip-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
        if (strEl) strEl.value = btn.dataset.s || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: RESTORE_IP_PROBLEM_HTML,
      analysisHtml: RESTORE_IP_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const strEl = this.root?.querySelector('#input-str') as HTMLInputElement | null;
    let s = (strEl?.value || '25525511135').trim().replace(/\D/g, '');
    if (!s) s = '25525511135';
    if (s.length > 12) s = s.slice(0, 12);

    const steps = buildRestoreIPSteps(s);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集有效 IP')) type = 'collect';
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
        cssPrefix: 'ip',
        nodeLabel: (nd) => (nd.id === 'root' ? '""' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染分段合法性监视器 (Card 2 Center)
    if (this.validationMonitorContainer) {
      const segs = step.path as string[];
      const ipPreview = segs.length > 0 ? segs.join('.') + (segs.length < 4 ? '....' : '') : '(空)';

      let subDisplay = '';
      if (step.message.includes('剪枝') || step.message.includes('做选择')) {
        const match = step.message.match(/"([^"]+)"/);
        const examinedSeg = match ? match[1] : (segs[segs.length - 1] || '');
        const val = parseInt(examinedSeg, 10);
        const hasLeadingZero = examinedSeg.length > 1 && examinedSeg[0] === '0';
        const isOver255 = val > 255;
        const valid = !hasLeadingZero && !isOver255 && !isNaN(val);

        subDisplay = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>当前段: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">"${examinedSeg}"</strong> (${val})</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; background: ${valid ? '#ecfdf5' : '#fef2f2'}; color: ${valid ? '#059669' : '#dc2626'}; border: 1px solid ${valid ? '#a7f3d0' : '#fecaca'};">
              ${valid ? '✓ 合法段 (0~255)' : isOver255 ? '✕ 超额 > 255' : hasLeadingZero ? '✕ 前导零非法' : '✕ 长度非法'}
            </span>
          </div>
        `;
      } else {
        subDisplay = `
          <div style="color: #334155; font-size: 11px;">
            当前 IP 预览: <code style="color: #2563eb; font-family: monospace; font-weight: 700; font-size: 12px;">${ipPreview}</code>
          </div>
        `;
      }

      this.validationMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          ${subDisplay}
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 段合法性: <code style="color:#b45309; font-family:monospace;">0 &le; val &le; 255 && 无前导 0</code></div>
            <div>• 剩余长度: <code style="color:#b45309; font-family:monospace;">need &le; rem &le; need * 3</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集有效 IP')) {
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
              this.steps[stepIdx].message.includes('收集有效 IP') &&
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
  id: 'restore-ip',
  name: '复原 IP 地址',
  viewId: 'algo-restore-ip-view',
  category: 'backtracking',
  description: '在数字串中插入点号复原合法有效 IP 地址',
  icon: '🌐',
  template,
  Visualizer: RestoreIPVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握 4 段式点分十进制切割与前导零、255 上限等全方位剪枝',
});
