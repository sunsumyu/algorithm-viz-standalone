/**
 * 根据字符出现频率排序 — 画布渲染适配器
 */

import { FrequencySortStep } from './sort-characters-by-frequency-step-compiler';

export function renderFrequencySortCanvas(container: HTMLElement, step: FrequencySortStep): void {
  const { s, charCounts, buckets, currentBucketFreq, resultStr } = step;

  const freqCards = Object.entries(charCounts).map(([c, cnt]) => `
    <div style="
      padding: 6px 12px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    ">
      <span style="font-weight: 700; color: #38bdf8; font-size: 1.1rem;">'${c}'</span>
      <span style="color: #94a3b8; font-size: 0.8rem;">:</span>
      <span style="font-weight: 700; color: #f8fafc;">${cnt} 次</span>
    </div>
  `).join('');

  const bucketCols = buckets.map((chars, f) => {
    if (f === 0) return '';
    const isActive = f === currentBucketFreq;
    const hasItems = chars.length > 0;
    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 48px;
      ">
        <div style="
          width: 46px;
          min-height: 70px;
          border-radius: 8px;
          background: ${isActive ? 'rgba(56, 189, 248, 0.25)' : (hasItems ? 'rgba(52, 211, 153, 0.15)' : 'rgba(30, 41, 59, 0.3)')};
          border: ${isActive ? '2px solid #38bdf8' : (hasItems ? '1px solid #34d399' : '1px dashed rgba(255, 255, 255, 0.1)')};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
          box-shadow: ${isActive ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'};
        ">
          ${chars.length ? chars.map(c => `<span style="font-weight:800; color:${isActive ? '#38bdf8' : '#34d399'}; font-size:1.1rem;">'${c}'</span>`).join('') : '<span style="color:#64748b; font-size:0.75rem;">空</span>'}
        </div>
        <span style="font-size: 0.72rem; color: ${isActive ? '#38bdf8' : '#94a3b8'}; font-weight: ${isActive ? '700' : 'normal'};">频次 ${f}</span>
      </div>
    `;
  }).reverse().join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 词频统计栏 -->
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">📊 字符出现频次统计</span>
          <span style="font-size: 0.82rem; color: #94a3b8;">原字符串: <code style="color: #cbd5e1;">"${s}"</code></span>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${freqCards.length ? freqCards : '<span style="color:#64748b; font-size:0.85rem;">等待统计...</span>'}
        </div>
      </div>

      <!-- 桶矩阵与降序扫描 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🪣 频次桶阵列 (从最大频次向 1 倒序扫描)</span>
          ${currentBucketFreq > 0 ? `<span style="font-size: 0.82rem; background: #38bdf822; color: #38bdf8; padding: 2px 8px; border-radius: 6px;">当前提取: 频次 ${currentBucketFreq}</span>` : ''}
        </div>

        <div style="
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 12px;
          background: rgba(2, 6, 23, 0.4);
          border-radius: 8px;
          align-items: flex-end;
          min-height: 100px;
        ">
          ${bucketCols.length ? bucketCols : '<div style="color:#64748b; margin:auto; font-size:0.85rem;">等待分桶...</div>'}
        </div>

        <!-- 拼接结果展示卡片 -->
        <div style="
          padding: 14px 18px;
          background: rgba(52, 211, 153, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="font-size: 0.88rem; color: #94a3b8;">重构字符串 (Res):</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: #34d399; font-family: monospace; letter-spacing: 0.05em;">
            ${resultStr ? `"${resultStr}"` : '<span style="color:#64748b; font-size:0.9rem;">(空)</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
}
