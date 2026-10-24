/**
 * 路径总和与全解收集 (Path Sum & Path Sum II · LeetCode 112 & 113 / Class 037 Code03)
 * 全景推演树渲染策略 (PathSumDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PathSumDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'path-sum';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'path-sum' ||
      modelId === 'tree-037-path-sum-ii' ||
      modelId === 'class037-code03' ||
      modelId === 'leetcode-112' ||
      modelId === 'leetcode-113' ||
      modelId === '112' ||
      modelId === '113'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 112 / 113. 路径总和与全解收集 (Path Sum & Path Sum II) · 全景推演树',
      badge: '代码随想录 · 显式回溯 / 隐式精简 / 全解收集',
      descriptionHtml: `
        二叉树根到叶路径核心判定：在树中搜索一条或全部根到叶子节点的路径，使沿途节点值之和严格等于 <span class="font-bold text-slate-800">targetSum</span>。<br/>
        <strong>《代码随想录》核心教学洞见：</strong> 搜索单条路径需要返回值（命中立即截断），收集全解不需要返回值（遍历整树深拷贝收录）；
        理解回溯必须先从显式 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">count -= val</code> 与 <code class="font-mono bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-bold">count += val</code> 现场恢复学起！
      `,
      initialStateText: `根调用入口：hasPathSum(root, targetSum)；若 root 为空直接返回 false；初始计数器 count = targetSum - root.val。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ return false / return [] (空树不存在根到叶有效路径)',
      },
      {
        prefix: '├───',
        label: '叶子命中终止 (Leaf Match)',
        valuesStr: '!cur.left && !cur.right && count == 0 ➔ return true / ans.add(new ArrayList<>(path)) ✅',
      },
      {
        prefix: '└───',
        label: '叶子未达成终止 (Leaf Mismatch)',
        valuesStr: '!cur.left && !cur.right && count != 0 ➔ return false (此路不通，直接回溯)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 辅助函数与显式回溯展开 (Carl\'s Explicit Backtracking)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">traversal(cur, count)</span>',
      detailLines: [
        'count -= cur.left.val ➔ 深入左孩子前，计数器扣减当前分支权重',
        'if (traversal(cur.left, count)) return true ➔ 命中立即向上快速返回截断',
        'count += cur.left.val ➔ 核心回溯：左树失败加回原值恢复现场，避免污染右子树！',
      ],
      fillLine: '显式展示递归深入与回溯撤销的一一对应性，彻底讲透回溯本质',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 参数隐藏回溯与单函数精简 (Concise Single-Function)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">hasPathSum(root, sum)</span>',
      detailLines: [
        'hasPathSum(root.left, targetSum - root.val) ➔ 将差额计算作为实参压栈传递',
        '|| hasPathSum(root.right, targetSum - root.val) ➔ 短路逻辑自动传播有效性',
      ],
      fillLine: '进阶跃迁：利用函数调用栈自动出栈特性，将回溯隐藏在参数传递中',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 3: 路径总和 II 全解收集与现场恢复 (LC 113 / Class 037)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">path.add / path.pop</span>',
      detailLines: [
        'path.add(cur.val) ➔ 共享路径栈入栈当前节点',
        'if (叶子且 remain==0) ans.add(new ArrayList<>(path)) ➔ 深拷贝快照收录全局解集',
        'path.remove(path.size() - 1) ➔ 离开当前节点前弹出栈顶，彻底恢复现场！',
      ],
      fillLine: '无返回值遍历整树，维护共享路径栈，现场恢复是全解收集的不二法门',
    });

    const step4 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 4: 迭代法 BFS 双队列管道层序求和 (Iterative Queues)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">nodeQ & sumQ</span>',
      detailLines: [
        'nodeQueue.offer(root) & sumQueue.offer(root.val) ➔ 根节点与初值入队',
        'cur = nodeQ.poll(); curSum = sumQ.poll() ➔ 双队列同步出队层序推进',
        'if (叶子 && curSum == targetSum) return true ➔ 命中答案立即退出',
      ],
      fillLine: '广度优先层序模拟，彻底规避极端单链树引发的递归系统栈溢出',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '四级演化阶梯状态推演流 (From Basic to Advanced)',
      subtitle: 'Programmer Carl Pedagogical Progression',
      stepLinesHtml: step1 + step2 + step3 + step4,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return hasPathSum(root, targetSum); // 或 return ans;',
      answerDescription: '判定树中是否存在有效路径 (true/false) 或返回全量合法路径列表 ans。时间复杂度 O(N)，空间复杂度 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
