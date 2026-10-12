import { MedianStep } from './median-two-sorted-arrays-step-compiler';

export function renderMedianCanvas(container: HTMLElement, step: MedianStep): void {
  const l1Str = step.l1 === -Infinity ? '-∞' : String(step.l1);
  const r1Str = step.r1 === Infinity ? '+∞' : String(step.r1);
  const l2Str = step.l2 === -Infinity ? '-∞' : String(step.l2);
  const r2Str = step.r2 === Infinity ? '+∞' : String(step.r2);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- 双数组切分标尺沙盘 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 20px 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-color, #f1f5f9);">
            ⚖️ 双数组虚拟切分标尺 (红竖线为切分位，左侧为 L，右侧为 R)
          </span>
          <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">
            总长度: ${step.nums1.length + step.nums2.length} (${(step.nums1.length + step.nums2.length) % 2 === 1 ? '奇数' : '偶数'})
          </span>
        </div>

        <!-- nums1 标尺 -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; color: var(--text-muted, #94a3b8); margin-bottom: 8px; font-weight: 600;">较短数组 nums1 (规模 m=${step.nums1.length})</div>
          <div style="display: flex; gap: 8px; align-items: center; overflow-x: auto; padding-bottom: 4px;">
            ${step.nums1.map((val, idx) => `
              <div style="display: flex; align-items: center;">
                ${idx === step.cut1 ? '<div style="width: 4px; height: 42px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 10px #ef4444;"></div>' : ''}
                <div style="
                  width: 42px;
                  height: 42px;
                  background: ${idx < step.cut1 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(251, 191, 36, 0.2)'};
                  border: 1px solid ${idx < step.cut1 ? '#38bdf8' : '#fbbf24'};
                  color: ${idx < step.cut1 ? '#38bdf8' : '#fbbf24'};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: 800;
                  font-family: monospace;
                ">${val}</div>
              </div>
            `).join('')}
            ${step.cut1 === step.nums1.length ? '<div style="width: 4px; height: 42px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 10px #ef4444;"></div>' : ''}
          </div>
        </div>

        <!-- nums2 标尺 -->
        <div>
          <div style="font-size: 11px; color: var(--text-muted, #94a3b8); margin-bottom: 8px; font-weight: 600;">基准数组 nums2 (规模 n=${step.nums2.length})</div>
          <div style="display: flex; gap: 8px; align-items: center; overflow-x: auto; padding-bottom: 4px;">
            ${step.nums2.map((val, idx) => `
              <div style="display: flex; align-items: center;">
                ${idx === step.cut2 ? '<div style="width: 4px; height: 42px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 10px #ef4444;"></div>' : ''}
                <div style="
                  width: 42px;
                  height: 42px;
                  background: ${idx < step.cut2 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(168, 85, 247, 0.2)'};
                  border: 1px solid ${idx < step.cut2 ? '#34d399' : '#a855f7'};
                  color: ${idx < step.cut2 ? '#34d399' : '#a855f7'};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: 800;
                  font-family: monospace;
                ">${val}</div>
              </div>
            `).join('')}
            ${step.cut2 === step.nums2.length ? '<div style="width: 4px; height: 42px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 10px #ef4444;"></div>' : ''}
          </div>
        </div>
      </div>

      <!-- 交叉不等式校验卡片 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="font-size: 12px; font-weight: 700; color: var(--text-color, #f1f5f9); margin-bottom: 10px;">
          ⚖️ 交叉不等式双向检验 (左大右小守恒性)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="padding: 10px 14px; background: rgba(30, 41, 59, 0.5); border-radius: 6px; border: 1px solid ${step.l1 <= step.r2 ? 'rgba(52,211,153,0.4)' : '#ef4444'};">
            <span style="color: var(--text-muted, #94a3b8); font-size: 12px;">条件 1: L1 ≤ R2 ➔</span>
            <span style="color: #38bdf8; font-weight: 800; font-family: monospace;"> ${l1Str}</span> ≤ <span style="color: #a855f7; font-weight: 800; font-family: monospace;">${r2Str}</span>
            <span style="float: right; color: ${step.l1 <= step.r2 ? '#34d399' : '#ef4444'}; font-weight: 800; font-size: 12px;">
              ${step.l1 <= step.r2 ? '✓ 满足' : '✗ 违背'}
            </span>
          </div>

          <div style="padding: 10px 14px; background: rgba(30, 41, 59, 0.5); border-radius: 6px; border: 1px solid ${step.l2 <= step.r1 ? 'rgba(52,211,153,0.4)' : '#ef4444'};">
            <span style="color: var(--text-muted, #94a3b8); font-size: 12px;">条件 2: L2 ≤ R1 ➔</span>
            <span style="color: #34d399; font-weight: 800; font-family: monospace;"> ${l2Str}</span> ≤ <span style="color: #fbbf24; font-weight: 800; font-family: monospace;">${r1Str}</span>
            <span style="float: right; color: ${step.l2 <= step.r1 ? '#34d399' : '#ef4444'}; font-weight: 800; font-size: 12px;">
              ${step.l2 <= step.r1 ? '✓ 满足' : '✗ 违背'}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}
