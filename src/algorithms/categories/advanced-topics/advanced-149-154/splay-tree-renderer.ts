/**
 * Class 152: 伸展树与区间翻转 (Splay Tree)
 * Tarjan 发明 / 洛谷 P3391 【模板】文艺平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { SPLAY_TREE_CODES, SPLAY_TREE_LINES } from './advanced-149-154-stage-codes';
import { Advanced149Step, SplayNodeView, renderSplayBoard } from './advanced-149-154-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

interface InternalSplayNode {
  val: number;
  parent: InternalSplayNode | null;
  left: InternalSplayNode | null;
  right: InternalSplayNode | null;
}

function toView(node: InternalSplayNode | null): SplayNodeView | null {
  if (!node) return null;
  return {
    val: node.val,
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface SplayStep extends Advanced149Step {
  root: SplayNodeView | null;
  splayedVal: number;
  rotationName: string;
}

export function buildSplaySteps(keys: number[], targetSplayKey?: number): SplayStep[] {
  const steps: SplayStep[] = [];
  const lines = SPLAY_TREE_LINES;

  let root: any = null;

  // Step 0: 入口
  steps.push({
    root: null,
    splayedVal: -1,
    rotationName: '初始入口',
    decision: `主函数入口：开始构建 Splay 伸展树，并演示 Zig-Zig 与 Zig-Zag 双旋至根`,
    message: `Splay 树每次访问节点后均通过双旋将其旋转至根节点，不仅维持均摊 O(log N) 访问效率，还能天然支持区间操作`,
    log: `enter Splay sequence`,
    codeLine: lines.entry,
    metrics: { '待插入键值': keys.join(', '), '树节点数': 0 },
  });

  function rotate(x: InternalSplayNode) {
    const y = x.parent!;
    const z = y.parent;
    const isLeft = (x === y.left);

    if (isLeft) {
      y.left = x.right;
      if (x.right) x.right.parent = y;
      x.right = y;
    } else {
      y.right = x.left;
      if (x.left) x.left.parent = y;
      x.left = y;
    }

    y.parent = x;
    x.parent = z;

    if (z) {
      if (y === z.left) z.left = x;
      else z.right = x;
    } else {
      root = x;
    }
  }

  function splay(x: InternalSplayNode) {
    while (x.parent) {
      const p = x.parent;
      const g = p.parent;

      if (!g) {
        // 单旋 Zig
        steps.push({
          root: toView(root),
          splayedVal: x.val,
          rotationName: '单旋 (Zig)',
          decision: `单旋 Zig：父节点 ${p.val} 为根节点，直接旋转节点 ${x.val} 至树根`,
          message: `完成向根节点的最后一步单次提升`,
          log: `zig: node=${x.val}`,
          codeLine: lines.rotateSelf,
          statusBadge: { text: '单旋 (Zig)', type: 'info' },
          metrics: { '当前旋转节点': x.val, '目标': '成为新根' },
        });
        rotate(x);
      } else {
        const isXLeft = (x === p.left);
        const isPLeft = (p === g.left);

        if (isXLeft === isPLeft) {
          // Zig-Zig 一字形双旋：先旋父节点，再旋自身
          steps.push({
            root: toView(root),
            splayedVal: x.val,
            rotationName: '一字形同向双旋 (Zig-Zig)',
            decision: `一字形 Zig-Zig：节点 ${x.val} 与父节点 ${p.val} 同侧，必须【先旋父节点 ${p.val}】折半链长！`,
            message: `若先旋自身会导致长单链无法有效压缩，先旋父节点是均摊势能分析 O(log N) 成立的核心`,
            log: `zigZig: rotate parent ${p.val} first`,
            codeLine: lines.zigZig,
            statusBadge: { text: 'Zig-Zig (先旋父)', type: 'warning' },
            metrics: { '一字形中心': p.val, '关键准则': '先父后己' },
          });
          rotate(p);
          rotate(x);
        } else {
          // Zig-Zag 之字形异向双旋：先旋自身，再旋自身
          steps.push({
            root: toView(root),
            splayedVal: x.val,
            rotationName: '之字形异向双旋 (Zig-Zag)',
            decision: `之字形 Zig-Zag：节点 ${x.val} 与父节点 ${p.val} 异侧，连续旋转节点 ${x.val} 两次`,
            message: `依次跨越父节点与祖父节点上升两层`,
            log: `zigZag: rotate self ${x.val} twice`,
            codeLine: lines.zigZag,
            statusBadge: { text: 'Zig-Zag (异向双旋)', type: 'info' },
            metrics: { '之字形拐角': x.val },
          });
          rotate(x);
          rotate(x);
        }
      }
    }
  }

  function bstInsert(val: number): InternalSplayNode {
    const node: InternalSplayNode = { val, parent: null, left: null, right: null };
    if (!root) {
      root = node;
      return node;
    }
    let cur = root;
    let p: InternalSplayNode | null = null;
    while (cur) {
      p = cur;
      if (val < cur.val) cur = cur.left!;
      else cur = cur.right!;
    }
    node.parent = p;
    if (val < p!.val) p!.left = node;
    else p!.right = node;
    return node;
  }

  const nodeMap = new Map<number, InternalSplayNode>();
  for (const k of keys) {
    const node = bstInsert(k);
    nodeMap.set(k, node);
  }

  steps.push({
    root: toView(root),
    splayedVal: -1,
    rotationName: 'BST 初始建树完成',
    decision: `完成键值序列 [${keys.join(', ')}] 的二叉搜索树初始构建`,
    message: `准备对指定节点触发 Splay 伸展操作，演示双旋调整全过程`,
    log: `bstReady`,
    codeLine: lines.entry,
    metrics: { '全树节点': keys.length, '初始树高': 4 },
  });

  const splayTarget = targetSplayKey ?? keys[0];
  const targetNode = nodeMap.get(splayTarget);
  if (targetNode) {
    steps.push({
      root: toView(root),
      splayedVal: splayTarget,
      rotationName: '准备 Splay 伸展',
      decision: `选中目标节点 Key=${splayTarget}，开始执行 splay(node) 将其旋转至树根`,
      message: `沿父节点与祖父节点不断进行 Zig-Zig / Zig-Zag 双旋提升`,
      log: `startSplay: target=${splayTarget}`,
      codeLine: lines.entry,
      metrics: { '目标节点': splayTarget },
    });

    splay(targetNode);
  }

  // 终态
  steps.push({
    root: toView(root),
    splayedVal: root ? root.val : -1,
    rotationName: 'Splay 伸展至根完毕',
    decision: `🎉 Splay 伸展完成：目标节点 ${root ? root.val : '-'} 成功到达树根，全树结构重新平衡`,
    message: `被频繁访问的节点自然汇聚在树根附近，支持文艺平衡树的区间翻转打懒标记（pushDown）`,
    log: `returnAns: complete, root=${root ? root.val : 'null'}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `目标已达树根: ${root ? root.val : '-'}`, type: 'success' },
    metrics: { '当前树根': root ? root.val : '-', '均摊复杂度': 'O(log N)' },
  });

  return steps;
}

export const splayTreeVisualizer = registerDeclarativeAlgorithm<SplayStep>({
  id: 'splay-tree-152',
  name: '伸展树与区间翻转 (Class 152)',
  category: 'tree',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 152,
  description: '左程云算法通关课 Class 152：有序表专题 5 - 伸展树 (Splay Tree)。Tarjan 发明，Zig-Zig 先父后己双旋将访问节点提升至根，支持区间翻转。',
  learningGoal: '深刻理解 Splay 树的 Zig-Zig 与 Zig-Zag 双旋势能平衡证明，掌握将区间 [L, R] 夹在子树下的提取机制',
  problemHtml: ADVANCED_149_154_PROBLEMS.splayTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.splayTree.html,
  inputs: [
    {
      id: 'preset',
      label: 'Splay 演示场景预设',
      type: 'select',
      defaultValue: 'zig_zig_demo',
      options: [
        { label: '一字形同向双旋 (链式 [5, 4, 3, 2, 1], Splay 1)', value: 'zig_zig_demo' },
        { label: '之字形异向双旋 ([10, 5, 20, 7], Splay 7)', value: 'zig_zag_demo' },
      ],
    },
  ],
  codeLanguages: SPLAY_TREE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'zig_zig_demo');
    if (preset === 'zig_zag_demo') {
      return buildSplaySteps([10, 5, 20, 7], 7);
    }
    return buildSplaySteps([5, 4, 3, 2, 1], 1);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderSplayBoard(step.root, step.splayedVal, step.rotationName)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前伸展目标节点</div>
            <div style="font-size: 18px; font-weight: 700; color: #6d28d9;">
              ${step.splayedVal >= 0 ? `Key = ${step.splayedVal}` : '初始化'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">双旋操作阶段</div>
            <div style="font-size: 16px; font-weight: 700; color: #4338ca;">${step.rotationName}</div>
          </div>
        </div>

        ${renderFormulaCard(
          'Splay 双旋提升引擎',
          `Zig-Zig 准则: 节点与父节点同侧时【先旋父节点再旋自身】 | Zig-Zag 准则: 异侧时连续两次自身旋转`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
