import { SmallSumStep } from './merge-sort-small-sum-022-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderSmallSumCanvas(container: HTMLElement, step: SmallSumStep) {
  const { arr, left, mid, right, p1, p2, totalSmallSum, currentAddedSum } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">归并区间 [L, Mid, R]</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            [${left}, ${mid}, ${right}]
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">左指针 p1 (值)</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${p1 >= 0 ? `${p1} (值:${arr[p1]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">右指针 p2 (值)</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${p2 >= 0 ? `${p2} (值:${arr[p2]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">本步新增小和</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            +${currentAddedSum}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">累计小和总计</div>
          <div style="font-size: 14px; font-weight: bold; color: #a855f7;">
            ${totalSmallSum}
          </div>
        </div>
      </div>

      <!-- 数组可视化条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${arr.map((val, idx) => {
            const isP1 = idx === p1;
            const isP2 = idx === p2;
            const inLeftGroup = idx >= left && idx <= mid;
            const inRightGroup = idx > mid && idx <= right;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isP1) {
              bgColor = 'rgba(245, 158, 11, 0.35)';
              borderColor = '#f59e0b';
            } else if (isP2) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (inLeftGroup) {
              bgColor = 'rgba(56, 189, 248, 0.15)';
              borderColor = 'rgba(56, 189, 248, 0.4)';
            } else if (inRightGroup) {
              bgColor = 'rgba(168, 85, 247, 0.15)';
              borderColor = 'rgba(168, 85, 247, 0.4)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isP1 ? '#f59e0b' : isP2 ? '#ec4899' : inLeftGroup ? '#38bdf8' : inRightGroup ? '#a855f7' : '#64748b'}; font-weight: bold;">
                  ${isP1 ? 'P1' : isP2 ? 'P2' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isP1 || isP2 ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${val}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 小和与归并精髓核心卡片 -->
      ${renderFormulaCard(
        '归并分治小和转化精髓 (MergeSort Small Sum Invariant)',
        '求左边比它小的累加和 等价于 求右边比它大的数量。当 arr[p1] < arr[p2] 时，右组中从 p2 到 r 全部大于 arr[p1]，产生 arr[p1] * (r - p2 + 1) 的贡献',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
