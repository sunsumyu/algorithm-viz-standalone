/**
 * Class 041: 手动实现加强堆 (Heap Greater)
 * 反向索引表 (Index Map) 与 O(log N) 动态修改/删除
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { HEAP_039_042_PROBLEMS } from './heap-039-042-problem-content';
import { HEAP_GREATER_041_CODES, HEAP_GREATER_041_LINES } from './heap-039-042-stage-codes';
import { Heap039Step, renderHeapGreaterBoard } from './heap-039-042-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface HeapGreater041Step extends Heap039Step {
  heapArray: { name: string; val: number }[];
  indexMap: Record<string, number>;
  modifiedObj: string | null;
  operation: string;
}

export function buildHeapGreater041Steps(): HeapGreater041Step[] {
  const steps: HeapGreater041Step[] = [];
  const lines = HEAP_GREATER_041_LINES;

  const initialHeap = [
    { name: 'User_A', val: 50 },
    { name: 'User_B', val: 30 },
    { name: 'User_C', val: 20 },
  ];
  const initialMap = { User_A: 0, User_B: 1, User_C: 2 };

  // Step 0: 入口帧
  steps.push({
    heapArray: initialHeap,
    indexMap: initialMap,
    modifiedObj: null,
    operation: '加强堆结构就绪',
    decision: `主函数入口：初始化包含反向索引表 (Index Map) 的加强堆`,
    message: `当前大根堆包含 3 个对象，反向索引表记录每个对象的物理下标：A->0, B->1, C->2`,
    log: `enter heapGreater: 3 elements registered in indexMap`,
    codeLine: lines.entryResign,
    metrics: { '元素数': 3, '反向映射': '严格双向同步' },
  });

  // Step 1: 动态修改 User_C 的权值：从 20 暴增至 99
  steps.push({
    heapArray: [
      { name: 'User_A', val: 50 },
      { name: 'User_B', val: 30 },
      { name: 'User_C', val: 99 },
    ],
    indexMap: initialMap,
    modifiedObj: 'User_C',
    operation: '动态修改 User_C 权值为 99',
    decision: `外部业务动态修改 User_C.val = 99，调用 resign(User_C)`,
    message: `传统堆此时无能为力，加强堆通过 indexMap.get('User_C') 在 O(1) 内查出其下标为 2`,
    log: `resign called for User_C, found index = 2 via indexMap`,
    codeLine: lines.findMapIndex,
    statusBadge: { text: 'O(1) 索引命中', type: 'info' },
    metrics: { '目标对象': 'User_C', '物理下标': 2 },
  });

  // Step 2: 触发 heapInsert 向上跃升成为新堆顶
  const heapAfterResign = [
    { name: 'User_C', val: 99 },
    { name: 'User_B', val: 30 },
    { name: 'User_A', val: 50 },
  ];
  const mapAfterResign = { User_C: 0, User_B: 1, User_A: 2 };

  steps.push({
    heapArray: heapAfterResign,
    indexMap: mapAfterResign,
    modifiedObj: 'User_C',
    operation: '上浮调整并在反向表中同步换位',
    decision: `heapInsert(2)：User_C(99) 大于父节点 User_A(50)，两者交换，反向表同步更新 A->2, C->0！`,
    message: `仅耗时 O(log N) 即可精准调整内部对象，无需遍历全堆！`,
    log: `heapInsert completed: User_C ascended to root, indexMap updated`,
    codeLine: lines.callInsert,
    statusBadge: { text: 'O(log N) 重排成功', type: 'success' },
    metrics: { '新堆顶': 'User_C (99)', '耗时': 'O(log N)' },
  });

  // Step 3: 演示 remove(User_B) 任意删除非堆顶元素
  steps.push({
    heapArray: [
      { name: 'User_C', val: 99 },
      { name: 'User_A', val: 50 },
    ],
    indexMap: { User_C: 0, User_A: 1 },
    modifiedObj: 'User_B',
    operation: '任意删除 remove(User_B)',
    decision: `调用 remove(User_B)：查得下标 1，与堆末尾 User_A 交换，删除 User_B 并对新节点 1 执行 resign`,
    message: `加强堆以 O(log N) 实现了传统堆无法做到的任意指定元素删除！`,
    log: `remove(User_B) completed in O(log N)`,
    codeLine: lines.swapReplace,
    statusBadge: { text: '任意删除成功', type: 'success' },
    metrics: { '剩余元素': 2, '删除耗时': 'O(log N)' },
  });

  return steps;
}

export const heapGreater041Visualizer = registerDeclarativeAlgorithm<HeapGreater041Step>({
  id: 'heap-greater-041',
  name: '手动实现加强堆 (Class 041)',
  category: 'tree',
  difficulty: 'hard',
  problemContent: HEAP_039_042_PROBLEMS.heapGreater041,
  sourceCodes: HEAP_GREATER_041_CODES,
  generateSteps: buildHeapGreater041Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderHeapGreaterBoard(
          step.heapArray,
          step.indexMap,
          step.modifiedObj,
          step.operation
        )}
        ${renderFormulaCard(
          '加强堆反向索引表同步定理',
          '\\forall i, \\; \\text{indexMap}[\\text{heap}[i]] = i',
          '通过在底层每次发生 swap 交换时强制双向更新反向索引表，保证能在 $O(1)$ 常数时间检索任意已知对象的当前堆位置，实现严格 $O(\\log N)$ 的 `resign` 与 `remove`。'
        )}
      </div>
    `;
  },
});
