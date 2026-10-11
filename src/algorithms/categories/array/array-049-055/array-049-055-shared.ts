/**
 * 左神算法通关课 049 ~ 055 前缀和、差分与单调栈队列专题 共享沙盘与渲染助手
 * 提供：一维前缀和哈希沙盘、二维前缀和容斥沙盘、等差数列二阶差分沙盘、单调栈左右边界沙盘、柱状图最大矩形沙盘、单调队列滑动窗口沙盘、双队列极限子数组沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Array049Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 一维前缀和与哈希表沙盘 (Class 049)
// ----------------------------------------------------
export function renderPrefixSumBasicBoard(
  arr: number[],
  curIdx: number,
  preSum: number,
  targetK: number,
  mapEntries: [number, number][],
  count: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 一维前缀和与哈希表差值匹配 (目标和 K = ${targetK})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          达标子数组累计: ${count}
        </span>
      </div>

      <!-- 数组与当前前缀和 -->
      <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 12px;">
        ${arr.map((val, idx) => {
          const isCur = idx === curIdx;
          return `
            <div style="padding: 8px 12px; border-radius: 8px; border: 2px solid ${isCur ? '#ef4444' : '#cbd5e1'}; background: ${isCur ? '#fef2f2' : '#f8fafc'}; text-align: center;">
              <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${val}</div>
              <div style="font-size: 9px; color: ${isCur ? '#dc2626' : '#64748b'};">[${idx}] ${isCur ? '▲' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #1d4ed8;">当前累计前缀和:</div>
          <div style="font-size: 14px; font-weight: 800; color: #1e40af; margin-top: 2px;">
            preSum = ${preSum} (需在哈希表中寻找 preSum - K = ${preSum - targetK})
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">哈希表前缀频次记录:</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${mapEntries.map(([s, c]) => `
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #ffffff; border: 1px solid #cbd5e1;">
                Sum(${s}): ${c}次
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 二维前缀和与区域检索沙盘 (Class 050)
// ----------------------------------------------------
export interface PrefixSum2DVisualData {
  r1?: number;
  c1?: number;
  r2?: number;
  c2?: number;
  sumVal?: number;
  desc?: string;
  mat?: number[][];
  sum?: number[][];
  phase?: 'init' | 'building' | 'query' | 'done';
  curI?: number;
  curJ?: number;
  formulaDetail?: string;
}

export function renderPrefixSum2DBoard(
  dataOrR1: PrefixSum2DVisualData | number,
  c1Arg?: number,
  r2Arg?: number,
  c2Arg?: number,
  sumValArg?: number,
  descArg?: string
): string {
  const data: PrefixSum2DVisualData =
    typeof dataOrR1 === 'object'
      ? dataOrR1
      : {
          r1: dataOrR1,
          c1: c1Arg ?? 0,
          r2: r2Arg ?? 0,
          c2: c2Arg ?? 0,
          sumVal: sumValArg ?? 0,
          desc: descArg ?? '',
          phase: 'query',
        };

  const mat = data.mat || [
    [4, 2, 2],
    [4, 4, 3],
    [4, 5, 8],
  ];
  const n = mat.length;
  const m = mat[0].length;

  const sum = data.sum || [
    [0, 0, 0, 0],
    [0, 4, 6, 8],
    [0, 8, 14, 19],
    [0, 12, 23, 36],
  ];

  const phase = data.phase || 'query';
  const curI = data.curI ?? -1;
  const curJ = data.curJ ?? -1;
  const r1 = data.r1 ?? 0;
  const c1 = data.c1 ?? 0;
  const r2 = data.r2 ?? 0;
  const c2 = data.c2 ?? 0;
  const sumVal = data.sumVal ?? 0;

  let badgeText = '⚡ O(1) 瞬时区域检索';
  let badgeBg = '#ecfdf5';
  let badgeColor = '#047857';
  if (phase === 'init') {
    badgeText = '📐 矩阵多开一行一列防越界';
    badgeBg = '#f1f5f9';
    badgeColor = '#475569';
  } else if (phase === 'building') {
    badgeText = `🔨 容斥建表中: sum[${curI}][${curJ}]`;
    badgeBg = '#eff6ff';
    badgeColor = '#1d4ed8';
  } else if (phase === 'done') {
    badgeText = '✅ 前缀和矩阵建表完成';
    badgeBg = '#f0fdf4';
    badgeColor = '#15803d';
  }

  // 1. 渲染原矩阵 mat
  const matRowsHtml = mat
    .map((row, r) => {
      const cellsHtml = row
        .map((val, c) => {
          const isQueryCell = phase === 'query' && r >= r1 && r <= r2 && c >= c1 && c <= c2;
          const isCurrentInput = phase === 'building' && curI - 1 === r && curJ - 1 === c;

          let bg = '#ffffff';
          let border = '#cbd5e1';
          let textColor = '#1e293b';
          let tag = '';

          if (isQueryCell) {
            bg = '#dcfce7';
            border = '#22c55e';
            textColor = '#15803d';
            tag = '<div style="font-size:8px;font-weight:700;color:#16a34a;margin-top:1px;">查询区</div>';
          } else if (isCurrentInput) {
            bg = '#fef3c7';
            border = '#f59e0b';
            textColor = '#b45309';
            tag = '<div style="font-size:8px;font-weight:700;color:#d97706;margin-top:1px;">当前值</div>';
          }

          return `
            <div style="min-width: 44px; height: 42px; border: 1.5px solid ${border}; background: ${bg}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <span style="font-size: 13px; font-weight: 800; color: ${textColor}; line-height: 1;">${val}</span>
              ${tag}
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; gap: 4px; align-items: center;">
          <div style="width: 22px; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: center;">r=${r}</div>
          ${cellsHtml}
        </div>
      `;
    })
    .join('');

  // 2. 渲染前缀和矩阵 sum
  const sumRowsHtml = sum
    .map((row, i) => {
      const cellsHtml = row
        .map((val, j) => {
          const isZeroBorder = i === 0 || j === 0;
          const isTarget = phase === 'building' && curI === i && curJ === j;
          const isTop = phase === 'building' && curI - 1 === i && curJ === j;
          const isLeft = phase === 'building' && curI === i && curJ - 1 === j;
          const isTopLeft = phase === 'building' && curI - 1 === i && curJ - 1 === j;

          const isBR = phase === 'query' && r2 + 1 === i && c2 + 1 === j;
          const isTR = phase === 'query' && r1 === i && c2 + 1 === j;
          const isBL = phase === 'query' && r2 + 1 === i && c1 === j;
          const isTL = phase === 'query' && r1 === i && c1 === j;

          let bg = isZeroBorder ? '#f8fafc' : '#ffffff';
          let border = isZeroBorder ? '#e2e8f0' : '#cbd5e1';
          let textColor = isZeroBorder ? '#94a3b8' : '#1e293b';
          let tag = isZeroBorder ? '<div style="font-size:8px;color:#94a3b8;margin-top:1px;">0边界</div>' : '';

          if (isTarget) {
            bg = '#e0f2fe';
            border = '#0284c7';
            textColor = '#0369a1';
            tag = '<div style="font-size:8px;font-weight:800;color:#0284c7;margin-top:1px;">★写入</div>';
          } else if (isTop) {
            bg = '#eff6ff';
            border = '#3b82f6';
            textColor = '#1d4ed8';
            tag = '<div style="font-size:8px;font-weight:700;color:#2563eb;margin-top:1px;">+上</div>';
          } else if (isLeft) {
            bg = '#f5f3ff';
            border = '#8b5cf6';
            textColor = '#6d28d9';
            tag = '<div style="font-size:8px;font-weight:700;color:#7c3aed;margin-top:1px;">+左</div>';
          } else if (isTopLeft) {
            bg = '#fef2f2';
            border = '#ef4444';
            textColor = '#b91c1c';
            tag = '<div style="font-size:8px;font-weight:700;color:#dc2626;margin-top:1px;">-左上</div>';
          } else if (isBR) {
            bg = '#dcfce7';
            border = '#16a34a';
            textColor = '#15803d';
            tag = '<div style="font-size:8px;font-weight:800;color:#16a34a;margin-top:1px;">+右下</div>';
          } else if (isTR) {
            bg = '#ffe4e6';
            border = '#f43f5e';
            textColor = '#be123c';
            tag = '<div style="font-size:8px;font-weight:700;color:#e11d48;margin-top:1px;">-上方</div>';
          } else if (isBL) {
            bg = '#ffedd5';
            border = '#f97316';
            textColor = '#c2410c';
            tag = '<div style="font-size:8px;font-weight:700;color:#ea580c;margin-top:1px;">-左方</div>';
          } else if (isTL) {
            bg = '#dbeafe';
            border = '#2563eb';
            textColor = '#1e40af';
            tag = '<div style="font-size:8px;font-weight:700;color:#1d4ed8;margin-top:1px;">+左上</div>';
          }

          const displayVal = phase === 'building' && (i > curI || (i === curI && j > curJ)) ? '·' : val;

          return `
            <div style="min-width: 44px; height: 42px; border: 1.5px solid ${border}; background: ${bg}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <span style="font-size: 13px; font-weight: 800; color: ${textColor}; line-height: 1;">${displayVal}</span>
              ${tag}
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; gap: 4px; align-items: center;">
          <div style="width: 22px; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: center;">i=${i}</div>
          ${cellsHtml}
        </div>
      `;
    })
    .join('');

  // 3. 构建公式条
  const formulaHtml = data.formulaDetail
    ? `
      <div style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; margin-top: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <span>⚡ 即时几何容斥算式</span>
        </div>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.5;">
          ${data.formulaDetail}
        </div>
      </div>
    `
    : '';

  return `
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
      <!-- 顶栏标题与状态徽章 -->
      <div style="font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>📐 二维几何容斥原理区域和检索</span>
          <span style="font-size: 11px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
            ${phase === 'query' ? `查询区间: (${r1}, ${c1}) ➔ (${r2}, ${c2})` : `矩阵规模: ${n}×${m}`}
          </span>
        </div>
        <span style="font-size: 11px; padding: 3px 10px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeColor}; font-weight: 800; border: 1px solid rgba(0,0,0,0.05);">
          ${badgeText}
        </span>
      </div>

      <!-- 核心沙盘：双矩阵并排对照 -->
      <div style="display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        
        <!-- 左侧：原数据矩阵 mat -->
        <div style="flex: 1; min-width: 170px;">
          <div style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>原数据矩阵 mat (${n}×${m})</span>
            <span style="font-size: 10px; color: #94a3b8;">只读输入</span>
          </div>
          <!-- 列表头 -->
          <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 4px;">
            <div style="width: 22px;"></div>
            ${mat[0].map((_, c) => `<div style="min-width: 44px; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: center;">c=${c}</div>`).join('')}
          </div>
          <!-- 数据行 -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${matRowsHtml}
          </div>
        </div>

        <!-- 中间：转化图例说明 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; align-self: center; padding: 8px 4px; color: #94a3b8;">
          <span style="font-size: 16px; font-weight: 800; color: #64748b;">➔</span>
          <span style="font-size: 9px; font-weight: 700; color: #94a3b8; writing-mode: vertical-lr; letter-spacing: 2px; margin-top: 4px;">几何容斥</span>
        </div>

        <!-- 右侧：前缀和累加矩阵 sum -->
        <div style="flex: 1.2; min-width: 220px;">
          <div style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>前缀和矩阵 sum (${n + 1}×${m + 1})</span>
            <span style="font-size: 10px; color: #0284c7; font-weight: 700;">${phase === 'building' ? '递推填充中' : '支持 O(1) 检索'}</span>
          </div>
          <!-- 列表头 -->
          <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 4px;">
            <div style="width: 22px;"></div>
            ${sum[0].map((_, j) => `<div style="min-width: 44px; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: center;">j=${j}</div>`).join('')}
          </div>
          <!-- 数据行 -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${sumRowsHtml}
          </div>
        </div>

      </div>

      <!-- 容斥公式与展开说明 -->
      ${formulaHtml}

      <!-- 步骤文字说明 -->
      <div style="margin-top: 10px; font-size: 11.5px; color: #475569; line-height: 1.5; background: #ffffff; border-left: 3px solid #0284c7; padding: 6px 10px; border-radius: 0 6px 6px 0;">
        ${data.desc}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 等差数列二阶差分沙盘 (Class 051)
// ----------------------------------------------------
export function renderArithmeticDiffBoard(
  diff2: number[],
  l: number,
  r: number,
  s: number,
  e: number,
  d: number,
  stage: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📊 二阶差分 4 点打标与两次前缀和还原 ([$l=${l}, r=${r}$], 首项 ${s}, 末项 ${e}, 公差 ${d})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #faf5ff; color: #7e22ce; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 6px; justify-content: center; overflow-x: auto; padding: 10px 0;">
        ${diff2.map((val, idx) => `
          <div style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; text-align: center; min-width: 44px;">
            <div style="font-size: 9px; color: #64748b;">[${idx}]</div>
            <div style="font-size: 13px; font-weight: 800; color: ${val !== 0 ? '#b91c1c' : '#334155'};">${val}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 单调栈左右较小值沙盘 (Class 052)
// ----------------------------------------------------
export function renderMonotonicStackBoard(
  arr: number[],
  stack: number[],
  settled: { idx: number; val: number; left: number; right: number }[],
  curI: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🥞 底到顶单调递增栈 (求解左右最近较小值)</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          当前扫描指针 i = ${curI}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
        <!-- 栈内元素 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 6px;">
            栈内下标与对应值 (底 -> 顶):
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${stack.map((idx) => `
              <div style="padding: 4px 8px; border-radius: 4px; background: #dbeafe; border: 1px solid #93c5fd; font-size: 11px; font-weight: 800; color: #1e40af;">
                idx:${idx} (${arr[idx]})
              </div>
            `).join(' ➔ ') || '<span style="font-size:11px;color:#94a3b8;">栈空</span>'}
          </div>
        </div>

        <!-- 已结算结果 -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 6px;">
            已结算左右较小值:
          </div>
          <div style="font-size: 11px; color: #15803d;">
            ${settled.map(s => `[${s.val}] 左:${s.left} | 右:${s.right}`).join(', ') || '等待元素出栈结算...'}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 柱状图最大矩形沙盘 (Class 053)
// ----------------------------------------------------
export function renderLargestRectangleBoard(
  heights: number[],
  curBar: number | null,
  curH: number,
  curW: number,
  maxArea: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📊 柱状图最大矩形 (以各柱为瓶颈高度的扩展跨度)</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #fef2f2; color: #dc2626; font-weight: 800;">
          全局最大面积 = ${maxArea}
        </span>
      </div>

      <!-- 柱状图柱体 -->
      <div style="display: flex; gap: 8px; align-items: flex-end; justify-content: center; height: 100px; margin-bottom: 12px; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px;">
        ${heights.map((h, idx) => {
          const isTarget = idx === curBar;
          return `
            <div style="position: relative; width: 36px; height: ${h * 14}px; background: ${isTarget ? '#ef4444' : '#3b82f6'}; border-radius: 4px 4px 0 0; text-align: center; color: #ffffff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center;">
              ${h}
              <div style="position: absolute; bottom: -18px; font-size: 9px; color: #64748b;">[${idx}]</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; color: #475569; background: #f8fafc; padding: 8px; border-radius: 6px; text-align: center;">
        当前瓶颈柱高 H=${curH}, 跨度宽度 W=${curW} ➔ 形成面积 = ${curH * curW}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. 单调队列滑动窗口沙盘 (Class 054)
// ----------------------------------------------------
export function renderMonotonicQueueBoard(
  nums: number[],
  k: number,
  curIdx: number,
  queueIndices: number[],
  maxVals: number[]
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🪟 单调双端队列 Deque (滑动窗口 K = ${k})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          当前右界 i = ${curIdx}
        </span>
      </div>

      <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 12px;">
        ${nums.map((v, i) => {
          const inWindow = i >= curIdx - k + 1 && i <= curIdx;
          return `
            <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${inWindow ? '#f59e0b' : '#cbd5e1'}; background: ${inWindow ? '#fef3c7' : '#ffffff'}; text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${v}</div>
              <div style="font-size: 9px; color: #64748b;">[${i}]</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">单调递减队列 (队头最大):</div>
          <div style="display: flex; gap: 4px;">
            ${queueIndices.map((idx, qI) => `
              <div style="padding: 2px 6px; border-radius: 4px; background: ${qI === 0 ? '#fee2e2' : '#dbeafe'}; border: 1px solid ${qI === 0 ? '#ef4444' : '#93c5fd'}; font-size: 10px; font-weight: 700; color: ${qI === 0 ? '#dc2626' : '#1e40af'};">
                idx:${idx} (${nums[idx]}) ${qI === 0 ? '👑' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 4px;">各窗口最大值输出:</div>
          <div style="font-size: 12px; font-weight: 800; color: #15803d;">
            [ ${maxVals.join(', ') || '等待完整窗口形成...'} ]
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 7. 双单调队列极限子数组沙盘 (Class 055)
// ----------------------------------------------------
export function renderValidSubarrayBoard(
  nums: number[],
  left: number,
  right: number,
  maxVal: number,
  minVal: number,
  limit: number,
  ansLen: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 双单调队列极限子数组 (max - min <= limit, limit = ${limit})</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          当前最长达标长度 = ${ansLen}
        </span>
      </div>

      <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 12px;">
        ${nums.map((v, i) => {
          const inWindow = i >= left && i <= right;
          return `
            <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${inWindow ? '#10b981' : '#cbd5e1'}; background: ${inWindow ? '#d1fae5' : '#ffffff'}; text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${v}</div>
              <div style="font-size: 9px; color: #64748b;">[${i}] ${i === left ? 'L' : ''} ${i === right ? 'R' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px; color: #475569; text-align: center;">
        当前窗口 [$left=${left}, right=${right}$] 极差: max(${maxVal}) - min(${minVal}) = ${maxVal - minVal} ${maxVal - minVal <= limit ? '✅ 满足要求' : '❌ 超出限制，左端收缩'}
      </div>
    </div>
  `;
}
