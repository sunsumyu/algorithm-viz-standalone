/**
 * Class 124: Morris 遍历 (Morris Traversal)
 * LeetCode 94 / 144 / 145 / 洛谷 B3642
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { MORRIS_CODES, MORRIS_LINES } from './advanced-124-134-stage-codes';
import { AdvancedStep, MorrisNode, renderMorrisTreeVisual } from './advanced-124-134-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MorrisStep extends AdvancedStep {
  nodes: MorrisNode[];
  curId?: number;
  mostRightId?: number;
  traversalList: number[];
}

export function buildMorrisSteps(
  rawTree: { id: number; val: number; left?: number; right?: number }[],
  rootId: number = 1
): MorrisStep[] {
  const steps: MorrisStep[] = [];
  const lines = MORRIS_LINES;

  // 深度复制树节点
  const nodesMap = new Map<number, MorrisNode>();
  rawTree.forEach(n => nodesMap.set(n.id, { ...n }));

  const getSnapshot = (): MorrisNode[] => {
    return Array.from(nodesMap.values()).map(n => ({ ...n }));
  };

  const traversal: number[] = [];
  let cur: number | undefined = rootId;

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot(),
    curId: cur,
    traversalList: [],
    decision: `主函数入口：开始对二叉树执行 Morris 中序遍历（额外空间严格 O(1)）`,
    message: `利用叶子节点空闲的右指针临时搭线建立线索，无需使用递归栈或显式显存`,
    log: `enter morrisInorder(root=${rootId})`,
    codeLine: lines.entry,
    metrics: { '当前游标': `#${cur}`, '已输出元素': 0 },
  });

  while (cur !== undefined && nodesMap.has(cur)) {
    const curNode: MorrisNode = nodesMap.get(cur)!;

    if (curNode.left === undefined) {
      // 无左子树：直接访问当前节点，移至右子树
      traversal.push(curNode.val);

      steps.push({
        nodes: getSnapshot(),
        curId: cur,
        traversalList: [...traversal],
        decision: `节点 #${cur} (值 ${curNode.val}) 无左孩子：直接访问并输出 ${curNode.val}`,
        message: `向右移动：cur = cur.right (${curNode.right ? `#${curNode.right}` : 'null'})`,
        log: `visit #${cur} (${curNode.val}), cur moves to right`,
        codeLine: lines.noLeft,
        metrics: { '当前输出': curNode.val, '总输出数': traversal.length },
        statusBadge: { text: `输出: ${curNode.val}`, type: 'success' },
      });

      cur = curNode.right;
    } else {
      // 有左子树：寻找左子树最右节点 mostRight
      let mostRight = curNode.left;

      steps.push({
        nodes: getSnapshot(),
        curId: cur,
        mostRightId: mostRight,
        traversalList: [...traversal],
        decision: `节点 #${cur} 存在左子树：开始寻找其左子树 #${curNode.left} 的最右节点 mostRight`,
        message: `沿着右分支一直下行，直到右子树为空或右指针已经指向 cur`,
        log: `finding mostRight for cur #${cur}`,
        codeLine: lines.findRight,
        metrics: { '当前节点': `#${cur}`, '左孩子': `#${curNode.left}` },
      });

      while (
        nodesMap.get(mostRight)!.right !== undefined &&
        nodesMap.get(mostRight)!.right !== cur
      ) {
        mostRight = nodesMap.get(mostRight)!.right!;
      }

      const mrNode = nodesMap.get(mostRight)!;

      if (mrNode.right === undefined) {
        // 第一次到达：搭线
        mrNode.right = cur;
        mrNode.threadTo = cur;

        steps.push({
          nodes: getSnapshot(),
          curId: cur,
          mostRightId: mostRight,
          traversalList: [...traversal],
          decision: `🔗 第一次到达节点 #${cur}：最右节点 #${mostRight} 的右指针为空，建立线索指向 #${cur}！`,
          message: `令 mostRight.right = cur，然后深入左子树：cur = cur.left (#${curNode.left})`,
          log: `thread created: #${mostRight} -> #${cur}`,
          codeLine: lines.addThread,
          metrics: { '建立线索': `#${mostRight} -> #${cur}`, '转向': `#${curNode.left}` },
          statusBadge: { text: `搭建线索 #${mostRight} ➔ #${cur}`, type: 'warning' },
        });

        cur = curNode.left;
      } else {
        // 第二次到达：拆线并访问
        mrNode.right = undefined;
        mrNode.threadTo = undefined;
        traversal.push(curNode.val);

        steps.push({
          nodes: getSnapshot(),
          curId: cur,
          mostRightId: mostRight,
          traversalList: [...traversal],
          decision: `✂️ 第二次到达节点 #${cur}：线索已存在，说明左子树已全遍历完！拆除线索并访问 #${cur} (值 ${curNode.val})`,
          message: `恢复原二叉树结构，随后向右子树移动：cur = cur.right (${curNode.right ? `#${curNode.right}` : 'null'})`,
          log: `thread removed from #${mostRight}, visit #${cur} (${curNode.val})`,
          codeLine: lines.delThread,
          metrics: { '拆除线索': `#${mostRight}`, '访问输出': curNode.val },
          statusBadge: { text: `拆除线索并输出 ${curNode.val}`, type: 'info' },
        });

        cur = curNode.right;
      }
    }
  }

  // 终态
  steps.push({
    nodes: getSnapshot(),
    traversalList: [...traversal],
    decision: `✅ Morris 中序遍历完成！最终序列: [${traversal.join(', ')}]`,
    message: `整个过程时间复杂度 O(N)，二叉树的所有边最多被访问两次，且原树拓扑结构已被 100% 完整恢复，额外空间 O(1)！`,
    log: `morris traversal completed, result: [${traversal.join(', ')}]`,
    codeLine: lines.returnAns,
    metrics: { '总遍历元素': traversal.length, '额外空间复杂度': 'O(1)', '时间复杂度': 'O(N)' },
    statusBadge: { text: 'Morris 遍历完毕 (O(1) 空间)', type: 'success' },
  });

  return steps;
}

export const morrisVisualizer = registerDeclarativeAlgorithm<MorrisStep>({
  id: 'morris-traversal-124',
  name: 'Morris 遍历 (Class 124)',
  category: 'tree',
  icon: '🧵',
  difficulty: 3,
  levelOrder: 124,
  learningGoal: '深刻理解 Morris 遍历利用叶子节点空闲右指针建立线索与拆除恢复二叉树结构、实现 O(1) 空间中序遍历的精妙机制',
  problemHtml: ADVANCED_124_134_PROBLEMS.morris.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.morris.html,
  inputs: [
    {
      id: 'treePreset',
      label: '二叉树结构预设',
      type: 'select',
      defaultValue: 'classic_7node',
      options: [
        { label: '经典 7 节点满二叉树 (1,2,3,4,5,6,7)', value: 'classic_7node' },
        { label: '倾斜二叉树 (包含单支与分支)', value: 'skew_tree' },
      ],
    },
  ],
  codeLanguages: MORRIS_CODES,
  generateSteps: (input) => {
    const preset = String(input.treePreset || 'classic_7node');
    if (preset === 'skew_tree') {
      const tree = [
        { id: 1, val: 10, left: 2, right: 3 },
        { id: 2, val: 5, left: 4 },
        { id: 4, val: 2 },
        { id: 3, val: 15, right: 5 },
        { id: 5, val: 20 },
      ];
      return buildMorrisSteps(tree, 1);
    }
    const classicTree = [
      { id: 1, val: 4, left: 2, right: 3 },
      { id: 2, val: 2, left: 4, right: 5 },
      { id: 3, val: 6, left: 6, right: 7 },
      { id: 4, val: 1 },
      { id: 5, val: 3 },
      { id: 6, val: 5 },
      { id: 7, val: 7 },
    ];
    return buildMorrisSteps(classicTree, 1);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMorrisTreeVisual(step.nodes, step.curId, step.mostRightId, step.traversalList)}

        ${renderFormulaCard(
          'Morris 遍历线索化执行引擎',
          `当前节点游标: ${step.curId ? `#${step.curId}` : 'null (遍历结束)'} | 最右前驱 mostRight: ${step.mostRightId ? `#${step.mostRightId}` : '无'}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
