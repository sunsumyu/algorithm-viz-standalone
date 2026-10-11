import { ValidStringStep } from './valid-parenthesis-string-step-compiler';

export function renderValidStringCanvas(step: ValidStringStep): string {
  const { s, currentIdx, minOpen, maxOpen, isValidSoFar, phase } = step;

  const charCards = s
    .split('')
    .map((c, idx) => {
      const isCur = idx === currentIdx && phase !== 'finish';
      const isProcessed = idx <= currentIdx;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isProcessed) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
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
          font-size: 20px;
        ">${c}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 字符序列卡片 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">括号表达式与通配符扫描</div>
          <div style="font-size: 11px; color: ${isValidSoFar ? '#34d399' : '#ef4444'}; font-weight: 700;">
            ${isValidSoFar ? '✓ 当前状态合法' : '✗ 右括号超量（非法）'}
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 65px;">
          ${charCards}
        </div>
      </div>

      <!-- 中部 贪心动态区间展示 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 12px;">
          未匹配左括号 '(' 的可能数量动态连续区间 [minOpen .. maxOpen]
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(56, 189, 248, 0.15); border: 2px solid #38bdf8; border-radius: 8px; padding: 8px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">最少未匹配 (下限)</span>
            <span style="font-size: 22px; font-weight: 700; color: #38bdf8;">${minOpen}</span>
          </div>
          <div style="font-size: 16px; color: #64748b; font-weight: 700;">至</div>
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(245, 158, 11, 0.15); border: 2px solid #f59e0b; border-radius: 8px; padding: 8px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">最多未匹配 (上限)</span>
            <span style="font-size: 22px; font-weight: 700; color: #fbbf24;">${maxOpen}</span>
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前字符</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentIdx >= 0 && currentIdx < s.length ? `'${s[currentIdx]}'` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">通配符 '*' 角色</div>
          <div style="font-size: 13px; font-weight: 600; color: #38bdf8;">'(' / ')' / '' 三合一</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">能否完全闭合</div>
          <div style="font-size: 16px; font-weight: 700; color: ${minOpen === 0 ? '#34d399' : '#f43f5e'};">
            ${minOpen === 0 ? '✓ 可归零' : '需补右括号'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">判定结果</div>
          <div style="font-size: 18px; font-weight: 700; color: ${isValidSoFar ? '#34d399' : '#f43f5e'};">
            ${phase === 'finish' ? (isValidSoFar ? 'TRUE' : 'FALSE') : isValidSoFar ? '有效中' : '无效'}
          </div>
        </div>
      </div>
    </div>
  `;
}
