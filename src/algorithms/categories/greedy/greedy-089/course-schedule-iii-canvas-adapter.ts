import { CourseScheduleStep } from './course-schedule-iii-step-compiler';
import { renderDualHeapVisual } from './greedy-089-shared';

export function renderCourseScheduleCanvas(container: HTMLElement, step: CourseScheduleStep): void {
  const courses = step.courses || [];
  const curCourse = step.currentCourse;

  const cardsHtml = courses
    .map((c) => {
      const isCur = curCourse && curCourse.id === c.id;
      let bg = '#1e293b';
      let border = '#334155';
      let statusBadge = '<span style="color: #64748b; font-size: 10px;">待排期</span>';
      let glow = 'none';

      if (c.status === 'selected') {
        bg = 'rgba(16, 185, 129, 0.12)';
        border = '#10b981';
        statusBadge = '<span style="color: #34d399; font-weight: 800; font-size: 10px; background: rgba(16,185,129,0.2); padding: 1px 6px; border-radius: 3px;">✓ 已入选</span>';
        glow = '0 0 8px rgba(16,185,129,0.25)';
      } else if (c.status === 'regretted') {
        bg = 'rgba(245, 158, 11, 0.12)';
        border = '#f59e0b';
        statusBadge = '<span style="color: #fbbf24; font-weight: 800; font-size: 10px; background: rgba(245,158,11,0.2); padding: 1px 6px; border-radius: 3px;">↩ 反悔剔除</span>';
        glow = '0 0 8px rgba(245,158,11,0.25)';
      } else if (c.status === 'rejected') {
        bg = 'rgba(239, 68, 68, 0.12)';
        border = '#ef4444';
        statusBadge = '<span style="color: #f87171; font-weight: 800; font-size: 10px; background: rgba(239,68,68,0.2); padding: 1px 6px; border-radius: 3px;">✗ 超时放弃</span>';
      }

      if (isCur) {
        border = '#38bdf8';
        glow = '0 0 12px rgba(56, 189, 248, 0.5)';
      }

      return `
        <div style="min-width: 120px; padding: 8px 12px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; gap: 4px; box-shadow: ${glow}; transition: all 0.2s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 3px;">
            <span style="font-weight: 800; font-size: 12px; color: #f8fafc;">课程 C${c.id}</span>
            ${statusBadge}
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1;">时长: <b style="color: #38bdf8;">${c.duration}</b> 天</div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;">截止: <b style="color: #fbbf24;">${c.lastDay}</b> 天</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">📅 课程选修队列与反悔排期沙盘</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; color: #94a3b8;">已修总学时:</span>
          <span style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono', monospace; background: rgba(56,189,248,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">${step.currentTime} 天</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px; background: #020617; border-radius: 8px; border: 1px solid #1e293b; overflow-y: auto; min-height: 90px;">
        ${cardsHtml}
      </div>
      <div style="font-size: 10px; color: #64748b; line-height: 1.4; border-top: 1px solid #1e293b; padding-top: 4px;">
        💡 反悔贪心机制：优先选修截止时间早的课程；一旦超时，从大根堆中弹出耗时最长的已选课程进行替换，压缩总耗时以容纳更多课程。
      </div>
    </div>
  `;
}

export function renderCourseScheduleMetrics(container: HTMLElement, step: CourseScheduleStep): void {
  const heapItems = step.heap || [];
  renderDualHeapVisual(container, heapItems, 'max', '大根堆 (已修课程时长维护)');
}
