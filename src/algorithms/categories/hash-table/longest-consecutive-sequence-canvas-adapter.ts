/**
 * 最长连续序列 — 画布渲染适配器
 */

import { LongestConsecutiveStep } from './longest-consecutive-sequence-step-compiler';

export function renderLongestConsecutiveCanvas(container: HTMLElement, step: LongestConsecutiveStep): void {
  const { numSet, currentNum, isStreakStart, currentStreak, longestStreak, maxLen, phase } = step;

  // 渲染所有去重数字徽章
  const badges = numSet
    .map((val) => {
      const isCur = val === currentNum && phase !== 'finish';
      const inCurStreak = currentStreak.includes(val);
      const inBestStreak = longestStreak.includes(val);

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.4)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (inCurStreak) {
        bg = 'rgba(56, 189, 248, 0.3)';
        border = '2px solid #38bdf8';
        color = '#bae6fd';
      } else if (inBestStreak && phase === 'finish') {
        bg = 'rgba(16, 185, 129, 0.3)';
        border = '2px solid #10b981';
        color = '#34d399';
      }

      return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 46px;
        height: 40px;
        background: ${bg};
        border: ${border};
        border-radius: 8px;
        color: ${color};
        font-weight: 700;
        font-size: 14px;
        transition: all 0.2s;
        padding: 0 8px;
      ">
        ${val}
      </div>`;
    })
    .join('');

  // 当前链条可视化
  let streakChain = '<span style="color: #64748b; font-size: 12px;">当前没有连续探索链</span>';
  if (currentStreak.length > 0) {
    streakChain = currentStreak
      .map((n) => `<span style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 4px; padding: 3px 8px; color: #bae6fd; font-weight: 700;">${n}</span>`)
      .join(' <span style="color: #64748b;">➔</span> ');
  }

  // 最佳链条可视化
  let bestChain = '<span style="color: #64748b; font-size: 12px;">暂无记录</span>';
  if (longestStreak.length > 0) {
    bestChain = longestStreak
      .map((n) => `<span style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 3px 8px; color: #34d399; font-weight: 700;">${n}</span>`)
      .join(' <span style="color: #64748b;">➔</span> ');
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 哈希集合分布 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">去重数字哈希集合 (HashSet)</div>
          <div style="font-size: 11px; display: flex; gap: 10px;">
            <span style="color: #fbbf24;">● 当前探测</span>
            <span style="color: #38bdf8;">● 链条探索中</span>
            <span style="color: #34d399;">● 最优连续序列</span>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 50px; align-items: center;">
          ${badges}
        </div>
      </div>

      <!-- 中部 序列链推演面板 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">当前考察序列链</div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 36px;">
            ${streakChain}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">历史最长连续链 (Max)</div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 36px;">
            ${bestChain}
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前考察数</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentNum !== -1 ? currentNum : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">是否为序列起点</div>
          <div style="font-size: 16px; font-weight: 700; color: ${isStreakStart ? '#34d399' : '#94a3b8'};">
            ${isStreakStart ? '✓ 起点 (num-1不存在)' : '否 (已包含)'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前链长度</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${currentStreak.length}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">全局最长长度</div>
          <div style="font-size: 18px; font-weight: 700; color: #34d399;">${maxLen}</div>
        </div>
      </div>
    </div>
  `;
}
