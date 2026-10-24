/**
 * 判断平衡二叉树 · 全景推演树渲染策略 (BalancedBinaryTreeDeductionRenderer)
 * LeetCode 110 / 左程云算法通关课 Class 037 Code01
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BalancedBinaryTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'balanced-binary-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'balanced-binary-tree' ||
      modelId === 'tree-037-balanced-binary-tree' ||
      modelId === 'class037-code01' ||
      modelId === 'leetcode-110' ||
      modelId === '110'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '判断平衡二叉树 (Balanced Binary Tree · LeetCode 110 / Class 037) · 全景推演树',
      badge: 'Tree-DP / 二叉树递归套路黄金模板与 -1 剪枝击穿',
      descriptionHtml: `
        二叉树平衡核心定理：树中每个节点的左右两个子树的高度差绝对值 <span class="font-bold text-slate-800">|left - right| &le; 1</span>，且左右子树必须同时满足平衡条件。<br/>
        体系化演进路径：从经典通用的 <span class="font-bold text-slate-800">Info 二元组套路</span> 到 <span class="font-bold text-slate-800">-1 剪枝穿甲弹优化</span>，再到 <span class="font-bold text-slate-800">显式后序遍历</span>。
      `,
      initialStateText: `初始基准：空节点天然平衡且高度为 0；二叉树递归套路黄金模板统一建模。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点递归基底 (Base Null)',
        valuesStr: 'node == null ➔ return Info(isBalanced=true, height=0)',
      },
      {
        prefix: '└───',
        label: '-1 剪枝击穿基底',
        valuesStr: 'node == null ➔ return 0；一旦失衡直接向上传递 -1 贯穿熔断',
      },
    ]);

    const round1 = DeductionBoardPrimitives.renderOuterRound({
      title: '【阶段一】自底向上递归与 Info 二元组模型 (Zuoshen Class 037 经典套路)',
      subtitle: '二叉树递归套路黄金模板：向左右子树索要全量子结构信息，自底向上归约判定',
      stepLinesHtml: [
        DeductionBoardPrimitives.renderInnerStep({
          connector: '├───',
          label: '子树信息索取 (Ask Subtree Info)',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">递归索取</span>',
          detailLines: [
            'leftInfo = process(node.left) ➔ 索取左子树 Info(isBalanced, height)',
            'rightInfo = process(node.right) ➔ 索取右子树 Info(isBalanced, height)',
          ],
          fillLine: '向下递归探针，向左右子树索要高度与平衡性',
        }),
        DeductionBoardPrimitives.renderInnerStep({
          connector: '├───',
          label: '当前节点三要素决策',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono text-[9px]">三要素判定</span>',
          detailLines: [
            '① 左子树是否平衡: leftInfo.isBalanced',
            '② 右子树是否平衡: rightInfo.isBalanced',
            '③ 高度差绝对值: Math.abs(leftInfo.height - rightInfo.height) <= 1',
          ],
          fillLine: '三者同时满足时，当前子树判定平衡',
        }),
        DeductionBoardPrimitives.renderInnerStep({
          connector: '└───',
          label: '当前节点 Info 封装并向上返回',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">归约返回</span>',
          detailLines: [
            'height = Math.max(leftInfo.height, rightInfo.height) + 1',
            'return new Info(isBalanced, height);',
          ],
          fillLine: '二叉树递归套路黄金模板：结构清晰、通用性极强',
        }),
      ].join(''),
    });

    const round2 = DeductionBoardPrimitives.renderOuterRound({
      title: '【阶段二】返回值复用与 -1 剪枝击穿优化 (LeetCode 110 穿甲弹最优解)',
      subtitle: '返回值单值复用：正数表示合法高度，-1 充当失衡哨兵信号，失衡时直接击穿熔断',
      stepLinesHtml: [
        DeductionBoardPrimitives.renderInnerStep({
          connector: '├───',
          label: '左分支深入与熔断探针',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-[9px]">左枝探针</span>',
          detailLines: [
            'left = check(node.left);',
            'if (left == -1) return -1; ➔ 左子树已失衡，直接穿甲熔断，右子树无需再遍历',
          ],
          fillLine: '剪枝穿甲弹：失衡信号无延迟直接贯穿至顶层',
        }),
        DeductionBoardPrimitives.renderInnerStep({
          connector: '├───',
          label: '右分支深入与高度差校验',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">右枝校验</span>',
          detailLines: [
            'right = check(node.right);',
            'if (right == -1 || Math.abs(left - right) > 1) return -1;',
          ],
          fillLine: '右枝失衡或当前节点高度差超标，均返回 -1',
        }),
        DeductionBoardPrimitives.renderInnerStep({
          connector: '└───',
          label: '局部平衡高度正常汇聚',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-mono text-[9px]">高度汇聚</span>',
          detailLines: [
            'return Math.max(left, right) + 1; ➔ 局部平衡，返回子树实际最大高度',
          ],
          fillLine: '省去对象封装与开销，极速纯数值返回',
        }),
      ].join(''),
    });

    const round3 = DeductionBoardPrimitives.renderOuterRound({
      title: '【阶段三】显式后序遍历与深度表映射 (Explicit Iterative Postorder & Depth Map)',
      subtitle: '零递归调用栈：基于显式栈双栈或单栈逆后序遍历，借助哈希深度表自底向上迭代归约',
      stepLinesHtml: [
        DeductionBoardPrimitives.renderInnerStep({
          connector: '├───',
          label: '显式栈模拟递归后序展开',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[9px]">栈后序遍历</span>',
          detailLines: [
            '利用双栈或 prev 指针标记，确保子节点先于父节点完成深度计算',
            'depthMap.set(node, Math.max(leftDepth, rightDepth) + 1)',
          ],
          fillLine: '自底向上显式拓扑序求高度',
        }),
        DeductionBoardPrimitives.renderInnerStep({
          connector: '└───',
          label: '弹栈时高度差实时检验',
          badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 font-mono text-[9px]">深度差检验</span>',
          detailLines: [
            'if (Math.abs(depthMap.get(node.left) - depthMap.get(node.right)) > 1) return false;',
            '全部节点遍历通过后返回 true',
          ],
          fillLine: '显式单调后序，深度表与栈内存完全受控',
        }),
      ].join(''),
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return check(root) != -1; // 或 return process(root).isBalanced;',
      answerDescription: '当且仅当根节点返回值不是 -1（或 isBalanced 为 true）时整棵二叉树严格平衡。时间复杂度 O(N)，空间复杂度 O(H)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round1 + round2 + round3 + finalReturn);
  }
}
