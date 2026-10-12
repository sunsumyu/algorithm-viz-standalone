import { MORRIS_LINES } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-stage-codes';
import { AdvancedStep, MorrisNode } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';

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
