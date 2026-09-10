/**
 * Class 148: 有序表专题 (一) - AVL 平衡二叉搜索树 (AVL Tree Self-Balancing BST)
 * 洛谷 P3369 【模板】普通平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { AVL_TREE_CODES, AVL_TREE_LINES } from './advanced-142-148-stage-codes';
import { Advanced142Step, AVLNodeView, renderAVLTreeBoard } from './advanced-142-148-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

interface InternalAVLNode {
  key: number;
  height: number;
  left: InternalAVLNode | null;
  right: InternalAVLNode | null;
}

function getHeight(node: InternalAVLNode | null): number {
  return node ? node.height : 0;
}

function getBalance(node: InternalAVLNode | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateHeight(node: InternalAVLNode): void {
  node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
}

function toView(node: InternalAVLNode | null): AVLNodeView | null {
  if (!node) return null;
  return {
    key: node.key,
    height: node.height,
    balance: getBalance(node),
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface AVLStep extends Advanced142Step {
  root: AVLNodeView | null;
  activeKey: number;
  rotationType: string;
}

export function buildAVLSteps(keys: number[]): AVLStep[] {
  const steps: AVLStep[] = [];
  const lines = AVL_TREE_LINES;

  let root: InternalAVLNode | null = null;

  // Step 0: 入口
  steps.push({
    root: null,
    activeKey: -1,
    rotationType: 'None',
    decision: `主函数入口：开始将键值序列 [${keys.join(', ')}] 依次插入 AVL 自平衡二叉搜索树`,
    message: `AVL 树严格保证任一节点的左右子树高度差绝对值 <= 1，每次插入若失衡通过四种旋转 (LL/RR/LR/RL) 在 O(1) 内恢复`,
    log: `enter AVL insert sequence`,
    codeLine: lines.entry,
    metrics: { '待插入序列': keys.join(', '), '树节点数': 0, '树高': 0 },
  });

  function rotateRight(y: InternalAVLNode): InternalAVLNode {
    const x = y.left!;
    const t2 = x.right;
    x.right = y;
    y.left = t2;
    updateHeight(y);
    updateHeight(x);
    return x;
  }

  function rotateLeft(x: InternalAVLNode): InternalAVLNode {
    const y = x.right!;
    const t2 = y.left;
    y.left = x;
    x.right = t2;
    updateHeight(x);
    updateHeight(y);
    return y;
  }

  function insert(node: InternalAVLNode | null, key: number): InternalAVLNode {
    if (!node) {
      return { key, height: 1, left: null, right: null };
    }

    if (key < node.key) {
      node.left = insert(node.left, key);
    } else if (key > node.key) {
      node.right = insert(node.right, key);
    } else {
      return node;
    }

    updateHeight(node);
    const balance = getBalance(node);

    // LL
    if (balance > 1 && key < node.left!.key) {
      steps.push({
        root: toView(root),
        activeKey: node.key,
        rotationType: 'LL (右单旋)',
        decision: `⚠️ 节点 ${node.key} 平衡因子失衡 (b=${balance} > 1)，新插入点落于左子树之左 -> 触发 LL 右单旋`,
        message: `以节点 ${node.key} 为旋转轴执行 rotateRight，使左孩子成为新子树根`,
        log: `rotateLL: at node=${node.key}`,
        codeLine: lines.rotateLL,
        statusBadge: { text: 'LL 右单旋', type: 'warning' },
        metrics: { '失衡节点': node.key, '失衡平衡因子': balance, '旋转类型': 'LL' },
      });
      return rotateRight(node);
    }

    // RR
    if (balance < -1 && key > node.right!.key) {
      steps.push({
        root: toView(root),
        activeKey: node.key,
        rotationType: 'RR (左单旋)',
        decision: `⚠️ 节点 ${node.key} 平衡因子失衡 (b=${balance} < -1)，新插入点落于右子树之右 -> 触发 RR 左单旋`,
        message: `以节点 ${node.key} 为旋转轴执行 rotateLeft，使右孩子成为新子树根`,
        log: `rotateRR: at node=${node.key}`,
        codeLine: lines.rotateRR,
        statusBadge: { text: 'RR 左单旋', type: 'warning' },
        metrics: { '失衡节点': node.key, '失衡平衡因子': balance, '旋转类型': 'RR' },
      });
      return rotateLeft(node);
    }

    // LR
    if (balance > 1 && key > node.left!.key) {
      steps.push({
        root: toView(root),
        activeKey: node.key,
        rotationType: 'LR (先左旋后右旋)',
        decision: `⚠️ 节点 ${node.key} 平衡因子失衡 (b=${balance} > 1)，新插入点落于左子树之右 -> 触发 LR 双旋`,
        message: `先对左孩子 ${node.left!.key} 左旋，再对根节点 ${node.key} 右旋恢复平衡`,
        log: `rotateLR: at node=${node.key}`,
        codeLine: lines.rotateLL,
        statusBadge: { text: 'LR 先左后右', type: 'warning' },
        metrics: { '失衡节点': node.key, '失衡平衡因子': balance, '旋转类型': 'LR' },
      });
      node.left = rotateLeft(node.left!);
      return rotateRight(node);
    }

    // RL
    if (balance < -1 && key < node.right!.key) {
      steps.push({
        root: toView(root),
        activeKey: node.key,
        rotationType: 'RL (先右旋后左旋)',
        decision: `⚠️ 节点 ${node.key} 平衡因子失衡 (b=${balance} < -1)，新插入点落于右子树之左 -> 触发 RL 双旋`,
        message: `先对右孩子 ${node.right!.key} 右旋，再对根节点 ${node.key} 左旋恢复平衡`,
        log: `rotateRL: at node=${node.key}`,
        codeLine: lines.rotateRR,
        statusBadge: { text: 'RL 先右后左', type: 'warning' },
        metrics: { '失衡节点': node.key, '失衡平衡因子': balance, '旋转类型': 'RL' },
      });
      node.right = rotateRight(node.right!);
      return rotateLeft(node);
    }

    return node;
  }

  for (let idx = 0; idx < keys.length; idx++) {
    const k = keys[idx];
    steps.push({
      root: toView(root),
      activeKey: k,
      rotationType: 'None',
      decision: `开始将键值 ${k} 插入 AVL 树 (当前为第 ${idx + 1}/${keys.length} 个元素)`,
      message: `按 BST 性质沿根节点向下查找插入位置`,
      log: `bstInsert: key=${k}`,
      codeLine: lines.bstInsert,
      metrics: { '插入键值': k, '已插入节点数': idx },
    });

    root = insert(root, k);

    steps.push({
      root: toView(root),
      activeKey: k,
      rotationType: 'None',
      decision: `完成键值 ${k} 的插入并更新沿途平衡因子与高度`,
      message: `整棵子树在回溯路径上已全部恢复平衡，当前根节点为 ${root ? root.key : 'null'}`,
      log: `checkBal: key=${k}, root=${root ? root.key : 'null'}, height=${getHeight(root)}`,
      codeLine: lines.checkBal,
      metrics: { '当前根': root ? root.key : '-', '当前树高': getHeight(root), '全树平衡': '已维持' },
    });
  }

  // 终态
  steps.push({
    root: toView(root),
    activeKey: -1,
    rotationType: 'None',
    decision: `🎉 序列插入全部完成：AVL 树成功自平衡，严格维持 O(log N) 树高`,
    message: `全部节点平衡因子绝对值 <= 1，保证查找、插入、删除均摊时间复杂度为稳定 O(log N)`,
    log: `returnAns: complete, finalHeight=${getHeight(root)}`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'AVL 完美自平衡', type: 'success' },
    metrics: { '最终节点总数': keys.length, '最终树高': getHeight(root), '理论最大树高': Math.ceil(1.44 * Math.log2(keys.length + 2)) },
  });

  return steps;
}

export const avlTreeVisualizer = registerDeclarativeAlgorithm<AVLStep>({
  id: 'avl-tree-148',
  name: 'AVL 平衡二叉搜索树 (Class 148)',
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 148,
  description: '左程云算法通关课 Class 148：有序表专题 1 - AVL 树。演示二叉搜索树在节点失衡时的四种旋转调整 (LL, RR, LR, RL)，动态保持严格平衡。',
  learningGoal: '深刻掌握 AVL 树平衡因子动态维护与 LL, RR, LR, RL 四种自平衡旋转操作',
  problemHtml: ADVANCED_142_148_PROBLEMS.avlTree.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.avlTree.html,
  inputs: [
    {
      id: 'preset',
      label: '键值插入序列预设',
      type: 'select',
      defaultValue: 'keys_10_20_30_40_50_25',
      options: [
        { label: '[10, 20, 30, 40, 50, 25] (触发 RR 与 RL 旋转)', value: 'keys_10_20_30_40_50_25' },
        { label: '[30, 20, 10, 5, 25] (触发 LL 旋转)', value: 'keys_30_20_10_5_25' },
      ],
    },
  ],
  codeLanguages: AVL_TREE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_10_20_30_40_50_25');
    if (preset === 'keys_30_20_10_5_25') {
      return buildAVLSteps([30, 20, 10, 5, 25]);
    }
    return buildAVLSteps([10, 20, 30, 40, 50, 25]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderAVLTreeBoard(step.root, step.activeKey, step.rotationType)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作键值</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.activeKey >= 0 ? `Key = ${step.activeKey}` : '调整就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">平衡旋转状态</div>
            <div style="font-size: 16px; font-weight: 700; color: ${step.rotationType !== 'None' ? '#b45309' : '#059669'};">
              ${step.rotationType !== 'None' ? step.rotationType : '平衡维持良好'}
            </div>
          </div>
        </div>

        ${renderFormulaCard(
          'AVL 严格平衡因子维护',
          `平衡准则: |b| = |h(left) - h(right)| &le; 1 | 四种失衡修正: LL(右单旋), RR(左单旋), LR(双旋), RL(双旋)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
