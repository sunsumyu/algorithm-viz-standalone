/**
 * 监控二叉树可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 968：后序自底向上推导，0=无覆盖, 1=有摄像头, 2=已覆盖；贪心在叶子父节点装摄像头
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_CAMERAS_PROBLEM_HTML,
  TREE_CAMERAS_ANALYSIS_HTML,
  TREE_CAMERAS_CODE_LANGUAGES,
} from './tree-cameras-problem-content';
import template from './tree-cameras.html?raw';

export interface TreeNode {
  id: number;
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

export type CameraNodeState = 0 | 1 | 2; // 0=无覆盖, 1=有摄像头, 2=已覆盖

export interface CameraStep {
  root: TreeNode | null;
  currentNodeId: number | null;
  nodeStates: Record<number, CameraNodeState>;
  cameraCount: number;
  leftState: number | null;
  rightState: number | null;
  action: 'enter' | 'place_camera' | 'covered_by_child' | 'wait_parent' | 'root_camera' | 'done';
  message: string;
  codeLine: number;
}

export function parseTreeFromArray(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  let nextId = 1;
  const root: TreeNode = { id: nextId++, val: arr[0]!, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      node.left = { id: nextId++, val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = { id: nextId++, val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

export function buildTreeCameraSteps(root: TreeNode | null): CameraStep[] {
  const steps: CameraStep[] = [];
  const nodeStates: Record<number, CameraNodeState> = {};
  let cameraCount = 0;

  if (!root) {
    steps.push({
      root: null,
      currentNodeId: null,
      nodeStates: {},
      cameraCount: 0,
      leftState: null,
      rightState: null,
      action: 'done',
      message: '树为空，最小摄像头数量为 0',
      codeLine: 2,
    });
    return steps;
  }

  function dfs(node: TreeNode | null): CameraNodeState {
    if (!node) return 2; // 空节点视为有覆盖

    steps.push({
      root,
      currentNodeId: node.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: null,
      rightState: null,
      action: 'enter',
      message: `🔽 访问节点 [${node.id}] (val=${node.val})，准备递归后序遍历左右子树`,
      codeLine: 13,
    });

    const left = dfs(node.left);
    const right = dfs(node.right);

    // 情况 1：左右孩子只要有一个无覆盖 (0)，当前父节点必须放置摄像头
    if (left === 0 || right === 0) {
      cameraCount++;
      nodeStates[node.id] = 1;

      steps.push({
        root,
        currentNodeId: node.id,
        nodeStates: { ...nodeStates },
        cameraCount,
        leftState: left,
        rightState: right,
        action: 'place_camera',
        message: `📷 【情况1】节点 [${node.id}] 的子节点存在无覆盖 (左=${left}, 右=${right})！贪心在此安装第 ${cameraCount} 台摄像头，返回 1 (有摄像头)`,
        codeLine: 17,
      });
      return 1;
    }

    // 情况 2：左右孩子至少有一个摄像头 (1)，当前节点被摄像头覆盖
    if (left === 1 || right === 1) {
      nodeStates[node.id] = 2;

      steps.push({
        root,
        currentNodeId: node.id,
        nodeStates: { ...nodeStates },
        cameraCount,
        leftState: left,
        rightState: right,
        action: 'covered_by_child',
        message: `🛡️ 【情况2】节点 [${node.id}] 的子节点已有摄像头 (左=${left}, 右=${right})，当前节点处于覆盖范围，返回 2 (已覆盖)`,
        codeLine: 21,
      });
      return 2;
    }

    // 情况 3：左右孩子都已被覆盖 (2)，当前节点暂时无覆盖，留给上层父节点覆盖
    nodeStates[node.id] = 0;
    steps.push({
      root,
      currentNodeId: node.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: left,
      rightState: right,
      action: 'wait_parent',
      message: `⚪ 【情况3】节点 [${node.id}] 的子节点均为已覆盖 (左=${left}, 右=${right})，当前节点暂无覆盖，留待上层父节点安装摄像头覆盖，返回 0 (无覆盖)`,
      codeLine: 24,
    });
    return 0;
  }

  const rootStatus = dfs(root);

  // 根节点特判：如果根节点返回 0 (无覆盖)，根节点自身必须放一个摄像头
  if (rootStatus === 0) {
    cameraCount++;
    nodeStates[root.id] = 1;

    steps.push({
      root,
      currentNodeId: root.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: null,
      rightState: null,
      action: 'root_camera',
      message: `📷 【根节点特判】遍历结束，根节点 [${root.id}] 依然处于无覆盖状态 (无上层父节点)！必须在此补装第 ${cameraCount} 台摄像头`,
      codeLine: 5,
    });
  }

  steps.push({
    root,
    currentNodeId: null,
    nodeStates: { ...nodeStates },
    cameraCount,
    leftState: null,
    rightState: null,
    action: 'done',
    message: `🎉 监控配置完成！监控全树所需最小摄像头数量为 ${cameraCount} 台`,
    codeLine: 7,
  });

  return steps;
}

/* ── Layout Tree & Render SVG ────────────────────────────── */
interface LayoutNode {
  id: number;
  val: number;
  x: number;
  y: number;
  left: LayoutNode | null;
  right: LayoutNode | null;
}

