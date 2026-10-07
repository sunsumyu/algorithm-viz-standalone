import { MeetingRoomsStep } from './meeting-rooms-ii-step-compiler';
import { renderDualHeapVisual, renderGanttTimeline } from './greedy-089-shared';

export function renderMeetingRoomsCanvas(container: HTMLElement, step: MeetingRoomsStep): void {
  const rooms = step.rooms || [];
  const numTracks = Math.max(1, step.maxRooms || 1);
  let maxTime = 30;
  step.intervals.forEach((iv) => {
    if (iv.end > maxTime) maxTime = iv.end;
  });

  renderGanttTimeline(container, rooms, numTracks, step.currentTime, maxTime + 2);
}

export function renderMeetingRoomsMetrics(container: HTMLElement, step: MeetingRoomsStep): void {
  const heapItems = step.heap || [];
  renderDualHeapVisual(container, heapItems, 'min', '小根堆 (维护正在进行的会议室结束时间)');
}
