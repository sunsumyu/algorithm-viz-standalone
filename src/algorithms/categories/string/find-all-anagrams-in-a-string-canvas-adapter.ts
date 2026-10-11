/**
 * 找到字符串中所有字母异位词 — 画布适配器
 * 负责定长滑动窗口追踪与异位词状态沙盘渲染
 */

import { AnagramsStep } from './find-all-anagrams-in-a-string-step-compiler';

export function getFindAllAnagramsCanvasHtml(step: AnagramsStep): string {
  const { s, p, left, right, isMatch, ans, phase } = step;

  const charCards = s
    .split('')
    .map((c, idx) => {
      const inWin = idx >= left && idx <= right && phase !== 'finish';
      const isStart = idx === left && isMatch;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (inWin) {
        if (isMatch) {
          bg = 'rgba(16, 185, 129, 0.25)';
          border = '2px solid #10b981';
          color = '#34d399';
        } else {
          bg = 'rgba(56, 189, 248, 0.2)';
          border = '2px solid #38bdf8';
          color = '#bae6fd';
        }
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 36px; margin: 0 3px;">
        <div style="font-size: 10px; height: 14px; margin-bottom: 2px;">
          ${isStart ? '<span style="color:#10b981;font-weight:700;">★</span>' : ''}
        </div>
        <div style="
          width: 100%;
          height: 38px;
          background: ${bg};
          border: ${border};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 16px;
          transition: all 0.2s;
        ">${c}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">定长滑动窗口 (长度 ${p.length}) 追踪</div>
          <div style="font-size: 11px; color: ${isMatch ? '#34d399' : '#38bdf8'}; font-weight: 700;">
            ${isMatch ? '✓ 匹配成功！异位词命中' : '比对中...'}
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 65px; overflow-x: auto;">
          ${charCards}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">目标模式串 p</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">"${p}"</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前窗口截取</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">
            "${left >= 0 && right < s.length ? s.slice(left, right + 1) : '—'}"
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">是否字母异位词</div>
          <div style="font-size: 16px; font-weight: 700; color: ${isMatch ? '#34d399' : '#94a3b8'};">
            ${isMatch ? '✓ 是' : '否'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">已命中起始下标列表</div>
          <div style="font-size: 16px; font-weight: 700; color: #34d399;">[${ans.join(', ')}]</div>
        </div>
      </div>
    </div>
  `;
}

export function renderFindAllAnagramsCanvas(container: HTMLElement, step: AnagramsStep): void {
  container.innerHTML = getFindAllAnagramsCanvasHtml(step);
}
