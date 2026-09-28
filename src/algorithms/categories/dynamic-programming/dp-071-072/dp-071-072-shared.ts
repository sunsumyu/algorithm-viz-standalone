/**
 * 左程云 Class 071 & 072: LIS 最长递增子序列及其高阶扩展通用共享接口与视觉呈现
 */

export interface Dp071StepBase {
  title?: string;
  description?: string;
  message: string;
  explanation?: string;
  line: number;
  codeLine?: import('../../../../core/step-visualizer').HighlightTarget;
  highlightedIndices?: number[];
  metrics?: Record<string, string | number>;
}

/**
 * 渲染 LIS 状态条 (dp 数组与 count 数组双轨视图)
 */
export function renderLisDualTracks(params: {
  nums: number[];
  dp: number[];
  count?: number[];
  currentIdx: number;
  compareIdx?: number;
  maxLen: number;
  totalWays?: number;
}): string {
  const { nums, dp, count, currentIdx, compareIdx, maxLen, totalWays } = params;

  const cardsHtml = nums
    .map((num, i) => {
      const isCurrent = i === currentIdx;
      const isCompare = i === compareIdx;
      const isProcessed = i <= currentIdx;

      let borderColor = '#334155';
      let bgColor = 'rgba(30, 41, 59, 0.7)';
      let glow = '';

      if (isCurrent) {
        borderColor = '#38bdf8';
        bgColor = 'rgba(14, 165, 233, 0.15)';
        glow = 'box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);';
      } else if (isCompare) {
        borderColor = '#f59e0b';
        bgColor = 'rgba(245, 158, 11, 0.15)';
        glow = 'box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);';
      }

      return `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${bgColor};
          border: 1.5px solid ${borderColor};
          border-radius: 8px;
          padding: 8px 10px;
          min-width: 64px;
          transition: all 0.25s ease;
          ${glow}
        ">
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">i = ${i}</div>
          <div style="font-size: 20px; font-weight: 800; color: ${isCurrent ? '#38bdf8' : isCompare ? '#fbbf24' : '#f8fafc'}; margin: 4px 0;">
            ${num}
          </div>
          <div style="
            display: flex;
            gap: 6px;
            width: 100%;
            justify-content: center;
            border-top: 1px solid rgba(148, 163, 184, 0.15);
            padding-top: 4px;
            font-size: 11px;
            font-family: monospace;
          ">
            <span style="color: #38bdf8;" title="以当前数结尾的LIS最长长度">dp:${isProcessed ? dp[i] : '-'}</span>
            ${count ? `<span style="color: #a78bfa;" title="达到最长长度的方法数">cnt:${isProcessed ? count[i] : '-'}</span>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; padding: 4px;">
      <!-- 核心数组轨道 -->
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        padding: 16px 12px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #334155;
        border-radius: 10px;
      ">
        ${cardsHtml}
      </div>
    </div>
  `;
}
