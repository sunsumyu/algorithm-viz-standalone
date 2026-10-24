/**
 * 二叉树的最近公共祖先 (Lowest Common Ancestor · LeetCode 236 / Class 037 Code04)
 * 全景推演树渲染策略 (LcaDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LcaDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'lca';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'lca' ||
      modelId === '236' ||
      modelId === 'leetcode-236' ||
      modelId === 'tree-037-lowest-common-ancestor' ||
      modelId === 'class037-code04' ||
      modelId === 'lowest-common-ancestor-of-a-binary-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 236. 二叉树最近公共祖先 (Lowest Common Ancestor) · 全景推演树',
      badge: '代码随想录 · 自底向上后序汇聚 / 父指针祖先哈希 / 根路径分叉相交',
      descriptionHtml: `
        最近公共祖先（LCA）定义：节点 $p$ 和 $q$ 的 LCA 为二叉树中同时以 $p$ 和 $q$ 为后代的最低节点（节点本身也视为自己的后代）。<br/>
        <strong>《代码随想录》教学破局点——后序遍历自底向上天然汇聚：</strong><br/>
        二叉树如何实现自底向上的信息传递？唯有<strong>后序遍历（左-右-中）</strong>！<br/>
        1. <strong>基底快速透传</strong>：遇到 <code class="font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold">root == null || root == p || root == q</code> 立即返回自身向上传递；<br/>
        2. <strong>分水岭双边命中</strong>：若 <code class="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">left != null && right != null</code>，说明 $p$ 和 $q$ 分列当前节点两侧，<strong>当前节点就是 LCA</strong>！<br/>
        3. <strong>单侧向上归并</strong>：若仅有一侧非空，说明目标在同一侧子树中，继续返回该非空引用向上透传。
      `,
      initialStateText: `检索入口：lowestCommonAncestor(root, p, q) ➔ 后序自底向上回溯，归并左右子树探测结果。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点基准 (Base Null)',
        valuesStr: 'root == null ➔ 遇到叶底空节点，返回 null',
      },
      {
        prefix: '└───',
        label: '目标命中基准 (Match Target p/q)',
        valuesStr: 'root == p || root == q ➔ 命中待检索节点，立即返回自身 root 向上透传',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归后序双向汇聚 (Postorder DFS · 回溯归并)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Postorder Left/Right</span>',
      detailLines: [
        'left = lowestCommonAncestor(root.left, p, q) ➔ 递归探测左子树',
        'right = lowestCommonAncestor(root.right, p, q) ➔ 递归探测右子树',
        'if (left != null && right != null) return root ➔ 左右开花：p、q 分列两侧，当前节点即为 LCA！',
        'return left != null ? left : right ➔ 单侧透传：返回非空一侧，向上层父节点汇聚',
      ],
      fillLine: '后序回溯逻辑流：无需提前知晓深度，自底向上将节点引用顺承回传，在首次交汇处锁定 LCA',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 父指针哈希表遍历 (Parent Pointer Hash Map)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">Parent Map + Set</span>',
      detailLines: [
        '遍历整树建立 parentMap: Map<TreeNode, TreeNode> 存储每个节点的父节点引用',
        '从 p 出发沿 parentMap 向上爬至根，将途径所有祖先加入 ancestorsSet',
        '从 q 出发沿 parentMap 向上爬，首个出现在 ancestorsSet 中的节点即为最近公共祖先！',
      ],
      fillLine: '空间换时间解法：将树形祖先查询转化为双链表首次相交点查找模型',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 根到节点路径追踪 (Root-to-Node Path Trace)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Path Intersection</span>',
      detailLines: [
        'getPath(root, p, pathP) ➔ 回溯寻找从根到 p 的完整节点路径',
        'getPath(root, q, pathQ) ➔ 回溯寻找从根到 q 的完整节点路径',
        '同步扫描两条路径 pathP[i] == pathQ[i]，最后一个相同节点即为分叉前的公共祖先',
      ],
      fillLine: '路径比对法：将抽象祖先问题规约为最长公共前缀路径终点',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Postorder to Parent Map & Path Trace)',
      subtitle: 'Programmer Carl Lowest Common Ancestor Three Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return LCA; // 返回成功锁定的最近公共祖先节点',
      answerDescription: '时间复杂度 O(N)，每个节点仅遍历一次；递归调用栈与辅助表空间复杂度为 O(H) ~ O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
