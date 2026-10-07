/**
 * 课程表 III (LeetCode 630) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  COURSE_SCHEDULE_STAGE1_CODES,
  COURSE_SCHEDULE_STAGE2_CODES,
  COURSE_SCHEDULE_STAGE3_CODES,
} from './greedy-089-stage-codes';
import {
  CourseItem,
  CourseScheduleStep,
  buildCourseScheduleStage1Steps,
  buildCourseScheduleStage2Steps,
  buildCourseScheduleStage3Steps,
  parseCourseScheduleInput,
} from './course-schedule-iii-step-compiler';
import {
  renderCourseScheduleCanvas,
  renderCourseScheduleMetrics,
} from './course-schedule-iii-canvas-adapter';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';

export type {
  CourseItem,
  CourseScheduleStep,
};
export {
  buildCourseScheduleStage1Steps,
  buildCourseScheduleStage2Steps,
  buildCourseScheduleStage3Steps,
  parseCourseScheduleInput,
};

const { template, Visualizer } = createDeclarativeVisualizer<CourseScheduleStep>({
  id: 'course-schedule-iii',
  name: '课程表 III (Course Schedule III)',
  category: 'greedy',
  icon: '📅',
  badge: { mode: '反悔贪心+大根堆', complexity: 'O(N log N) · O(N)' },
  card1Title: '📈 课程排期耗时条与时间推进沙盘',
  card2Title: '🌲 大根堆双形态呈现 (维护已选课程耗时)',
  card2Desc: '展示堆顶耗时最长的课，超时时支持反悔剔除换入短课',
  legend: [
    { label: '已成功选修', color: '#10b981' },
    { label: '反悔剔除课程', color: '#f59e0b' },
    { label: '放弃课程', color: '#ef4444' },
    { label: '待处理课程', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-courses',
      label: '课程 [duration, lastDay]',
      type: 'text',
      defaultValue: '100,200; 200,1300; 1000,1250; 2000,3200',
      width: '230px',
      placeholder: '持续天数,截止天数; 如 100,200; 200,1300',
    },
  ],
  presets: [
    { label: '经典反悔用例', values: { 'input-courses': '100,200; 200,1300; 1000,1250; 2000,3200' } },
    { label: '连续反悔用例', values: { 'input-courses': '5,5; 4,6; 2,6' } },
    { label: '不可反悔用例', values: { 'input-courses': '1,2; 2,3; 3,4' } },
  ],
  metrics: [
    { id: 'selected-count', label: '已修读课程数', color: '#10b981' },
    { id: 'current-time', label: '累计总耗时 (天)', color: '#3b82f6' },
    { id: 'heap-top', label: '堆顶最大耗时', color: '#ef4444' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力子集对比',
      shortName: '暴力穷举',
      card2Desc: '搜索所有选与不选的组合，展示指数级状态树',
      codeLanguages: COURSE_SCHEDULE_STAGE1_CODES,
      buildSteps: (inputs) => parseCourseScheduleInput(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 反悔贪心推演',
      shortName: '反悔贪心',
      card2Desc: '按截止时间排序，超时时弹出堆顶最长课，置换短课赢得时间裕度',
      codeLanguages: COURSE_SCHEDULE_STAGE2_CODES,
      buildSteps: (inputs) => parseCourseScheduleInput(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 置换不劣证明',
      shortName: '贪心证明',
      card2Desc: '代数证明反悔置换后课程门数守恒且耗时更充裕',
      codeLanguages: COURSE_SCHEDULE_STAGE3_CODES,
      buildSteps: (inputs) => parseCourseScheduleInput(inputs, 3),
    },
  ],
  codeLanguages: COURSE_SCHEDULE_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.courseScheduleIII.html,
  buildSteps: (inputs) => parseCourseScheduleInput(inputs, 2),
  renderCanvas: renderCourseScheduleCanvas,
  renderCustomMetrics: renderCourseScheduleMetrics,
});

export const CourseScheduleVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'course-schedule-iii',
  name: '课程表 III (Course Schedule III)',
  viewId: 'algo-course-schedule-iii-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code06：LeetCode 630 课程表 III，经典反悔贪心大根堆与时间余裕置换',
  icon: '📅',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 895,
  learningGoal: '深入理解反悔贪心 (Regret Greedy) 思想，掌握大根堆在动态优化历史选择中的应用',
  aliases: ['class089-code05', 'course-schedule-iii-630', 'leetcode-630'],
});
