/**
 * Class 055: 单调队列·下 (Monotonic Queue Part 2) 共享沙盘与渲染器
 * 1. 和至少为 K 的最短子数组 (Shortest Subarray with Sum at Least K / LeetCode 862)
 * 2. 满足不等式的最大值 (Max Value of Equation / LeetCode 1499)
 * 3. 你可以安排的最多任务数目 (Maximum Number of Tasks You Can Assign / LeetCode 2071)
 *
 * 遵循 DOM 契约：
 * - 纯净沙盘，零 h1~h6
 * - 语义化包裹，杜绝误触指标药丸面板
 * - 响应式多栏支持
 */

import { HighlightTarget } from '../../../../core/renderers/dark-code-terminal-presenter';

export interface Step055 {
  title?: string;
  description?: string;
  decision?: string;
  message?: string;
  log?: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  metrics?: Record<string, string | number>;

  // Code01 和至少为 K
  arr?: number[];
  sum?: number[];
  k?: number;
  curI?: number;
  deque?: number[]; // 下标
  bestLen?: number;
  activeMatch?: { l: number; r: number; sumDiff: number } | null;

  // Code02 满足不等式的最大值
  points?: Array<[number, number]>;
  maxEquationK?: number;
  curPointIdx?: number;
  pointDeque?: Array<[number, number]>; // [x, y]
  curBestAns?: number;
  matchedPair?: { prev: [number, number]; cur: [number, number]; val: number } | null;

  // Code03 安排最多任务
  tasks?: number[];
  workers?: number[];
  pills?: number[];
  pillsLeft?: number;
  strength?: number;
  midM?: number;
  workerIdx?: number;
  taskDeque?: number[]; // 待选任务编号
  usedPills?: number;
  actionType?: 'init' | 'check_mid' | 'unlock' | 'take_free' | 'take_pill' | 'fail' | 'done';
}

/**
 * 沙盘 1: 和至少为 K 的最短子数组 (Code01)
 * 展示原数组、前缀和数组、单调递增队列、当前达标匹配区间
 */
