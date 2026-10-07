/**
 * 会议室 II (LeetCode 253 / LintCode 919) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  MEETING_ROOMS_STAGE1_CODES,
  MEETING_ROOMS_STAGE2_CODES,
  MEETING_ROOMS_STAGE3_CODES,
} from './greedy-089-stage-codes';
import {
  MeetingInterval,
  MeetingRoomsStep,
  buildMeetingRoomsStage1Steps,
  buildMeetingRoomsStage2Steps,
  buildMeetingRoomsStage3Steps,
  parseMeetingRoomsInput,
} from './meeting-rooms-ii-step-compiler';
import {
  renderMeetingRoomsCanvas,
  renderMeetingRoomsMetrics,
} from './meeting-rooms-ii-canvas-adapter';

export type {
  MeetingInterval,
  MeetingRoomsStep,
};
export {
  buildMeetingRoomsStage1Steps,
  buildMeetingRoomsStage2Steps,
  buildMeetingRoomsStage3Steps,
  parseMeetingRoomsInput,
};

const { template, Visualizer } = createDeclarativeVisualizer<MeetingRoomsStep>({
  id: 'meeting-rooms-ii',
  name: '会议室 II (Meeting Rooms II)',
  category: 'greedy',
  icon: '🏢',
  badge: { mode: '排序+小根堆贪心', complexity: 'O(N log N) · O(N)' },
  card1Title: '📊 甘特图多轨道时间轴沙盘',
  card2Title: '🌲 小根堆双形态呈现 (二叉树 + 物理数组)',
  card2Desc: '堆顶时刻保存最早结束的会议室时间，支持新会议无缝复用',
  legend: [
    { label: '正在占用', color: '#3b82f6' },
    { label: '当前考察', color: '#ef4444' },
    { label: '空闲轨道', color: '#f1f5f9' },
  ],
  inputs: [
    {
      id: 'input-intervals',
      label: '会议时间区间',
      type: 'text',
      defaultValue: '0,30; 5,10; 15,20',
      width: '200px',
      placeholder: 'start,end; 如 0,30; 5,10',
    },
  ],
  presets: [
    { label: '示例 1: 0,30; 5,10; 15,20', values: { 'input-intervals': '0,30; 5,10; 15,20' } },
    { label: '示例 2: 7,10; 2,4', values: { 'input-intervals': '7,10; 2,4' } },
    { label: '复杂重叠 (5场)', values: { 'input-intervals': '1,10; 2,7; 3,19; 8,12; 10,20; 11,30' } },
  ],
  metrics: [
    { id: 'total-rooms', label: '所需会议室数', color: '#10b981' },
    { id: 'heap-size', label: '活跃房间堆容量', color: '#3b82f6' },
    { id: 'current-time', label: '当前推进时间 t', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力重叠对比',
      shortName: '暴力对比',
      card2Desc: '枚举各个会议开始时刻，统计同时活跃会议数',
      codeLanguages: MEETING_ROOMS_STAGE1_CODES,
      buildSteps: (inputs) => parseMeetingRoomsInput(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 小根堆贪心',
      shortName: '堆贪心',
      card2Desc: '按开始时间排序，堆顶最早结束会议室动态复用',
      codeLanguages: MEETING_ROOMS_STAGE2_CODES,
      buildSteps: (inputs) => parseMeetingRoomsInput(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 最大重叠反证',
      shortName: '贪心证明',
      card2Desc: '证明小根堆贪心解严格等于时间线峰值并发数，无任何浪费',
      codeLanguages: MEETING_ROOMS_STAGE3_CODES,
      buildSteps: (inputs) => parseMeetingRoomsInput(inputs, 3),
    },
  ],
  codeLanguages: MEETING_ROOMS_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.meetingRoomsII.html,
  buildSteps: (inputs) => parseMeetingRoomsInput(inputs, 2),
  renderCanvas: renderMeetingRoomsCanvas,
  renderCustomMetrics: renderMeetingRoomsMetrics,
});

export const MeetingRoomsVisualizer = Visualizer;

registerAlgorithm({
  id: 'meeting-rooms-ii',
  name: '会议室 II (Meeting Rooms II)',
  viewId: 'meeting-rooms-ii',
  category: 'greedy',
  description: '左程云算法讲解089 Code05：LeetCode 253 会议室 II，小根堆动态维护最早结束时间与多轨道甘特图',
  icon: '🏢',
  template: `<div id="meeting-rooms-ii" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 894,
  learningGoal: '掌握小根堆在区间调度与重叠问题中的核心应用，理解最早空闲复用的贪心策略',
  aliases: ['class089-code04', 'meeting-rooms-ii-253', 'leetcode-253'],
});
