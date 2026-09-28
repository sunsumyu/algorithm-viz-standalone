/**
 * Class 054: 单调队列·上 (Monotonic Queue Part 1) 共享沙盘与渲染器
 * 1. 滑动窗口最大值 (Sliding Window Maximum / LeetCode 239)
 * 2. 绝对差不超过限制的最长连续子数组 (Longest Subarray with Limit / LeetCode 1438)
 * 3. 接取落水的最小花盆 (Falling Water Flowerpot / 洛谷 P2698 / USACO 2012 Mar Silver)
 *
 * 遵循 DOM 契约：
 * - 纯净沙盘，零 h1~h6
 * - 语义化容器，杜绝误触指标药丸面板
 * - 移动端与全高清响应式支持
 */

import { HighlightTarget } from '../../../../core/renderers/dark-code-terminal-presenter';

export interface Step054 {
  title?: string;
  description?: string;
  decision?: string;
  message?: string;
  log?: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  metrics?: Record<string, string | number>;

  // Code01 滑动窗口最大值
  nums?: number[];
  k?: number;
  curIdx?: number;
  windowLeft?: number;
  windowRight?: number;
  deque?: number[]; // 下标
  ansList?: number[];

  // Code02 绝对差不超过限制
  left?: number;
  right?: number;
  maxVal?: number;
  minVal?: number;
  limit?: number;
  ansLen?: number;
  maxDeque?: number[]; // 下标
  minDeque?: number[]; // 下标

  // Code03 接取落水的最小花盆
  points?: Array<{ x: number; y: number; id: number }>;
  d?: number;
  curL?: number;
  curR?: number;
  bestW?: number;
  currentDiff?: number;
  validWindow?: boolean;
}

/**
 * 沙盘 1: 滑动窗口最大值 (Code01)
 * 展示数组条带、活动窗口高亮、单调队列下标及对应数值、已收集答案
 */
