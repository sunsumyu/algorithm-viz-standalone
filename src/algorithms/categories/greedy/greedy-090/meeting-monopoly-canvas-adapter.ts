import type { MeetingMonopolyStep } from './meeting-monopoly-step-compiler';
import { renderGanttTimeline } from './greedy-090-shared';

export const MEETING_MONOPOLY_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
    <h3 style="color: #0f172a; margin-top: 0;">🧠 为什么按结束时间升序排序一定最优？</h3>
    <p><b>直观洞察：</b></p>
    <p>一个会议占用时间越早结束，就越早把会议室空出来，给后续会议留下的可用时间段 <code>[end, +∞)</code> 就越充裕！</p>
    <p><b>为什么不能按开始时间排序？反例：</b></p>
    <p>会议 A <code>[0, 100]</code>，会议 B <code>[1, 2]</code>，会议 C <code>[3, 4]</code>。若按开始时间排序会错误地首先选择 A，导致后续全部冲突，只能参加 1 场；而最优解显然是参加 B 和 C（共 2 场）。</p>
    
    <p><b>洛谷 P1803 数组桶优化 ($O(N)$)：</b></p>
    <p>当时间范围最大为 $10^6$ 时，若排序耗时过高，可以开辟数组 <code>latest[end]</code>，记录以 <code>end</code> 结束的会议中最晚的开始时间。直接从 0 到 $10^6$ 遍历时间刻度，跳过排序达到严格 $O(N)$！</p>
  </div>
`;

export function renderMeetingMonopolyCanvas(container: HTMLElement, step: MeetingMonopolyStep): void {
  renderGanttTimeline(container, {
    intervals: step.intervals,
    currentTime: step.currentTime,
    minTime: step.minTime,
    maxTime: step.maxTime,
    tracksCount: step.tracksCount,
    cursorLabel: '时间指针',
  });

  const root = container.closest('.dsp-view-root') || document;
  const selEl = root.querySelector('#metric-selected-count');
  const dropEl = root.querySelector('#metric-discarded-count');
  const curEndEl = root.querySelector('#metric-cur-end');

  if (selEl) selEl.textContent = `${step.selectedCount} 场`;
  if (dropEl) dropEl.textContent = `${step.discardedCount} 场`;
  if (curEndEl) curEndEl.textContent = step.curEnd === -Infinity ? '尚未开始' : `T = ${step.curEnd}`;
}

export function renderMeetingMonopolyCustomMetrics(container: HTMLElement, step: MeetingMonopolyStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">当前推演决策:</span>
        <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
      </div>
      <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11.5px; color: #334155;">
        ${step.message}
      </div>
    </div>
  `;
}
