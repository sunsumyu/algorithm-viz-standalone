/**
 * Class 059: 拓扑排序与 Kahn 算法 (Topological Sort / Kahn's Algorithm) 共享沙盘
 * 提供：课程拓扑消除沙盘、入度表与就绪队列联动
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 语义化包裹，杜绝误触指标药丸面板
 */

import { StepBase } from '../../../../core/step-visualizer';
import { HighlightTarget } from '../../../../core/renderers/dark-code-terminal-presenter';

export interface Step059 extends StepBase {
  title?: string;
  description?: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'error' | 'info' };

  numCourses: number;
  inDegree: number[];
  queue: number[];
  curNode?: number;
  topoOrder: number[];
  adjacency: number[][]; // 邻接表
  isCycle?: boolean;
}

export function renderCourseScheduleBoard(step: Step059): string {
  const n = step.numCourses;
  const inDegree = step.inDegree || [];
  const queue = step.queue || [];
  const cur = step.curNode !== undefined ? step.curNode : -1;
  const topo = step.topoOrder || [];
  const isCycle = step.isCycle;

  // 1. 课程节点状态卡片
  const courseCards = Array.from({ length: n }, (_, i) => {
    const isLearned = topo.includes(i);
    const inQueue = queue.includes(i);
    const isCurrent = i === cur;
    const deg = inDegree[i] ?? 0;

    let border = '1px solid #cbd5e1';
    let bg = '#ffffff';
    let color = '#334155';
    let statusText = `入度: ${deg}`;

    if (isCurrent) {
      border = '2px solid #8b5cf6';
      bg = '#f5f3ff';
      color = '#6b21a8';
      statusText = '正在修读';
    } else if (isLearned) {
      border = '1.5px solid #10b981';
      bg = '#ecfdf5';
      color = '#047857';
      statusText = '已修完 ✔';
    } else if (inQueue) {
      border = '2px solid #3b82f6';
      bg = '#eff6ff';
      color = '#1d4ed8';
      statusText = '零入度排队';
    } else if (isCycle && deg > 0) {
      border = '2px solid #ef4444';
      bg = '#fee2e2';
      color = '#b91c1c';
      statusText = '环路死锁 ✕';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;
                  min-width: 58px; height: 58px; border-radius: 8px; border: ${border}; background: ${bg}; color: ${color};
                  box-sizing: border-box; padding: 4px;">
        <span style="font-size: 13px; font-weight: 800; font-family: monospace;">课程 ${i}</span>
        <span style="font-size: 9px; font-weight: 700; margin-top: 2px;">${statusText}</span>
      </div>
    `;
  }).join('');

  // 2. 零入度待修就绪队列 (FIFO Queue)
  const queueHtml = queue.length > 0
    ? queue.map(q => `
        <span style="padding: 3px 8px; border-radius: 4px; background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; font-family: monospace; font-size: 11px; font-weight: 700;">
          课程 ${q}
        </span>
      `).join(' ➔ ')
    : '<span style="color: #94a3b8; font-size: 11px;">(队列为空)</span>';

  // 3. 已按拓扑序完成的课程链
  const topoHtml = topo.length > 0
    ? topo.map(t => `
        <span style="padding: 3px 8px; border-radius: 4px; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; font-family: monospace; font-size: 11px; font-weight: 700;">
          ${t}
        </span>
      `).join(' ➔ ')
    : '<span style="color: #94a3b8; font-size: 11px;">(暂无完成课程)</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11.5px; font-weight: 700; color: #334155;">🎓 课程入度消解与状态沙盘 (总课程 N=${n})</span>
        <span style="font-size: 11px; font-weight: 700; color: ${topo.length === n ? '#059669' : isCycle ? '#dc2626' : '#2563eb'};">
          修完进度: ${topo.length} / ${n} ${topo.length === n ? '(全部修完)' : isCycle ? '(成环死锁)' : ''}
        </span>
      </div>

      <!-- 课程卡片列表 -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 0;">
        ${courseCards}
      </div>

      <!-- 就绪队列与已修序列 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #1e40af;">📥 就绪队列 (零入度课程):</span>
          <div style="display: flex; gap: 4px; align-items: center; overflow-x: auto;">
            ${queueHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #065f46;">📋 已修拓扑路径:</span>
          <div style="display: flex; gap: 4px; align-items: center; overflow-x: auto;">
            ${topoHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
