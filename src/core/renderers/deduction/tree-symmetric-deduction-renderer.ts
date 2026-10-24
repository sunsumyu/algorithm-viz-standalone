/**
 * 对称二叉树 (Symmetric Tree · LeetCode 101)
 * 全景推演树渲染策略 (TreeSymmetricDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeSymmetricDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-symmetric';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-symmetric' ||
      modelId === '101' ||
      modelId === 'leetcode-101' ||
      modelId === 'symmetric-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 101. 对称二叉树 (Symmetric Tree) · 全景推演树',
      badge: '代码随想录 · 外侧与内侧镜像双指针 / 队列成对迭代 / 静态数组优化',
      descriptionHtml: `
        对称二叉树判定本质：不是单树的普通自遍历，而是<strong>以根节点为镜像轴，两棵子树（左子树与右子树）的镜像同步比对</strong>！<br/>
        <strong>《代码随想录》核心教学洞见——外侧与内侧双指针联动模型：</strong><br/>
        设计递归函数 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">compare(left, right)</code>，同步推进两枚指针：<br/>
        1. <strong>外侧比对</strong>：左孩子的左子树 vs 右孩子的右子树（<code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">outside = compare(left.left, right.right)</code>）；<br/>
        2. <strong>内侧比对</strong>：左孩子的右子树 vs 右孩子的左子树（<code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">inside = compare(left.right, right.left)</code>）；<br/>
        3. <strong>综合归约</strong>：<code class="font-mono bg-purple-50 text-purple-700 px-1 py-0.5 rounded font-bold">return outside && inside</code>；<br/>
        递归基底四情况：两空为 true，一空为 false，值不等为 false，值相等继续深潜。
      `,
      initialStateText: `判定入口：isSymmetric(root) ➔ 根空返回 true，否则启动 compare(root.left, root.right)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '双空对称基底 (Both Null)',
        valuesStr: 'left == null && right == null ➔ return true (对称叶底，天然镜像匹配)',
      },
      {
        prefix: '├───',
        label: '单空失衡违规 (One Null)',
        valuesStr: 'left == null || right == null ➔ return false (一侧存在而对侧为空，结构破坏)',
      },
      {
        prefix: '└───',
        label: '数值失配违规 (Value Mismatch)',
        valuesStr: 'left.val != right.val ➔ return false (数值不相等，镜像对称失效)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 镜像双指针递归比对 (Mirror Two Pointers DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Recursive Compare</span>',
      detailLines: [
        'outside = compare(left.left, right.right) ➔ 递归探针深潜最外侧边缘',
        'inside = compare(left.right, right.left) ➔ 递归探针深潜最内侧边缘',
        'return outside && inside ➔ 外侧与内侧皆对称，局部子树方可判定为对称',
      ],
      fillLine: '外侧内侧联动推演：以轴对称视角拆解递归，左右子树同步对称下探',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 队列成对迭代层序比较 (Queue Pair BFS Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">Queue&lt;TreeNode&gt;</span>',
      detailLines: [
        'queue.push(root.left); queue.push(root.right); ➔ 成对压入左右镜像节点',
        'node1 = queue.shift(); node2 = queue.shift(); ➔ 成对出队比对基底条件',
        '按外侧与内侧顺序成对推进入队：(node1.left, node2.right), (node1.right, node2.left)',
      ],
      fillLine: '成对迭代解法：队列维持相邻两元素恒为镜像比较对象，消除隐式函数递归开销',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 静态数组高性能循环队列 (Static Array Queue O(1) GC)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Zero-GC Array</span>',
      detailLines: [
        '预分配固定长度静态数组 TreeNode[] queue 配合 head/tail 指针',
        '原地复用数组槽位，彻底消除大量对象频繁压栈与垃圾回收 (GC) 抖动',
      ],
      fillLine: '工业级工程优化：利用连续内存数组模拟队列，运行吞吐与响应极致稳定',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Mirror DFS to Queue & Zero-GC)',
      subtitle: 'Programmer Carl Symmetric Tree Dual-Pointer Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return true; // 全树所有对称位置外侧与内侧节点均严格镜像相等',
      answerDescription: '时间复杂度严格 O(N)，每个节点仅访问一次；空间复杂度取决于树高或最大层宽 O(H) ~ O(W)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
