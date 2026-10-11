/**
 * 判断链表是否为回文结构 — 画布渲染适配器
 */

import { PalindromeStep } from './palindrome-linked-list-034-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderPalindromeCanvas(container: HTMLElement, step: PalindromeStep): void {
  const nodeChips = step.nodes.map((node) => {
    const isP1 = step.leftHeadIdx === node.idx;
    const isP2 = step.rightHeadIdx === node.idx;
    const isSlow = step.slowIdx === node.idx;
    const isFast = step.fastIdx === node.idx;

    let border = 'rgba(255, 255, 255, 0.1)';
    let bg = 'rgba(30, 41, 59, 0.8)';
    let pointerLabel = '';

    if (isP1 && isP2) {
      border = '#f59e0b';
      bg = 'rgba(245, 158, 11, 0.2)';
      pointerLabel = 'P1 & P2';
    } else if (isP1) {
      border = '#38bdf8';
      bg = 'rgba(56, 189, 248, 0.2)';
      pointerLabel = 'P1 (左)';
    } else if (isP2) {
      border = '#ec4899';
      bg = 'rgba(236, 72, 153, 0.2)';
      pointerLabel = 'P2 (右)';
    } else if (isSlow && isFast) {
      border = '#a855f7';
      bg = 'rgba(168, 85, 247, 0.2)';
      pointerLabel = 'Slow & Fast';
    } else if (isSlow) {
      border = '#10b981';
      bg = 'rgba(16, 185, 129, 0.2)';
      pointerLabel = 'Slow (中)';
    } else if (isFast) {
      border = '#f43f5e';
      bg = 'rgba(244, 63, 94, 0.2)';
      pointerLabel = 'Fast (快)';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px;">
        <span style="font-size: 10px; height: 16px; font-weight: 700; color: ${border};">
          ${pointerLabel}
        </span>
        <div style="display: flex; align-items: center;">
          <div style="width: 48px; height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px;">
            <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">${node.val}</span>
            <span style="font-size: 9px; color: #64748b;">#${node.idx}</span>
          </div>
          <div style="width: 28px; text-align: center; color: #64748b; font-size: 14px; font-weight: 700;">
            ${node.nextIdx !== null ? (node.nextIdx > node.idx ? '➔' : '⬅') : '⏚'}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 阶段指示器 -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 13px; font-weight: 700; color: #94a3b8;">执行阶段:</span>
          <span style="background: #0284c7; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
            ${step.phase === 'find_mid' ? '🏃 快慢指针寻中点' : step.phase === 'reverse_half' ? '🔄 原地反转后半段' : step.phase === 'compare' ? '⚖️ 两端向中夹逼比对' : step.phase === 'restore' ? '🛠️ 恢复链表拓扑' : '🏁 完成'}
          </span>
        </div>
      </div>

      <!-- 链表拓扑图沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
        <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 12px;">
          🔗 链表拓扑与指针动态 (Arrow: 指针指向, ⏚: null)
        </div>
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; min-height: 80px; padding: 10px 0;">
          ${nodeChips}
        </div>
      </div>

      <!-- 教学核心公式卡 -->
      ${renderFormulaCard(
        '左程云回文链表 O(1) 空间黄金四部曲',
        '\\text{Mid} \\longrightarrow \\text{Reverse}(\\text{Half}) \\longrightarrow \\text{TwoPointerCompare} \\longrightarrow \\text{Restore}(\\text{Half})',
        '笔试直接压栈虽然好写，但空间为 O(N)；大厂面试必须手写快慢指针求中点 + 后半段原地反转，在 O(1) 空间完成严格校验并完整恢复链表。'
      )}
    </div>
  `;
}
