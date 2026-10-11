import { NetherlandsStep } from './netherlands-flag-024-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderNetherlandsSandbox(step: NetherlandsStep): string {
  const maxVal = Math.max(...step.nums, step.target, 1);
  const barsHtml = step.nums.map((v, i) => {
    const isCur = i === step.cur;
    const inLess = i <= step.less;
    const inMore = i >= step.more;
    const inEqual = i > step.less && i < step.more;

    let bg = '#cbd5e1';
    let border = '#94a3b8';
    let textColor = '#475569';

    if (inLess) {
      bg = '#dcfce7';
      border = '#22c55e';
      textColor = '#15803d';
    } else if (inMore) {
      bg = '#fee2e2';
      border = '#ef4444';
      textColor = '#b91c1c';
    } else if (inEqual) {
      bg = '#e0f2fe';
      border = '#0284c7';
      textColor = '#0369a1';
    }

    if (isCur) {
      border = '3px solid #f59e0b';
    }

    const heightPct = Math.max(15, (v / maxVal) * 100);

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; width:34px; margin:0 3px;">
        <div style="width:100%; height:110px; display:flex; align-items:flex-end; justify-content:center;">
          <div style="width:28px; height:${heightPct}%; background:${bg}; border:2px solid ${border}; border-radius:6px 6px 0 0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; color:${textColor};">
            ${v}
          </div>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:4px;">#${i}</div>
        <div style="font-size:9px; height:14px; margin-top:2px;">
          ${isCur ? '<b style="color:#d97706;">▲cur</b>' : i === step.less ? '<span style="color:#16a34a;">less</span>' : i === step.more ? '<span style="color:#dc2626;">more</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 三向区间柱状图看板 -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:13px; color:#0f172a;">
            🇳🇱 荷兰国旗三向分区柱状图 (基准 Target = ${step.target})
          </span>
          <div style="display:flex; gap:10px; font-size:11px;">
            <span style="color:#15803d; font-weight:700;">■ 小于区 (&lt;${step.target})</span>
            <span style="color:#0284c7; font-weight:700;">■ 等于区 (==${step.target})</span>
            <span style="color:#b91c1c; font-weight:700;">■ 大于区 (&gt;${step.target})</span>
          </div>
        </div>
        <div style="display:flex; justify-content:center; align-items:flex-end; overflow-x:auto; padding:10px 0;">
          ${barsHtml}
        </div>
      </div>

      <!-- 指针状态与区间看板 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">小于区边界 [0 .. less]</div>
          <div style="font-size:15px; font-weight:800; color:#15803d;">less = #${step.less}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前扫描游标 cur</div>
          <div style="font-size:16px; font-weight:800; color:#d97706;">cur = #${step.cur}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">大于区边界 [more .. n-1]</div>
          <div style="font-size:15px; font-weight:800; color:#b91c1c;">more = #${step.more}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '荷兰国旗切分原则',
        '遇到小于放左边 (less右扩且cur++)；遇到大于放右边 (more左扩但cur不前进，因换来元素未知)；遇到等于直接推进 cur++。',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
