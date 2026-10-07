/**
 * 会议独占时间段的最大会议数量 (LeetCode 435 / 洛谷 P1803) - 声明式教学级沙盘渲染器
 * 核心贪心：按结束时间升序排序，优先安排结束最早的会议；包含洛谷桶优化推演
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  MEETING_MONOPOLY_STAGE1_CODES,
  MEETING_MONOPOLY_STAGE2_CODES,
  MEETING_MONOPOLY_STAGE3_CODES,
} from './greedy-090-stage-codes';
import {
  type MeetingMonopolyStep,
  parseIntervalsInput,
  buildMeetingMonopolySteps,
} from './meeting-monopoly-step-compiler';
import {
  renderMeetingMonopolyCanvas,
  renderMeetingMonopolyCustomMetrics,
  MEETING_MONOPOLY_ANALYSIS_HTML,
} from './meeting-monopoly-canvas-adapter';

export type { MeetingMonopolyStep };
export {
  parseIntervalsInput,
  buildMeetingMonopolySteps,
  renderMeetingMonopolyCanvas,
  renderMeetingMonopolyCustomMetrics,
};

const { template } = createDeclarativeVisualizer<MeetingMonopolyStep>({
  id: 'meeting-monopoly',
  name: '会议独占最大数量',
  category: 'greedy',
  icon: '📅',
  badge: { mode: '结束时间排序与桶优化', complexity: 'O(n log n) · O(1)' },
  card1Title: '📅 多轨道甘特时间调度沙盘',
  card2Title: '⏱️ 独占时间游标与区间状态看板',
  card2Desc: '展示会议起止区间、冲突舍弃排查与相容留白推演',
  legend: [
    { label: '已选入会议 (不冲突)', color: '#10b981' },
    { label: '当前考察中会议', color: '#f59e0b' },
    { label: '冲突淘汰会议', color: '#ef4444' },
    { label: '等待考察会议', color: '#64748b' },
  ],
  inputs: [
    { id: 'input-intervals', label: '会议区间 [start, end]', type: 'text', defaultValue: '1,2; 2,3; 3,4; 1,3', width: '200px' },
  ],
  presets: [
    { label: '标准重叠用例 (1,2; 2,3; 3,4; 1,3)', values: { 'input-intervals': '1,2; 2,3; 3,4; 1,3' } },
    { label: '全重叠区间 (1,5; 2,6; 3,7; 4,8)', values: { 'input-intervals': '1,5; 2,6; 3,7; 4,8' } },
    { label: '包含区间 (1,10; 2,3; 4,5; 6,7)', values: { 'input-intervals': '1,10; 2,3; 4,5; 6,7' } },
  ],
  metrics: [
    { id: 'selected-count', label: '最多可参会数', color: '#10b981' },
    { id: 'discarded-count', label: '最少需移除数', color: '#ef4444' },
    { id: 'cur-end', label: '当前空闲推进时刻', color: '#38bdf8' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力独立子集穷举对比',
      shortName: '暴力穷举',
      card2Desc: '枚举所有可能的分支，展示指数级时间复杂度',
      codeLanguages: MEETING_MONOPOLY_STAGE1_CODES,
      buildSteps: (inputs) => buildMeetingMonopolySteps(inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3', 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 结束时间排序贪心推演',
      shortName: '结束时间贪心',
      card2Desc: '按结束时间升序排序，每次挑选最早结束的相容会议，留出最大空余',
      codeLanguages: MEETING_MONOPOLY_STAGE2_CODES,
      buildSteps: (inputs) => buildMeetingMonopolySteps(inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3', 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 区间调度数学归纳证明',
      shortName: '贪心证明',
      card2Desc: '归纳证明贪心解永远不比任意合法解更晚结束，相容空间严格最大',
      codeLanguages: MEETING_MONOPOLY_STAGE3_CODES,
      buildSteps: (inputs) => buildMeetingMonopolySteps(inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3', 3),
    },
  ],
  codeLanguages: MEETING_MONOPOLY_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.meetingMonopoly.html,
  analysisHtml: MEETING_MONOPOLY_ANALYSIS_HTML,
  buildSteps: (inputs) => buildMeetingMonopolySteps(inputs?.['input-intervals'] || '1,2; 2,3; 3,4; 1,3', 2),
  renderCanvas: renderMeetingMonopolyCanvas,
  renderCustomMetrics: renderMeetingMonopolyCustomMetrics,
});

export const meetingMonopolyRenderer = UniversalStageVisualizer;
registerAlgorithm({
  id: 'meeting-monopoly',
  name: '会议独占最大数量 (LeetCode 435 / 洛谷 P1803)',
  viewId: 'algo-meeting-monopoly-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code03：结束时间排序贪心与洛谷最晚开始桶 O(N) 优化',
  icon: '📅',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 903,
  learningGoal: '理解结束时间贪心如何为后续留出最大可用时间裕度',
  aliases: ['class090-code03', 'meeting-monopoly-435', 'leetcode-435', 'luogu-p1803'],
});
