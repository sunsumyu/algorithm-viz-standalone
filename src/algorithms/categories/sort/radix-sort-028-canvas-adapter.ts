import { RadixSortStep } from './radix-sort-028-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderRadixSortCanvas(container: HTMLElement, step: RadixSortStep) {
  const { arr, help, currentDigit, digitExp, counts } = step;
  const digitName = currentDigit === 1 ? '个位' : currentDigit === 2 ? '十位' : currentDigit === 3 ? '百位' : `第 ${currentDigit} 位`;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前排序位</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${digitName} (权值: ${digitExp})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">最大元素</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${Math.max(...arr)}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">元素总个数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${arr.length}
          </div>
        </div>
      </div>

      <!-- 数组可视化条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">当前数组元素状态：</div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${arr.map((val, idx) => {
            const currentDigitVal = Math.floor(val / digitExp) % 10;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: #38bdf8; font-weight: bold;">
                  位:${currentDigitVal}
                </div>
                <div style="
                  width: 52px;
                  height: 48px;
                  background: rgba(51, 65, 85, 0.4);
                  border: 2px solid rgba(56, 189, 248, 0.4);
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: #f8fafc;
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

      <!-- 0~9 计数桶前缀视图 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">0~9 计数前缀桶状态 (count):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">
          ${counts.map((c, i) => `
            <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #f8fafc; text-align: center;">
              数字 ${i}: <b>${c}</b>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '非比较基数排序核心前缀出桶原理',
        'count[d] 从频次表转化为前缀和表后，直接标识该数位 <= d 的元素在 help 数组中的最右落点。必须【从右向左】倒序遍历原数组，确保相同的数相对顺序不变 (稳定性保持)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
