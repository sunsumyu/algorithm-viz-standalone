/**
 * Class 059: Code01 课程表与拓扑排序判环 (Course Schedule / LeetCode 207)
 * 经典 Kahn 算法模版 / 有向环检测
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_059_PROBLEMS } from './graph-059-problem-content';
import { CODE01_COURSE_SCHEDULE_CODES } from './graph-059-stage-codes';
import { Step059, renderCourseScheduleBoard } from './graph-059-shared';
import { buildCourseScheduleSteps } from './course-schedule-059-step-compiler';

export { buildCourseScheduleSteps };

export const courseSchedule059Renderer = registerDeclarativeAlgorithm<Step059>({
  id: 'course-schedule-059',
  aliases: ['class059-code01', 'course-schedule-207', 'can-finish-courses'],
  name: '课程表与拓扑排序判环 (Class 059)',
  category: 'graph',
  difficulty: 'medium',
  badge: { mode: 'Kahn拓扑排序', complexity: 'O(V+E)' },
  description: '左程云算法通关课【必备篇】Class 059：入度统计、零入度队列进出、链式消解与有向环检测 (LeetCode 207)',
  learningGoal: '透彻掌握 Kahn 算法入度削减机理，深刻领悟拓扑排序判定有向图是否存在循环依赖死锁的核心定理。',
  icon: '🎓',

  inputs: [
    {
      id: 'numCourses',
      label: '课程总数 N',
      type: 'number',
      defaultValue: 4,
      min: 2,
      max: 8,
    },
    {
      id: 'prereqs',
      label: '先修关系 (格式: a b 代表先修b再修a; 分号或换行分隔)',
      type: 'text',
      defaultValue: '1 0; 2 0; 3 1; 3 2',
      placeholder: '例如: 1 0; 2 0; 3 1; 3 2',
    },
  ],

  presets: [
    {
      label: '经典菱形 DAG: 4门课程顺利学完',
      values: { numCourses: 4, prereqs: '1 0; 2 0; 3 1; 3 2' },
    },
    {
      label: '三方循环死锁: 0->1->2->0 (成环无法学完)',
      values: { numCourses: 3, prereqs: '1 0; 2 1; 0 2' },
    },
    {
      label: '线性链式依赖: 0->1->2->3',
      values: { numCourses: 4, prereqs: '1 0; 2 1; 3 2' },
    },
  ],

  problemContent: GRAPH_059_PROBLEMS.courseSchedule059,
  codeLanguages: CODE01_COURSE_SCHEDULE_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let n = 4;
    let prereqs: Array<[number, number]> = [
      [1, 0],
      [2, 0],
      [3, 1],
      [3, 2],
    ];

    if (params && params.numCourses !== undefined) {
      const parsedN = parseInt(params.numCourses, 10);
      if (!isNaN(parsedN) && parsedN >= 2) n = Math.min(parsedN, 8);
    }

    if (params && params.prereqs) {
      const raw = String(params.prereqs);
      const items = raw.split(/[;\n\r]+/).map(s => s.trim()).filter(Boolean);
      const parsedPrereqs: Array<[number, number]> = [];
      for (const item of items) {
        const parts = item.split(/[\s,，]+/).map(p => parseInt(p, 10)).filter(num => !isNaN(num));
        if (parts.length >= 2) {
          parsedPrereqs.push([parts[0], parts[1]]);
        }
      }
      if (parsedPrereqs.length > 0) prereqs = parsedPrereqs;
    }

    return buildCourseScheduleSteps(n, prereqs);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderCourseScheduleBoard(step);
  },
});
