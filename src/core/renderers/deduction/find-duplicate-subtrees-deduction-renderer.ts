/**
 * 寻找重复的子树 (Find Duplicate Subtrees · LeetCode 652)
 * 全景推演树渲染策略 (FindDuplicateSubtreesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FindDuplicateSubtreesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'find-duplicate-subtrees';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'find-duplicate-subtrees' ||
      modelId === '652' ||
      modelId === 'leetcode-652'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 652. 寻找重复的子树 (Find Duplicate Subtrees) · 全景推演树',
      badge: '代码随想录 · 后序序列化子树指纹 / 三元组 UID 整数哈希压缩 O(N) / 显式栈迭代',
      descriptionHtml: `
        目标：给定一棵二叉树 <code>root</code>，返回所有<strong>重复的子树</strong>的根节点（如果两棵树具有相同的结构和相同的节点值，则它们是重复的）。<br/>
        <strong>《代码随想录》教学破局点——自底向上子树指纹生成与唯一性哈希：</strong><br/>
        1. <strong>我长什么样？（后序序列化）</strong>：要获知以当前节点为根的子树长相，必须先知道左子树与右子树的长相，故<strong>天然采用后序遍历</strong>；<br/>
        2. <strong>字符串序列化（Stage 1）</strong>：<code>sub = root.val + "," + left + "," + right</code>，用空节点标记 <code>#</code> 保障结构唯一。在哈希表中频次首次达到 2 时将根节点加入答案（避免重复收集）；<br/>
        3. <strong>三元组 UID 压缩（Stage 2 · 极致 O(N)）</strong>：字符串拼接在大树下会导致单步 O(N)、总时间退化为 $O(N^2)$。通过对 <code>(val, leftUID, rightUID)</code> 分配唯一全局自增整型 <code>UID</code>，将子树判定压缩为严格 $O(N)$！
      `,
      initialStateText: `计算入口：findDuplicateSubtrees(root) ➔ 维护子树指纹计数表，自底向上展开后序归纳。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点占位符 (Null Token Base)',
        valuesStr: 'node == null ➔ return "#" (或 UID = 0，空树占据唯一定界符，保证拓扑无歧义)',
      },
      {
        prefix: '└───',
        label: '重复触发阈值 (Duplicate Trigger Threshold)',
        valuesStr: 'countMap.get(serial) === 2 ➔ ans.push(node) (频次恰好为 2 时收集，频次 > 2 忽略以防冗余)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 经典后序字符串序列化 (Postorder Subtree Serialization)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Postorder DFS</span>',
      detailLines: [
        'left = serialize(node.left); right = serialize(node.right) ➔ 自底向上收集左右子树序列',
        'serial = node.val + "," + left + "," + right ➔ 组装包含自身值的唯一子树拓扑串',
        'count = countMap.getOrDefault(serial, 0) + 1; if (count === 2) res.add(node) ➔ 恰好第 2 次出现时收录',
      ],
      fillLine: '拓扑指纹化：空间复杂度 O(N)，直观展示子树形状向字符串序列的映射',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 三元组 UID 整数压缩 (Triplet UID Compression · 严格 O(N))',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Triplet UID O(N)</span>',
      detailLines: [
        '空树 UID = 0；每个非空子树由三元组 (node.val, leftUID, rightUID) 唯一确定',
        'Map<String, Integer> seenTriplets ➔ 三元组首次出现时分配全新自增 id；已出现则直接返回既有 id',
        '避免大字符串反复拷贝拼接与长哈希计算，将单次哈希比对优化为 O(1) 整数元组查找，全局时间压至严格 O(N)',
      ],
      fillLine: '图同构与字典树思维：工业级与竞赛最优解，利用整数代号替代大体量字符串',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 显式后序遍历与单调栈迭代 (Explicit Stack Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Explicit Stack</span>',
      detailLines: [
        '模拟系统调用栈：采用双栈（访问栈 + 逆序输出栈）严密实现后序弹栈流',
        '在节点后序离开时刻，其左右子树的序列指纹或 UID 均已在结果表中就绪',
        '安全应对极端深度的单链二叉树，免疫 StackOverflow 崩溃风险',
      ],
      fillLine: '栈控流健壮性：以确定性循环推演代替递归调用栈，内存与步骤流清晰透明',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Postorder Serial ➔ Triplet UID O(N) ➔ Explicit Stack)',
      subtitle: 'Programmer Carl & LeetCode 652 Find Duplicate Subtrees',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return res; // 所有重复子树的代表根节点列表',
      answerDescription: '时间复杂度: 字符串序列化 O(N²) / 三元组 UID 压缩严格 O(N)；空间复杂度 O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
