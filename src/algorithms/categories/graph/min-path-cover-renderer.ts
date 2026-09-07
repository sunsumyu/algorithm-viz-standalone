/**
 * DAG 最小路径覆盖 (DAG Minimum Path Cover - 网络流 / 二分图匹配) 声明式可视化器
 * 进阶网络流/二分图: 拆点 u -> u_in, u_out、二分图最大匹配、路径数 = n - 最大匹配
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIN_PATH_COVER_CODE_LANGUAGES,
  MIN_PATH_COVER_PROBLEM_HTML,
  MIN_PATH_COVER_ANALYSIS_HTML,
} from './min-path-cover-problem-content';

export interface PathCoverStep {
  splitMatches: Array<[number, number]>;
  currentMatchingCount: number;
  minPathsCount: number;
  recoveredPaths: number[][];
  status: 'init' | 'match' | 'recover' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  curU?: number;
  metrics?: Record<string, any>;
}

export function buildMinPathCoverSteps(): PathCoverStep[] {
  const steps: PathCoverStep[] = [];

  function makeStep(data: Omit<PathCoverStep, 'metrics'>): PathCoverStep {
    const curUStr = data.curU ? `节点 ${data.curU}_out` : '——';
    const formulaStr = `4 - ${data.currentMatchingCount} = ${data.minPathsCount}`;
    return {
      ...data,
      metrics: {
        'metric-match-count': `${data.currentMatchingCount} 条匹配`,
        'metric-path-count': `${data.minPathsCount} 条路径`,
        'metric-cur-node': curUStr,
        'metric-path-formula': formulaStr,
        'match-count': `${data.currentMatchingCount} 条匹配`,
        'path-count': `${data.minPathsCount} 条路径`,
        'cur-node': curUStr,
        'path-formula': formulaStr,
      },
    };
  }

  // 1. 函数入口与拆点建图说明
  steps.push(
    makeStep({
      splitMatches: [],
      currentMatchingCount: 0,
      minPathsCount: 4,
      recoveredPaths: [[1], [2], [3], [4]],
      status: 'init',
      message: '🚀 [函数入口] solve: DAG 拆点建立二分图，每个点 u 拆为出点 u_out 与入点 v_in。',
      log: '初始化 DAG 最小路径覆盖，节点数 n = 4',
      codeLine: 29,
    })
  );

  // 2. 初始化匹配数组
  steps.push(
    makeStep({
      splitMatches: [],
      currentMatchingCount: 0,
      minPathsCount: 4,
      recoveredPaths: [[1], [2], [3], [4]],
      status: 'init',
      message: '📦 [初始化状态] match[1..4] 置为 0，初始 4 个孤立点各自构成独立路径，覆盖数 = 4。',
      log: 'match = new int[5]; minPaths = 4',
      codeLine: 37,
    })
  );

  // --- 节点 1 寻找增广路 ---
  // 3. 循环进入节点 1
  steps.push(
    makeStep({
      curU: 1,
      splitMatches: [],
      currentMatchingCount: 0,
      minPathsCount: 4,
      recoveredPaths: [[1], [2], [3], [4]],
      status: 'match',
      message: '🔍 [节点 1 寻增广路] i = 1，清空 vis 访问标记，准备为出点 1_out 寻找可用入点。',
      log: 'for i = 1: Arrays.fill(vis, false); dfs(1)',
      codeLine: 43,
    })
  );

  // 4. 节点 1 尝试连接入点 2_in
  steps.push(
    makeStep({
      curU: 1,
      splitMatches: [],
      currentMatchingCount: 0,
      minPathsCount: 4,
      recoveredPaths: [[1], [2], [3], [4]],
      status: 'match',
      message: '⚡ [尝试边 (1, 2)] 遍历邻接点 v = 2，标记 vis[2] = true。',
      log: '| dfs(1): 考察边 1 -> 2, vis[2] = true',
      codeLine: 18,
    })
  );

  // 5. 发现入点 2_in 未被匹配
  steps.push(
    makeStep({
      curU: 1,
      splitMatches: [[1, 2]],
      currentMatchingCount: 1,
      minPathsCount: 3,
      recoveredPaths: [[1, 2], [3], [4]],
      status: 'match',
      message: '✓ [匹配成功 (1➔2)] 检测到 match[2] == 0，入点 2_in 未被占用，成功匹配 match[2] = 1！',
      log: '| match[2] == 0 -> match[2] = 1, return true',
      codeLine: 20,
    })
  );

  // 6. 路径合并为 [1->2]
  steps.push(
    makeStep({
      curU: 1,
      splitMatches: [[1, 2]],
      currentMatchingCount: 1,
      minPathsCount: 3,
      recoveredPaths: [[1, 2], [3], [4]],
      status: 'match',
      message: '📈 [匹配数 +1] 成功增广一条匹配边，匹配数 maxMatch = 1，路径 [1] 与 [2] 合并为 [1 ➔ 2]！',
      log: 'maxMatch++ -> 1; 路径数 = 4 - 1 = 3',
      codeLine: 45,
    })
  );

  // --- 节点 2 寻找增广路 ---
  // 7. 循环进入节点 2
  steps.push(
    makeStep({
      curU: 2,
      splitMatches: [[1, 2]],
      currentMatchingCount: 1,
      minPathsCount: 3,
      recoveredPaths: [[1, 2], [3], [4]],
      status: 'match',
      message: '🔍 [节点 2 寻增广路] i = 2，清空 vis 访问标记，准备为出点 2_out 寻找可用入点。',
      log: 'for i = 2: Arrays.fill(vis, false); dfs(2)',
      codeLine: 43,
    })
  );

  // 8. 节点 2 尝试连接入点 3_in
  steps.push(
    makeStep({
      curU: 2,
      splitMatches: [[1, 2]],
      currentMatchingCount: 1,
      minPathsCount: 3,
      recoveredPaths: [[1, 2], [3], [4]],
      status: 'match',
      message: '⚡ [尝试边 (2, 3)] 遍历邻接点 v = 3，标记 vis[3] = true。',
      log: '| dfs(2): 考察边 2 -> 3, vis[3] = true',
      codeLine: 18,
    })
  );

  // 9. 发现入点 3_in 未被匹配
  steps.push(
    makeStep({
      curU: 2,
      splitMatches: [
        [1, 2],
        [2, 3],
      ],
      currentMatchingCount: 2,
      minPathsCount: 2,
      recoveredPaths: [[1, 2, 3], [4]],
      status: 'match',
      message: '✓ [匹配成功 (2➔3)] 检测到 match[3] == 0，入点 3_in 尚未被占用，成功匹配 match[3] = 2！',
      log: '| match[3] == 0 -> match[3] = 2, return true',
      codeLine: 20,
    })
  );

  // 10. 路径合并为 [1->2->3]
  steps.push(
    makeStep({
      curU: 2,
      splitMatches: [
        [1, 2],
        [2, 3],
      ],
      currentMatchingCount: 2,
      minPathsCount: 2,
      recoveredPaths: [[1, 2, 3], [4]],
      status: 'match',
      message: '📈 [匹配数 +1] 再次增广成功，匹配数 maxMatch = 2，路径扩展为 [1 ➔ 2 ➔ 3]，剩余路径数 = 2！',
      log: 'maxMatch++ -> 2; 路径数 = 4 - 2 = 2',
      codeLine: 45,
    })
  );

  // --- 节点 3 寻找增广路 ---
  // 11. 循环进入节点 3
  steps.push(
    makeStep({
      curU: 3,
      splitMatches: [
        [1, 2],
        [2, 3],
      ],
      currentMatchingCount: 2,
      minPathsCount: 2,
      recoveredPaths: [[1, 2, 3], [4]],
      status: 'match',
      message: '🔍 [节点 3 寻增广路] i = 3，清空 vis 访问标记，准备为出点 3_out 寻找可用入点。',
      log: 'for i = 3: Arrays.fill(vis, false); dfs(3)',
      codeLine: 43,
    })
  );

  // 12. 节点 3 尝试连接入点 4_in
  steps.push(
    makeStep({
      curU: 3,
      splitMatches: [
        [1, 2],
        [2, 3],
      ],
      currentMatchingCount: 2,
      minPathsCount: 2,
      recoveredPaths: [[1, 2, 3], [4]],
      status: 'match',
      message: '⚡ [尝试边 (3, 4)] 遍历邻接点 v = 4，标记 vis[4] = true。',
      log: '| dfs(3): 考察边 3 -> 4, vis[4] = true',
      codeLine: 18,
    })
  );

  // 13. 发现入点 4_in 未被匹配
  steps.push(
    makeStep({
      curU: 3,
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'match',
      message: '✓ [匹配成功 (3➔4)] 检测到 match[4] == 0，入点 4_in 尚未被占用，成功匹配 match[4] = 3！',
      log: '| match[4] == 0 -> match[4] = 3, return true',
      codeLine: 20,
    })
  );

  // 14. 路径合并为 [1->2->3->4]
  steps.push(
    makeStep({
      curU: 3,
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'match',
      message: '📈 [匹配数 +1] 再次增广成功，匹配数 maxMatch = 3，整图路径贯通为一条：[1 ➔ 2 ➔ 3 ➔ 4]！',
      log: 'maxMatch++ -> 3; 路径数 = 4 - 3 = 1',
      codeLine: 45,
    })
  );

  // --- 节点 4 寻找增广路 ---
  // 15. 循环进入节点 4
  steps.push(
    makeStep({
      curU: 4,
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'match',
      message: '🔍 [节点 4 寻增广路] i = 4，出点 4_out 为 DAG 终点，出度为 0。',
      log: 'for i = 4: adj[4] 为空',
      codeLine: 43,
    })
  );

  // 16. 节点 4 无出边返回 false
  steps.push(
    makeStep({
      curU: 4,
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'match',
      message: '🛑 [无出边增广结束] 节点 4 没有任何出边，dfs(4) 直接返回 false，匹配数保持 3。',
      log: '| dfs(4) -> false (无出边)',
      codeLine: 25,
    })
  );

  // 17. 匈牙利循环完成
  steps.push(
    makeStep({
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'recover',
      message: '🎯 [匈牙利循环结束] 所有 4 个出点遍历匹配完毕，二分图最大匹配数确定为 3。',
      log: '循环结束：maxMatch = 3',
      codeLine: 48,
    })
  );

  // 18. 计算最小路径覆盖数
  steps.push(
    makeStep({
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'recover',
      message: '👑 [柯尼希/路径覆盖定理] 最小不相交路径数 = n - maxMatch = 4 - 3 = 1！',
      log: 'int minPaths = n - maxMatch = 4 - 3 = 1',
      codeLine: 50,
    })
  );

  // 19. 路径链还原确认
  steps.push(
    makeStep({
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'done',
      message: '🔗 [路径追踪验证] 从未被作为入点匹配的起始点 1 出发，依次沿 match 追踪：1 ➔ 2 ➔ 3 ➔ 4。',
      log: '追踪路径：1 -> 2 -> 3 -> 4 覆盖全图',
      codeLine: 50,
    })
  );

  // 20. 最终完成返回
  steps.push(
    makeStep({
      splitMatches: [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      currentMatchingCount: 3,
      minPathsCount: 1,
      recoveredPaths: [[1, 2, 3, 4]],
      status: 'done',
      message: '🎉 [求解圆满完成] 返回最小路径覆盖数 1，路径集合为 {[1 ➔ 2 ➔ 3 ➔ 4]}，100% 节点覆盖！',
      log: '✓ return minPaths = 1; 算法求解完毕！',
      codeLine: 51,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PathCoverStep>({
  id: 'min-path-cover',
  name: 'DAG 最小路径覆盖 (Min Path Cover)',
  viewId: 'algo-min-path-cover-view',
  category: 'graph',
  icon: '🛣️',
  badge: {
    mode: '拆点二分图最大匹配',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🛣️ DAG 拆点二分图与路径合并沙盘',
  card2Title: '🧭 拆点匹配与路径数监视器',
  card2Desc: '二分图出点与入点匹配、当前覆盖路径集合与最小路径数公式',
  legend: [
    { label: '出点集合 (U_out)', color: '#0284c7' },
    { label: '入点集合 (V_in)', color: '#f59e0b' },
    { label: '🟢 匹配边 / 路径段', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点 DAG 经典覆盖', values: {} },
  ],
  metrics: [
    { id: 'metric-match-count', label: '二分图匹配数', color: '#2563eb' },
    { id: 'metric-path-count', label: '最小路径覆盖数', color: '#10b981' },
    { id: 'metric-cur-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'metric-path-formula', label: '定理公式', color: '#8b5cf6' },
  ],
  codeLanguages: MIN_PATH_COVER_CODE_LANGUAGES,
  problemHtml: MIN_PATH_COVER_PROBLEM_HTML,
  analysisHtml: MIN_PATH_COVER_ANALYSIS_HTML,
  buildSteps: () => buildMinPathCoverSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <!-- 匹配连线 -->
          ${step.splitMatches
            .map(([u, v]) => {
              const y1 = 35 + (u - 1) * 45;
              const y2 = 35 + (v - 1) * 45;
              return `<line x1="80" y1="${y1}" x2="230" y2="${y2}" stroke="#10b981" stroke-width="3" />`;
            })
            .join('')}

          <!-- 左侧出点 U_out -->
          <g><circle cx="80" cy="35" r="14" fill="#0284c7" /><text x="80" y="39" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1_out</text></g>
          <g><circle cx="80" cy="80" r="14" fill="#0284c7" /><text x="80" y="84" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2_out</text></g>
          <g><circle cx="80" cy="125" r="14" fill="#0284c7" /><text x="80" y="129" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3_out</text></g>
          <g><circle cx="80" cy="170" r="14" fill="#0284c7" /><text x="80" y="174" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4_out</text></g>

          <!-- 右侧入点 V_in -->
          <g><circle cx="230" cy="35" r="14" fill="#f59e0b" /><text x="230" y="39" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1_in</text></g>
          <g><circle cx="230" cy="80" r="14" fill="#f59e0b" /><text x="230" y="84" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2_in</text></g>
          <g><circle cx="230" cy="125" r="14" fill="#f59e0b" /><text x="230" y="129" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3_in</text></g>
          <g><circle cx="230" cy="170" r="14" fill="#f59e0b" /><text x="230" y="174" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4_in</text></g>
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 绿色连线为匹配成功的路径段 | 每匹配一条边，全图路径总数减少 1
        </div>
      </div>
    `;

    const root = container.closest('#algo-min-path-cover-view');
    if (root) {
      const matchEl = root.querySelector('#metric-match-count') || root.querySelector('#match-count');
      const pathEl = root.querySelector('#metric-path-count') || root.querySelector('#path-count');
      const nodeEl = root.querySelector('#metric-cur-node') || root.querySelector('#cur-node');
      const formulaEl = root.querySelector('#metric-path-formula') || root.querySelector('#path-formula');

      if (matchEl) matchEl.textContent = `${step.currentMatchingCount} 条匹配`;
      if (pathEl) pathEl.textContent = `${step.minPathsCount} 条路径`;
      if (nodeEl) nodeEl.textContent = step.curU ? `节点 ${step.curU}_out` : '——';
      if (formulaEl) formulaEl.textContent = `4 - ${step.currentMatchingCount} = ${step.minPathsCount}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pathList = step.recoveredPaths.map((p) => `[${p.join(' ➔ ')}]`).join(', ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前路径覆盖:</span>
              <strong style="color: #10b981; font-family: monospace;">${pathList}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 最小路径覆盖定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">MinPath = N - MaxMatch = 4 - ${step.currentMatchingCount} = ${step.minPathsCount}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'min-path-cover',
  name: 'DAG 最小路径覆盖 (Min Path Cover)',
  viewId: 'algo-min-path-cover-view',
  category: 'graph',
  description: '进阶网络流与二分图建模：DAG 拆点二分图最大匹配、路径数 n - 最大匹配与路径还原 (洛谷 P2764)',
  icon: '🛣️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 65,
  learningGoal: '掌握 DAG 最小路径覆盖转化为二分图最大匹配的建模技巧与路径重建算法',
});

export { Visualizer as MinPathCoverVisualizer };
