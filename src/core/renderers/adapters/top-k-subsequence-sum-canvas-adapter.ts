/**
 * 非负数组前k个最小的子序列累加和 (Top K Subsequence Sum / 左程云 Class 073 Code06)
 * Canvas Adapter: 排序数组、小根堆两路后继与已收录榜单面板
 */

import { type TopKStep } from './top-k-subsequence-sum-step-compiler';

export function renderTopKBoard(container: HTMLElement, step: TopKStep): void {
  const numsHtml = step.sortedNums
    .map((n, i) => {
      const isPoppedRight = step.poppedItem && step.poppedItem.right === i;
      const bg = isPoppedRight ? '#065f46' : '#1e293b';
      const border = isPoppedRight ? '#10b981' : '#334155';
      return `
        <div style="background:${bg}; border:1.5px solid ${border}; border-radius:6px; padding:6px 10px; min-width:45px; text-align:center;">
          <div style="font-size:9px; color:#64748b;">#${i}</div>
          <div style="font-size:13px; font-weight:800; color:#1e293b;">${n}</div>
        </div>
      `;
    })
    .join('');

  const heapListHtml =
    step.heapSnapshot.length > 0
      ? step.heapSnapshot
          .map((item, idx) => {
            const isTop = idx === 0;
            return `
              <div style="background:${isTop ? 'rgba(209, 250, 229, 0.9)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${isTop ? '#10b981' : '#e2e8f0'}; border-radius:6px; padding:6px 10px; min-width:70px; text-align:center;">
                <div style="font-size:9.5px; color:${isTop ? '#16a34a' : '#64748b'};">${isTop ? '👑 堆顶' : `#${idx + 1}`} (右=${item.right})</div>
                <div style="font-size:13px; font-weight:800; color:#1e293b; margin-top:2px;">和: ${item.sum}</div>
              </div>
            `;
          })
          .join('')
      : `<span style="color:#64748b; font-size:11px;">(小根堆当前为空)</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">升序原数组 (作为状态机构建基石)</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          已收集: <b style="color:#10b981;">${step.ans.length}</b> / ${step.kTarget} 个
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
        ${numsHtml}
      </div>

      <!-- 小根堆优先队列舱 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">🌲 小根堆状态机优先队列 (队首即全局当前最小和)</span>
          <span style="font-size:10.5px; color:#38bdf8;">两路分叉：替换最右项 / 追加下一项</span>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          ${heapListHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderTopKMetrics(container: HTMLElement, step: TopKStep): void {
  const chips = step.ans.map(
    (sum, i) => `
    <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:40px; padding:4px 6px; margin:2px; background:#dcfce7; border:1px solid #22c55e; border-radius:4px;">
      <span style="font-size:9px; color:#a7f3d0;">第 ${i + 1} 小</span>
      <span style="font-size:13px; font-weight:800; color:#1e293b;">${sum}</span>
    </div>
  `
  );

  container.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
      <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">已收录的 Top-K 最小子序列和榜单</div>
      <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:3px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
        ${chips.join('')}
      </div>
    </div>
  `;
}
