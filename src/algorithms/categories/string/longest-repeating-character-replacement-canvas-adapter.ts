/**
 * 替换后的最长重复字符 — 画布适配器
 * 负责滑动窗口双指针 [L..R] 缩放、字符频次分布与指标展示
 */

import { CharacterReplacementStep } from './longest-repeating-character-replacement-step-compiler';

export function getCharacterReplacementCanvasHtml(step: CharacterReplacementStep): string {
  const { s, k, left, right, maxCount, counts, windowLen, isValid, phase, bestLen } = step;

  const charCards = s
    .split('')
    .map((ch, idx) => {
      const inWindow = idx >= left && idx <= right && phase !== 'finish';
      const isL = idx === left && phase !== 'finish';
      const isR = idx === right && phase !== 'finish';

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (inWindow) {
        if (!isValid) {
          bg = 'rgba(239, 68, 68, 0.2)';
          border = '1px solid #ef4444';
          color = '#fca5a5';
        } else {
          bg = 'rgba(56, 189, 248, 0.25)';
          border = '2px solid #38bdf8';
          color = '#bae6fd';
        }
      }

      let pointerTag = '';
      if (isL && isR) {
        pointerTag = '<span style="color: #ec4899; font-weight: 700;">L/R</span>';
      } else if (isL) {
        pointerTag = '<span style="color: #60a5fa; font-weight: 700;">L</span>';
      } else if (isR) {
        pointerTag = '<span style="color: #a78bfa; font-weight: 700;">R</span>';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${pointerTag}</div>
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
          transition: all 0.2s;
        ">${ch}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  const freqPills = Object.entries(counts)
    .filter(([_, cnt]) => cnt > 0)
    .map(([char, cnt]) => {
      const isDominant = cnt === maxCount;
      return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 10px; background: rgba(255,255,255,0.04); border-radius: 6px; font-size: 12px;">
        <span style="color: #38bdf8; font-weight: 700;">字符 '${char}'</span>
        <span style="color: ${isDominant ? '#34d399' : '#fbbf24'}; font-weight: 600;">
          ${cnt} 次 ${isDominant ? '★ 主导' : ''}
        </span>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">滑动窗口双指针 [L .. R] 动态缩放</div>
          <div style="font-size: 11px; color: ${isValid ? '#34d399' : '#ef4444'}; font-weight: 700;">
            ${phase !== 'finish' ? (isValid ? `✓ 窗口合法 (需替换 <= ${k})` : `✗ 超出替换上限 (需替换 > ${k})`) : '探索完毕'}
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 75px;">
          ${charCards}
        </div>
      </div>

      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
          当前窗口内字符频次分布
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
          ${freqPills || '<div style="color: #64748b; font-size: 11px;">窗口为空</div>'}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前窗口长度</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${windowLen}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最高主导频次 maxCount</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${maxCount}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">需替换字符数</div>
          <div style="font-size: 16px; font-weight: 700; color: ${windowLen - maxCount <= k ? '#34d399' : '#f43f5e'};">
            ${Math.max(0, windowLen - maxCount)} (上限 ${k})
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">历史最长合法长度</div>
          <div style="font-size: 18px; font-weight: 700; color: #10b981;">${bestLen}</div>
        </div>
      </div>
    </div>
  `;
}

export function renderCharacterReplacementCanvas(container: HTMLElement, step: CharacterReplacementStep): void {
  container.innerHTML = getCharacterReplacementCanvasHtml(step);
}
