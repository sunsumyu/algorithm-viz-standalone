import type { MeetingOneDayStep } from './meeting-one-day-step-compiler';
import { renderGanttTimeline } from './greedy-090-shared';

export const MEETING_ONE_DAY_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
    <h3 style="color: #0f172a; margin-top: 0;">🧠 为什么只占一天时必须按“截止日小根堆”贪心？</h3>
    <p><b>反向思考：紧迫度原则</b></p>
    <p>在某一天 <code>day</code>，如果有多场会议都可以今天去打卡：</p>
    <ul>
      <li>会议 A 截止日是明天（即将过期）；</li>
      <li>会议 B 截止日是下周（时间充裕）。</li>
    </ul>
    <p>如果今天不去 A，明天 A 就永久作废了，产生净损失；而如果今天去 A，把 B 留给后天去参加，完全不影响最终总数！</p>
    <p>因此，<b>早截止日代表更高的紧迫性与更短的容忍度</b>，小根堆贪心正是紧迫度排队的完美实现。</p>
  </div>
`;

export function renderMeetingOneDayCanvas(container: HTMLElement, step: MeetingOneDayStep): void {
  renderGanttTimeline(container, {
    intervals: step.intervals,
    currentTime: step.currentDay,
    minTime: step.minDay,
    maxTime: step.maxDay,
    tracksCount: step.tracksCount,
    cursorLabel: '今日指针',
  });

  const root = container.closest('.dsp-view-root') || document;
  const dayEl = root.querySelector('#metric-current-day');
  const heapEl = root.querySelector('#metric-heap-size');
  const attendEl = root.querySelector('#metric-total-attended');

  if (dayEl) dayEl.textContent = `Day ${step.currentDay}`;
  if (heapEl) heapEl.textContent = `${step.heapContents.length} 场`;
  if (attendEl) attendEl.textContent = `${step.totalAttended} 场`;
}

export function renderMeetingOneDayCustomMetrics(container: HTMLElement, step: MeetingOneDayStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">小根堆当前截止日:</span>
        <span style="font-size: 11px; color: #34d399; font-weight: 800; font-family: 'JetBrains Mono', monospace; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">[${step.heapContents.join(', ') || '空'}]</span>
      </div>
      <div style="padding: 8px 12px; background: #020617; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; border-radius: 6px; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">
        ${step.message}
      </div>
    </div>
  `;
}
