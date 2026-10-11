/**
 * Class 033: 位图 BitMap 的实现与海量数据去重 (BitMap Design) - 步进编译器
 * 左程云算法通关课入门篇 Class 033
 */

import { StepBase } from '../../../core/step-visualizer';

export interface BitMapStep extends StepBase {
  stepIndex?: number;
  operation: 'init' | 'add' | 'remove' | 'contains';
  targetNum: number;
  bucketIndex: number;
  bitOffset: number;
  buckets: number[]; // 每个 int 桶的当前值
  queryResult?: boolean;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BITMAP_033_CODES = {
  java: `public class BitMap {
    private int[] bits;

    public BitMap(int max) {
        // 计算需要多少个 32 位整型桶：(max + 32) >> 5
        bits = new int[(max + 32) >> 5];
    }

    public void add(int num) {
        // num >> 5 决定属于哪个 int 桶，num & 31 决定第几位
        bits[num >> 5] |= (1 << (num & 31));
    }

    public void remove(int num) {
        // 取反掩码后进行与操作将对应位置为 0
        bits[num >> 5] &= ~(1 << (num & 31));
    }

    public boolean contains(int num) {
        // 右移后判断最低位是否为 1
        return ((bits[num >> 5] >> (num & 31)) & 1) == 1;
    }
}`,
  cpp: `class BitMap {
private:
    vector<int> bits;
public:
    BitMap(int maxVal) {
        bits.resize((maxVal + 32) >> 5, 0);
    }

    void add(int num) {
        bits[num >> 5] |= (1 << (num & 31));
    }

    void remove(int num) {
        bits[num >> 5] &= ~(1 << (num & 31));
    }

    bool contains(int num) {
        return ((bits[num >> 5] >> (num & 31)) & 1) == 1;
    }
};`,
  python: `class BitMap:
    def __init__(self, max_val: int):
        self.bits = [0] * ((max_val + 32) >> 5)

    def add(self, num: int):
        self.bits[num >> 5] |= (1 << (num & 31))

    def remove(self, num: int):
        self.bits[num >> 5] &= ~(1 << (num & 31))

    def contains(self, num: int) -> bool:
        return ((self.bits[num >> 5] >> (num & 31)) & 1) == 1`,
  typescript: `class BitMap {
    private bits: number[];
    constructor(maxVal: number) {
        this.bits = new Array((maxVal + 32) >> 5).fill(0);
    }
    add(num: number): void {
        this.bits[num >> 5] |= (1 << (num & 31));
    }
    remove(num: number): void {
        this.bits[num >> 5] &= ~(1 << (num & 31));
    }
    contains(num: number): boolean {
        return ((this.bits[num >> 5] >> (num & 31)) & 1) === 1;
    }
}`
};

export interface BitMapOp {
  type: 'add' | 'remove' | 'contains';
  num: number;
}

export function generateBitMapSteps(maxVal: number = 63, ops: BitMapOp[]): BitMapStep[] {
  const steps: BitMapStep[] = [];
  const bucketCount = (maxVal + 32) >> 5;
  const buckets = new Array(bucketCount).fill(0);

  const lines: Record<string, Record<string, number>> = {
    init: { java: 6, cpp: 6, python: 3, typescript: 4, javascript: 4 },
    add: { java: 11, cpp: 10, python: 6, typescript: 7, javascript: 7 },
    remove: { java: 16, cpp: 14, python: 9, typescript: 10, javascript: 10 },
    contains: { java: 21, cpp: 18, python: 12, typescript: 13, javascript: 13 },
  };

  // Step 0: 初始化
  steps.push({
    operation: 'init',
    targetNum: 0,
    bucketIndex: 0,
    bitOffset: 0,
    buckets: [...buckets],
    decision: `BitMap 初始化：最大上限 ${maxVal}，分配 ${bucketCount} 个 32位整型桶`,
    message: `使用 ${bucketCount} 个 int 即可表示 0~${maxVal} 的所有数字，空间占用仅为传统数组的 1/32！`,
    log: `Init BitMap with ${bucketCount} buckets for max ${maxVal}`,
    codeLine: lines.init,
    statusBadge: { text: '初始化', type: 'info' },
  });

  for (const op of ops) {
    const bIdx = op.num >> 5;
    const bitOffset = op.num & 31;

    if (op.type === 'add') {
      buckets[bIdx] |= (1 << bitOffset);
      steps.push({
        operation: 'add',
        targetNum: op.num,
        bucketIndex: bIdx,
        bitOffset: bitOffset,
        buckets: [...buckets],
        decision: `添加数字 ${op.num} ➔ bits[${bIdx}] |= (1 << ${bitOffset})`,
        message: `数字 ${op.num} 定位：属于桶 bits[${bIdx}] 的第 ${bitOffset} 位，通过按位或置 1`,
        log: `add(${op.num}): bucket=${bIdx}, bit=${bitOffset}, val=${buckets[bIdx]}`,
        codeLine: lines.add,
        statusBadge: { text: '添加元素', type: 'success' },
      });
    } else if (op.type === 'remove') {
      buckets[bIdx] &= ~(1 << bitOffset);
      steps.push({
        operation: 'remove',
        targetNum: op.num,
        bucketIndex: bIdx,
        bitOffset: bitOffset,
        buckets: [...buckets],
        decision: `删除数字 ${op.num} ➔ bits[${bIdx}] &= ~(1 << ${bitOffset})`,
        message: `数字 ${op.num} 抹除：构造取反掩码，通过按位与将其置 0`,
        log: `remove(${op.num}): bucket=${bIdx}, bit=${bitOffset}, val=${buckets[bIdx]}`,
        codeLine: lines.remove,
        statusBadge: { text: '删除元素', type: 'danger' },
      });
    } else if (op.type === 'contains') {
      const exists = ((buckets[bIdx] >> bitOffset) & 1) === 1;
      steps.push({
        operation: 'contains',
        targetNum: op.num,
        bucketIndex: bIdx,
        bitOffset: bitOffset,
        buckets: [...buckets],
        queryResult: exists,
        decision: `查询数字 ${op.num} 是否存在 ➔ 结果: ${exists ? '存在 (TRUE)' : '不存在 (FALSE)'}`,
        message: `检查 bits[${bIdx}] 的第 ${bitOffset} 位：((val >> ${bitOffset}) & 1) == ${exists ? 1 : 0}`,
        log: `contains(${op.num}) -> ${exists}`,
        codeLine: lines.contains,
        statusBadge: { text: exists ? '命中存在' : '未命中', type: exists ? 'success' : 'warning' },
      });
    }
  }

  return steps;
}
