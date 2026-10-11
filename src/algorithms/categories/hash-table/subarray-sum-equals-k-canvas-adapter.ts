/**
 * 和为 K 的子数组 — 画布渲染适配器
 */

import { SubarraySumStep } from './subarray-sum-equals-k-step-compiler';

export function renderSubarraySumCanvas(container: HTMLElement, step: SubarraySumStep): void {
  const { nums, k, currentIdx, currentPrefixSum, targetPrefix, matchedCount, totalCount, prefixMap, phase } = step;

  // 数组元素渲染
  const elements = nums
    .map((val, idx) => {
      const isCur = idx === currentIdx && phase !== 'finish';
      const isProcessed = idx <= currentIdx;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isProcessed) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 16px;
        ">${val}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // 哈希表渲染
  const mapBadges = Object.entries(prefixMap)
    .map(([sumVal, cnt]) => {
      const isTarget = Number(sumVal) === targetPrefix && matchedCount > 0;
      let bg = 'rgba(255, 255, 255, 0.04)';
      let border = '1px solid rgba(255, 255, 255, 0.08)';
      let color = '#94a3b8';

      if (isTarget) {
        bg = 'rgba(16, 185, 129, 0.3)';
        border = '2px solid #10b981';
        color = '#34d399';
      }

      return `
      <div style="display: flex; justify-content: space-between; padding: 4px 10px; background: ${bg}; border: ${border}; border-radius: 6px; font-size: 12px;">
        <span style="color: ${color}; font-weight: 600;">前缀和 ${sumVal}</span>
        <span style="color: #fbbf24; font-weight: 700;">${cnt} 次</span>
      </div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px;">
        <!-- 左侧 元素序列 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">扫描数组与累计前缀</div>
            <div style="font-size: 11px; color: #fbbf24;">当前累计 pre = ${currentPrefixSum}</div>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; min-height: 65px;">
            ${elements}
          </div>
        </div>

        <!-- 右侧 前缀和频次哈希表 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; display: flex; flex-direction: column;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
            前缀和频次哈希表 map[pre]
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
            ${mapBadges}
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">目标子数组和 k</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${k}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">需检索历史前缀 target</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${targetPrefix}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">本轮命中子数组数</div>
          <div style="font-size: 16px; font-weight: 700; color: ${matchedCount > 0 ? '#34d399' : '#94a3b8'};">
            +${matchedCount}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">累积合格子数组总数</div>
          <div style="font-size: 18px; font-weight: 700; color: #ec4899;">${totalCount}</div>
        </div>
      </div>
    </div>
  `;
}
