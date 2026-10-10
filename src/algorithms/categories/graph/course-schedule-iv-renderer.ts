/**
 * 课程表 IV (Course Schedule IV · LeetCode 1462) 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 纯声明式元数据配置与委托挂载，身材保持在 70 行内
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  CourseScheduleIVStep,
  COURSE_SCHEDULE_IV_CODES,
  buildCourseScheduleIVSteps,
} from './course-schedule-iv-step-compiler';
import {
  renderCourseScheduleIVCanvas,
  renderCourseScheduleIVCustomMetrics,
} from '../../../core/renderers/adapters/course-schedule-iv-canvas-adapter';

registerDeclarativeAlgorithm({
  id: 'course-schedule-iv',
  name: '课程表 IV',
  category: 'graph',
  difficulty: 2,
  learningGoal: 'LeetCode 1462: 判断有向图中任意两门课程是否存在先修可达性。使用拓扑排序带动状态传递闭包，将多路查询优化为 O(1)。',
  codeLanguages: COURSE_SCHEDULE_IV_CODES,
  generateSteps: (inputs) => {
    const rawN = Number(inputs?.numCourses ?? 4);
    const n = isNaN(rawN) || rawN < 2 ? 4 : Math.min(rawN, 8);
    const pre: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    const qry: [number, number][] = [
      [0, 2],
      [1, 3],
      [3, 0],
      [0, 3],
    ];
    return buildCourseScheduleIVSteps(n, pre, qry);
  },
  renderCanvas: renderCourseScheduleIVCanvas,
  renderCustomMetrics: renderCourseScheduleIVCustomMetrics,
  inputs: [
    {
      id: 'numCourses',
      label: '课程节点数 (2-8)',
      type: 'number',
      defaultValue: 4,
      placeholder: '课程总数',
    },
  ],
});

export {
  buildCourseScheduleIVSteps,
  type CourseScheduleIVStep,
  COURSE_SCHEDULE_IV_CODES,
};
