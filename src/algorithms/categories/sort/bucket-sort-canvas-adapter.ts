import { BucketStep } from './bucket-sort-step-compiler';

export function renderBucketSortCanvas(container: HTMLElement, step: BucketStep): void {
  const { array, buckets, activeBucket, gatherCount, phase } = step;

  const bucketsHtml = buckets
    .map((items, bIdx) => {
      const isActive = bIdx === activeBucket && phase !== 'done';
      const itemsHtml = items
        .map((item) => `<span style="padding: 2px 6px; border-radius: 4px; background: ${isActive ? '#eff6ff' : '#f1f5f9'}; border: 1px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; color: ${isActive ? '#1d4ed8' : '#334155'}; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800;">${item}</span>`)
        .join('');

      return `
        <div style="flex: 1; min-height: 56px; border-radius: 8px; background: ${isActive ? '#eff6ff' : '#ffffff'}; border: 1.5px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; display: flex; flex-direction: column; padding: 4px; gap: 4px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          <div style="font-size: 9.5px; font-weight: 800; color: #64748b; text-align: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px;">Bucket [${bIdx}]</div>
          <div style="display: flex; flex-wrap: wrap; gap: 3px; align-items: center; justify-content: center; flex: 1;">${itemsHtml || '<span style="font-size:9px;color:#94a3b8;">(空)</span>'}</div>
        </div>
      `;
    })
    .join('');

  const mainHtml = array
    .map((val, idx) => {
      const isGathered = val !== null && (phase === 'gather' || phase === 'done');
      const isActiveElem = idx === gatherCount - 1 && phase === 'gather';

      let bg = '#ffffff';
      let border = '#cbd5e1';
      let color = '#0f172a';
      if (isActiveElem) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      } else if (isGathered) {
        bg = '#f0fdf4';
        border = '#22c55e';
        color = '#15803d';
      }

      return `
        <div style="min-width: 32px; height: 32px; padding: 0 4px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; color: ${color}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box;">${val !== null ? val : '—'}</div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 14px; padding: 16px 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">分桶容器 (值域线性映射):</div>
        <div style="display: flex; align-items: stretch; justify-content: center; gap: 8px; width: 100%;">${bucketsHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; font-weight: 700; color: #64748b;">主数组 arr (归拢回填):</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; flex-wrap: wrap;">${mainHtml}</div>
      </div>
    </div>
  `;
}
