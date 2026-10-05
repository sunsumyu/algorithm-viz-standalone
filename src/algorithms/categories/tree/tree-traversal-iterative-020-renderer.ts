/**
 * 左程云算法通关课 Class 020: 二叉树非递归与双栈遍历 (Iterative Tree Traversals)
 * LeetCode 144 (先序) / 94 (中序) / 145 (后序)
 * 4-Card 声明式标准化架构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { TREE_TRAVERSAL_020_PROBLEM_CONTENT } from './tree-traversal-iterative-020-problem-content';
import {
  TREE_TRAVERSAL_020_CODES,
  TREE_TRAVERSAL_020_CODE_LINES,
} from './tree-traversal-iterative-020-stage-codes';

export { TREE_TRAVERSAL_020_CODES, TREE_TRAVERSAL_020_CODE_LINES };

// ============================================================
// 步骤接口定义 (保持既有测试契约不变)
// ============================================================
export interface TraversalNode {
  val: number;
  left?: number;
  right?: number;
}

export interface Traversal020Step extends StepBase {
  treeStructure: TraversalNode[];
  traversalType: 'preorder' | 'inorder' | 'postorder';
  mainStack: number[];
  collectStack?: number[];
  visitedResult: number[];
  activeNode: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  stageId?: 'stage1' | 'stage2' | 'stage3';
}

interface SimNode {
  val: number;
  left?: SimNode;
  right?: SimNode;
}

// ============================================================
// 样板树静态布局坐标 (经典 6 节点二叉树)
//          1
//        /   \
//       2     3
//      / \   /
//     4   5 6
// ============================================================
interface TreeLayoutItem {
  val: number;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

const SAMPLE_TREE_LAYOUT: Record<number, TreeLayoutItem> = {
  1: { val: 1, x: 380, y: 40, left: 2, right: 3 },
  2: { val: 2, x: 230, y: 110, left: 4, right: 5 },
  3: { val: 3, x: 530, y: 110, left: 6 },
  4: { val: 4, x: 150, y: 180 },
  5: { val: 5, x: 310, y: 180 },
  6: { val: 6, x: 450, y: 180 },
};

// ============================================================
// 步骤生成核心 (满足不可篡改测试契约)
// ============================================================
export function buildTraversal020Steps(
  type: 'preorder' | 'inorder' | 'postorder' = 'preorder'
): Traversal020Step[] {
  const steps: Traversal020Step[] = [];

  const n4: SimNode = { val: 4 };
  const n5: SimNode = { val: 5 };
  const n6: SimNode = { val: 6 };
  const n2: SimNode = { val: 2, left: n4, right: n5 };
  const n3: SimNode = { val: 3, left: n6 };
  const root: SimNode = { val: 1, left: n2, right: n3 };

  const treeSnapshot: TraversalNode[] = [
    { val: 1, left: 2, right: 3 },
    { val: 2, left: 4, right: 5 },
    { val: 3, left: 6 },
    { val: 4 },
    { val: 5 },
    { val: 6 },
  ];

  const stageIdMap: Record<'preorder' | 'inorder' | 'postorder', 'stage1' | 'stage2' | 'stage3'> = {
    preorder: 'stage1',
    inorder: 'stage2',
    postorder: 'stage3',
  };
  const stageId = stageIdMap[type];

  // Entry step
  steps.push({
    treeStructure: treeSnapshot,
    traversalType: type,
    mainStack: [],
    collectStack: type === 'postorder' ? [] : undefined,
    visitedResult: [],
    activeNode: -1,
    decision: `主函数入口：开始进行二叉树显式栈非递归【${type === 'preorder' ? '先序遍历' : type === 'inorder' ? '中序遍历' : '双栈后序遍历'}】`,
    message: '非递归遍历彻底剥离系统递归调用栈，使用显式堆栈控制访问时序',
    log: `enter ${type}Traversal`,
    codeLine: TREE_TRAVERSAL_020_CODE_LINES[type].entry,
    statusBadge: { text: '准备遍历', type: 'info' },
    stageId,
  });

  if (type === 'preorder') {
    const stack: SimNode[] = [root];
    const visited: number[] = [];

    while (stack.length > 0) {
      const cur = stack.pop()!;
      visited.push(cur.val);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: stack.map((n) => n.val),
        visitedResult: [...visited],
        activeNode: cur.val,
        decision: `弹出栈顶节点 [${cur.val}] 并打印记录！当前访问序列更新为: [${visited.join(', ')}]`,
        message: '先序遍历准则：弹出一个打印一个，随后若有右子树先压右，再若有左子树后压左',
        log: `pop & visit ${cur.val}`,
        codeLine: TREE_TRAVERSAL_020_CODE_LINES.preorder.popVisit,
        statusBadge: { text: `访问节点 ${cur.val}`, type: 'success' },
        stageId,
      });

      if (cur.right) {
        stack.push(cur.right);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.right.val,
          decision: `右孩子 [${cur.right.val}] 存在，压入工作栈！栈顶现为: [${cur.right.val}]`,
          message: '栈后进先出，因此先压右子树以保证右子树在左子树之后被处理',
          log: `push right ${cur.right.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.preorder.pushRight,
          statusBadge: { text: `压右 ${cur.right.val}`, type: 'warning' },
          stageId,
        });
      }

      if (cur.left) {
        stack.push(cur.left);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.left.val,
          decision: `左孩子 [${cur.left.val}] 存在，后压入工作栈！栈顶现更新为: [${cur.left.val}]`,
          message: '后压左子树，使得下一轮循环首选弹出左孩子，完美实现“中左右”时序',
          log: `push left ${cur.left.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.preorder.pushLeft,
          statusBadge: { text: `压左 ${cur.left.val}`, type: 'info' },
          stageId,
        });
      }
    }
  } else if (type === 'inorder') {
    const stack: SimNode[] = [];
    const visited: number[] = [];
    let cur: SimNode | undefined = root;

    while (stack.length > 0 || cur !== undefined) {
      if (cur !== undefined) {
        stack.push(cur);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.val,
          decision: `当前指针指向节点 [${cur.val}]：左边界下潜，压入栈中并继续探测 cur.left`,
          message: '中序遍历核心：整条左边界全部依次进栈，直到走到尽头',
          log: `inorder push left boundary ${cur.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.inorder.pushLeft,
          statusBadge: { text: `下潜 ${cur.val}`, type: 'info' },
          stageId,
        });
        cur = cur.left;
      } else {
        const top = stack.pop()!;
        visited.push(top.val);
        cur = top.right;

        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: top.val,
          decision: `左路已到尽头，弹出栈顶节点 [${top.val}] 打印记录！指针转向其右子树: ${cur ? `[${cur.val}]` : '空(Null)'}`,
          message: '左子树处理完毕，访问中序父节点，随后进入右子树重复左边界进栈过程',
          log: `inorder pop & visit ${top.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.inorder.popVisitRight,
          statusBadge: { text: `访问 ${top.val}`, type: 'success' },
          stageId,
        });
      }
    }
  } else {
    // Postorder (双栈法)
    const s1: SimNode[] = [root];
    const s2: SimNode[] = [];
    const visited: number[] = [];

    while (s1.length > 0) {
      const cur = s1.pop()!;
      s2.push(cur);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: s1.map((n) => n.val),
        collectStack: s2.map((n) => n.val),
        visitedResult: [...visited],
        activeNode: cur.val,
        decision: `主栈 s1 弹出 [${cur.val}] 并压入收集栈 s2！时序由“中右左”收集驱动`,
        message: '双栈法巧妙之处：先按 中 ➔ 右 ➔ 左 压入收集栈，从收集栈倒序弹出即为 左右中！',
        log: `postorder s1 pop ${cur.val} -> push s2`,
        codeLine: TREE_TRAVERSAL_020_CODE_LINES.postorder.s1PopS2Push,
        statusBadge: { text: `收集 ${cur.val}`, type: 'warning' },
        stageId,
      });

      if (cur.left) s1.push(cur.left);
      if (cur.right) s1.push(cur.right);
    }

    while (s2.length > 0) {
      const cur = s2.pop()!;
      visited.push(cur.val);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: [],
        collectStack: s2.map((n) => n.val),
        visitedResult: [...visited],
        activeNode: cur.val,
        decision: `收集栈 s2 依次弹出 [${cur.val}] 输出至结果序列！当前已输出: [${visited.join(', ')}]`,
        message: '逆序弹出收集栈，最终产出合法的后序遍历序列 (左右中)',
        log: `postorder s2 pop -> ans ${cur.val}`,
        codeLine: TREE_TRAVERSAL_020_CODE_LINES.postorder.s2PopAns,
        statusBadge: { text: `后序输出 ${cur.val}`, type: 'success' },
        stageId,
      });
    }
  }

  // Final Step
  const lastStep = steps[steps.length - 1];
  steps.push({
    ...lastStep,
    activeNode: -1,
    decision: `🎉 遍历圆满完成！最终访问序列为: [${lastStep.visitedResult.join(', ')}]。显式栈模拟递归时序正确收敛！`,
    message: '全部节点均已按正确时序完成弹出与输出',
    log: `traversal complete: [${lastStep.visitedResult.join(',')}]`,
    statusBadge: { text: '遍历收敛', type: 'success' },
    stageId,
  });

  return steps;
}

// ============================================================
// Card 1: 纯净二叉树拓扑沙盘 (SVG Canvas)
// 零内嵌指标卡、零子卡片套娃 (Anti-Traps 9 & 10)
// ============================================================
export function renderTreeTraversalCanvas(container: HTMLElement, step: Traversal020Step) {
  const { activeNode, visitedResult, mainStack, collectStack } = step;
  const inMainStackSet = new Set(mainStack);
  const inCollectSet = new Set(collectStack || []);
  const visitedSet = new Set(visitedResult);

  // 连线 SVG
  const linesHtml: string[] = [];
  Object.values(SAMPLE_TREE_LAYOUT).forEach((node) => {
    if (node.left && SAMPLE_TREE_LAYOUT[node.left]) {
      const child = SAMPLE_TREE_LAYOUT[node.left];
      const isPath = (activeNode === node.val && inMainStackSet.has(child.val)) || (visitedSet.has(node.val) && visitedSet.has(child.val));
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${child.x}" y2="${child.y}"
          stroke="${isPath ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isPath ? 2.5 : 1.5}"
        />
      `);
    }
    if (node.right && SAMPLE_TREE_LAYOUT[node.right]) {
      const child = SAMPLE_TREE_LAYOUT[node.right];
      const isPath = (activeNode === node.val && inMainStackSet.has(child.val)) || (visitedSet.has(node.val) && visitedSet.has(child.val));
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${child.x}" y2="${child.y}"
          stroke="${isPath ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isPath ? 2.5 : 1.5}"
        />
      `);
    }
  });

  // 节点 SVG
  const nodesHtml = Object.values(SAMPLE_TREE_LAYOUT).map((node) => {
    const isActive = node.val === activeNode;
    const isVisited = visitedSet.has(node.val);
    const inMain = inMainStackSet.has(node.val);
    const inCollect = inCollectSet.has(node.val);

    let fillColor = '#1e293b';
    let strokeColor = 'rgba(255, 255, 255, 0.2)';
    let orderBadge = '';

    if (isActive) {
      fillColor = '#0284c7';
      strokeColor = '#38bdf8';
    } else if (isVisited) {
      fillColor = 'rgba(16, 185, 129, 0.25)';
      strokeColor = '#10b981';
      const visitIdx = visitedResult.indexOf(node.val) + 1;
      orderBadge = `#${visitIdx}`;
    } else if (inMain) {
      fillColor = 'rgba(139, 92, 246, 0.25)';
      strokeColor = '#8b5cf6';
    } else if (inCollect) {
      fillColor = 'rgba(245, 158, 11, 0.25)';
      strokeColor = '#f59e0b';
    }

    return `
      <g transform="translate(${node.x}, ${node.y})">
        ${isActive ? `<circle r="26" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="19"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${isActive ? 3 : 2}"
        />
        <text
          y="5"
          text-anchor="middle"
          fill="#f8fafc"
          font-size="13"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${node.val}</text>
        ${
          orderBadge
            ? `
          <rect x="-14" y="-30" width="28" height="14" rx="4" fill="#10b981" />
          <text y="-20" text-anchor="middle" fill="#064e3b" font-size="9" font-weight="bold" font-family="monospace">${orderBadge}</text>
        `
            : inMain
            ? `
          <text y="-23" text-anchor="middle" fill="#a78bfa" font-size="9" font-family="monospace">栈中</text>
        `
            : ''
        }
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; box-sizing: border-box;">
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); overflow: hidden;">
        <svg viewBox="0 0 760 240" style="width: 100%; height: 100%; max-height: 270px;" preserveAspectRatio="xMidYMid meet">
          ${linesHtml.join('')}
          ${nodesHtml}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 显式堆栈状态与访问时序面板 (Custom Metrics)
// ============================================================
export function renderTreeTraversalCard2(container: HTMLElement, step: Traversal020Step) {
  const { traversalType, mainStack, collectStack, visitedResult, activeNode, decision } = step;

  const typeName =
    traversalType === 'preorder'
      ? '先序遍历 (Preorder: 根左右)'
      : traversalType === 'inorder'
      ? '中序遍历 (Inorder: 左根右)'
      : '双栈后序 (Postorder: 左右根)';

  const hasCollect = traversalType === 'postorder';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 顶部四联仪表盘 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">遍历模式</div>
          <div style="font-size: 0.85rem; font-weight: bold; color: #38bdf8; margin-top: 2px;">
            ${traversalType.toUpperCase()}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">主栈 mainStack</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #a78bfa; font-family: monospace; margin-top: 2px;">
            ${mainStack.length} 项
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">当前聚焦</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #34d399; font-family: monospace; margin-top: 2px;">
            ${activeNode >= 0 ? `Node ${activeNode}` : '无'}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">输出进度</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #facc15; font-family: monospace; margin-top: 2px;">
            ${visitedResult.length} / 6
          </div>
        </div>
      </div>

      <!-- 堆栈状态视窗 (主栈 mainStack & 收集栈 collectStack) -->
      <div style="display: grid; grid-template-columns: ${hasCollect ? '1fr 1fr' : '1fr'}; gap: 10px; flex: 1;">
        <!-- 主工作栈 -->
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column;">
          <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>🥞 工作栈 mainStack (底 ➔ 顶)</span>
            <span style="font-size: 0.7rem; color: #a78bfa;">LIFO</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 42px;">
            ${
              mainStack.length === 0
                ? `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">栈为空</span>`
                : mainStack
                    .map(
                      (v, i) => `
                <div style="padding: 4px 10px; background: rgba(139, 92, 246, 0.15); border: 1px solid ${
                  i === mainStack.length - 1 ? '#a78bfa' : 'rgba(139, 92, 246, 0.4)'
                }; border-radius: 6px; font-size: 0.85rem; font-weight: bold; color: #f1f5f9; display: flex; align-items: center; gap: 4px;">
                  <span>${v}</span>
                  ${i === mainStack.length - 1 ? `<span style="font-size: 0.65rem; color: #a78bfa; font-weight: normal;">(顶)</span>` : ''}
                </div>
              `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- 双栈法收集栈 -->
        ${
          hasCollect
            ? `
          <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column;">
            <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span>📥 收集栈 collectStack (底 ➔ 顶)</span>
              <span style="font-size: 0.7rem; color: #f59e0b;">中右左 ➔ 左右中</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 42px;">
              ${
                !collectStack || collectStack.length === 0
                  ? `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">收集栈为空</span>`
                  : collectStack
                      .map(
                        (v, i) => `
                  <div style="padding: 4px 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid ${
                    i === collectStack.length - 1 ? '#fbbf24' : 'rgba(245, 158, 11, 0.4)'
                  }; border-radius: 6px; font-size: 0.85rem; font-weight: bold; color: #f1f5f9; display: flex; align-items: center; gap: 4px;">
                    <span>${v}</span>
                    ${i === collectStack.length - 1 ? `<span style="font-size: 0.65rem; color: #fbbf24; font-weight: normal;">(顶)</span>` : ''}
                  </div>
                `
                      )
                      .join('')
              }
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- 最终访问序列展流 (Result Stream) -->
      <div style="padding: 10px 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px;">
        <div style="font-size: 0.75rem; font-weight: 600; color: #34d399; margin-bottom: 6px;">
          📜 访问输出序列 (Traversal Result)
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          ${
            visitedResult.length === 0
              ? `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">等待节点弹出访问...</span>`
              : visitedResult
                  .map(
                    (v, idx) => `
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <span style="font-size: 0.85rem; font-weight: bold; color: #10b981; font-family: monospace;">${v}</span>
                  ${idx < visitedResult.length - 1 ? `<span style="color: #64748b; font-size: 0.75rem;">➜</span>` : ''}
                </div>
              `
                  )
                  .join('')
          }
        </div>
      </div>

      <!-- 当前时序决策总结 -->
      <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
        <strong style="color: #38bdf8;">当前时序决策：</strong> ${decision}
      </div>
    </div>
  `;
}

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const treeTraversal020Visualizer = registerDeclarativeAlgorithm<Traversal020Step>({
  id: 'tree-traversal-iterative-020',
  name: '二叉树迭代遍历 (Class 020)',
  category: 'tree',
  icon: '🥞',
  difficulty: 2,
  levelOrder: 20,
  aliases: ['class020-code01', 'tree-traversal-iterative-020', 'iterative-traversal', 'tree-traversal-stack'],
  learningGoal: '掌握使用显式单栈/双栈模拟系统递归调用过程，深入理解先序、中序、后序在栈内的时序转换',
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 先序非递归 (Preorder: 根左右)',
      shortName: '先序迭代',
      card2Title: '先序显式单栈时序探针',
      card2Desc: '弹出一个打印一个，先压右孩子再压左孩子',
      codeLanguages: TREE_TRAVERSAL_020_CODES,
      generateSteps: () => buildTraversal020Steps('preorder'),
    },
    {
      id: 'stage2',
      name: 'Stage 2: 中序非递归 (Inorder: 左根右)',
      shortName: '中序迭代',
      card2Title: '中序左边界下潜栈探针',
      card2Desc: '整条左边界全压栈，无法下潜时出栈访问并转向右子树',
      codeLanguages: TREE_TRAVERSAL_020_CODES,
      generateSteps: () => buildTraversal020Steps('inorder'),
    },
    {
      id: 'stage3',
      name: 'Stage 3: 双栈后序非递归 (Postorder: 左右根)',
      shortName: '后序双栈',
      card2Title: '双栈逆向收集探针',
      card2Desc: '按中右左收集，二次弹出自动反转为左右根',
      codeLanguages: TREE_TRAVERSAL_020_CODES,
      generateSteps: () => buildTraversal020Steps('postorder'),
    },
  ],
  codeLanguages: TREE_TRAVERSAL_020_CODES,
  inputs: [
    {
      id: 'type',
      label: '遍历类型',
      type: 'select',
      defaultValue: 'preorder',
      options: [
        { label: '先序遍历 (Preorder: 根左右)', value: 'preorder' },
        { label: '中序遍历 (Inorder: 左根右)', value: 'inorder' },
        { label: '双栈后序遍历 (Postorder: 左右根)', value: 'postorder' },
      ],
    },
  ],
  card2Title: '显式堆栈状态与访问时序面板',
  card2Desc: '显式控制遍历顺序，支持先序、中序与双栈后序',
  problemHtml: TREE_TRAVERSAL_020_PROBLEM_CONTENT.description + TREE_TRAVERSAL_020_PROBLEM_CONTENT.mechanisms,
  generateSteps: (inputs) => {
    const type = (inputs?.type || 'preorder') as 'preorder' | 'inorder' | 'postorder';
    return buildTraversal020Steps(type);
  },
  renderCanvas: (container, step) => {
    renderTreeTraversalCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeTraversalCard2(container, step);
  },
});
