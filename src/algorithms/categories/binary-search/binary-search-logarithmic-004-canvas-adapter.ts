/**
 * Class 004: 二分搜索与对数器 (Binary Search & Logarithmic Verifier) - 视觉适配器
 * 左程云算法通关课入门篇 Class 004
 */

import { BinarySearchStep } from './binary-search-logarithmic-004-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderBinarySearchCanvas(container: HTMLElement, step: BinarySearchStep) {
  const { nums, target, left, right, mid, ansIndex, mode } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 顶部控制状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">查找模式</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${mode === 'local-minimum' ? '局部最小值 (峰谷二分)' : '最左 >= target'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">目标 Target</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${mode === 'local-minimum' ? 'N/A (峰谷相对值)' : target}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前区间 [L, R]</div>
          <div style="font-size: 14px; font-weight: bold; color: #a78bfa;">
            [${left}, ${right}]
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前中点 Mid</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${mid >= 0 ? `${mid} (值:${nums[mid]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">最佳候选 Ans</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${ansIndex >= 0 ? `${ansIndex} (值:${nums[ansIndex]})` : '未命中'}
          </div>
        </div>
      </div>

      <!-- 数组可视化条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${nums.map((val, idx) => {
            const isL = idx === left;
            const isR = idx === right;
            const isM = idx === mid;
            const isAns = idx === ansIndex;
            const inRange = idx >= left && idx <= right;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isAns) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (isM) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            } else if (inRange) {
              bgColor = 'rgba(56, 189, 248, 0.15)';
              borderColor = 'rgba(56, 189, 248, 0.5)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isAns ? '#ec4899' : isM ? '#10b981' : isL ? '#38bdf8' : isR ? '#a78bfa' : '#64748b'}; font-weight: bold;">
                  ${isM ? 'MID' : isL && isR ? 'L=R' : isL ? 'L' : isR ? 'R' : ''}
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
                  box-shadow: ${isM ? '0 0 12px rgba(16, 185, 129, 0.4)' : isAns ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'none'};
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

      <!-- 对数器与二分原理核心卡片 -->
      ${renderFormulaCard(
        '二分精髓与对数器 (Logarithmic Verifier) 原理',
        mode === 'local-minimum'
          ? 'arr[mid] > arr[mid-1] => 左侧必有拐点；arr[mid] > arr[mid+1] => 右侧必有拐点 (无序数组二分极值)'
          : '中点计算防溢出：mid = L + ((R - L) >> 1)；若 arr[mid] >= target，记下 ans 并向左 R = mid - 1 继续收缩',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
