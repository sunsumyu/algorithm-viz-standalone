/**
 * Class 154: 非旋 Treap / FHQ-Treap
 * 范浩强发明的无旋分裂合并平衡树 / 洛谷 P3369 & P3391
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { FHQ_TREAP_CODES, FHQ_TREAP_LINES } from './advanced-149-154-stage-codes';
import { Advanced149Step, FHQNodeView, renderFHQTreapBoard } from './advanced-149-154-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

interface InternalFHQNode {
  val: number;
  pri: number;
  left: InternalFHQNode | null;
  right: InternalFHQNode | null;
}

function toView(node: InternalFHQNode | null): FHQNodeView | null {
  if (!node) return null;
  return {
    val: node.val,
    pri: node.pri,
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface FHQStep extends Advanced149Step {
  rootL: FHQNodeView | null;
  rootR: FHQNodeView | null;
  mergedRoot?: FHQNodeView | null;
  splitKey?: number;
}

export function buildFHQSteps(items: { val: number; pri: number }[], splitKey: number = 25): FHQStep[] {
  const steps: FHQStep[] = [];
  const lines = FHQ_TREAP_LINES;

  let root: InternalFHQNode | null = null;

  // Step 0: 入口
  steps.push({
    rootL: null,
    rootR: null,
    mergedRoot: null,
    decision: `主函数入口：开始构建非旋 Treap (FHQ-Treap)，并演示 split(按值分裂) 与 merge(堆序合并)`,
    message: `FHQ-Treap 仅靠 split 与 merge 两个原子操作实现所有平衡树功能，完全抛弃传统旋转，极易可持久化`,
    log: `enter FHQ-Treap sequence`,
    codeLine: lines.entry,
    metrics: { '初始节点数': items.length, '分裂基准 Key': splitKey },
  });

  function merge(x: InternalFHQNode | null, y: InternalFHQNode | null): InternalFHQNode | null {
    if (!x || !y) return x || y;
    if (x.pri < y.pri) {
      x.right = merge(x.right, y);
      return x;
    } else {
      y.left = merge(x, y.left);
      return y;
    }
  }

  function split(
    node: InternalFHQNode | null,
    k: number
  ): [InternalFHQNode | null, InternalFHQNode | null] {
    if (!node) return [null, null];
    if (node.val <= k) {
      const [lSub, rSub] = split(node.right, k);
      node.right = lSub;
      return [node, rSub];
    } else {
      const [lSub, rSub] = split(node.left, k);
      node.left = rSub;
      return [lSub, node];
    }
  }

  // 1. 逐步插入建树
  for (const item of items) {
    const newNode: InternalFHQNode = { val: item.val, pri: item.pri, left: null, right: null };
    const [l, r] = split(root, item.val);
    root = merge(merge(l, newNode), r);
  }

  steps.push({
    rootL: null,
    rootR: null,
    mergedRoot: toView(root),
    decision: `完成全部 ${items.length} 个节点的堆序与 BST 初始建树 (键值满足 BST，优先级满足小根堆)`,
    message: `树中任意节点均满足: val(left) < val(cur) < val(right) 且 pri(cur) <= min(pri(left), pri(right))`,
    log: `buildComplete: items=${items.length}`,
    codeLine: lines.entry,
    statusBadge: { text: 'FHQ-Treap 已构建', type: 'info' },
    metrics: { '节点数': items.length, '根节点': root ? `v=${root.val}, p=${root.pri}` : '-' },
  });

  // 2. 演示 split (按值分裂)
  const [treeL, treeR] = split(root, splitKey);

  steps.push({
    rootL: toView(treeL),
    rootR: toView(treeR),
    splitKey,
    decision: `✂️ 执行 split(root, ${splitKey})：将原树裂解为左树 L (值 &le; ${splitKey}) 与右树 R (值 &gt; ${splitKey})`,
    message: `递归切断跨越 splitKey 的单向指针，分裂出的两棵独立子树仍保持严格的 Treap 堆序与搜索二叉性质`,
    log: `splitTree: key=${splitKey}`,
    codeLine: lines.splitVal,
    statusBadge: { text: `按 key=${splitKey} 分裂`, type: 'warning' },
    metrics: { '左树根': treeL ? treeL.val : '空', '右树根': treeR ? treeR.val : '空' },
  });

  // 3. 演示 merge (堆序合并)
  const reMerged = merge(treeL, treeR);

  steps.push({
    rootL: null,
    rootR: null,
    mergedRoot: toView(reMerged),
    decision: `🔗 执行 merge(L, R)：按优先级 priority 小根堆比较，重新无缝拼接为一棵完整 Treap`,
    message: `两树无需任何几何旋转调整，仅依据根节点优先级决定挂载位置，O(log N) 内瞬时完成`,
    log: `mergeTrees: L + R`,
    codeLine: lines.mergeHeap,
    statusBadge: { text: '两树重新合并完毕', type: 'success' },
    metrics: { '合并后新根': reMerged ? reMerged.val : '-', '全树规模': items.length },
  });

  // 终态
  steps.push({
    rootL: null,
    rootR: null,
    mergedRoot: toView(reMerged),
    decision: `🎉 FHQ-Treap 分裂与合并演示完成：两函数奠定现代数据结构高级可持久化基石`,
    message: `可轻松拓展到文艺平衡树区间翻转、区间加减与主席树版本的函数式平衡树中`,
    log: `returnAns: complete`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'FHQ-Treap 完美收官', type: 'success' },
    metrics: { '最终节点数': items.length, '时间复杂度': 'O(log N)' },
  });

  return steps;
}

export const fhqTreapVisualizer = registerDeclarativeAlgorithm<FHQStep>({
  id: 'treap-fhq-154',
  name: '非旋 Treap / FHQ-Treap (Class 154)',
  category: 'tree',
  icon: '🎋',
  difficulty: 3,
  levelOrder: 154,
  description: '左程云算法通关课 Class 154：有序表专题 7 - 非旋 Treap (FHQ-Treap)。范浩强发明，split(按值或排名分裂) 与 merge(堆序合并) 极简无旋平衡树。',
  learningGoal: '深刻理解 FHQ-Treap 的 split 按值分裂与 merge 堆序合并双核心函数，掌握无旋平衡树与区间操作原理',
  problemHtml: ADVANCED_149_154_PROBLEMS.treapFhq.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.treapFhq.html,
  inputs: [
    {
      id: 'splitKey',
      label: '分裂阈值 Split Key',
      type: 'select',
      defaultValue: '25',
      options: [
        { label: '按 Key = 25 分裂 (左: 10,20 / 右: 30,40,50)', value: '25' },
        { label: '按 Key = 35 分裂 (左: 10,20,30 / 右: 40,50)', value: '35' },
      ],
    },
  ],
  codeLanguages: FHQ_TREAP_CODES,
  generateSteps: (input) => {
    const k = Number(input.splitKey ?? 25);
    const defaultItems = [
      { val: 10, pri: 42 },
      { val: 20, pri: 17 },
      { val: 30, pri: 85 },
      { val: 40, pri: 23 },
      { val: 50, pri: 64 },
    ];
    return buildFHQSteps(defaultItems, k);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderFHQTreapBoard(step.rootL, step.rootR, step.mergedRoot, step.splitKey)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作类型</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.splitKey !== undefined ? `按 Key &le; ${step.splitKey} 分裂` : '合并 / 就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">核心操作范式</div>
            <div style="font-size: 16px; font-weight: 700; color: #059669;">无旋 Split / Merge</div>
          </div>
        </div>

        ${renderFormulaCard(
          'FHQ-Treap 极简无旋引擎',
          `二叉搜索律: val(L) &le; key &lt; val(R) | 随机堆序律: pri(root) &le; min(pri(L), pri(R)) | 0 旋转自平衡`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
