/**
 * 移掉 K 位数字 (Remove K Digits) - 视觉适配器
 * LeetCode 402
 */

import { RemoveKDigitsStep } from './remove-k-digits-step-compiler';

export function renderRemoveKDigitsCanvas(step: RemoveKDigitsStep): string {
  const { num, currentIdx, stack, poppedChar, remainingK, finalResult, phase } = step;

  // 渲染输入字符序列
  const charCards = num
    .split('')
    .map((ch, idx) => {
      const isCur = idx === currentIdx && phase !== 'finish' && phase !== 'strip-zero';
      const isProcessed = idx < currentIdx;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isProcessed) {
        bg = 'rgba(56, 189, 248, 0.1)';
        border = '1px solid rgba(56, 189, 248, 0.3)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 40px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 40px;
          background: ${bg};
          border: ${border};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 16px;
        ">${ch}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // 渲染单调栈槽位
  const stackCells = stack
    .map((ch) => {
      return `
      <div style="
        min-width: 44px;
        height: 44px;
        background: rgba(16, 185, 129, 0.25);
        border: 2px solid #10b981;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #34d399;
        font-weight: 700;
        font-size: 18px;
        margin: 0 4px;
      ">${ch}</div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 原始数字序列与当前扫描游标 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">原始数字扫描带与当前考察位</div>
          <div style="font-size: 11px; color: #fbbf24;">当前考察: ${currentIdx >= 0 && currentIdx < num.length ? `[${currentIdx}] = '${num[currentIdx]}'` : '扫描完毕'}</div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 55px;">
          ${charCards}
        </div>
      </div>

      <!-- 中部 单调栈与弹出指示 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">单调递增栈 (Monotonic Stack)</div>
          ${poppedChar ? `<div style="font-size: 11px; color: #ef4444; font-weight: 700;">刚刚弹出较大位: '${poppedChar}' ✗</div>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; min-height: 55px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 8px;">
          ${stackCells || '<span style="color: #64748b; font-size: 12px;">栈为空</span>'}
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">待移除名额 remainingK</div>
          <div style="font-size: 16px; font-weight: 700; color: #f43f5e;">${remainingK}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">栈内字符数</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${stack.length}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前栈状态</div>
          <div style="font-size: 15px; font-weight: 700; color: #34d399;">"${stack.join('') || '空'}"</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最终收敛最小数</div>
          <div style="font-size: 18px; font-weight: 700; color: #fbbf24;">${finalResult || '计算中...'}</div>
        </div>
      </div>
    </div>
  `;
}
