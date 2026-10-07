/**
 * 找出数组的第K大和 (LeetCode 2386 / 左程云 Class 073 Code07)
 * Canvas Adapter: 绝对值映射数组、小根堆状态机与对决推导舱
 */

import { type FindKthStep } from './find-kth-sum-step-compiler';

export function renderFindKthBoard(container: HTMLElement, step: FindKthStep): void {
  const absBadges = step.absNums
    .map(
      (x, i) => `
      <div style="background:rgba(241, 245, 249, 0.9); border:1.5px solid #38bdf8; border-radius:6px; padding:5px 8px; min-width:40px; text-align:center;">
        <div style="font-size:8.5px; color:#64748b;">|#${i}|</div>
        <div style="font-size:12px; font-weight:800; color:#38bdf8;">${x}</div>
      </div>
    `
    )
    .join('');

  const heapList = step.heapSnapshot
    .map((node, idx) => {
      const isTop = idx === 0;
      return `
        <div style="background:${isTop ? 'rgba(209, 250, 229, 0.9)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${isTop ? '#10b981' : '#e2e8f0'}; border-radius:6px; padding:5px 8px; min-width:65px; text-align:center;">
            <div style="font-size:8.5px; color:${isTop ? '#16a34a' : '#64748b'};">${isTop ? '👑 堆顶' : `#${idx + 1}`} (idx=${node.idx})</div>
            <div style="font-size:12px; font-weight:800; color:#1e293b;">损失: ${node.val}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">绝对值数组 absNums (由原数组转化并升序排列)</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          全局最大和 maxSum: <b style="color:#10b981;">${step.maxSum}</b>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
        ${absBadges}
      </div>

      <!-- 小根堆优先队列舱 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">🌲 绝对值小根堆状态机 (寻找第 K 小损失)</span>
          <span style="font-size:10.5px; color:#38bdf8;">堆顶即当前最小损失</span>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          ${heapList}
        </div>
      </div>
    </div>
  `;
}

export function renderFindKthMetrics(container: HTMLElement, step: FindKthStep): void {
  container.innerHTML = `
    <div style="width:100%; padding:8px 12px; box-sizing:border-box; display:flex; flex-direction:column; gap:8px;">
      <div style="font-size:11.5px; color:#374151; font-weight:700;">👑 第 K 大和最终对决推导</div>
      <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:12px; color:#64748b;">
          目标：第 <b style="color:#38bdf8;">${step.currentSmallestRank}</b> 大子序列和
        </div>
        <div style="font-size:14px; font-weight:800; color:#1e293b; font-family:monospace;">
          ans = maxSum (${step.maxSum}) - 绝对值损失 (${step.currentSmallestVal}) = <span style="color:#a855f7;">${step.kthSum}</span>
        </div>
      </div>
    </div>
  `;
}
