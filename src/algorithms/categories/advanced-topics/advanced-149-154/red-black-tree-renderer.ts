/**
 * Class 150: 红黑树 (Red-Black Tree)
 * 工业界标准自平衡二叉搜索树 / Java TreeMap, C++ std::map 核心实现
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { RED_BLACK_CODES, RED_BLACK_LINES } from './advanced-149-154-stage-codes';
import { Advanced149Step, RBNodeView, renderRBTreeBoard } from './advanced-149-154-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

type Color = 'RED' | 'BLACK';

interface InternalRBNode {
  key: number;
  color: Color;
  parent: InternalRBNode | null;
  left: InternalRBNode | null;
  right: InternalRBNode | null;
}

function toView(node: InternalRBNode | null): RBNodeView | null {
  if (!node) return null;
  return {
    key: node.key,
    color: node.color,
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface RBStep extends Advanced149Step {
  root: RBNodeView | null;
  activeKey: number;
  actionType: string;
}

export function buildRBSteps(keys: number[]): RBStep[] {
  const steps: RBStep[] = [];
  const lines = RED_BLACK_LINES;

  let root: InternalRBNode | null = null;

  // Step 0: 入口
  steps.push({
    root: null,
    activeKey: -1,
    actionType: '初始入口',
    decision: `主函数入口：开始向红黑树依次插入键值序列 [${keys.join(', ')}]`,
    message: `红黑树保证任意节点到后代叶节点的黑节点数量恒等，最长路径不超过最短路径的 2 倍`,
    log: `enter RBTree insert sequence`,
    codeLine: lines.entry,
    metrics: { '待插入序列': keys.join(', '), '树节点数': 0 },
  });

  function rotateLeft(x: InternalRBNode) {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  function rotateRight(y: InternalRBNode) {
    const x = y.left!;
    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) root = x;
    else if (y === y.parent.right) y.parent.right = x;
    else y.parent.left = x;
    x.right = y;
    y.parent = x;
  }

  function insertFixup(z: InternalRBNode) {
    while (z.parent && z.parent.color === 'RED') {
      const p = z.parent;
      const g = p.parent;
      if (!g) break;

      steps.push({
        root: toView(root),
        activeKey: z.key,
        actionType: '检测到连续双红冲突',
        decision: `⚠️ 节点 ${z.key} (红) 与其父节点 ${p.key} (红) 冲突，违反红黑树性质 4`,
        message: `进入 insertFixup 循环进行变色或局部旋转`,
        log: `checkDoubleRed: node=${z.key}, parent=${p.key}`,
        codeLine: lines.checkLoop,
        statusBadge: { text: '双红冲突', type: 'warning' },
        metrics: { '冲突节点': z.key, '父节点': p.key },
      });

      if (p === g.left) {
        const y = g.right; // 叔叔
        if (y && y.color === 'RED') {
          // Case 1: 叔叔为红 -> 变色
          p.color = 'BLACK';
          y.color = 'BLACK';
          g.color = 'RED';
          steps.push({
            root: toView(root),
            activeKey: z.key,
            actionType: 'Case 1: 叔叔为红 (变色上推)',
            decision: `Case 1：叔叔节点 ${y.key} 为红。将父/叔置黑，祖父 ${g.key} 置红，冲突指针上移至祖父`,
            message: `黑高保持不变，将红色冲突向上推至更高层`,
            log: `recolor: p=${p.key}->B, uncle=${y.key}->B, g=${g.key}->R`,
            codeLine: lines.caseRecolor,
            statusBadge: { text: '变色上推', type: 'info' },
            metrics: { '变黑节点': `${p.key}, ${y.key}`, '变红节点': g.key },
          });
          z = g;
        } else {
          if (z === p.right) {
            // Case 2: 之字形先左旋
            z = p;
            rotateLeft(z);
            steps.push({
              root: toView(root),
              activeKey: z.key,
              actionType: 'Case 2: 之字形 (左单旋)',
              decision: `Case 2：节点位于内侧（之字形），对父节点 ${z.key} 执行 rotateLeft 转化为一字形`,
              message: `准备进入 Case 3 一字形右旋`,
              log: `rotateLeft: at ${z.key}`,
              codeLine: lines.caseRotate,
              metrics: { '旋转中心': z.key, '目标': '化为一字形' },
            });
          }
          // Case 3: 一字形右旋
          z.parent!.color = 'BLACK';
          g.color = 'RED';
          rotateRight(g);
          steps.push({
            root: toView(root),
            activeKey: z.key,
            actionType: 'Case 3: 一字形 (右单旋)',
            decision: `Case 3：父节点置黑，祖父置红，以祖父 ${g.key} 为轴执行 rotateRight 恢复平衡`,
            message: `双红冲突彻底解决，黑高严格保持`,
            log: `rotateRight: at ${g.key}`,
            codeLine: lines.caseRotate,
            statusBadge: { text: '旋转修复', type: 'success' },
            metrics: { '旋转轴': g.key, '修复完成': '是' },
          });
        }
      } else {
        // 对称右侧
        const y = g.left;
        if (y && y.color === 'RED') {
          p.color = 'BLACK';
          y.color = 'BLACK';
          g.color = 'RED';
          steps.push({
            root: toView(root),
            activeKey: z.key,
            actionType: 'Case 1: 叔叔为红 (对称变色)',
            decision: `Case 1：对称右侧叔叔为红，父/叔置黑，祖父置红`,
            message: `将红色冲突上推至祖父节点`,
            log: `recolorRight: g=${g.key}->R`,
            codeLine: lines.caseRecolor,
            statusBadge: { text: '变色上推', type: 'info' },
            metrics: { '变红节点': g.key },
          });
          z = g;
        } else {
          if (z === p.left) {
            z = p;
            rotateRight(z);
          }
          z.parent!.color = 'BLACK';
          g.color = 'RED';
          rotateLeft(g);
          steps.push({
            root: toView(root),
            activeKey: z.key,
            actionType: 'Case 3: 对称一字形 (左单旋)',
            decision: `Case 3：对称右侧一字形，父置黑祖父置红，以祖父 ${g.key} 为轴左旋`,
            message: `平衡修复完毕`,
            log: `rotateLeftSymmetric: at ${g.key}`,
            codeLine: lines.caseRotate,
            statusBadge: { text: '旋转修复', type: 'success' },
            metrics: { '旋转轴': g.key },
          });
        }
      }
    }

    if (root && root.color !== 'BLACK') {
      root.color = 'BLACK';
      steps.push({
        root: toView(root),
        activeKey: root.key,
        actionType: '根节点置黑 (性质 2)',
        decision: `强制将根节点 ${root.key} 涂为黑色，满足红黑树性质 2 (根节点必黑)`,
        message: `全树所有路径黑高同时增加 1，黑高依然严格平衡`,
        log: `rootBlack: root=${root.key}->BLACK`,
        codeLine: lines.rootBlack,
        metrics: { '根节点': root.key, '最终颜色': 'BLACK' },
      });
    }
  }

  function bstInsert(key: number): InternalRBNode {
    const z: InternalRBNode = { key, color: 'RED', parent: null, left: null, right: null };
    let y: InternalRBNode | null = null;
    let x = root;
    while (x) {
      y = x;
      if (z.key < x.key) x = x.left;
      else x = x.right;
    }
    z.parent = y;
    if (!y) root = z;
    else if (z.key < y.key) y.left = z;
    else y.right = z;
    return z;
  }

  for (let idx = 0; idx < keys.length; idx++) {
    const k = keys[idx];
    const z = bstInsert(k);

    steps.push({
      root: toView(root),
      activeKey: k,
      actionType: 'BST 插入 (默认染红)',
      decision: `将新节点 ${k} 按 BST 规则插入树中，初始颜色设为红色`,
      message: `染红可保证不会立刻破坏各路径黑高平衡，仅需检测是否产生双红冲突`,
      log: `insertKey: ${k}`,
      codeLine: lines.entry,
      metrics: { '当前键值': k, '初始着色': 'RED' },
    });

    insertFixup(z);
  }

  // 终态
  steps.push({
    root: toView(root),
    activeKey: -1,
    actionType: '构建完成',
    decision: `🎉 序列插入全部完成：红黑树五大公理全部满足，黑高严格平衡`,
    message: `红黑树最坏情况下查找、插入、删除均维持在 2 * log(N + 1) 次比较内`,
    log: `returnAns: complete`,
    codeLine: lines.rootBlack,
    statusBadge: { text: '红黑树严格平衡', type: 'success' },
    metrics: { '最终节点数': keys.length, '根节点': root ? (root as any).key : 'null' },
  });

  return steps;
}

export const redBlackTreeVisualizer = registerDeclarativeAlgorithm<RBStep>({
  id: 'red-black-tree-150',
  name: '红黑树 (Class 150)',
  category: 'tree',
  icon: '🔴',
  difficulty: 3,
  levelOrder: 150,
  description: '左程云算法通关课 Class 150：有序表专题 3 - 红黑树 (Red-Black Tree)。解析五大公理、双红冲突与变色/单旋/双旋修复流程。',
  learningGoal: '掌握红黑树五大公理与插入修复的三种经典 Case 处理逻辑及黑高平衡原理',
  problemHtml: ADVANCED_149_154_PROBLEMS.redBlackTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.redBlackTree.html,
  inputs: [
    {
      id: 'preset',
      label: '键值插入序列预设',
      type: 'select',
      defaultValue: 'keys_10_20_30_15_25',
      options: [
        { label: '[10, 20, 30, 15, 25] (触发变色与旋转)', value: 'keys_10_20_30_15_25' },
        { label: '[12, 1, 9, 2, 0, 11] (经典多 Case 演示)', value: 'keys_multi_case' },
      ],
    },
  ],
  codeLanguages: RED_BLACK_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_10_20_30_15_25');
    if (preset === 'keys_multi_case') {
      return buildRBSteps([12, 1, 9, 2, 0, 11]);
    }
    return buildRBSteps([10, 20, 30, 15, 25]);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderRBTreeBoard(step.root, step.activeKey, step.actionType)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作键值</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.activeKey >= 0 ? `Key = ${step.activeKey}` : '调整就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前修复阶段</div>
            <div style="font-size: 16px; font-weight: 700; color: #059669;">${step.actionType}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '红黑树着色与黑高维护引擎',
          `公理4: 红色不能相连 | 公理5: 各路径黑色节点数相等 | 修复三部曲: 叔叔为红变色上推，叔叔为黑一字/之字旋转`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
