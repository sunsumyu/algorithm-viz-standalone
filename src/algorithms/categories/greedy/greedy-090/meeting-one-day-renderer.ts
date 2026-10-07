/**
 * 最多可以参加的会议数目 (LeetCode 1353) - 声明式教学级沙盘渲染器
 * 核心贪心：时间指针 day 逐日推进，小根堆维护当前所有可用会议的截止日，贪心优先参加最早截止者
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  MEETING_ONE_DAY_STAGE1_CODES,
  MEETING_ONE_DAY_STAGE2_CODES,
  MEETING_ONE_DAY_STAGE3_CODES,
} from './greedy-090-stage-codes';
import {
  type MeetingOneDayStep,
  parseEventsInput,
  buildMeetingOneDaySteps,
} from './meeting-one-day-step-compiler';
import {
  renderMeetingOneDayCanvas,
  renderMeetingOneDayCustomMetrics,
  MEETING_ONE_DAY_ANALYSIS_HTML,
} from './meeting-one-day-canvas-adapter';

export type { MeetingOneDayStep };
export {
  parseEventsInput,
  buildMeetingOneDaySteps,
  renderMeetingOneDayCanvas,
  renderMeetingOneDayCustomMetrics,
};

const { template } = createDeclarativeVisualizer<MeetingOneDayStep>({
  id: 'meeting-one-day',
  name: '最多参加会议数目',
  category: 'greedy',
  icon: '🗓️',
  badge: { mode: '时间轴扫描与小根堆', complexity: 'O(n log n) · O(n)' },
  card1Title: '🗓️ 逐日推进甘特调度沙盘',
  card2Title: '⏱️ 小根堆截止时间监视器',
  card2Desc: '展示每日开启入堆、过期剔除与堆顶早截止贪心打卡过程',
  legend: [
    { label: '已选定参会 (成功打卡)', color: '#10b981' },
    { label: '小根堆中候选会议', color: '#f59e0b' },
    { label: '已过期失效会议', color: '#ef4444' },
    { label: '尚未开启会议', color: '#64748b' },
  ],
  inputs: [
    { id: 'input-events', label: '会议区间 [startDay, endDay]', type: 'text', defaultValue: '1,2; 2,3; 3,4; 1,2', width: '200px' },
  ],
  presets: [
    { label: '经典重叠 (1,2; 2,3; 3,4; 1,2)', values: { 'input-events': '1,2; 2,3; 3,4; 1,2' } },
    { label: '紧凑全冲突 (1,2; 1,2; 1,2)', values: { 'input-events': '1,2; 1,2; 1,2' } },
    { label: '宽限期分散 (1,4; 2,3; 3,4; 1,1)', values: { 'input-events': '1,4; 2,3; 3,4; 1,1' } },
  ],
  metrics: [
    { id: 'current-day', label: '当前推进天数', color: '#38bdf8' },
    { id: 'heap-size', label: '堆内有效候选数', color: '#f59e0b' },
    { id: 'total-attended', label: '累计参会成功数', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力匹配枚举搜索',
      shortName: '暴力匹配',
      card2Desc: '按天尝试每一种会议分配方案，展示指数级回溯复杂度',
      codeLanguages: MEETING_ONE_DAY_STAGE1_CODES,
      buildSteps: (inputs) => buildMeetingOneDaySteps(inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2', 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 日期推进与小根堆早截止推演',
      shortName: '小根堆贪心',
      card2Desc: '按天推进时间指针，小根堆动态维护所有可用会议的截止日，贪心打卡堆顶',
      codeLanguages: MEETING_ONE_DAY_STAGE2_CODES,
      buildSteps: (inputs) => buildMeetingOneDaySteps(inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2', 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 早截止失效不可逆反证',
      shortName: '贪心证明',
      card2Desc: '反证证明优先消费早截止会议不劣于保留到未来，相容性单调占优',
      codeLanguages: MEETING_ONE_DAY_STAGE3_CODES,
      buildSteps: (inputs) => buildMeetingOneDaySteps(inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2', 3),
    },
  ],
  codeLanguages: MEETING_ONE_DAY_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.meetingOneDay.html,
  analysisHtml: MEETING_ONE_DAY_ANALYSIS_HTML,
  buildSteps: (inputs) => buildMeetingOneDaySteps(inputs?.['input-events'] || '1,2; 2,3; 3,4; 1,2', 2),
  renderCanvas: renderMeetingOneDayCanvas,
  renderCustomMetrics: renderMeetingOneDayCustomMetrics,
});

export const meetingOneDayRenderer = UniversalStageVisualizer;
registerAlgorithm({
  id: 'meeting-one-day',
  name: '最多可以参加的会议数目 (LeetCode 1353)',
  viewId: 'algo-meeting-one-day-view',
  category: 'greedy',
  description: 'LeetCode 1353 / 左程云算法讲解090 Code04：最多可以参加的会议数目（最多参加会议数目），时间逐日推进与小根堆最早截止优先贪心。',
  icon: '🗓️',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 904,
  learningGoal: '掌握紧迫度排序思想与早截止失效不可逆性反证',
  aliases: ['class090-code04', 'meeting-one-day-1353', 'leetcode-1353'],
});
