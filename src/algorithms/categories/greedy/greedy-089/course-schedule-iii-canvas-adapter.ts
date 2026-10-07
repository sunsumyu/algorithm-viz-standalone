import { CourseScheduleStep } from './course-schedule-iii-step-compiler';
import { renderDualHeapVisual } from './greedy-089-shared';

export function renderCourseScheduleCanvas(container: HTMLElement, step: CourseScheduleStep): void {
  const courses = step.courses || [];
  const curCourse = step.currentCourse;

  const cardsHtml = courses
    .map((c) => {
      const isCur = curCourse && curCourse.id === c.id;
      let bg = '#ffffff';
      let border = '#cbd5e1';
      let statusBadge = '<span style="color: #64748b;">待处理</span>';

      if (c.status === 'selected') {
        bg = '#ecfdf5';
        border = '#10b981';
        statusBadge = '<span style="color: #059669; font-weight: 700;">✓ 已入选</span>';
      } else if (c.status === 'regretted') {
        bg = '#fffbeb';
        border = '#f59e0b';
        statusBadge = '<span style="color: #d97706; font-weight: 700;">↩ 反悔剔除</span>';
      } else if (c.status === 'rejected') {
        bg = '#fef2f2';
        border = '#ef4444';
        statusBadge = '<span style="color: #dc2626; font-weight: 700;">✗ 超时放弃</span>';
      }

      if (isCur) {
        border = '#3b82f6';
      }

      return `
        <div style="min-width: 110px; padding: 6px 10px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 800; font-size: 12px; color: #1e293b;">课程 C${c.id}</span>
            <span style="font-size: 10px;">${statusBadge}</span>
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569;">时长: <b>${c.duration}</b> 天</div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">截止: <b>${c.lastDay}</b> 天</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <span style="font-size: 12px; font-weight: 700; color: #475569;">📅 课程池与排期状态</span>
        <span style="font-size: 12px; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">当前累计总耗时: ${step.currentTime} 天</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;">
        ${cardsHtml}
      </div>
    </div>
  `;
}

export function renderCourseScheduleMetrics(container: HTMLElement, step: CourseScheduleStep): void {
  const heapItems = step.heap || [];
  renderDualHeapVisual(container, heapItems, 'max', '大根堆 (已修课程时长维护)');
}
