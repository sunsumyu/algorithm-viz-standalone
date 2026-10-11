/**
 * 左程云算法通关课 Class 042: 复杂链表的复制 (Copy List with Random Pointer)
 * LeetCode 138 (Medium / 高频大厂核心链表手撕题)
 * 核心机制: 原地交织复制法 (In-Place Interleaving)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ComplexNode,
  CopyListStep,
  COPY_LIST_CODES,
  COPY_LINES,
  buildCopyListSteps,
} from './copy-list-random-pointer-042-step-compiler';
import { renderCopyListCanvas } from './copy-list-random-pointer-042-canvas-adapter';

export type { ComplexNode, CopyListStep };
export { COPY_LIST_CODES, COPY_LINES, buildCopyListSteps, renderCopyListCanvas };

export const copyListRandomPointer042Visualizer = registerDeclarativeAlgorithm<CopyListStep>({
  id: 'copy-list-random-pointer-042',
  aliases: ['class035-code01', 'class042-code01', 'copy-random-list-035', 'copy-list-random-pointer', 'copy-random-list', 'leetcode-138'],
  name: '复杂链表的复制 (Class 042)',
  category: 'linked-list',
  icon: '📋',
  difficulty: 2,
  levelOrder: 42,
  learningGoal: '掌握利用链表就地插入建立映射的精妙技巧，彻底摆脱哈希表实现 O(1) 额外空间复杂度的复杂链表深拷贝',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 042 / LeetCode 138)</h3>
      <p>给你一个长度为 <code>n</code> 的链表，每个节点包含一个额外增加的随机指针 <code>random</code> ，该指针可以指向链表中的任何节点或空节点。构造这个链表的<strong>深拷贝</strong>：</p>
      <ul>
        <li><strong>传统解法</strong>：用 <code>HashMap&lt;Node, Node&gt;</code> 记录原节点到克隆节点的映射，空间复杂度为 $O(N)$。</li>
        <li><strong>左神最优解法 (原地交织法)</strong>：
          <br/>1. 复制每个节点，并将新节点直接挂在老节点后边：<code>1 -&gt; 1' -&gt; 2 -&gt; 2'</code>；
          <br/>2. 根据老节点的 <code>random</code> 关系设置新节点的 <code>random</code>：<code>cur.next.random = cur.random.next</code>；
          <br/>3. 在保持老链表完整恢复的同时，将新链表从缝隙中完整拆出！空间复杂度达 $O(1)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: COPY_LIST_CODES,
  inputs: [],
  generateSteps: () => {
    return buildCopyListSteps();
  },
  renderCanvas: (container, step) => {
    renderCopyListCanvas(container, step);
  },
});
