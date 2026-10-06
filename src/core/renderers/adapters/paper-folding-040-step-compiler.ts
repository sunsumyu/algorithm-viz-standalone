/**
 * Paper Folding (Class 040) Step Compiler
 * 折纸问题：满二叉树中序遍历同构、显式调用栈模拟与逐层物理裂变推演
 * 深模块核心编译器 (Deep Module)
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  PAPER_FOLDING_CODE_LINES,
  PAPER_FOLDING_STAGE2_LINES,
  PAPER_FOLDING_STAGE3_LINES,
} from '../../../algorithms/categories/tree/paper-folding-040-stage-codes';

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
export function buildTreeLayout(n: number): TreeNodeLayout[] {
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
