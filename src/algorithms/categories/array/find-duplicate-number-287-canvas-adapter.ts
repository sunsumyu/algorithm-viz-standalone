/**
 * Hard 25: 寻找重复数 — 画布适配器
 * 负责数组下标有向图映射与快慢指针沙盘渲染
 */

import { DuplicateNumberStep } from './find-duplicate-number-287-step-compiler';

export function renderFindDuplicateCanvas(container: HTMLElement, step: DuplicateNumberStep): void {
  const arrayCardsHtml = step.nums
    .map((v, i) => {
      const isSlow = step.slow === i;
      const isFast = step.fast === i;
      const isDup = step.duplicate === v;

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      if (isDup) {
        border = 'border: 2px solid #34d399; background: rgba(6, 78, 59, 0.5); box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);';
      } else if (isSlow && isFast) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.5);';
      } else if (isSlow) {
        border = 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.3);';
      } else if (isFast) {
        border = 'border: 2px solid #f43f5e; background: rgba(190, 18, 60, 0.3);';
      }

      return `
      <div style="
        padding: 10px 14px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 65px;
        transition: all 0.2s;
      ">
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">idx: [${i}]</div>
        <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${v}</div>
        <div style="font-size: 10px; color: #64748b;">➔ [${v}]</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">数组下标有向图映射与快慢指针沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #38bdf8;">slow / p1: ${step.slow}</span>
          <span style="color: #f43f5e;">fast / p2: ${step.fast}</span>
          ${
            step.duplicate !== null
              ? `<span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">重复数字: ${step.duplicate}</span>`
              : ''
          }
        </div>
      </div>

      <!-- 数组卡片 -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${arrayCardsHtml}
      </div>

      <!-- 核心原理解析卡 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">下标链表化建图</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">由于元素在 1~n 且有 n+1 个数，每个 i 连向 nums[i]，0 作为永不在环内的虚拟头。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">多入度必聚环入口</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">重复数字意味着有多个下标的值相同，即有两个不同节点指向它，它必定是环入口！</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">O(1) 绝杀苛刻约束</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">不修改原数组、不占用额外数组空间、不用哈希表，Floyd 判圈以常数空间秒解。</div>
        </div>
      </div>
    </div>
  `;
}
