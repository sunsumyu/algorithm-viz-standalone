/**
 * 完全二叉树检验 (Completeness of Binary Tree · LeetCode 958 / Class 036 Code05)
 * 全景推演树渲染策略 (CompletenessBinaryTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CompletenessBinaryTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'completeness-binary-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'completeness-binary-tree' ||
      modelId === '958' ||
      modelId === 'leetcode-958' ||
      modelId === 'tree-036-completeness-binary-tree' ||
      modelId === 'completeness-of-binary-tree' ||
      modelId === 'tree-036-code05'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 958. 二叉树的完全性检验 (Check Completeness) · 全景推演树',
      badge: '左程云 Class 036 经典两大铁律 / 哨兵空指针拦截 / 静态数组极致零 GC',
      descriptionHtml: `
        目标：给定一棵二叉树的根节点 <code>root</code>，确定它是否是一个<strong>完全二叉树</strong>。<br/>
        <strong>左程云算法体系教学破局点——左神完全二叉树两大铁律：</strong><br/>
        在任意层序遍历过程中，对每一个弹出的节点 <code>cur</code> 执行状态机判定：<br/>
        1. <strong>铁律 1（有右无左必非完全）</strong>：若 <code>cur.right != null && cur.left == null</code> ➔ 出现右孩子却无左孩子，破坏左对齐拓扑，<strong>立即返回 false</strong>！<br/>
        2. <strong>铁律 2（首次缺孩后续必叶）</strong>：一旦遇到某个节点不是双全节点（即 <code>cur.left == null || cur.right == null</code>），立即激活 <code>leaf = true</code> 警戒开关！<br/>
        <strong>此后遍历到的所有后续节点，必须严格全是无子叶子节点</strong>；一旦发现任何一个后续节点带有孩子（<code>cur.left != null || cur.right != null</code>），<strong>立即返回 false</strong>！<br/>
        若平稳出队消费完毕未触碰任何违规，判定为标准完全二叉树，返回 true。
      `,
      initialStateText: `检验入口：isCompleteTree(root) ➔ 根节点入队，leaf = false 警戒初始关闭，启动状态机校验。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空树基准 (Base Null)',
        valuesStr: 'root == null ➔ return true (空树默认为完全二叉树)',
      },
      {
        prefix: '└───',
        label: '状态机变量初始化',
        valuesStr: 'queue.push(root); leaf = false (叶子警戒初始未触发)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 标准 Queue + 左神两大铁律与 leaf 警戒标志 (Classic State Machine)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Two Iron Rules</span>',
      detailLines: [
        'cur = queue.poll(); l = cur.left; r = cur.right;',
        '【铁律 1 违规核验】if (r != null && l == null) return false ➔ 有右无左直接红牌出局！',
        '【铁律 2 警戒触发】if (leaf && (l != null || r != null)) return false ➔ 开启警戒后仍有孩子，直接判伪！',
        'if (l != null) queue.offer(l); if (r != null) queue.offer(r); if (l == null || r == null) leaf = true; ➔ 发现缺肢立即拉响警报',
      ],
      fillLine: '状态机极简优雅：双重铁律将复杂的层级对齐约束收敛为两个局部条件',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 左程云 Class 036 静态数组模拟队列 (Static Array Zero-GC)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Zero-GC Array</span>',
      detailLines: [
        'TreeNode[] queue = new TreeNode[MAXN]; int l = 0, r = 0; queue[r++] = root;',
        'while (l < r) { cur = queue[l++]; 校验铁律1与铁律2; 压入子节点 queue[r++] }',
        '以平坦数组完全消灭对象分配，在极端大规模二叉树压测下保持 100% 毫秒级稳定通过',
      ],
      fillLine: '工业级高性能实践：平坦内存连续布局，零 GC 抖动，竞赛与服务端核心范式',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 空指针哨兵标记遍历法 (Null Sentinel BFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Sentinel BFS</span>',
      detailLines: [
        '即使子节点为 null 也照常压入队列：queue.offer(cur.left); queue.offer(cur.right);',
        'while ((cur = queue.poll()) != null) ➔ 直到弹出第一个 null 节点跳出循环',
        'while (!queue.isEmpty()) if (queue.poll() != null) return false ➔ 此时队列中若还有任何非空节点，则必非完全！',
      ],
      fillLine: '反向极简视角：完全二叉树层序遍历展开中，所有空节点必须全部紧随在末尾',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Two Iron Rules ➔ Zero-GC Fast Queue ➔ Null Sentinel)',
      subtitle: 'Zuoshen Class 036 Completeness Verification Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return true; // 树满足完全二叉树约束',
      answerDescription: '时间复杂度严格 O(N)，全树各节点恰好进出队一次；空间复杂度 O(W)（最大层宽）。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
