/**
 * Class 149: Size Balanced Tree (SB 树)
 * 中国学者陈启峰发明 / 洛谷 P3369 【模板】普通平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { SB_TREE_CODES, SB_TREE_LINES } from './advanced-149-154-stage-codes';
import { Advanced149Step, SBNodeView, renderSBTreeBoard } from './advanced-149-154-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

interface InternalSBNode {
  key: number;
  size: number;
  left: InternalSBNode | null;
  right: InternalSBNode | null;
}

function getSize(node: InternalSBNode | null): number {
  return node ? node.size : 0;
}

function toView(node: InternalSBNode | null): SBNodeView | null {
  if (!node) return null;
  return {
    key: node.key,
    size: node.size,
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface SBStep extends Advanced149Step {
  root: SBNodeView | null;
  activeKey: number;
  maintainType: string;
}

export function buildSBSteps(keys: number[]): SBStep[] {
  const steps: SBStep[] = [];
  const lines = SB_TREE_LINES;

  let root: InternalSBNode | null = null;

  // Step 0: 入口
  steps.push({
    root: null,
    activeKey: -1,
    maintainType: 'None',
    decision: `主函数入口：开始将序列 [${keys.join(', ')}] 插入 Size Balanced Tree (SB 树)`,
    message: `SB 树依据子树节点数量 size 维持平衡，仅在插入时 maintain 调整，删除完全不需要旋转，常数极小`,
    log: `enter SBTree insert sequence`,
    codeLine: lines.entry,
    metrics: { '待插入序列': keys.join(', '), '树节点数': 0 },
  });

  function rotateRight(t: InternalSBNode): InternalSBNode {
    const k = t.left!;
    t.left = k.right;
    k.right = t;
    k.size = t.size;
    t.size = getSize(t.left) + getSize(t.right) + 1;
    return k;
  }

  function rotateLeft(t: InternalSBNode): InternalSBNode {
    const k = t.right!;
    t.right = k.left;
    k.left = t;
    k.size = t.size;
    t.size = getSize(t.left) + getSize(t.right) + 1;
    return k;
  }

  function maintain(t: InternalSBNode | null): InternalSBNode | null {
    if (!t) return null;

    // LL 型
    if (getSize(t.left?.left ?? null) > getSize(t.right)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'LL (左左偏重 -> 右旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.left.left)=${getSize(t.left?.left ?? null)} > size(t.right)=${getSize(t.right)} -> 触发 LL 右单旋`,
        message: `执行 rotateRight(t)，随后递归修复右子树与整树`,
        log: `maintainLL: at key=${t.key}`,
        codeLine: lines.repairLL,
        statusBadge: { text: 'LL 右旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'LL' },
      });
      t = rotateRight(t);
      t.right = maintain(t.right);
      t = maintain(t)!;
    }
    // LR 型
    else if (getSize(t.left?.right ?? null) > getSize(t.right)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'LR (左右偏重 -> 双旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.left.right)=${getSize(t.left?.right ?? null)} > size(t.right)=${getSize(t.right)} -> 触发 LR 双旋`,
        message: `左子树先左旋，根节点再右旋`,
        log: `maintainLR: at key=${t.key}`,
        codeLine: lines.repairLL,
        statusBadge: { text: 'LR 双旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'LR' },
      });
      t.left = rotateLeft(t.left!);
      t = rotateRight(t);
      t.left = maintain(t.left);
      t.right = maintain(t.right);
      t = maintain(t)!;
    }
    // RR 型
    else if (getSize(t.right?.right ?? null) > getSize(t.left)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'RR (右右偏重 -> 左旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.right.right)=${getSize(t.right?.right ?? null)} > size(t.left)=${getSize(t.left)} -> 触发 RR 左单旋`,
        message: `执行 rotateLeft(t)，随后递归修复左子树与整树`,
        log: `maintainRR: at key=${t.key}`,
        codeLine: lines.repairRR,
        statusBadge: { text: 'RR 左旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'RR' },
      });
      t = rotateLeft(t);
      t.left = maintain(t.left);
      t = maintain(t)!;
    }
    // RL 型
    else if (getSize(t.right?.left ?? null) > getSize(t.left)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'RL (右左偏重 -> 双旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.right.left)=${getSize(t.right?.left ?? null)} > size(t.left)=${getSize(t.left)} -> 触发 RL 双旋`,
        message: `右子树先右旋，根节点再左旋`,
        log: `maintainRL: at key=${t.key}`,
        codeLine: lines.repairRR,
        statusBadge: { text: 'RL 双旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'RL' },
      });
      t.right = rotateRight(t.right!);
      t = rotateLeft(t);
      t.left = maintain(t.left);
      t.right = maintain(t.right);
      t = maintain(t)!;
    }

    return t;
  }

  function insert(t: InternalSBNode | null, key: number): InternalSBNode {
    if (!t) {
      return { key, size: 1, left: null, right: null };
    }
    t.size++;
    if (key < t.key) {
      t.left = insert(t.left, key);
    } else {
      t.right = insert(t.right, key);
    }
    return maintain(t)!;
  }

  for (let idx = 0; idx < keys.length; idx++) {
    const k = keys[idx];
    steps.push({
      root: toView(root),
      activeKey: k,
      maintainType: 'None',
      decision: `开始将键值 ${k} 插入 SB 树 (当前为第 ${idx + 1}/${keys.length} 个元素)`,
      message: `沿路径向下插入，沿途子树 size 递增 1`,
      log: `bstInsert: key=${k}`,
      codeLine: lines.bstInsert,
      metrics: { '插入键值': k, '当前全树节点数': idx },
    });

    root = insert(root, k);

    steps.push({
      root: toView(root),
      activeKey: k,
      maintainType: 'None',
      decision: `键值 ${k} 插入完成，子树 Size Balanced 维持完毕`,
      message: `所有子树满足 size(t.left) >= max(size(t.right.left), size(t.right.right))`,
      log: `maintainDone: key=${k}, root=${root ? root.key : 'null'}, size=${getSize(root)}`,
      codeLine: lines.maintain,
      metrics: { '当前根': root ? root.key : '-', '全树大小 size': getSize(root) },
    });
  }

  // 终态
  steps.push({
    root: toView(root),
    activeKey: -1,
    maintainType: 'None',
    decision: `🎉 序列插入全部完成：SB 树维持极佳平衡，均摊时间复杂度为稳定的 O(log N)`,
    message: `删除操作无需任何旋转调整（仅减小沿途 size 即可），为高级名次树实现首选`,
    log: `returnAns: complete, finalSize=${getSize(root)}`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'SB 树平衡完毕', type: 'success' },
    metrics: { '最终节点数': keys.length, '总大小 size': getSize(root) },
  });

  return steps;
}

export const sbTreeVisualizer = registerDeclarativeAlgorithm<SBStep>({
  id: 'sb-tree-149',
  name: 'Size Balanced Tree (Class 149)',
  category: 'tree',
  icon: '🌳',
  difficulty: 3,
  levelOrder: 149,
  description: '左程云算法通关课 Class 149：有序表专题 2 - SB 树 (Size Balanced Tree)。中国学者陈启峰发明，用子树大小 size 维持平衡，删除无需旋转，极速高效。',
  learningGoal: '深刻理解 Size Balanced 平衡准则与 Maintain 修复机制，掌握其删除不旋转的工程优势',
  problemHtml: ADVANCED_149_154_PROBLEMS.sbTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.sbTree.html,
  inputs: [
    {
      id: 'preset',
      label: '键值插入序列预设',
      type: 'select',
      defaultValue: 'keys_10_20_30_40_50_25',
      options: [
        { label: '[10, 20, 30, 40, 50, 25] (典型平衡测试)', value: 'keys_10_20_30_40_50_25' },
        { label: '[5, 4, 3, 2, 1] (单调降序触发 LL 维护)', value: 'keys_54321' },
      ],
    },
  ],
  codeLanguages: SB_TREE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_10_20_30_40_50_25');
    if (preset === 'keys_54321') {
      return buildSBSteps([5, 4, 3, 2, 1]);
    }
    return buildSBSteps([10, 20, 30, 40, 50, 25]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderSBTreeBoard(step.root, step.activeKey, step.maintainType)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作键值</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.activeKey >= 0 ? `Key = ${step.activeKey}` : '操作就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">Maintain 状态</div>
            <div style="font-size: 16px; font-weight: 700; color: ${step.maintainType !== 'None' ? '#b45309' : '#059669'};">
              ${step.maintainType !== 'None' ? step.maintainType : '子树平衡良好'}
            </div>
          </div>
        </div>

        ${renderFormulaCard(
          'SB 树 Maintain 平衡引擎',
          `平衡公理: size(t.left) &ge; max(size(t.right.left), size(t.right.right)) | 仅插入调整，删除 0 旋转`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
