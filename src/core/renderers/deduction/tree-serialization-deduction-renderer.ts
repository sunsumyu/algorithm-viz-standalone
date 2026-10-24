/**
 * 二叉树序列化与反序列化 (Serialize and Deserialize Binary Tree · LeetCode 297 / Class 021 / 036 / 037)
 * 全景推演树渲染策略 (TreeSerializationDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeSerializationDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-serialization';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-serialization' ||
      modelId === 'tree-serialization-021' ||
      modelId === 'tree-serialization-037' ||
      modelId === '297' ||
      modelId === 'leetcode-297' ||
      modelId === 'serialize-and-deserialize-binary-tree' ||
      modelId === 'tree-036-preorder-serialize' ||
      modelId === 'tree-036-levelorder-serialize' ||
      modelId === 'postorder-serialize' ||
      modelId === 'class021-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 297. 二叉树的序列化与反序列化 (Serialize & Deserialize) · 全景推演树',
      badge: '左程云 Class 021/036/037 · 先序DFS打桩 / 层序BFS双指针 / 后序逆向建树 / 中序歧义定理',
      descriptionHtml: `
        目标：设计算法将二叉树编码为字符串（序列化），并在另一端将该字符串精确还原为原二叉树（反序列化）。<br/>
        <strong>左程云算法体系教学核心——空节点占位打桩与拓扑还原公理：</strong><br/>
        1. <strong>先序序列化与队列自顶向下递归装配（Preorder DFS · Class 021 / 036）</strong>：<br/>
        普通先序遍历因无法感知叶节点的空指针而无法唯一建树；引入 <code>#</code> 作为 null 标记并以 <code>,</code> 分隔。<br/>
        反序列化时将字符串切分为 FIFO 队列，递归函数头部每次弹出队首 token：若为 <code>#</code> 返回 null；若为数值直接 <code>new TreeNode(val)</code>，接着连贯调用 <code>root.left = build()</code> 与 <code>root.right = build()</code>，自然自顶向下完成拓扑缝合。<br/>
        2. <strong>层序序列化与队列双指针挂载（Levelorder BFS · Class 036）</strong>：<br/>
        利用 FIFO 队列输出层序，null 亦按 <code>#</code> 显式入流；反序列化时主队列控制父节点弹出，流指针每次连续消费 2 个 token 分别作为左孩子和右孩子绑定。<br/>
        3. <strong>后序序列化与逆向自右向左建树（Postorder DFS · Class 037）</strong>：<br/>
        左右根序列流在反向消费时（出栈）呈现 <strong>根 ➔ 右 ➔ 左</strong> 秩序！因此先建根，再建右子树，最后建左子树，同样达成无损恢复。<br/>
        4. <strong>中序序列化歧义崩溃定理（Inorder Ambiguity · Class 037 经典反例）</strong>：<br/>
        即使记录了空节点 <code>#</code>，中序遍历依然无法唯一反序列化！例如两棵形态完全不同的二叉树：<code>1(left: null, right: 1)</code> 与 <code>1(left: 1, right: null)</code>，产生的中序序列流完全一模一样，数学上单射崩溃！
      `,
      initialStateText: `协议规范：空指针使用 '#' 打桩，节点间用 ',' 隔离。序列化实现双向同构映射。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空节点占位协议 (Null Sentinel)',
        valuesStr: 'node == null ➔ 流中追加 "#,"；反序列化时消费 "#" 返回 null',
      },
      {
        prefix: '└───',
        label: '有效数值编码协议 (Value Token)',
        valuesStr: 'node.val ➔ 追加 "val,"；反序列化消费数值实例化 TreeNode(val)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 先序遍历序列化与 FIFO 队列自顶向下复原 (Preorder DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Preorder DFS</span>',
      detailLines: [
        '序列化：sb.append(root.val).append(","); preOrder(root.left); preOrder(root.right);',
        '反序列化：Queue<String> q = split(","); TreeNode build(q) { val = q.poll(); ... }',
        '自顶向下装配：root.left = build(q); root.right = build(q); return root;',
      ],
      fillLine: '单路流式恢复：先序天然先知根节点，队列弹出与递归堆栈展开严格同相',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 广度优先层序序列化与成对子节点挂载 (Levelorder BFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Levelorder BFS</span>',
      detailLines: [
        '序列化：FIFO 队列入队，弹出节点写入流，左右孩子（含 null）无条件推入队列',
        '反序列化：root = new TreeNode(tokens[0]); Queue<TreeNode> q; q.offer(root);',
        '成对消费：while(!q.isEmpty()) { cur = q.poll(); cur.left = parse(tokens[i++]); cur.right = parse(tokens[i++]); }',
      ],
      fillLine: '按层拓扑缝合：父节点出队一次，精准消费 2 个 tokens 完成左右指针接驳',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 3: 后序序列化与自右向左逆向建树 (Postorder Reverse DFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Postorder Reverse</span>',
      detailLines: [
        '左右中输出流，若自右向左扫描（或利用 Stack 压入整流后出栈）：',
        '出栈顺序严格对应【根 ➔ 右 ➔ 左】！',
        '逆向递归建树：root = new TreeNode(pop()); root.right = build(); root.left = build();',
      ],
      fillLine: '逆序建树公理：先建右后建左，与后序遍历天然对偶，同样可无损反序列化',
    });

    const step4 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 4: 中序序列化歧义判定反例 (Inorder Ambiguity Proof)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px]">Ambiguity Proof</span>',
      detailLines: [
        '反例证明：树 A 为 1(left: null, right: 2)；树 B 为 2(left: 1, right: null)',
        '中序遍历序列化流均为：# , 1 , # , 2 , #',
        '数学结论：在中序中，子树根节点与左右边界的归属存在不可判定性，单射破坏！',
      ],
      fillLine: '考点绝杀：即便保留空节点打桩，中序也无法单独反序列化，面试必考反例',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '全景序列化协议与拓扑还原推演流 (Preorder ➔ Levelorder ➔ Postorder ➔ Ambiguity)',
      subtitle: 'LeetCode 297 & Zuoshen Class 021/036/037 Serialization Paradigms',
      stepLinesHtml: step1 + step2 + step3 + step4,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return reconstructedRoot; // 精确 1:1 同构复原的原二叉树根节点',
      answerDescription: '序列化与反序列化时间复杂度均为 O(N)，空间复杂度为 O(N)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
