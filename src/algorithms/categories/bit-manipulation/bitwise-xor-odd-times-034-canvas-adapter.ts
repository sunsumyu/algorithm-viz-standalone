/**
 * Class 034: 异或运算的奇妙用法与奇数次提取 (Bitwise XOR Odd Occurrences) - 视觉适配器
 * 左程云算法通关课入门篇 Class 034 / LeetCode 136 & 260
 */

import { XorStep } from './bitwise-xor-odd-times-034-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderXorCanvas(container: HTMLElement, step: XorStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">全序列累积异或和 (EOR)</div>
          <div style="font-size: 24px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.eorAll} <span style="font-size: 12px; font-family: monospace; color: #94a3b8;">(0b${step.eorAll.toString(2)})</span>
          </div>
        </div>

        ${
          step.mode === 'double' && step.rightOne !== undefined
            ? `
            <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
              <div style="font-size: 11px; color: #94a3b8;">最右侧 1 划分掩码 (RightOne)</div>
              <div style="font-size: 20px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
                ${step.rightOne} <span style="font-size: 12px; font-family: monospace; color: #94a3b8;">(0b${step.rightOne.toString(2)})</span>
              </div>
            </div>
          `
            : ''
        }

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">求解结果</div>
          <div style="font-size: 22px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${
              step.mode === 'single'
                ? step.resultA !== undefined ? `奇数次元素: [ ${step.resultA} ]` : '计算中...'
                : step.resultB !== undefined
                ? `两数: [ ${step.resultA} , ${step.resultB} ]`
                : step.resultA !== undefined
                ? `部分解: ${step.resultA}`
                : '寻找分水岭...'
            }
          </div>
        </div>
      </div>

      <!-- 数组元素卡片序列沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">输入序列点阵</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.nums.map((num, idx) => {
            const isCurrent = idx === step.currentIndex;
            const inGroupA = step.groupA?.includes(num);
            return `
              <div style="
                min-width: 44px;
                height: 48px;
                background: ${isCurrent ? '#0284c7' : inGroupA ? '#065f46' : '#1e293b'};
                border: ${isCurrent ? '2px solid #38bdf8' : inGroupA ? '1px solid #34d399' : '1px solid #475569'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${isCurrent ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
              ">
                <div style="font-size: 14px; font-weight: bold; color: #fff;">${num}</div>
                <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">0b${num.toString(2)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 分组异或池展示 (双奇数模式) -->
      ${
        step.mode === 'double' && step.groupA
          ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 8px; padding: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #34d399; margin-bottom: 6px;">
                组 A (该位为 1): [ ${step.groupA.join(', ') || '空'} ]
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                组内数字全部异或 ➔ 解出奇数次数字 A = ${step.resultA !== undefined ? step.resultA : '计算中'}
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px;">
                组 B (该位为 0): [ ${step.groupB?.join(', ') || '空'} ]
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                由 eor ^ A = ${step.eorAll} ^ ${step.resultA || 0} ➔ 解出数字 B = ${step.resultB !== undefined ? step.resultB : '待反解'}
              </div>
            </div>
          </div>
        `
          : ''
      }

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '异或运算与最右 1 提取定理',
        '异或本质是无进位相加。两个不同的数 a != b，异或结果必有某一位为 1！通过 rightOne = eor & (-eor) 提取出这个区分两数的关键位，将原本混杂的数组在 O(N) 时间内划分进两个互斥的虚拟空间，无需任何哈希表额外空间达成 O(1) 空间极速解题！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
