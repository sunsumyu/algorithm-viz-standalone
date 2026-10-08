import { TaskSchedulerStep } from './task-scheduler-step-compiler';

export function renderTaskSchedulerCanvas(container: HTMLElement, step: TaskSchedulerStep): void {
  const { slots, taskCounts, maxFreq, idleCount, totalTime } = step;

  const taskPalette: Record<string, string> = {
    A: '#38bdf8',
    B: '#818cf8',
    C: '#34d399',
    D: '#fbbf24',
    E: '#f472b6',
    F: '#a78bfa',
    IDLE: '#64748b'
  };

  const slotHtml = slots.map((s, idx) => {
    const isIdle = s === 'IDLE';
    const color = taskPalette[s] || '#c084fc';
    const bg = isIdle ? 'rgba(100, 116, 139, 0.15)' : `${color}22`;
    const border = isIdle ? '1px dashed rgba(148, 163, 184, 0.3)' : `1px solid ${color}88`;

    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
        <div style="
          width: 44px;
          height: 48px;
          border-radius: 8px;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          color: ${isIdle ? '#94a3b8' : color};
          box-shadow: ${isIdle ? 'none' : `0 4px 12px ${color}33`};
          transition: all 0.2s ease;
        ">
          ${isIdle ? '💤' : s}
        </div>
        <span style="font-size: 0.72rem; color: #64748b; font-family: monospace;">T${idx + 1}</span>
      </div>
    `;
  }).join('');

  const freqCards = Object.entries(taskCounts).map(([task, cnt]) => {
    const isMax = cnt === maxFreq;
    const color = taskPalette[task] || '#c084fc';
    return `
      <div style="
        padding: 8px 14px;
        background: ${isMax ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.5)'};
        border: 1px solid ${isMax ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'};
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span style="font-weight: 700; color: ${color}; font-size: 1.1rem;">${task}</span>
        <span style="color: #94a3b8; font-size: 0.85rem;">频次:</span>
        <span style="font-weight: 700; color: #f8fafc;">${cnt}</span>
        ${isMax ? '<span style="font-size:0.7rem; background:#38bdf822; color:#38bdf8; padding:2px 6px; border-radius:4px;">最高频</span>' : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.85rem; font-weight: 600; color: #94a3b8;">任务频次统计:</span>
        ${freqCards.length ? freqCards : '<span style="color:#64748b; font-size:0.85rem;">未统计</span>'}
      </div>

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
          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
            <span>⏱️ CPU 调度时间轴槽位排布 (Timeline Slots)</span>
            ${totalTime > 0 ? `<span style="font-size: 0.8rem; background: #38bdf822; color: #38bdf8; padding: 2px 8px; border-radius: 6px;">总耗时: ${totalTime} 个时间片</span>` : ''}
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8;">
            空闲槽 (IDLE): <b style="color: ${idleCount > 0 ? '#fbbf24' : '#34d399'};">${idleCount}</b>
          </div>
        </div>

        <div style="
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 16px;
          background: rgba(2, 6, 23, 0.4);
          border-radius: 10px;
          min-height: 90px;
          align-items: center;
        ">
          ${slotHtml.length ? slotHtml : '<div style="color: #64748b; font-size: 0.88rem; width: 100%; text-align: center;">点击单步或播放查看时间轴插槽调度</div>'}
        </div>

        <div style="
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.5);
          border-left: 4px solid #38bdf8;
          border-radius: 0 8px 8px 0;
          font-size: 0.85rem;
          color: #cbd5e1;
          line-height: 1.6;
        ">
          <div>💡 <b>桶思想贪心解析</b>：以最高频任务建立 (maxFreq - 1) 个大小为 (n + 1) 的桶。</div>
          <div>若任务种类少，桶内空闲需填补 IDLE，耗时为 <code>(maxFreq - 1) * (n + 1) + maxCount</code>；若任务丰富填满桶，耗时为 <code>tasks.length</code>。</div>
        </div>
      </div>
    </div>
  `;
}
