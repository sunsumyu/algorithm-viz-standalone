/**
 * 左程云算法通关课 Class 040: 折纸问题 (Paper Folding)
 * 满二叉树中序遍历同构、显式调用栈模拟与逐层物理裂变推演
 * 4-Card 声明式标准化架构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { PAPER_FOLDING_040_PROBLEM_CONTENT } from './paper-folding-040-problem-content';
import {
  PAPER_FOLDING_CODES,
  PAPER_FOLDING_CODE_LINES,
  PAPER_FOLDING_STAGE2_CODES,
  PAPER_FOLDING_STAGE2_LINES,
  PAPER_FOLDING_STAGE3_CODES,
  PAPER_FOLDING_STAGE3_LINES,
} from './paper-folding-040-stage-codes';

export {
  PAPER_FOLDING_CODES,
  PAPER_FOLDING_CODE_LINES,
  PAPER_FOLDING_STAGE2_CODES,
  PAPER_FOLDING_STAGE2_LINES,
  PAPER_FOLDING_STAGE3_CODES,
  PAPER_FOLDING_STAGE3_LINES,
};

// ============================================================
// 数据结构与接口定义
// ============================================================
export interface CreaseItem {
  id: number;
  type: 'down' | 'up';
  text: string;
  level: number;
}

export interface TreeNodeLayout {
  id: string;
  level: number;
  type: 'down' | 'up' | 'root';
  text: string;
  status: 'pending' | 'visiting' | 'printed';
  x: number;
  y: number;
  parentId?: string;
}

export interface PaperFoldStep extends StepBase {
  currentLevel: number;
  maxLevels: number;
  currentType: 'down' | 'up' | 'root';
  action: 'enter' | 'left_done' | 'print' | 'right_done' | 'finish';
  creaseList: CreaseItem[];
  message: string;
  log: string;
  codeLine: HighlightTarget;
  stageId?: 'stage1' | 'stage2' | 'stage3';
  activeNodeId?: string | null;
  treeNodes?: TreeNodeLayout[];
  stackFrames?: Array<{ level: number; type: 'down' | 'up'; state: string }>;
  foldingLayer?: number;
}

// ============================================================
// 二叉树布局与几何构建辅助函数
// ============================================================
function buildTreeLayout(n: number): TreeNodeLayout[] {
  const nodes: TreeNodeLayout[] = [];
  const svgWidth = 800;
  const svgHeight = 280;
  const topMargin = 40;
  const bottomMargin = 40;
  const levelHeight = n > 1 ? (svgHeight - topMargin - bottomMargin) / (n - 1) : 0;

  function traverse(
    level: number,
    type: 'down' | 'up' | 'root',
    id: string,
    parentId: string | undefined,
    leftBound: number,
    rightBound: number
  ) {
    if (level > n) return;
    const x = (leftBound + rightBound) / 2;
    const y = topMargin + (level - 1) * levelHeight;
    nodes.push({
      id,
      level,
      type,
      text: type === 'root' ? '凹 (根)' : type === 'down' ? '凹' : '凸',
      status: 'pending',
      x,
      y,
      parentId,
    });
    // 左子必为凹
    traverse(level + 1, 'down', `${id}-L`, id, leftBound, x);
    // 右子必为凸
    traverse(level + 1, 'up', `${id}-R`, id, x, rightBound);
  }

  traverse(1, 'root', '1', undefined, 20, svgWidth - 20);
  return nodes;
}

// ============================================================
// Stage 1 步骤生成器: 经典中序递归栈 (In-order DFS)
// 保持 100% 测试不可篡改契约 (buildPaperFoldingSteps)
// ============================================================
export function buildPaperFoldingSteps(n: number = 3): PaperFoldStep[] {
  const steps: PaperFoldStep[] = [];
  const creaseList: CreaseItem[] = [];
  let foldCounter = 0;
  const initialNodes = buildTreeLayout(n);

  function snapshotNodes(activeId: string | null): TreeNodeLayout[] {
    const printedIds = new Set<string>();
    // 当前已打印折痕对应的节点标记为 printed
    return initialNodes.map((node) => {
      let status: 'pending' | 'visiting' | 'printed' = 'pending';
      if (node.id === activeId) {
        status = 'visiting';
      } else if (printedIds.has(node.id)) {
        status = 'printed';
      }
      return { ...node, status };
    });
  }

  const currentNodes = snapshotNodes(null);

  // Step 0: Entry
  steps.push({
    currentLevel: 1,
    maxLevels: n,
    currentType: 'root',
    action: 'enter',
    creaseList: [],
    message: `算法启动：模拟纸条对折 ${n} 次。整个折痕体系等价于一棵深度为 ${n} 的满二叉树，根为凹，左凹右凸。准备启动中序遍历输出。`,
    log: `折纸算法启动: 折叠次数 N = ${n}, 总折痕数 = 2^${n} - 1 = ${Math.pow(2, n) - 1}`,
    codeLine: PAPER_FOLDING_CODE_LINES.entry,
    stageId: 'stage1',
    activeNodeId: '1',
    treeNodes: currentNodes,
    foldingLayer: 1,
  });

  function process(i: number, down: boolean, nodeId: string) {
    if (i > n) return;

    // Enter node
    const enterNodes = snapshotNodes(nodeId);
    steps.push({
      currentLevel: i,
      maxLevels: n,
      currentType: down ? 'down' : 'up',
      action: 'enter',
      creaseList: [...creaseList],
      message: `进入第 ${i} 层递归节点：折痕方向 [${down ? '凹 (Down)' : '凸 (Up)'}]。优先递归深入左子树（左子必为凹）...`,
      log: `深入第 ${i} 层节点 (${down ? '凹' : '凸'}), 探查左子树`,
      codeLine: PAPER_FOLDING_CODE_LINES.dfsLeft,
      stageId: 'stage1',
      activeNodeId: nodeId,
      treeNodes: enterNodes,
      foldingLayer: i,
    });

    process(i + 1, true, `${nodeId}-L`);

    // Print node
    foldCounter++;
    const currentCrease: CreaseItem = {
      id: foldCounter,
      type: down ? 'down' : 'up',
      text: down ? '凹' : '凸',
      level: i,
    };
    creaseList.push(currentCrease);

    const printNodes = initialNodes.map((node) => {
      const isPrinted = node.id === nodeId || creaseList.some((c) => c.level === node.level && (node.id.endsWith('-L') ? c.type === 'down' : c.type === 'up'));
      return {
        ...node,
        status: node.id === nodeId ? ('visiting' as const) : isPrinted ? ('printed' as const) : ('pending' as const),
      };
    });

    steps.push({
      currentLevel: i,
      maxLevels: n,
      currentType: down ? 'down' : 'up',
      action: 'print',
      creaseList: [...creaseList],
      message: `【中序打印】折痕 #${foldCounter}: 第 ${i} 层产生【${down ? '凹折痕' : '凸折痕'}】。当前从上到下序列新增折痕 [${down ? '凹' : '凸'}]。`,
      log: `输出折痕 #${foldCounter}: 层数=${i}, 方向=${down ? '凹' : '凸'}`,
      codeLine: PAPER_FOLDING_CODE_LINES.print,
      stageId: 'stage1',
      activeNodeId: nodeId,
      treeNodes: printNodes,
      foldingLayer: i,
    });

    process(i + 1, false, `${nodeId}-R`);

    steps.push({
      currentLevel: i,
      maxLevels: n,
      currentType: down ? 'down' : 'up',
      action: 'right_done',
      creaseList: [...creaseList],
      message: `第 ${i} 层节点 [${down ? '凹' : '凸'}] 的左右子树中序遍历均已完成，回溯至上一层递归。`,
      log: `第 ${i} 层节点回溯完成`,
      codeLine: PAPER_FOLDING_CODE_LINES.rightDone,
      stageId: 'stage1',
      activeNodeId: nodeId,
      treeNodes: printNodes,
      foldingLayer: i,
    });
  }

  process(1, true, '1');

  // Finish
  const finalNodes = initialNodes.map((node) => ({ ...node, status: 'printed' as const }));
  steps.push({
    currentLevel: n,
    maxLevels: n,
    currentType: 'root',
    action: 'finish',
    creaseList: [...creaseList],
    message: `🎉 对折 ${n} 次展开完成！纸条自上而下共 ${creaseList.length} 条折痕：[ ${creaseList.map((c) => c.text).join(' , ')} ]。中序遍历完美映射折痕几何！`,
    log: `折纸遍历终结: 总输出折痕 = ${creaseList.map((c) => c.text).join('')}`,
    codeLine: PAPER_FOLDING_CODE_LINES.finish,
    stageId: 'stage1',
    activeNodeId: null,
    treeNodes: finalNodes,
    foldingLayer: n,
  });

  return steps;
}

// ============================================================
// Stage 2 步骤生成器: 显式调用栈展开模拟 (Explicit Stack)
// ============================================================
export function buildPaperFoldingStage2Steps(n: number = 3): PaperFoldStep[] {
  const steps: PaperFoldStep[] = [];
  const creaseList: CreaseItem[] = [];
  let foldCounter = 0;
  const initialNodes = buildTreeLayout(n);

  interface Frame {
    i: number;
    down: boolean;
    state: number; // 0: enter/to left, 1: print/to right, 2: pop
    nodeId: string;
  }

  const toType = (d: boolean): 'down' | 'up' => (d ? 'down' : 'up');
  const stack: Frame[] = [{ i: 1, down: true, state: 0, nodeId: '1' }];

  steps.push({
    currentLevel: 1,
    maxLevels: n,
    currentType: 'root',
    action: 'enter',
    creaseList: [],
    message: `Stage 2 显式栈模拟启动：初始化根调用帧 Frame(level=1, down=true, state=0) 入栈，消除系统递归开销。`,
    log: `初始化显式中序遍历栈, 压入根节点 (1, 凹)`,
    codeLine: PAPER_FOLDING_STAGE2_LINES.entry,
    stageId: 'stage2',
    activeNodeId: '1',
    treeNodes: initialNodes,
    stackFrames: stack.map((f) => ({ level: f.i, type: toType(f.down), state: '0:探左' })),
    foldingLayer: 1,
  });

  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    if (cur.i > n) {
      stack.pop();
      continue;
    }

    if (cur.state === 0) {
      cur.state = 1;
      steps.push({
        currentLevel: cur.i,
        maxLevels: n,
        currentType: cur.down ? 'down' : 'up',
        action: 'enter',
        creaseList: [...creaseList],
        message: `栈顶探左：Frame(level=${cur.i}, ${cur.down ? '凹' : '凸'}) 准备探查左子树，压入左子节点 Frame(level=${cur.i + 1}, 凹)。`,
        log: `栈顶深入左子: level=${cur.i + 1}, type=凹`,
        codeLine: PAPER_FOLDING_STAGE2_LINES.pushLeft,
        stageId: 'stage2',
        activeNodeId: cur.nodeId,
        treeNodes: initialNodes,
        stackFrames: stack.map((f) => ({
          level: f.i,
          type: toType(f.down),
          state: f.state === 1 ? '1:待打印' : f.state === 2 ? '2:待探右' : '0:探左',
        })),
        foldingLayer: cur.i,
      });
      stack.push({ i: cur.i + 1, down: true, state: 0, nodeId: `${cur.nodeId}-L` });
    } else if (cur.state === 1) {
      cur.state = 2;
      foldCounter++;
      const currentCrease: CreaseItem = {
        id: foldCounter,
        type: cur.down ? 'down' : 'up',
        text: cur.down ? '凹' : '凸',
        level: cur.i,
      };
      creaseList.push(currentCrease);

      steps.push({
        currentLevel: cur.i,
        maxLevels: n,
        currentType: cur.down ? 'down' : 'up',
        action: 'print',
        creaseList: [...creaseList],
        message: `【栈帧中序打印】折痕 #${foldCounter}: 弹出准备打印，输出第 ${cur.i} 层【${cur.down ? '凹' : '凸'}】折痕。随后压入右子节点 Frame(level=${cur.i + 1}, 凸)。`,
        log: `栈输出折痕 #${foldCounter}: 层数=${cur.i}, 方向=${cur.down ? '凹' : '凸'}`,
        codeLine: PAPER_FOLDING_STAGE2_LINES.print,
        stageId: 'stage2',
        activeNodeId: cur.nodeId,
        treeNodes: initialNodes,
        stackFrames: stack.map((f) => ({
          level: f.i,
          type: toType(f.down),
          state: f.state === 1 ? '1:待打印' : f.state === 2 ? '2:待探右' : '0:探左',
        })),
        foldingLayer: cur.i,
      });

      steps.push({
        currentLevel: cur.i,
        maxLevels: n,
        currentType: cur.down ? 'down' : 'up',
        action: 'enter',
        creaseList: [...creaseList],
        message: `栈顶深入右子：压入 Frame(level=${cur.i + 1}, 凸)，继续驱动右子树中序遍历。`,
        log: `压入右子帧: level=${cur.i + 1}, 凸`,
        codeLine: PAPER_FOLDING_STAGE2_LINES.pushRight,
        stageId: 'stage2',
        activeNodeId: `${cur.nodeId}-R`,
        treeNodes: initialNodes,
        stackFrames: [
          ...stack.map((f) => ({
            level: f.i,
            type: toType(f.down),
            state: f.state === 1 ? '1:待打印' : f.state === 2 ? '2:待探右' : '0:探左',
          })),
          { level: cur.i + 1, type: 'up' as const, state: '0:探左' },
        ],
        foldingLayer: cur.i,
      });

      stack.push({ i: cur.i + 1, down: false, state: 0, nodeId: `${cur.nodeId}-R` });
    } else {
      const popped = stack.pop()!;
      steps.push({
        currentLevel: popped.i,
        maxLevels: n,
        currentType: popped.down ? 'down' : 'up',
        action: 'right_done',
        creaseList: [...creaseList],
        message: `栈帧回溯：Frame(level=${popped.i}, ${popped.down ? '凹' : '凸'}) 左右子树全部遍历完毕，栈帧正常出栈弹出。`,
        log: `弹出栈帧: level=${popped.i}`,
        codeLine: PAPER_FOLDING_STAGE2_LINES.pop,
        stageId: 'stage2',
        activeNodeId: popped.nodeId,
        treeNodes: initialNodes,
        stackFrames: stack.map((f) => ({
          level: f.i,
          type: toType(f.down),
          state: f.state === 1 ? '1:待打印' : f.state === 2 ? '2:待探右' : '0:探左',
        })),
        foldingLayer: popped.i,
      });
    }
  }

  // Finish
  steps.push({
    currentLevel: n,
    maxLevels: n,
    currentType: 'root',
    action: 'finish',
    creaseList: [...creaseList],
    message: `🎉 Stage 2 显式栈模拟完成！调用栈完全清空，共输出 ${creaseList.length} 条折痕，完美匹配数学预期。`,
    log: `显式栈模拟收敛完毕`,
    codeLine: PAPER_FOLDING_STAGE2_LINES.finish,
    stageId: 'stage2',
    activeNodeId: null,
    treeNodes: initialNodes.map((nd) => ({ ...nd, status: 'printed' as const })),
    stackFrames: [],
    foldingLayer: n,
  });

  return steps;
}

// ============================================================
// Stage 3 步骤生成器: 逐层物理裂变递推 (Layered Folding)
// ============================================================
export function buildPaperFoldingStage3Steps(n: number = 3): PaperFoldStep[] {
  const steps: PaperFoldStep[] = [];
  const creaseList: CreaseItem[] = [{ id: 1, type: 'down', text: '凹', level: 1 }];

  // Step 0: Layer 1
  steps.push({
    currentLevel: 1,
    maxLevels: n,
    currentType: 'root',
    action: 'enter',
    creaseList: [...creaseList],
    message: `物理折叠启动：第 1 次对折，整段纸条被压出 1 道折痕，方向必为【凹】。`,
    log: `第 1 折: [ 凹 ]`,
    codeLine: PAPER_FOLDING_STAGE3_LINES.entry,
    stageId: 'stage3',
    foldingLayer: 1,
  });

  for (let k = 2; k <= n; k++) {
    steps.push({
      currentLevel: k,
      maxLevels: n,
      currentType: 'root',
      action: 'enter',
      creaseList: [...creaseList],
      message: `纸条进行第 ${k} 次向上对折：物理上，上一轮的每一道折痕上方将压出【凹】，下方压出【凸】。折痕裂变开始！`,
      log: `开始第 ${k} 次物理折叠，旧折痕数=${creaseList.length}`,
      codeLine: PAPER_FOLDING_STAGE3_LINES.newLayer,
      stageId: 'stage3',
      foldingLayer: k,
    });

    const nextCreases: CreaseItem[] = [];
    let insertDown = true;
    let globalId = 1;

    for (let i = 0; i < creaseList.length; i++) {
      // 插入裂变折痕
      const spawnedType = insertDown ? 'down' : 'up';
      nextCreases.push({
        id: globalId++,
        type: spawnedType,
        text: spawnedType === 'down' ? '凹' : '凸',
        level: k,
      });
      insertDown = !insertDown;

      // 继承旧折痕
      const old = creaseList[i];
      nextCreases.push({
        id: globalId++,
        type: old.type,
        text: old.text,
        level: old.level,
      });
    }

    // 最后一个缝隙插入裂变折痕
    const lastSpawned = insertDown ? 'down' : 'up';
    nextCreases.push({
      id: globalId++,
      type: lastSpawned,
      text: lastSpawned === 'down' ? '凹' : '凸',
      level: k,
    });

    steps.push({
      currentLevel: k,
      maxLevels: n,
      currentType: 'down',
      action: 'print',
      creaseList: [...nextCreases],
      message: `第 ${k} 折裂变就绪：由旧序列 ${creaseList.length} 条折痕裂变为 ${nextCreases.length} 条新折痕。交替生成凹凸新折痕。`,
      log: `第 ${k} 折生成完成: 折痕数=${nextCreases.length}`,
      codeLine: PAPER_FOLDING_STAGE3_LINES.insertFold,
      stageId: 'stage3',
      foldingLayer: k,
    });

    creaseList.length = 0;
    creaseList.push(...nextCreases);

    steps.push({
      currentLevel: k,
      maxLevels: n,
      currentType: 'root',
      action: 'right_done',
      creaseList: [...creaseList],
      message: `第 ${k} 折物理展开完毕，当前序列自上而下：[ ${creaseList.map((c) => c.text).join(' ')} ]。`,
      log: `第 ${k} 折展开完成`,
      codeLine: PAPER_FOLDING_STAGE3_LINES.layerFinish,
      stageId: 'stage3',
      foldingLayer: k,
    });
  }

  // Finish
  steps.push({
    currentLevel: n,
    maxLevels: n,
    currentType: 'root',
    action: 'finish',
    creaseList: [...creaseList],
    message: `🎉 物理折叠 ${n} 次全部展开！从上到下共 ${creaseList.length} 条折痕，与满二叉树中序遍历结果 100% 吻合！`,
    log: `物理裂变终结: 结果序列=[${creaseList.map((c) => c.text).join('')}]`,
    codeLine: PAPER_FOLDING_STAGE3_LINES.finish,
    stageId: 'stage3',
    foldingLayer: n,
  });

  return steps;
}

// ============================================================
// Card 1: 纯净物理折纸与满二叉树同构沙盘 (Clean SVG Sandbox)
// 绝无内嵌标题、无子卡片套娃 (Anti-Traps 9 & 10)
// ============================================================
export function renderPaperFoldingCanvas(container: HTMLElement, step: PaperFoldStep) {
  const n = step.maxLevels || 3;
  const treeNodes = step.treeNodes || buildTreeLayout(n);
  const creases = step.creaseList || [];
  const svgWidth = 800;
  const svgHeight = 240;

  // 生成树连接线 (SVG lines)
  const linesHtml: string[] = [];
  const nodeMap = new Map<string, TreeNodeLayout>();
  treeNodes.forEach((node) => nodeMap.set(node.id, node));

  treeNodes.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      const isHighlighted = step.activeNodeId === node.id || step.activeNodeId === parent.id;
      linesHtml.push(`
        <line
          x1="${parent.x}"
          y1="${parent.y}"
          x2="${node.x}"
          y2="${node.y}"
          stroke="${isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}"
          stroke-width="${isHighlighted ? 2.5 : 1.5}"
          stroke-dasharray="${node.type === 'down' ? 'none' : '4 3'}"
        />
      `);
    }
  });

  // 生成树节点 (SVG circles and texts)
  const nodesHtml = treeNodes.map((node) => {
    const isVisiting = step.activeNodeId === node.id;
    const isPrinted = node.status === 'printed';
    const isDown = node.type === 'down' || node.type === 'root';
    const baseColor = isDown ? '#38bdf8' : '#fb7185';
    const fillColor = isVisiting ? baseColor : isPrinted ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.8)';
    const strokeColor = isVisiting ? '#ffffff' : isPrinted ? baseColor : 'rgba(148, 163, 184, 0.4)';
    const textColor = isVisiting ? '#0f172a' : '#f1f5f9';

    return `
      <g transform="translate(${node.x}, ${node.y})">
        ${isVisiting ? `<circle r="22" fill="none" stroke="${baseColor}" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="16"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${isVisiting ? 3 : 2}"
        />
        <text
          y="4"
          text-anchor="middle"
          fill="${textColor}"
          font-size="11"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${node.text.slice(0, 1)}</text>
        <text
          y="-22"
          text-anchor="middle"
          fill="${baseColor}"
          font-size="9"
          font-family="monospace"
        >${node.type === 'root' ? 'ROOT' : isDown ? '凹(L)' : '凸(R)'}</text>
      </g>
    `;
  }).join('');

  // 物理纸条折痕展开带展示 (Top -> Bottom 纵向纸条或横向展开带)
  const paperTapeHtml = creases.length === 0
    ? `<div style="color: #64748b; font-size: 0.82rem; font-style: italic; padding: 12px;">尚未产生折痕，启动中序遍历中...</div>`
    : creases.map((c, idx) => {
        const isDown = c.type === 'down';
        const isCurrent = idx === creases.length - 1 && (step.action === 'print' || step.action === 'enter');
        return `
          <div style="
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px 10px;
            margin: 2px 4px;
            background: ${isDown ? 'rgba(14, 165, 233, 0.15)' : 'rgba(244, 63, 94, 0.15)'};
            border: 1px solid ${isCurrent ? '#ffffff' : isDown ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 113, 133, 0.4)'};
            border-radius: 6px;
            box-shadow: ${isCurrent ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none'};
            transition: all 0.2s ease;
          ">
            <span style="font-size: 0.65rem; color: #94a3b8; font-family: monospace;">#${idx + 1}</span>
            <span style="font-size: 0.95rem; font-weight: bold; color: ${isDown ? '#38bdf8' : '#fb7185'};">${c.text}</span>
            <span style="font-size: 0.65rem; color: #64748b;">L${c.level}</span>
          </div>
        `;
      }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box;">
      
      <!-- 物理纸带空间展开展区 -->
      <div style="flex-shrink: 0; padding: 10px 14px; background: rgba(2, 6, 23, 0.55); border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.12);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.78rem; font-weight: 600; color: #cbd5e1;">纸条物理展开折痕序列 (Top ➔ Bottom)</span>
          <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">已产出: <strong style="color: #38bdf8;">${creases.length}</strong> / ${Math.pow(2, n) - 1}</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; max-height: 90px; overflow-y: auto; align-items: center;">
          ${paperTapeHtml}
        </div>
      </div>

      <!-- 满二叉树中序遍历同构沙盘 -->
      <div style="flex: 1; min-height: 200px; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); position: relative; overflow: hidden;">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; max-height: 260px;" preserveAspectRatio="xMidYMid meet">
          ${linesHtml.join('')}
          ${nodesHtml}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 折痕探针面板与中序数学同构规律 (Card 2 Custom Metrics)
// ============================================================
export function renderPaperFoldingCard2(container: HTMLElement, step: PaperFoldStep) {
  const creases = step.creaseList || [];
  const downCount = creases.filter((c) => c.type === 'down').length;
  const upCount = creases.filter((c) => c.type === 'up').length;
  const totalTarget = Math.pow(2, step.maxLevels || 3) - 1;
  const stackFrames = step.stackFrames || [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 三联核心数据看板 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">折叠层数 / 目标</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #f8fafc; font-family: monospace; margin-top: 2px;">
            N = ${step.maxLevels} <span style="font-size: 0.75rem; color: #64748b;">(${totalTarget} 条)</span>
          </div>
        </div>
        <div style="padding: 10px; background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #38bdf8;">凹折痕 (Down)</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #38bdf8; font-family: monospace; margin-top: 2px;">
            ${downCount} <span style="font-size: 0.72rem; color: #94a3b8;">(${totalTarget ? Math.round((downCount / totalTarget) * 100) : 0}%)</span>
          </div>
        </div>
        <div style="padding: 10px; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(251, 113, 133, 0.3); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #fb7185;">凸折痕 (Up)</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #fb7185; font-family: monospace; margin-top: 2px;">
            ${upCount} <span style="font-size: 0.72rem; color: #94a3b8;">(${totalTarget ? Math.round((upCount / totalTarget) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      <!-- 显式调用栈或当前遍历状态 -->
      ${
        stackFrames.length > 0
          ? `
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>显式调用栈帧 (Stack Frames)</span>
            <span style="font-size: 0.7rem; color: #94a3b8;">栈深: ${stackFrames.length}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${stackFrames
              .map(
                (f, idx) => `
              <div style="padding: 3px 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 4px; font-size: 0.72rem; font-family: monospace;">
                #${idx + 1}: L${f.level} [${f.type === 'down' ? '凹' : '凸'}] <span style="color: #38bdf8;">${f.state}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- 数学同构三大定则指示面板 -->
      <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #38bdf8;">满二叉树同构：</strong> 根节点为凹，对折产生的新折痕中，左孩子必为凹，右孩子必为凸。
        </div>
        <div style="padding: 8px 12px; background: rgba(251, 113, 133, 0.08); border-left: 3px solid #fb7185; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #fb7185;">中序遍历等价：</strong> 展开后从上至下的折痕出现顺序，严格对应二叉树左 ➔ 根 ➔ 右中序遍历。
        </div>
        <div style="padding: 8px 12px; background: rgba(52, 211, 153, 0.08); border-left: 3px solid #34d399; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #34d399;">O(N) 空间优化：</strong> 无需物理构建 2^N - 1 节点树，直接借助单路递归栈打印，空间降至 O(N)。
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const paperFolding040Visualizer = registerDeclarativeAlgorithm<PaperFoldStep>({
  id: 'paper-folding-040',
  name: '折纸问题 (Class 040)',
  category: 'tree',
  icon: '📄',
  difficulty: 2,
  levelOrder: 40,
  learningGoal: '理解折纸物理展开与满二叉树中序遍历的数学同构关系，掌握不建树利用递归栈完成 O(N) 空间求解的技巧',
  aliases: ['paper-folding', 'zuo-class-040', 'fold-paper-creases'],
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 经典中序递归栈 (In-order DFS)',
      shortName: '中序递归',
      card2Title: '折纸几何探针与中序同构面板',
      card2Desc: '二叉树中序遍历左凹右凸，不物理建树空间复杂度 O(N)',
      codeLanguages: PAPER_FOLDING_CODES,
      generateSteps: (inputs) => {
        const n = parseInt(inputs?.folds || '3', 10);
        return buildPaperFoldingSteps(n);
      },
    },
    {
      id: 'stage2',
      name: 'Stage 2: 显式调用栈模拟 (Explicit Stack)',
      shortName: '栈迭代',
      card2Title: '显式中序遍历栈帧分析',
      card2Desc: '模拟系统栈压栈展开与出栈回溯过程',
      codeLanguages: PAPER_FOLDING_STAGE2_CODES,
      generateSteps: (inputs) => {
        const n = parseInt(inputs?.folds || '3', 10);
        return buildPaperFoldingStage2Steps(n);
      },
    },
    {
      id: 'stage3',
      name: 'Stage 3: 逐层物理裂变递推 (Layered Folding)',
      shortName: '物理裂变',
      card2Title: '物理纸条逐层裂变面板',
      card2Desc: '直观展示每一次对折在旧折痕裂变生成凹凸的过程',
      codeLanguages: PAPER_FOLDING_STAGE3_CODES,
      generateSteps: (inputs) => {
        const n = parseInt(inputs?.folds || '3', 10);
        return buildPaperFoldingStage3Steps(n);
      },
    },
  ],
  codeLanguages: PAPER_FOLDING_CODES,
  inputs: [
    {
      id: 'folds',
      label: '对折次数 (N)',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '对折 2 次 (3 条折痕)', value: '2' },
        { label: '对折 3 次 (7 条折痕)', value: '3' },
        { label: '对折 4 次 (15 条折痕)', value: '4' },
      ],
    },
  ],
  card2Title: '折纸几何探针与中序同构面板',
  card2Desc: '二叉树中序遍历左凹右凸，不物理建树空间复杂度 O(N)',
  problemHtml: PAPER_FOLDING_040_PROBLEM_CONTENT.description + PAPER_FOLDING_040_PROBLEM_CONTENT.mathematicalAnalysis,
  renderCanvas: (container, step) => {
    renderPaperFoldingCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderPaperFoldingCard2(container, step);
  },
});
