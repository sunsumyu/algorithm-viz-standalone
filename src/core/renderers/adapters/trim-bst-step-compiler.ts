/**
 * Trim BST Step Compiler (LeetCode 669 / Class 037 Code06)
 *
 * 真实递归推演编译器 (严格一行一步 · 五段式生命周期):
 *   入口帧 → 判空帧 → 左/右越界比较帧 → 深入帧 → 返回归约帧 → 指针重接帧 → returnRoot 帧 → 顶层闭合帧。
 * 每帧携带工作树快照 (cloneStateDepTree) 与空调用探针 (StepNullProbe)，
 * 供 USNE 自动合成树上挂树全景与统一画布防断电渲染。
 */

import { TreeNode036, Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { TRIM_BST_037_LINES } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';
import { parseTreeArray } from '../../input-primitives';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import { RecursiveCallTraceBuilder } from './recursive-call-trace-adapter';
import type { TreeNode } from '../tree-svg';

// LC 669 官方示例树: 3 -> (0 -> (null, 2 -> (1, null)), 4)
const DEFAULT_TREE = [3, 0, 4, null, 2, null, null, 1] as (number | null)[];

function countKept(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countKept(node.left) + countKept(node.right);
}

export function buildTrimBst037Steps(
  treeRaw?: string,
  lowInput?: number | string,
  highInput?: number | string
): Tree036Step[] {
  const low = lowInput !== undefined && lowInput !== '' && !isNaN(Number(lowInput)) ? Number(lowInput) : 1;
  const high = highInput !== undefined && highInput !== '' && !isNaN(Number(highInput)) ? Number(highInput) : 3;
  const arr = parseTreeArray(treeRaw, DEFAULT_TREE);
  // 可变工作树：修剪重接直接发生在该实例上，每帧以 cloneStateDepTree 快照留档
  const working = buildTreeFromArr(arr);

  const steps: Tree036Step[] = [];
  const trace = new RecursiveCallTraceBuilder();
  const lines = TRIM_BST_037_LINES;

  const pushStep = (partial: Record<string, any> & Pick<Tree036Step, 'decision' | 'message' | 'log'>): void => {
    steps.push({
      tree: cloneStateDepTree(working),
      ...partial,
    } as Tree036Step);
  };

  // 空树边界：入口 → 判空命中 → 闭合
  if (!working) {
    trace.addHeader(`trimBST(root: null, low: ${low}, high: ${high})`, 0, '<- 空树边界');
    trace.addConditionHit('① root == null 命中 -> return null', 0);
    trace.addFinalResult('最终结果: null (空树)', 0, 'return null;');
    pushStep({
      codeLine: lines.entry,
      current: null,
      decision: `修剪空树：无任何节点需要裁剪`,
      message: `输入为空树，直接返回 null。`,
      log: `trimBST(root: null, low: ${low}, high: ${high})`,
      metrics: { '目标区间': `[${low}, ${high}]`, '最终保留节点数': 0 },
      statusBadge: { text: '空树边界', type: 'info' },
      callTrace: trace.snapshot(),
    });
    pushStep({
      codeLine: lines.nullCheck,
      current: null,
      decision: '基底判空命中：空树直接返回 null',
      message: 'root == null 判空命中，返回 null，算法结束。',
      log: 'root is null -> return null',
      metrics: { '目标区间': `[${low}, ${high}]`, '最终保留节点数': 0 },
      statusBadge: { text: '空树边界', type: 'info' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  const rootText = `Node(${working.val})`;
  trace.addHeader(`trimBST(root: ${rootText}, low: ${low}, high: ${high})`, 0, '<- 根调用开始');
  pushStep({
    codeLine: lines.entry,
    current: working.val,
    decision: `修剪 BST：保留区间 [${low}, ${high}] 内的所有节点`,
    message: `修剪原理：小于 low 的节点连同其左子树整体丢弃、由修剪后的右子树提升替代；大于 high 亦然；区间内节点重接左右修剪后的子树。`,
    log: `trimBST(root: ${working.val}, low: ${low}, high: ${high})`,
    metrics: { '目标区间': `[${low}, ${high}]`, '当前根节点': working.val },
    statusBadge: { text: '算法启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  function recurse(
    node: TreeNode | null,
    depth: number,
    parent?: TreeNode,
    branch: 'left' | 'right' = 'left'
  ): TreeNode | null {
    // 递归推演五段式 ①: 函数入口帧 (空子树挂探针锚点)
    if (depth > 0) {
      const label = node ? `Node(${node.val})` : 'null';
      trace.addHeader(`trimBST(root: ${label}, low: ${low}, high: ${high})`, depth);
      pushStep({
        codeLine: lines.entry,
        current: node ? node.val : null,
        secondaryHighlightedNodes: !node && parent ? [parent.val] : undefined,
        nullProbe: !node && parent ? { parentVal: parent.val, parentId: parent.id, branch, phase: 'entry' } : undefined,
        decision: node ? `深入调用帧: 携带实参进入节点 ${node.val}` : `深入调用帧: 探测${branch === 'left' ? '左' : '右'}子树空槽位`,
        message: node
          ? `进入 trimBST(节点 ${node.val})，准备判空与区间单调性比较。`
          : `父节点 ${parent?.val} 的${branch === 'left' ? '左' : '右'}孩子为空，进入空调用帧。`,
        log: `trimBST(${label}, low: ${low}, high: ${high})`,
        metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node ? node.val : 'null' },
        statusBadge: { text: node ? `访问节点 ${node.val}` : '空调用探针', type: 'info' },
        callTrace: trace.snapshot(),
      });
    }

    // 递归推演五段式 ②: 边界判空帧
    if (!node) {
      trace.addConditionHit('① root == null 命中 -> return null', depth);
      pushStep({
        codeLine: lines.nullCheck,
        current: null,
        secondaryHighlightedNodes: parent ? [parent.val] : undefined,
        nullProbe: parent ? { parentVal: parent.val, parentId: parent.id, branch, phase: 'return' } : undefined,
        decision: `基底判空命中: ${parent?.val ?? '—'} 的${branch === 'left' ? '左' : '右'}子树为空`,
        message: 'root == null 判空命中，向父调用返回 null（空子树无需修剪）。',
        log: 'root is null -> return null',
        metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': 'null' },
        statusBadge: { text: '空节点回溯', type: 'warning' },
        callTrace: trace.snapshot(),
      });
      return null;
    }
    trace.addConditionPass(`① root = Node(${node.val}) ≠ null，判空通过`, depth);
    pushStep({
      codeLine: lines.nullCheck,
      current: node.val,
      decision: `判空通过: root = 节点 ${node.val} 非空`,
      message: `root == null 不成立，继续考察节点 ${node.val} 与区间 [${low}, ${high}] 的单调关系。`,
      log: `root = ${node.val} is not null -> proceed`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val },
      statusBadge: { text: `判空通过 ${node.val}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 递归推演五段式 ③: 左越界比较帧 (Line 3 显式求值)
    const belowLow = node.val < low;
    trace.addConditionPass(`② ${node.val} < low(${low}) ? ${belowLow}`, depth);
    pushStep({
      codeLine: lines.trimLow,
      current: node.val,
      decision: belowLow
        ? `节点 ${node.val} < low(${low})，左越界条件成立`
        : `节点 ${node.val} ≥ low(${low})，左越界条件不成立`,
      message: `求值 root.val < low → ${node.val} < ${low} → ${belowLow}。${belowLow ? 'BST 性质：其整个左子树必然更小，本节点连同左子树整体丢弃！' : '节点不在下界左侧，继续考察上界。'}`,
      log: `if (${node.val} < ${low}) -> ${belowLow}`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '左越界判定': `${node.val} < ${low} ? ${belowLow}` },
      statusBadge: { text: belowLow ? `左越界成立` : `左越界不成立`, type: belowLow ? 'danger' : 'info' },
      callTrace: trace.snapshot(),
    });

    if (belowLow) {
      // 递归推演五段式 ④: 深入右子树帧 (本节点将被丢弃，由修剪后的右子树提升替代)
      trace.addConditionPass(`③ 丢弃节点 ${node.val} 及其左子树，深入 trimBST(root.right)`, depth);
      pushStep({
        codeLine: lines.trimLow,
        current: node.val,
        secondaryHighlightedNodes: [node.val],
        decision: `丢弃节点 ${node.val}，深入其右子树`,
        message: `执行 return trimBST(root.right, low, high)：节点 ${node.val} 连同左子树被裁剪，仅右子树有望提升替代。`,
        log: `return trimBST(root.right = ${node.right ? node.right.val : 'null'})`,
        metrics: { '目标区间': `[${low}, ${high}]`, '被裁剪节点': node.val, '走向': '深入右子树提升' },
        statusBadge: { text: `✂️ 丢弃 ${node.val}`, type: 'danger' },
        callTrace: trace.snapshot(),
      });
      const res = recurse(node.right, depth + 1, node, 'right');
      // 递归推演五段式 ⑤: 返回归约帧 (子调用结果就绪，本节点已被剪除，结果向上提升)
      trace.addReturnLeaf(`右子调用返回 ${res ? 'Node(' + res.val + ')' : 'null'} -> 节点 ${node.val} 被剪除，结果向上提升`, depth);
      pushStep({
        codeLine: lines.trimLow,
        current: res ? res.val : null,
        secondaryHighlightedNodes: [node.val],
        decision: `右子调用返回: ${res ? 'Node(' + res.val + ')' : 'null'}`,
        message: `节点 ${node.val} 确定被裁剪（父层指针即将重接剪除），右子树修剪结果 ${res ? 'Node(' + res.val + ')' : 'null'} 作为本层返回值向上提升。`,
        log: `rightTrimmed = ${res ? res.val : 'null'} -> return (丢弃 ${node.val})`,
        metrics: { '目标区间': `[${low}, ${high}]`, '被裁剪节点': node.val, '提升结果': res ? `节点 ${res.val}` : 'null' },
        statusBadge: { text: `提升 ${res ? res.val : 'null'}`, type: 'warning' },
        callTrace: trace.snapshot(),
      });
      return res;
    }

    // 递归推演五段式 ③': 右越界比较帧 (Line 4 显式求值)
    const aboveHigh = node.val > high;
    trace.addConditionPass(`② ${node.val} > high(${high}) ? ${aboveHigh}`, depth);
    pushStep({
      codeLine: lines.trimHigh,
      current: node.val,
      decision: aboveHigh
        ? `节点 ${node.val} > high(${high})，右越界条件成立`
        : `节点 ${node.val} ≤ high(${high})，右越界条件不成立`,
      message: `求值 root.val > high → ${node.val} > ${high} → ${aboveHigh}。${aboveHigh ? 'BST 性质：其整个右子树必然更大，本节点连同右子树整体丢弃！' : '节点在区间内，进入指针重接阶段。'}`,
      log: `if (${node.val} > ${high}) -> ${aboveHigh}`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '右越界判定': `${node.val} > ${high} ? ${aboveHigh}` },
      statusBadge: { text: aboveHigh ? `右越界成立` : `右越界不成立`, type: aboveHigh ? 'danger' : 'info' },
      callTrace: trace.snapshot(),
    });

    if (aboveHigh) {
      // 递归推演五段式 ④': 深入左子树帧 (本节点将被丢弃，由修剪后的左子树提升替代)
      trace.addConditionPass(`③ 丢弃节点 ${node.val} 及其右子树，深入 trimBST(root.left)`, depth);
      pushStep({
        codeLine: lines.trimHigh,
        current: node.val,
        secondaryHighlightedNodes: [node.val],
        decision: `丢弃节点 ${node.val}，深入其左子树`,
        message: `执行 return trimBST(root.left, low, high)：节点 ${node.val} 连同右子树被裁剪，仅左子树有望提升替代。`,
        log: `return trimBST(root.left = ${node.left ? node.left.val : 'null'})`,
        metrics: { '目标区间': `[${low}, ${high}]`, '被裁剪节点': node.val, '走向': '深入左子树提升' },
        statusBadge: { text: `✂️ 丢弃 ${node.val}`, type: 'danger' },
        callTrace: trace.snapshot(),
      });
      const res = recurse(node.left, depth + 1, node, 'left');
      // 递归推演五段式 ⑤': 返回归约帧
      trace.addReturnLeaf(`左子调用返回 ${res ? 'Node(' + res.val + ')' : 'null'} -> 节点 ${node.val} 被剪除，结果向上提升`, depth);
      pushStep({
        codeLine: lines.trimHigh,
        current: res ? res.val : null,
        secondaryHighlightedNodes: [node.val],
        decision: `左子调用返回: ${res ? 'Node(' + res.val + ')' : 'null'}`,
        message: `节点 ${node.val} 确定被裁剪（父层指针即将重接剪除），左子树修剪结果 ${res ? 'Node(' + res.val + ')' : 'null'} 作为本层返回值向上提升。`,
        log: `leftTrimmed = ${res ? res.val : 'null'} -> return (丢弃 ${node.val})`,
        metrics: { '目标区间': `[${low}, ${high}]`, '被裁剪节点': node.val, '提升结果': res ? `节点 ${res.val}` : 'null' },
        statusBadge: { text: `提升 ${res ? res.val : 'null'}`, type: 'warning' },
        callTrace: trace.snapshot(),
      });
      return res;
    }

    // 深入左子树帧 (Line 5: root.left = trimBST(root.left, low, high)；保留判定并入本帧叙述)
    trace.addConditionPass(`③ ${low} <= ${node.val} <= ${high} 节点保留，开始重接左右子树`, depth);
    pushStep({
      codeLine: lines.trimBoth,
      current: node.val,
      decision: `节点 ${node.val} ∈ [${low}, ${high}] 合规保留，深入修剪其左子树`,
      message: `当前节点 ${node.val} 在保留区间内，保留本节点。执行 root.left = trimBST(root.left, low, high)：左孩子 ${node.left ? node.left.val : 'null'} 进入修剪。`,
      log: `keep ${node.val} -> root.left = trimBST(${node.left ? node.left.val : 'null'})`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '判定性质': '区间内保留', '走向': '⬅️ 修剪左子树' },
      statusBadge: { text: `保留 ${node.val} · 修剪左子树`, type: 'info' },
      callTrace: trace.snapshot(),
    });
    const leftRes = recurse(node.left, depth + 1, node, 'left');
    node.left = leftRes;
    // 左指针重接归约帧 (快照已含重接后的拓扑)
    trace.addReturnLeaf(`左子调用返回 ${leftRes ? 'Node(' + leftRes.val + ')' : 'null'} -> root.left = ${leftRes ? leftRes.val : 'null'}`, depth);
    pushStep({
      codeLine: lines.trimBoth,
      current: node.val,
      decision: `左指针重接完成: root.left = ${leftRes ? 'Node(' + leftRes.val + ')' : 'null'}`,
      message: `左子树修剪完毕并回接：节点 ${node.val} 的左孩子更新为 ${leftRes ? 'Node(' + leftRes.val + ')' : 'null'}。`,
      log: `root.left = ${leftRes ? leftRes.val : 'null'}`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '左孩子最新状态': leftRes ? `节点 ${leftRes.val}` : 'null' },
      statusBadge: { text: `左重接完成`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 深入右子树帧 (Line 6: root.right = trimBST(root.right, low, high))
    pushStep({
      codeLine: lines.trimBothRight,
      current: node.val,
      decision: `深入修剪节点 ${node.val} 的右子树`,
      message: `执行 root.right = trimBST(root.right, low, high)：右孩子 ${node.right ? node.right.val : 'null'} 进入修剪。`,
      log: `root.right = trimBST(${node.right ? node.right.val : 'null'})`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '走向': '➡️ 修剪右子树' },
      statusBadge: { text: `修剪右子树`, type: 'info' },
      callTrace: trace.snapshot(),
    });
    const rightRes = recurse(node.right, depth + 1, node, 'right');
    node.right = rightRes;
    // 右指针重接归约帧
    trace.addReturnLeaf(`右子调用返回 ${rightRes ? 'Node(' + rightRes.val + ')' : 'null'} -> root.right = ${rightRes ? rightRes.val : 'null'}`, depth);
    pushStep({
      codeLine: lines.trimBothRight,
      current: node.val,
      decision: `右指针重接完成: root.right = ${rightRes ? 'Node(' + rightRes.val + ')' : 'null'}`,
      message: `右子树修剪完毕并回接：节点 ${node.val} 的右孩子更新为 ${rightRes ? 'Node(' + rightRes.val + ')' : 'null'}。`,
      log: `root.right = ${rightRes ? rightRes.val : 'null'}`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '右孩子最新状态': rightRes ? `节点 ${rightRes.val}` : 'null' },
      statusBadge: { text: `右重接完成`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // returnRoot 帧 (Line 7)
    trace.addReturnLeaf(`return Node(${node.val}) — 本帧子树修剪完成`, depth);
    pushStep({
      codeLine: lines.returnRoot,
      current: node.val,
      decision: `return Node(${node.val})：本帧子树修剪完成`,
      message: `节点 ${node.val} 连同其修剪后的子树整体向上返回。`,
      log: `return root: ${node.val}`,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': node.val, '本帧保留规模': countKept(node) },
      statusBadge: { text: `返回 ${node.val}`, type: 'success' },
      callTrace: trace.snapshot(),
    });
    return node;
  }

  const finalRoot = recurse(working, 0);

  // 顶层闭合帧
  const kept = countKept(finalRoot);
  trace.addFinalResult(`最终保留 ${kept} 个节点，全部位于 [${low}, ${high}] 区间内`, 0, 'return root;');
  pushStep({
    codeLine: lines.returnRoot,
    current: finalRoot ? finalRoot.val : null,
    decision: `算法完成: 修剪后保留 ${kept} 个节点`,
    message: `全部递归帧闭合。修剪后的二叉搜索树包含 ${kept} 个节点，满足 BST 性质且全部位于 [${low}, ${high}] 闭区间内。`,
    log: `全部执行完成: 最终保留节点数 = ${kept}`,
    metrics: { '目标区间': `[${low}, ${high}]`, '最终保留节点数': kept, '判定性质': '递归闭合' },
    statusBadge: { text: `修剪完成 (保留 ${kept})`, type: 'success' },
    callTrace: trace.snapshot(),
  });
  return steps;
}
