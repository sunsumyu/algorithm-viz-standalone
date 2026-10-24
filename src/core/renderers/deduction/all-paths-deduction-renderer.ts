/**
 * 二叉树的所有路径 (Binary Tree Paths · LeetCode 257)
 * 全景推演树渲染策略 (AllPathsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class AllPathsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'all-paths';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'all-paths' ||
      modelId === '257' ||
      modelId === 'leetcode-257' ||
      modelId === 'binary-tree-paths'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 257. 二叉树的所有路径 (Binary Tree Paths) · 全景推演树',
      badge: '代码随想录 · 回溯黄金启蒙题 / 显式栈回溯对称 / 隐式参数值传递 / BFS 双队列',
      descriptionHtml: `
        目标：按任意顺序，输出所有从<strong>根节点到叶子节点</strong>的路径（格式如 <code>1->2->5</code>）。<br/>
        <strong>《代码随想录》教学破局点——回溯与递归的本源共生关系：</strong><br/>
        “<strong>有递归就有回溯，回溯伴随递归而生</strong>”！<br/>
        1. <strong>显式回溯（Stage 1）</strong>：共享动态路径列表 <code>path</code>，递归下潜时 <code>path.push(val)</code>，递归返回后必须对称执行 <code>path.pop()</code> 恢复现场；<br/>
        2. <strong>隐式回溯（Stage 2）</strong>：以不可变字符串 <code>path + "->" + cur.val</code> 作为形参值传递，函数返回时依靠系统调用栈的销毁天然恢复上一层环境；<br/>
        3. <strong>广度优先遍历（Stage 3）</strong>：采用双队列（节点队列 + 路径队列）同步推进，在层序出队中直观感受多路径并行生长。
      `,
      initialStateText: `计算入口：binaryTreePaths(root) ➔ 初始路径包含 root.val，展开深度探索。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点防御 (Null Defense)',
        valuesStr: 'root == null ➔ return [] (空树无路径)',
      },
      {
        prefix: '└───',
        label: '叶子节点结算条件 (Leaf Hit Base)',
        valuesStr: 'cur.left == null && cur.right == null ➔ 收集当前完整路径 path.join("->") 到 res',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 回溯法 DFS 递归与显式路径栈 (Explicit Path Backtracking)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Explicit Backtrack</span>',
      detailLines: [
        'path.push(cur.val) ➔ 考察节点入栈（进入现场）',
        'if (!cur.left && !cur.right) { res.push(path.join("->")); return; } ➔ 抵达叶子收获路径',
        'if (cur.left) { traversal(cur.left); path.pop(); } ➔ 深入左分支，归来立即 pop 回溯（恢复现场）',
        'if (cur.right) { traversal(cur.right); path.pop(); } ➔ 深入右分支，归来立即 pop 回溯（恢复现场）',
      ],
      fillLine: '成对对称性：入栈与出栈严谨对应，单列表共享复用，空间开销严格受控于树高 O(H)',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纯函数递归与不可变字符串形参传递 (Immutable String / Pass by Value)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pure Function</span>',
      detailLines: [
        'traversal(cur, s): s += cur.val ➔ 局部不可变字符串拼接',
        'if (!cur.left && !cur.right) { res.push(s); return; } ➔ 命中叶子直接存入完整副本',
        'if (cur.left) traversal(cur.left, s + "->"); ➔ 传参产生全新字符串副本，上一层 s 保持不变',
        'if (cur.right) traversal(cur.right, s + "->"); ➔ 借助调用栈帧销毁实现【天然隐式回溯】',
      ],
      fillLine: '不可变数据流：无副作用参数隔离，代码极简，彻底领悟递归栈帧对回溯现场的自动保护',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 广度优先搜索双队列层序遍历 (BFS Dual Queues)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Dual Queue BFS</span>',
      detailLines: [
        'Queue<TreeNode> nodeQueue; Queue<String> pathQueue; 同步将 root 与 root.val 入队',
        'node = nodeQueue.poll(); path = pathQueue.poll(); ➔ 同步出队',
        'if (node 是叶子) { res.push(path); } ➔ 捕获到达叶子的完备路径',
        'if (node.left) { nodeQueue.offer(node.left); pathQueue.offer(path + "->" + node.left.val); }',
      ],
      fillLine: '无回溯状态同步：通过双队列关联节点与动态路径历史，全路径并行推进',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Explicit Backtrack ➔ Pure Functional ➔ Dual Queue BFS)',
      subtitle: 'Programmer Carl Binary Tree Paths Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return res; // 所有从根节点到叶子节点路径字符串数组',
      answerDescription: '时间复杂度: O(N) 遍历节点与复制路径；空间复杂度: DFS O(H) / BFS O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