export function renderSlidingWindowBoard(step: Step054): string {
  const nums = step.nums || [];
  const k = step.k || 3;
  const wL = step.windowLeft !== undefined ? step.windowLeft : -1;
  const wR = step.windowRight !== undefined ? step.windowRight : -1;
  const deque = step.deque || [];
  const ansList = step.ansList || [];

  const itemsHtml = nums.map((val, idx) => {
    const inWindow = idx >= wL && idx <= wR && wL >= 0;
    const isHead = deque.length > 0 && deque[0] === idx;
    const inDeque = deque.includes(idx);

    let border = '1px solid #cbd5e1';
    let bg = '#f8fafc';
    let color = '#334155';

    if (isHead) {
      border = '2px solid #10b981';
      bg = '#d1fae5';
      color = '#065f46';
    } else if (inDeque) {
      border = '1.5px solid #3b82f6';
      bg = '#dbeafe';
      color = '#1e40af';
    } else if (inWindow) {
      border = '1.5px dashed #f59e0b';
      bg = '#fef3c7';
      color = '#92400e';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 44px;">
        <span style="font-size: 10px; color: #64748b; font-family: monospace;">[${idx}]</span>
        <div style="width: 40px; height: 38px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
                    box-shadow: ${isHead ? '0 0 10px rgba(16,185,129,0.35)' : 'none'};">
          ${val}
        </div>
        ${inWindow ? `<span style="font-size: 9px; color: #d97706; font-weight: 600; margin-top: 2px;">窗口内</span>` : '<span style="height: 14px;"></span>'}
      </div>
    `;
  }).join('');

  const dequeItemsHtml = deque.length === 0
    ? `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">(当前双端队列为空)</span>`
    : deque.map((idx, pos) => {
        const val = nums[idx];
        const isHead = pos === 0;
        const isTail = pos === deque.length - 1;
        return `
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="padding: 4px 8px; border-radius: 6px; background: ${isHead ? '#ecfdf5' : '#eff6ff'};
                        border: 1px solid ${isHead ? '#10b981' : '#3b82f6'}; color: ${isHead ? '#065f46' : '#1e40af'};
                        font-family: monospace; font-size: 12px; font-weight: 700; display: flex; flex-direction: column; align-items: center;">
              <span>arr[${idx}] = ${val}</span>
              <span style="font-size: 9px; opacity: 0.8;">${isHead ? '队头 (Max)' : isTail ? '队尾' : '内部'}</span>
            </div>
            ${pos < deque.length - 1 ? `<span style="color: #94a3b8; font-weight: 800;">&gt;</span>` : ''}
          </div>
        `;
      }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">📊 数组序列 (活动窗口 [${wL >= 0 ? wL : '—'} .. ${wR >= 0 ? wR : '—'}], 长度 K=${k}):</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 600;">当前扫描下标 i = ${step.curIdx !== undefined ? step.curIdx : '—'}</span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 4px 2px; align-items: center;">
          ${itemsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #0f172a;">🥞 单调双端队列 (队头到队尾单调递减, 淘汰劣质小值):</span>
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; min-height: 42px;
                    padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${dequeItemsHtml}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #059669;">🎯 已收集的窗口最大值答案列表:</span>
        <div style="padding: 6px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;
                    font-family: monospace; font-size: 13px; font-weight: 700; color: #059669;">
          [ ${ansList.join(', ')} ]
        </div>
      </div>
    </div>
  `;
}

/**
 * 沙盘 2: 绝对差不超过限制的最长连续子数组 (Code02)
 * 展示双指针窗口 [l, r)、maxQ (递减)、minQ (递增)、当前极差与 limit 对比
 */
export function renderLongestSubarrayLimitBoard(step: Step054): string {
  const nums = step.nums || [];
  const l = step.left !== undefined ? step.left : 0;
  const r = step.right !== undefined ? step.right : 0;
  const limit = step.limit !== undefined ? step.limit : 0;
  const maxQ = step.maxDeque || [];
  const minQ = step.minDeque || [];
  const maxVal = step.maxVal !== undefined ? step.maxVal : 0;
  const minVal = step.minVal !== undefined ? step.minVal : 0;
  const diff = maxVal - minVal;
  const isOver = diff > limit;

  const itemsHtml = nums.map((val, idx) => {
    const inWindow = idx >= l && idx < r;
    const isL = idx === l;
    const isR = idx === r;

    let border = '1px solid #cbd5e1';
    let bg = '#f8fafc';
    let color = '#334155';

    if (inWindow) {
      border = '1.5px solid #3b82f6';
      bg = '#eff6ff';
      color = '#1e3a8a';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 44px;">
        <span style="font-size: 10px; color: #64748b; font-family: monospace;">[${idx}]</span>
        <div style="width: 40px; height: 38px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">
          ${val}
        </div>
        <div style="display: flex; gap: 2px; margin-top: 2px; font-size: 9px; font-weight: 700;">
          ${isL ? '<span style="color: #2563eb;">L</span>' : ''}
          ${isR ? '<span style="color: #dc2626;">R(待入)</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  const renderDeque = (dq: number[], label: string, isMax: boolean) => {
    if (dq.length === 0) return `<span style="color: #94a3b8; font-style: italic; font-size: 12px;">(空)</span>`;
    return dq.map((idx, pos) => {
      const val = nums[idx];
      const isHead = pos === 0;
      const themeColor = isMax ? '#dc2626' : '#2563eb';
      const themeBg = isMax ? '#fef2f2' : '#eff6ff';
      return `
        <div style="padding: 3px 6px; border-radius: 4px; background: ${themeBg}; border: 1px solid ${themeColor};
                    color: ${themeColor}; font-family: monospace; font-size: 11px; font-weight: 700;">
          [${idx}]: ${val} ${isHead ? (isMax ? '(Max)' : '(Min)') : ''}
        </div>
      `;
    }).join('');
  };

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">📊 数组序列 (当前有效区间 [${l} .. ${r - 1}], 长度: ${Math.max(0, r - l)}):</span>
          <span style="font-size: 11px; font-weight: 700; color: ${isOver ? '#dc2626' : '#059669'};">
            极差 (Max - Min) = ${diff} ${isOver ? `> limit(${limit}) 超限!` : `≤ limit(${limit}) 合法`}
          </span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 4px 2px; align-items: center;">
          ${itemsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 4px; background: #fff1f2; padding: 8px 10px; border-radius: 6px; border: 1px solid #fecdd3;">
          <span style="font-size: 11px; font-weight: 700; color: #be123c;">🔻 maxDeque (单调递减, 队头维护最大值):</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
            ${renderDeque(maxQ, 'max', true)}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; background: #f0f9ff; padding: 8px 10px; border-radius: 6px; border: 1px solid #bae6fd;">
          <span style="font-size: 11px; font-weight: 700; color: #0369a1;">🔺 minDeque (单调递增, 队头维护最小值):</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
            ${renderDeque(minQ, 'min', false)}
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">🏆 全局历史最长合法长度 (Ans):</span>
        <span style="font-size: 16px; font-weight: 800; color: #059669; font-family: monospace;">${step.ansLen || 0}</span>
      </div>
    </div>
  `;
}

/**
 * 沙盘 3: 接取落水的最小花盆 (Code03)
 * 水滴在平面中的位置图、花盆放置区间 [xL, xR]、当前时间差 max(y) - min(y) 与 D 对比、双单调队列状态
 */
export function renderFallingWaterFlowerPotBoard(step: Step054): string {
  const points = step.points || [];
  const d = step.d || 0;
  const curL = step.curL !== undefined ? step.curL : -1;
  const curR = step.curR !== undefined ? step.curR : -1;
  const bestW = step.bestW !== undefined && step.bestW !== Infinity ? step.bestW : -1;
  const curDiff = step.currentDiff !== undefined ? step.currentDiff : 0;
  const isValid = step.validWindow;

  const leftPt = curL >= 0 && curL < points.length ? points[curL] : null;
  const rightPt = curR >= 0 && curR < points.length ? points[curR] : null;
  const curW = leftPt && rightPt ? (rightPt.x - leftPt.x) : 0;

  // 坐标卡片展示
  const pointsHtml = points.map((p, idx) => {
    const isSelected = idx >= curL && idx <= curR && curL >= 0;
    const isLeft = idx === curL;
    const isRight = idx === curR;

    let border = '1px solid #cbd5e1';
    let bg = '#ffffff';
    let color = '#334155';

    if (isSelected) {
      border = '1.5px solid #8b5cf6';
      bg = '#f5f3ff';
      color = '#5b21b6';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 52px;">
        <span style="font-size: 10px; color: #64748b; font-family: monospace;">#${idx}</span>
        <div style="padding: 4px 6px; border-radius: 6px; border: ${border}; background: ${bg}; color: ${color};
                    display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 11px; font-weight: 700;">💧 (${p.x}, ${p.y})</span>
          <span style="font-size: 9px; opacity: 0.8;">y = ${p.y}</span>
        </div>
        <div style="font-size: 9px; font-weight: 700; margin-top: 2px;">
          ${isLeft ? '<span style="color: #6366f1;">L边界</span>' : ''}
          ${isRight ? '<span style="color: #ec4899;">R边界</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #334155;">💧 水滴坐标序列 (按 X 坐标升序排列, 要求时间差 Δy ≥ ${d})</span>
          <span style="font-size: 11px; font-weight: 700; color: ${isValid ? '#059669' : '#d97706'};">
            当前区间时间差 Δy = ${curDiff} ${isValid ? `≥ D(${d}) 满足!` : `< D(${d}) 不满足`}
          </span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px; align-items: center;">
          ${pointsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1;"></div>

      <!-- 二维水滴与花盆覆盖 SVG 沙盘 -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #475569;">🪴 二维下落坐标与花盆覆盖区间:</span>
        <svg viewBox="0 0 600 130" style="width: 100%; height: 130px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <!-- X 轴地面基准线 -->
          <line x1="30" y1="105" x2="570" y2="105" stroke="#94a3b8" stroke-width="2" />
          <text x="575" y="109" font-size="10" fill="#64748b" font-family="monospace">X</text>

          ${(() => {
            if (points.length === 0) return '';
            const minX = Math.min(...points.map(p => p.x));
            const maxX = Math.max(...points.map(p => p.x));
            const maxY = Math.max(...points.map(p => p.y), 15);
            const spanX = Math.max(1, maxX - minX);
            const scaleX = (x: number) => 50 + ((x - minX) / (spanX + 2)) * 480;
            const scaleY = (y: number) => 95 - (y / maxY) * 75;

            // 绘制花盆底座
            let potSvg = '';
            if (leftPt && rightPt) {
              const potLeft = scaleX(leftPt.x) - 10;
              const potRight = scaleX(rightPt.x) + 10;
              const potW = Math.max(20, potRight - potLeft);
              potSvg = `
                <rect x="${potLeft}" y="103" width="${potW}" height="14" rx="4"
                      fill="${isValid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(139, 92, 246, 0.2)'}"
                      stroke="${isValid ? '#10b981' : '#8b5cf6'}" stroke-width="1.5" />
                <text x="${potLeft + potW / 2}" y="114" font-size="9" font-weight="700"
                      fill="${isValid ? '#065f46' : '#6b21a8'}" text-anchor="middle" font-family="monospace">
                  花盆 [${leftPt.x}..${rightPt.x}] 宽=${curW}
                </text>
              `;
            }

            // 绘制水滴与垂线
            const dropsSvg = points.map((p, idx) => {
              const cx = scaleX(p.x);
              const cy = scaleY(p.y);
              const inPot = idx >= curL && idx <= curR && curL >= 0;
              const circleColor = inPot ? (isValid ? '#10b981' : '#8b5cf6') : '#64748b';
              const fillColor = inPot ? (isValid ? '#d1fae5' : '#ede9fe') : '#ffffff';

              return `
                <line x1="${cx}" y1="${cy}" x2="${cx}" y2="105" stroke="${circleColor}" stroke-dasharray="2,2" stroke-width="1" opacity="0.6" />
                <circle cx="${cx}" cy="${cy}" r="6" fill="${fillColor}" stroke="${circleColor}" stroke-width="2" />
                <text x="${cx}" y="${cy - 9}" font-size="9" font-weight="700" fill="${circleColor}" text-anchor="middle" font-family="monospace">
                  (${p.x},${p.y})
                </text>
              `;
            }).join('');

            return potSvg + dropsSvg;
          })()}
        </svg>
      </div>
    </div>
  `;
}
