/**
 * 爬楼梯可视化器（动态规划）— 声明式 4-Card 标准架构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';

interface StairsStep {
  n: number;
  currentIndex: number;
  dp: number[];
  status: 'init' | 'compute' | 'done';
  message: string;
  log: string;
  codeLine: number | { from: number; to: number };
  metrics?: Record<string, string>;
}

export function buildStairsSteps(n: number): StairsStep[] {
  const steps: StairsStep[] = [];

  if (n <= 2) {
    steps.push({
      n,
      currentIndex: n,
      dp: Array.from({ length: n + 1 }, (_, i) => i),
      status: 'done',
      message: `n=${n} 是基础情况，答案为 ${n}。`,
      log: `基础情况：climbStairs(${n}) = ${n}。`,
      codeLine: 2,
    });
    return steps;
  }

  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;

  steps.push({
    n,
    currentIndex: 2,
    dp: [...dp],
    status: 'init',
    message: '初始化：dp[1] = 1，dp[2] = 2。',
    log: '初始化 DP 数组。',
    codeLine: { from: 3, to: 5 },
  });

  for (let i = 3; i <= n; i++) {
    steps.push({
      n,
      currentIndex: i,
      dp: [...dp],
      status: 'compute',
      message: `准备计算 dp[${i}]，它来自 dp[${i - 1}] 和 dp[${i - 2}]。`,
      log: `进入循环 i=${i}。`,
      codeLine: 7,
    });

    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      n,
      currentIndex: i,
      dp: [...dp],
      status: 'compute',
      message: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}。`,
      log: `计算 dp[${i}] = ${dp[i]}。`,
      codeLine: 8,
    });
  }

  steps.push({
    n,
    currentIndex: n,
    dp: [...dp],
    status: 'done',
    message: `计算完成，爬到第 ${n} 阶共有 ${dp[n]} 种方法。`,
    log: `返回 dp[${n}] = ${dp[n]}。`,
    codeLine: 10,
  });

  return steps;
}

const CLIMB_STAIRS_JAVA_CODE = `public int climbStairs(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[1] = 1;
    dp[2] = 2;

    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`;

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: StairsStep[]): StairsStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'cur-idx': s.currentIndex >= 0 ? String(s.currentIndex) : '—',
      prev1: s.currentIndex >= 2 ? String(s.dp[s.currentIndex - 1] || '-') : '-',
      prev2: s.currentIndex >= 3 ? String(s.dp[s.currentIndex - 2] || '-') : '-',
      answer: s.status === 'done' ? String(s.dp[s.n]) : '-',
      action:
        s.currentIndex >= 3
          ? `dp[${s.currentIndex}] = dp[${s.currentIndex - 1}] + dp[${s.currentIndex - 2}]`
          : 'dp[i] = dp[i-1] + dp[i-2]',
    },
  }));
}

/** 主视觉：阶梯 DP 单元格 + 转移箭头 SVG */
export function renderClimbStairsCanvas(container: HTMLElement, step: StairsStep): void {
  const cellBase =
    'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-width: 64px; padding: 10px 8px; border-radius: 10px; border: 2px solid #e2e8f0; background: #ffffff; font-family: \'JetBrains Mono\', monospace; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;';

  const cellsHtml = Array.from({ length: step.n }, (_, k) => {
    const i = k + 1;
    const isSource = i === step.currentIndex - 1 || i === step.currentIndex - 2;
    const isActive = i === step.currentIndex;
    const isComputing = step.status === 'compute' && isActive;

    let bg = '#ffffff';
    let border = '#e2e8f0';
    let boxShadow = 'none';
    let labelColor = '#94a3b8';
    let valueColor = '#0f172a';

    if (isComputing) {
      bg = '#fffbeb';
      border = '#f59e0b';
      boxShadow = '0 0 12px rgba(245, 158, 11, 0.55)';
      labelColor = '#d97706';
      valueColor = '#b45309';
    } else if (isActive) {
      bg = '#eff6ff';
      border = '#3b82f6';
      labelColor = '#2563eb';
    } else if (isSource) {
      bg = '#f0fdf4';
      border = '#22c55e';
      labelColor = '#16a34a';
    }

    return `
      <div class="stairs-step" data-step="${i}" style="${cellBase} background: ${bg}; border-color: ${border}; box-shadow: ${boxShadow};">
        <div style="font-size: 9.5px; font-weight: 700; color: ${labelColor};">第 ${i} 阶</div>
        <div style="font-size: 15px; font-weight: 800; color: ${valueColor};">${step.dp[i] ?? '?'}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="stairs-track" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; gap: 10px; overflow-x: auto; padding: 14px 12px; box-sizing: border-box;">
      ${cellsHtml}
    </div>
  `;

  // 绘制转移箭头：dp[i-1] / dp[i-2] -> dp[i]（compute 状态且 i >= 3）
  if (step.status !== 'compute' || step.currentIndex < 3) return;

  const host = container.querySelector<HTMLElement>('.stairs-track');
  if (!host) return;

  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('class', 'stairs-transition-overlay');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.pointerEvents = 'none';

  const defs = document.createElementNS(svgNs, 'defs');
  const marker = document.createElementNS(svgNs, 'marker');
  marker.setAttribute('id', 'stairs-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '8');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '7');
  marker.setAttribute('markerHeight', '7');
  marker.setAttribute('orient', 'auto-start-reverse');
  const arrowPath = document.createElementNS(svgNs, 'path');
  arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrowPath.setAttribute('fill', '#fbbf24');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);
  host.appendChild(svg);

  const i = step.currentIndex;
  const sources = [i - 1, i - 2].filter((s) => s >= 1);
  const toCell = host.querySelector<HTMLElement>(`.stairs-step[data-step="${i}"]`);
  if (!toCell || sources.length === 0) return;

  const hostRect = host.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();
  const toX = toRect.left - hostRect.left + toRect.width / 2;
  const toY = toRect.top - hostRect.top + toRect.height / 2;

  sources.forEach((s) => {
    const fromCell = host.querySelector<HTMLElement>(`.stairs-step[data-step="${s}"]`);
    if (!fromCell) return;
    const fromRect = fromCell.getBoundingClientRect();
    const fromX = fromRect.left - hostRect.left + fromRect.width / 2;
    const fromY = fromRect.top - hostRect.top + fromRect.height / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const pad = 22;
    const x1 = fromX + (dx / dist) * pad;
    const y1 = fromY + (dy / dist) * pad;
    const x2 = toX - (dx / dist) * pad;
    const y2 = toY - (dy / dist) * pad;
    const midX = (x1 + x2) / 2;
    const offset = s === i - 2 ? -18 : 18;
    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('d', `M ${x1} ${y1} Q ${midX} ${(y1 + y2) / 2 + offset} ${x2} ${y2}`);
    path.setAttribute('stroke', '#fbbf24');
    path.setAttribute('stroke-width', '2.4');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#stairs-arrow)');
    const len = Math.hypot(x2 - x1, y2 - y1) * 1.15;
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    svg.appendChild(path);
  });
}

registerDeclarativeAlgorithm({
  id: 'climb-stairs',
  name: '爬楼梯（动态规划）',
  category: 'dynamic-programming',
  description: '使用状态转移 dp[i]=dp[i-1]+dp[i-2] 求方案数',
  icon: '🪜',
  difficulty: 1,
  levelOrder: 999,
  learningGoal: '理解一维 DP 的状态转移方程',
  inputs: [
    {
      id: 'n',
      label: '台阶数 n',
      type: 'number',
      defaultValue: '8',
      placeholder: '1 - 12',
    },
  ],
  presets: [
    { label: '示例 n=5', values: { n: '5' } },
    { label: '示例 n=8', values: { n: '8' } },
    { label: '示例 n=10', values: { n: '10' } },
  ],
  metrics: [
    { id: 'cur-idx', label: '当前阶梯 i', color: '#3b82f6' },
    { id: 'prev1', label: 'dp[i-1]', color: '#16a34a' },
    { id: 'prev2', label: 'dp[i-2]', color: '#16a34a' },
    { id: 'answer', label: '答案', color: '#f59e0b' },
    { id: 'action', label: '转移方程', color: '#2563eb' },
  ],
  legend: [
    { label: '当前计算', color: '#f59e0b' },
    { label: '转移来源', color: '#22c55e' },
    { label: '已就绪', color: '#3b82f6' },
  ],
  codeLanguages: { java: CLIMB_STAIRS_JAVA_CODE },
  generateSteps: (inputs) => {
    let n = parseInt(String(inputs.n ?? '8'), 10);
    if (!Number.isFinite(n)) n = 8;
    n = Math.max(1, Math.min(12, n));
    return withMetrics(buildStairsSteps(n));
  },
  renderCanvas: (container, step) => renderClimbStairsCanvas(container, step as StairsStep),
});