export function renderShortestSubarrayBoard(step: Step055): string {
  const arr = step.arr || [];
  const sum = step.sum || [];
  const k = step.k || 0;
  const curI = step.curI !== undefined ? step.curI : -1;
  const deque = step.deque || [];
  const match = step.activeMatch;
  const bestLen = step.bestLen !== undefined && step.bestLen !== Infinity ? step.bestLen : -1;

  // 原数组序列
  const arrHtml = arr.map((v, idx) => {
    const isMatched = match && idx >= match.l && idx < match.r;
    let bg = '#f8fafc';
    let border = '1px solid #cbd5e1';
    let color = '#334155';

    if (isMatched) {
      bg = '#d1fae5';
      border = '1.5px solid #10b981';
      color = '#065f46';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 38px;">
        <span style="font-size: 9px; color: #64748b; font-family: monospace;">arr[${idx}]</span>
        <div style="width: 36px; height: 34px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;">
          ${v}
        </div>
      </div>
    `;
  }).join('');

  // 前缀和序列
  const sumHtml = sum.map((s, idx) => {
    const isCur = idx === curI;
    const inDq = deque.includes(idx);
    const isHead = deque.length > 0 && deque[0] === idx;

    let bg = '#f8fafc';
    let border = '1px solid #cbd5e1';
    let color = '#334155';

    if (isCur) {
      bg = '#dbeafe';
      border = '2px solid #2563eb';
      color = '#1e40af';
    } else if (isHead) {
      bg = '#fef3c7';
      border = '2px solid #f59e0b';
      color = '#92400e';
    } else if (inDq) {
      bg = '#f1f5f9';
      border = '1.5px solid #94a3b8';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 44px;">
        <span style="font-size: 9px; color: #64748b; font-family: monospace;">sum[${idx}]</span>
        <div style="width: 42px; height: 34px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">
          ${s}
        </div>
      </div>
    `;
  }).join('');

  // 队列内前缀和
  const dqHtml = deque.length === 0
    ? `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">(空队列)</span>`
    : deque.map((idx, pos) => {
        const val = sum[idx];
        const isHead = pos === 0;
        return `
          <div style="padding: 4px 8px; border-radius: 6px; background: ${isHead ? '#fef3c7' : '#f8fafc'};
                      border: 1px solid ${isHead ? '#f59e0b' : '#cbd5e1'}; font-family: monospace; font-size: 11.5px; font-weight: 700;">
            sum[${idx}]=${val} ${isHead ? '(队头最小)' : ''}
          </div>
        `;
      }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #334155;">📊 原数组序列 (目标累加和 K = ${k})</span>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
          ${arrHtml}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #2563eb;">📈 前缀和序列 sum[i] (当前右端点 i = ${curI >= 0 ? curI : '—'})</span>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
          ${sumHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #0f172a;">🥞 单调递增前缀和队列 (越靠前且和越小者优先淘汰)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 38px;
                    padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${dqHtml}
        </div>
      </div>

      ${match ? `
        <div style="padding: 8px 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;
                    display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #065f46;">
            🎯 命中达标子数组 arr[${match.l}..${match.r - 1}]: 和 = ${match.sumDiff} ≥ ${k}, 长度 = ${match.r - match.l}
          </span>
          <span style="font-size: 12px; font-weight: 800; color: #047857; font-family: monospace;">
            历史最短 = ${bestLen}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * 沙盘 2: 满足不等式的最大值 (Code02)
 * 展示已按 x 排序的点对散点沙盘、单调递减队列 (存储 y - x 权值)、当前最优配对
 */
export function renderMaxValueOfEquationBoard(step: Step055): string {
  const points = step.points || [];
  const k = step.maxEquationK || 0;
  const curIdx = step.curPointIdx !== undefined ? step.curPointIdx : -1;
  const deque = step.pointDeque || [];
  const pair = step.matchedPair;
  const curAns = step.curBestAns !== undefined && step.curBestAns !== -Infinity ? step.curBestAns : -Infinity;

  // 点卡片列表
  const ptsHtml = points.map(([x, y], idx) => {
    const isCur = idx === curIdx;
    const isHead = deque.length > 0 && deque[0][0] === x && deque[0][1] === y;
    const inDq = deque.some(([dx, dy]) => dx === x && dy === y);

    let border = '1px solid #cbd5e1';
    let bg = '#ffffff';
    let color = '#334155';

    if (isCur) {
      border = '2px solid #ec4899';
      bg = '#fdf2f8';
      color = '#be185d';
    } else if (isHead) {
      border = '2px solid #8b5cf6';
      bg = '#f5f3ff';
      color = '#6d28d9';
    } else if (inDq) {
      border = '1.5px solid #a855f7';
      bg = '#faf5ff';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 58px;">
        <span style="font-size: 9px; color: #64748b; font-family: monospace;">#${idx}</span>
        <div style="padding: 4px 6px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 11px; font-weight: 700;">(${x}, ${y})</span>
          <span style="font-size: 9px; opacity: 0.85;">y-x = ${y - x}</span>
        </div>
        <div style="font-size: 9px; font-weight: 700; margin-top: 2px;">
          ${isCur ? '<span style="color: #ec4899;">当前点 j</span>' : ''}
          ${isHead ? '<span style="color: #8b5cf6;">最优前点 i</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  // 队列内部 (y - x 递减)
  const dqHtml = deque.length === 0
    ? `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">(空队列)</span>`
    : deque.map(([x, y], pos) => {
        const diff = y - x;
        const isHead = pos === 0;
        return `
          <div style="padding: 4px 8px; border-radius: 6px; background: ${isHead ? '#f5f3ff' : '#ffffff'};
                      border: 1px solid ${isHead ? '#8b5cf6' : '#cbd5e1'}; font-family: monospace; font-size: 11.5px; font-weight: 700;">
            (${x}, ${y}) [权值 ${diff}] ${isHead ? '(Max)' : ''}
          </div>
        `;
      }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #334155;">📍 点集序列 (按 X 升序, 距离限制 |xi - xj| ≤ ${k})</span>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 2px 0;">
          ${ptsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #6b21a8;">🥞 单调递减队列 (队头到队尾 y-x 递减, 淘汰劣质小权值)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 38px;
                    padding: 8px 10px; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px;">
          ${dqHtml}
        </div>
      </div>

      ${pair ? `
        <div style="padding: 8px 12px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px;
                    display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #9d174d;">
            ✨ 点对 (${pair.prev[0]}, ${pair.prev[1]}) 与 (${pair.cur[0]}, ${pair.cur[1]}): 指标 = ${pair.val}
          </span>
          <span style="font-size: 13px; font-weight: 800; color: #be185d; font-family: monospace;">
            历史最大 = ${curAns}
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * 沙盘 3: 你可以安排的最多任务数目 (Code03)
 * 二分答案测试 m，展示当前选取的最小 m 个任务与最大 m 个工人、药丸余量与候选任务队列
 */
export function renderMaxTasksAssignBoard(step: Step055): string {
  const tasks = step.tasks || [];
  const workers = step.workers || [];
  const pillsLeft = step.pillsLeft !== undefined ? step.pillsLeft : 0;
  const strength = step.strength || 0;
  const midM = step.midM || 0;
  const workerIdx = step.workerIdx !== undefined ? step.workerIdx : -1;
  const taskDeque = step.taskDeque || [];
  const usedPills = step.usedPills || 0;

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <!-- 二分答案状态栏 -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">
          🎯 二分探测中点: 尝试完成 <strong>${midM}</strong> 个任务
        </span>
        <span style="font-size: 11.5px; font-weight: 700; color: #0284c7;">
          💊 药丸力值 +${strength}, 剩余药丸: ${pillsLeft} (已用: ${usedPills})
        </span>
      </div>

      <!-- 任务与工人概览 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
          <span style="font-size: 11px; font-weight: 700; color: #166534;">📋 当前选取的最小 ${midM} 个任务要求</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${tasks.slice(0, midM).map((t, idx) => `
              <span style="padding: 2px 6px; border-radius: 4px; background: #dcfce7; border: 1px solid #86efac; font-size: 10.5px; font-family: monospace; font-weight: 700; color: #15803d;">
                t[${idx}]=${t}
              </span>
            `).join('') || '<span style="font-size: 11px; color: #94a3b8;">无任务</span>'}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
          <span style="font-size: 11px; font-weight: 700; color: #1e40af;">👷 当前选取的最大 ${midM} 名工人力量</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${workers.slice(Math.max(0, workers.length - midM)).map((w, idx) => {
              const isCur = idx === workerIdx;
              return `
                <span style="padding: 2px 6px; border-radius: 4px; background: ${isCur ? '#3b82f6' : '#dbeafe'}; border: 1px solid #93c5fd; font-size: 10.5px; font-family: monospace; font-weight: 700; color: ${isCur ? '#ffffff' : '#1d4ed8'};">
                  w[${idx}]=${w}
                </span>
              `;
            }).join('') || '<span style="font-size: 11px; color: #94a3b8;">无工人</span>'}
          </div>
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <!-- 解锁候选任务双端队列 -->
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11.5px; font-weight: 700; color: #475569;">🥞 可胜任任务双端队列 (队头最易完成, 队尾最难任务)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 38px;
                    padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${taskDeque.length === 0
            ? `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">(暂无解锁任务)</span>`
            : taskDeque.map((tIdx, pos) => {
                const req = tasks[tIdx];
                const isHead = pos === 0;
                const isTail = pos === taskDeque.length - 1;
                return `
                  <div style="padding: 3px 6px; border-radius: 4px; background: ${isHead ? '#ecfdf5' : isTail ? '#fef2f2' : '#ffffff'};
                              border: 1px solid ${isHead ? '#10b981' : isTail ? '#ef4444' : '#cbd5e1'}; font-family: monospace; font-size: 11px; font-weight: 700;
                              color: ${isHead ? '#065f46' : isTail ? '#b91c1c' : '#334155'};">
                    任务#${tIdx} (${req}) ${isHead ? '←不吃药取' : isTail ? '←吃药取' : ''}
                  </div>
                `;
              }).join('')}
        </div>
      </div>
    </div>
  `;
}
