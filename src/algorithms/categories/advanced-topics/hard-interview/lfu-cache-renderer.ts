/**
 * 大厂高频真题 02: LFU 缓存机制 (LFU Cache)
 * LeetCode 460 / 大厂经典高难度系统设计与数据结构题
 * 双哈希表 + 双向频次链表 O(1) 操作
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  LFUNode,
  FreqBucket,
  LFUStep,
  Command,
  LFU_CACHE_CODES,
  generateLFUSteps,
} from '../../../../core/renderers/adapters/lfu-cache-step-compiler';
import { renderLFUSandbox } from '../../../../core/renderers/adapters/lfu-cache-canvas-adapter';

export type { LFUNode, FreqBucket, LFUStep, Command };
export { LFU_CACHE_CODES, generateLFUSteps, renderLFUSandbox };

export const lfuCacheVisualizer = registerDeclarativeAlgorithm<LFUStep>({
  id: 'lfu-cache',
  name: '大厂高频真题: LFU 缓存机制 (LFU Cache)',
  category: 'linked-list',
  icon: '🗄️',
  difficulty: 3,
  levelOrder: 460,
  learningGoal: '掌握双哈希表配合双向链表在 O(1) 时间内实现 LFU 频次晋升与淘汰机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 460)</h3>
      <p>请你为最不经常使用 (LFU) 缓存算法设计并实现数据结构。支持 <code>get</code> 和 <code>put</code> 操作，且时间复杂度均为 <code>O(1)</code>。</p>
      <p>当缓存容量达到上限时，淘汰使用频次最低的键；若存在平局，淘汰最久未使用的键。</p>
    </div>
  `,
  metrics: [
    { id: 'operation', label: '当前指令', color: '#0284c7' },
    { id: 'capacityUsage', label: '容量使用', color: '#16a34a' },
    { id: 'minFreq', label: '全局 minFreq', color: '#d97706' },
    { id: 'evicted', label: '驱逐记录', color: '#ef4444' },
  ],
  codeLanguages: LFU_CACHE_CODES,
  inputs: [
    {
      id: 'capacity',
      label: '缓存容量',
      type: 'number',
      defaultValue: 3,
    },
  ],
  generateSteps: (input) => {
    const cap = Number(input.capacity) || 3;
    const commands: Command[] = [
      { type: 'put', k: 1, v: 10 },
      { type: 'put', k: 2, v: 20 },
      { type: 'get', k: 1 },
      { type: 'put', k: 3, v: 30 },
      { type: 'get', k: 2 },
      { type: 'get', k: 3 },
      { type: 'put', k: 4, v: 40 },
      { type: 'get', k: 1 },
      { type: 'get', k: 3 },
      { type: 'get', k: 4 },
    ];
    return generateLFUSteps(cap, commands);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderLFUSandbox(step);
  },
});
