/**
 * 分割回文串 II (Palindrome Partitioning II) Canvas 适配器
 */

import { type PalindromePartitionStep } from './palindrome-partitioning-ii-step-compiler';

export function renderPalindromePartitionCanvas(step: PalindromePartitionStep): string {
  const { s, dp, currentI, currentJ, phase } = step;

  const charCards = s
    .split('')
    .map((ch, idx) => {
      const isCur = idx === currentI && phase !== 'finish';
      const isCutPoint = idx === currentJ;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (idx <= currentI) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px; position: relative;">
        ${isCutPoint ? '<div style="position: absolute; right: -8px; top: -6px; color: #ef4444; font-weight: 700; font-size: 14px;">✂</div>' : ''}
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 18px;
        ">${ch}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // DP 数组展示
  const dpCells = dp
    .map((val, idx) => {
      const isCur = idx === currentI;
      let bg = 'rgba(255, 255, 255, 0.05)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(16, 185, 129, 0.3)';
        color = '#34d399';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 36px;
          background: ${bg};
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 15px;
        ">${idx <= currentI ? val : '—'}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">dp[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 字符串与切割指示 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">目标字符串字符与动态切割点</div>
          <div style="font-size: 11px; color: #fbbf24;">当前前缀截止 i = ${currentI} ("${s.slice(0, currentI + 1)}")</div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 60px;">
          ${charCards}
        </div>
      </div>

      <!-- DP 转移数组面板 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 12px;">
          最少分割次数 DP 表 (dp[i] 代表前缀 s[0..i] 的最少切刀数)
        </div>
        <div style="display: flex; justify-content: center; align-items: center;">
          ${dpCells}
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前考察前缀右端 i</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentI}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">试探分割点 j</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${currentJ >= 0 ? currentJ : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前前缀最优刀数</div>
          <div style="font-size: 16px; font-weight: 700; color: #34d399;">${dp[currentI]} 刀</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">全局最终最少分割</div>
          <div style="font-size: 18px; font-weight: 700; color: #ec4899;">${dp[s.length - 1]} 刀</div>
        </div>
      </div>
    </div>
  `;
}