function layoutBinaryTree(root: TreeNode | null, width: number, height: number): LayoutNode | null {
  if (!root) return null;

  function getHeight(n: TreeNode | null): number {
    if (!n) return 0;
    return 1 + Math.max(getHeight(n.left), getHeight(n.right));
  }

  const treeHeight = getHeight(root);
  const levelHeight = Math.min(85, (height - 60) / Math.max(1, treeHeight));

  function assignCoords(node: TreeNode | null, depth: number, leftBound: number, rightBound: number): LayoutNode | null {
    if (!node) return null;
    const x = (leftBound + rightBound) / 2;
    const y = 35 + depth * levelHeight;

    const layoutLeft = assignCoords(node.left, depth + 1, leftBound, x);
    const layoutRight = assignCoords(node.right, depth + 1, x, rightBound);

    return {
      id: node.id,
      val: node.val,
      x,
      y,
      left: layoutLeft,
      right: layoutRight,
    };
  }

  return assignCoords(root, 0, 20, width - 20);
}

/* ── Visualizer class ─────────────────────────────────────── */
export class TreeCamerasVisualizer extends StepVisualizer<CameraStep> {
  protected codeLanguages = TREE_CAMERAS_CODE_LANGUAGES;
  protected codeLines = TREE_CAMERAS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '监控二叉树 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private nodeContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#tc-sandbox-container');
    this.nodeContainer = this.root.querySelector('#tc-node-container');
    this.decisionMonitorContainer = this.root.querySelector('#tc-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#tc-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.tc-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tEl = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (tEl && btn.dataset.tree) tEl.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: TREE_CAMERAS_PROBLEM_HTML,
      analysisHtml: TREE_CAMERAS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): CameraStep[] {
    const tEl = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    let arr: (number | null)[] = [0, 0, null, 0, 0];
    try {
      const parsed = JSON.parse(tEl?.value || '[0,0,null,0,0]');
      if (Array.isArray(parsed)) {
        arr = parsed;
      }
    } catch {
      arr = [0, 0, null, 0, 0];
    }

    const tree = parseTreeFromArray(arr);
    return buildTreeCameraSteps(tree);
  }

  protected renderStep(step: CameraStep): void {
    const root = step.root;
    const nodeStates = step.nodeStates;

    // 1. 渲染二叉树自适应 SVG 沙盘 (Card 1)
    if (this.sandboxContainer) {
      if (!root) {
        this.sandboxContainer.innerHTML = `<span style="color:#94a3b8; font-size:12px;">空二叉树</span>`;
        return;
      }

      const svgW = 540;
      const svgH = 260;
      const layoutRoot = layoutBinaryTree(root, svgW, svgH);

      const linesSvg: string[] = [];
      const nodesSvg: string[] = [];

      function traverse(n: LayoutNode | null) {
        if (!n) return;

        if (n.left) {
          linesSvg.push(`
            <line x1="${n.x}" y1="${n.y}" x2="${n.left.x}" y2="${n.left.y}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="none" />
          `);
          traverse(n.left);
        }
        if (n.right) {
          linesSvg.push(`
            <line x1="${n.x}" y1="${n.y}" x2="${n.right.x}" y2="${n.right.y}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="none" />
          `);
          traverse(n.right);
        }

        const state = nodeStates[n.id]; // 0, 1, 2 or undefined
        const isCurrent = n.id === step.currentNodeId;

        let fill = '#ffffff';
        let stroke = '#94a3b8';
        let stateEmoji = '';

        if (state === 1) {
          fill = '#fef2f2';
          stroke = '#ef4444';
          stateEmoji = '📷';
        } else if (state === 2) {
          fill = '#eff6ff';
          stroke = '#3b82f6';
          stateEmoji = '🛡️';
        } else if (state === 0) {
          fill = '#f8fafc';
          stroke = '#94a3b8';
          stateEmoji = '⚪';
        }

        const ringSvg = isCurrent
          ? `<circle cx="${n.x}" cy="${n.y}" r="23" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,3" />`
          : '';

        nodesSvg.push(`
          <g>
            ${ringSvg}
            <circle cx="${n.x}" cy="${n.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
            <text x="${n.x}" y="${n.y - 1}" text-anchor="middle" dominant-baseline="central" font-size="${stateEmoji ? '11px' : '12px'}" font-weight="800" fill="#0f172a" font-family="'JetBrains Mono', monospace">
              ${stateEmoji || n.val}
            </text>
            <text x="${n.x}" y="${n.y + 26}" text-anchor="middle" font-size="9px" font-weight="700" fill="${isCurrent ? '#ef4444' : '#64748b'}">
              ${isCurrent ? '📍当前' : `[${n.id}]`}
            </text>
          </g>
        `);
      }

      traverse(layoutRoot);

      this.sandboxContainer.innerHTML = `
        <svg viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; max-height: 250px;">
          ${linesSvg.join('')}
          ${nodesSvg.join('')}
        </svg>
      `;
    }

    // 2. 渲染当前后序节点 (Card 2 Left)
    if (this.nodeContainer) {
      const curId = step.currentNodeId;
      const st = curId ? nodeStates[curId] : null;

      this.nodeContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前访问节点:</span>
            <span style="font-family: monospace; font-weight:800; color: #ef4444; font-size: 12.5px;">
              ${curId ? `节点 [${curId}]` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>子节点状态 (左, 右):</span>
            <span style="font-family: monospace; font-weight:700; color: #2563eb;">
              ${step.leftState !== null ? `(左: ${step.leftState}, 右: ${step.rightState})` : '-'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心状态转移决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPlace = step.action === 'place_camera' || step.action === 'root_camera';
      const isCover = step.action === 'covered_by_child';
      const isWait = step.action === 'wait_parent';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>贪心判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPlace ? '#fef2f2' : isCover ? '#eff6ff' : isWait ? '#f8fafc' : '#ecfdf5'}; color: ${isPlace ? '#dc2626' : isCover ? '#2563eb' : isWait ? '#64748b' : '#059669'}; border: 1px solid ${isPlace ? '#fecaca' : isCover ? '#bfdbfe' : isWait ? '#e2e8f0' : '#a7f3d0'};">
              ${isPlace ? '📷 安装摄像头 (覆照父子)' : isCover ? '🛡️ 被子节点摄像头覆盖' : isWait ? '⚪ 暂无覆盖 (留待父节点覆盖)' : '✓ 遍历完成'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ef4444; font-family:monospace;">后序左右中自底向上，叶子节点的父节点优先装摄像头</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最小摄像头安装配置看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>最小摄像头数量: <strong style="color: #ef4444; font-family: monospace; font-size: 13.5px;">${step.cameraCount}</strong> 台</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">后序自底向上贪心最优解</span>
          </div>
        </div>
      `;
    }

    const badgeCam = this.root?.querySelector('#badge-camera-count');
    if (badgeCam) {
      badgeCam.textContent = `摄像头: ${step.cameraCount}`;
    }



    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '访问';

        if (st.action === 'place_camera' || st.action === 'root_camera') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '装摄像头';
        } else if (st.action === 'covered_by_child') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '已覆盖';
        } else if (st.action === 'wait_parent') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '留父覆盖';
        } else if (st.action === 'done') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'tree-cameras',
  name: '监控二叉树',
  viewId: 'algo-tree-cameras-view',
  category: 'greedy',
  description: '后序自底向上贪心遍历，0=无覆盖/1=装摄像头/2=已覆盖，叶子父节点安装摄像头覆盖率最高',
  icon: '📷',
  template,
  Visualizer: TreeCamerasVisualizer,
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握二叉树后序遍历与状态机的贪心结合，理解自底向上局部最优推导全局最少的解题范式',
});