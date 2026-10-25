/**
 * 删除链表的倒数第 N 个结点可视化器 — 声明式 4-Card 标准架构
 * LeetCode 19：dummyHead 虚拟头节点 + 快慢指针定距一趟扫描
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_NTH_FROM_END_PROBLEM_HTML,
  REMOVE_NTH_FROM_END_ANALYSIS_HTML,
  REMOVE_NTH_FROM_END_CODE_LANGUAGES,
} from './remove-nth-from-end-problem-content';
import {
  RNStep,
  buildRNSteps,
  withRemoveNthFromEndMetrics,
} from './remove-nth-from-end-step-compiler';
import { renderRemoveNthFromEndCanvas } from './remove-nth-from-end-canvas-adapter';

export type { RNStep };
export {
  buildRNSteps,
  withRemoveNthFromEndMetrics,
  renderRemoveNthFromEndCanvas,
};

registerDeclarativeAlgorithm({
  id: 'remove-nth-from-end',
  aliases: ['19', 'leetcode-19', 'remove-nth-node'],
  name: '删除链表的倒数第 N 个结点',
  category: 'linked-list',
  description: 'LeetCode 19 · 虚拟头节点 + 快慢指针定距一趟扫描完成倒数第 N 个节点跨越删除',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握虚拟头节点 (dummyHead) 消除特判与快慢指针定距一趟扫描删除链表结点的核心技巧',
  hasDeductionTree: true,
  inputs: [
    {
      id: 'list',
      label: 'head',
      type: 'text',
      defaultValue: '1,2,3,4,5',
      placeholder: '1,2,3,4,5',
    },
    {
      id: 'n',
      label: 'n (倒数第几个)',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 10,
    },
  ],
  presets: [
    { label: '示例 1 (1..5, n=2)', values: { list: '1,2,3,4,5', n: 2 } },
    { label: '示例 2 (删头, n=1)', values: { list: '1,2,3,4,5', n: 5 } },
    { label: '单节点', values: { list: '7', n: 1 } },
    { label: '删中间 (n=3)', values: { list: '1,2,3,4,5,6', n: 3 } },
  ],
  metrics: [
    { id: 'fast', label: 'fast 快指针', color: '#2563eb' },
    { id: 'slow', label: 'slow 慢指针', color: '#059669' },
    { id: 'target', label: '待删除目标', color: '#ef4444' },
    { id: 'gap', label: '指针间距', color: '#64748b' },
    { id: 'head', label: '当前链表头', color: '#059669' },
    { id: 'remaining', label: '剩余节点数', color: '#2563eb' },
    { id: 'action', label: '当前阶段', color: '#2563eb' },
  ],
  legend: [
    { label: '🚩 dummyHead 虚拟头', color: '#64748b' },
    { label: '🚀 fast 快指针 (先行 n+1 步)', color: '#2563eb' },
    { label: '🐢 slow 慢指针', color: '#059669' },
    { label: '❌ 待删除目标节点', color: '#ef4444' },
  ],
  codeLanguages: REMOVE_NTH_FROM_END_CODE_LANGUAGES,
  problemHtml: REMOVE_NTH_FROM_END_PROBLEM_HTML,
  analysisHtml: REMOVE_NTH_FROM_END_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withRemoveNthFromEndMetrics(
      buildRNSteps(
        parseNumberList(String(inputs.list ?? '1,2,3,4,5'), [1, 2, 3, 4, 5]),
        parseInt(String(inputs.n ?? '2'), 10) || 2
      )
    ),
  renderCanvas: (container, step) => renderRemoveNthFromEndCanvas(container, step as RNStep),
});
