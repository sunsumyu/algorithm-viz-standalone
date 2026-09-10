/**
 * Class 033: 位图 BitMap 的实现与海量数据去重 (BitMap Design)
 * 左程云算法通关课入门篇 Class 033
 * 核心原语：利用 int/long 整数的每一位 bit 映射数字，空间压缩 32~64 倍，常数级位运算存取
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
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

  const lines = {
    init: 6,
    add: 11,
    remove: 16,
    contains: 21,
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

export function renderBitMapCanvas(container: HTMLElement, step: BitMapStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前操作目标</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.operation.toUpperCase()}( ${step.targetNum} )
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">定位参数 (Bucket & Offset)</div>
          <div style="font-size: 18px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            桶索引: [${step.bucketIndex}] · 偏移位: [${step.bitOffset}]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">位运算解析方程</div>
          <div style="font-size: 13px; font-family: monospace; color: #34d399; margin-top: 6px;">
            ${
              step.operation === 'add'
                ? `bits[${step.bucketIndex}] |= (1 << ${step.bitOffset})`
                : step.operation === 'remove'
                ? `bits[${step.bucketIndex}] &= ~(1 << ${step.bitOffset})`
                : step.operation === 'contains'
                ? `((bits[${step.bucketIndex}] >> ${step.bitOffset}) & 1) == ${step.queryResult ? '1 (存在)' : '0 (无)'}`
                : '初始化待命'
            }
          </div>
        </div>
      </div>

      <!-- 32位整型桶像素化展示沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          BitMap 内存状态 (每个色块代表 1 个 bit，绿色代表被置为 1)
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${step.buckets.map((bVal, bIdx) => {
            const isCurrentBucket = bIdx === step.bucketIndex;
            return `
              <div style="background: rgba(30, 41, 59, 0.5); padding: 10px; border-radius: 6px; border: ${isCurrentBucket ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)'};">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                  <span style="color: ${isCurrentBucket ? '#38bdf8' : '#94a3b8'}; font-weight: 600;">
                    int 桶 [${bIdx}] (存储范围: ${bIdx * 32} ~ ${bIdx * 32 + 31})
                  </span>
                  <span style="font-family: monospace; color: #64748b;">十进制数值: ${bVal}</span>
                </div>

                <!-- 32 个 bit 排列 -->
                <div style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px;">
                  ${Array.from({ length: 32 }, (_, bit) => {
                    const isSet = ((bVal >> bit) & 1) === 1;
                    const isTargetBit = isCurrentBucket && bit === step.bitOffset;
                    const numRepresented = bIdx * 32 + bit;
                    return `
                      <div title="数字: ${numRepresented} (第 ${bit} 位)" style="
                        height: 28px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: ${isSet ? '#059669' : '#1e293b'};
                        color: ${isSet ? '#fff' : '#64748b'};
                        border-radius: 4px;
                        font-size: 10px;
                        font-family: monospace;
                        border: ${isTargetBit ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)'};
                        box-shadow: ${isTargetBit ? '0 0 8px #fbbf24' : 'none'};
                      ">
                        <span>${isSet ? '1' : '0'}</span>
                        <span style="font-size: 8px; opacity: 0.7;">#${bit}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '位图 (BitMap) 极限定理',
        '任何一个非负整数 num：num / 32 即 num >> 5 可唯一定位所属的整型桶；num % 32 即 num & 31 可唯一定位桶内的 bit 偏移。存储 40 亿个数字只需要 500MB 内存，常用于海量日志去重与布隆过滤器底层实现！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const bitmapDesign033Visualizer = registerDeclarativeAlgorithm<BitMapStep>({
  id: 'bitmap-design-033',
  name: 'Class 033: 位图 BitMap 的实现与海量数据去重 (BitMap Design)',
  category: 'bit-manipulation',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 33,
  learningGoal: '掌握经典位图 (BitMap) 的底层位运算设计与桶偏移定位原理，理解海量数据去重的空间压缩本质',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 033)</h3>
      <p>设计实现经典位图结构 (BitMap)，支持海量数字高效去重与状态标记：</p>
      <ul>
        <li><code>add(int num)</code>：将数字加入位图，对应 bit 置 1。</li>
        <li><code>remove(int num)</code>：将数字从位图移除，对应 bit 置 0。</li>
        <li><code>contains(int num)</code>：查询数字是否在位图中。</li>
        <li><strong>核心价值</strong>：传统数组存一个数字需 4 字节 (32 bit)，位图存一个数字仅需 1 bit，实现 32 倍空间极大压缩。</li>
      </ul>
    </div>
  `,
  codeLanguages: BITMAP_033_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设操作序列',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准序列 (添加3, 17, 35; 查询与删除)', value: 'standard' },
        { label: '跨桶边界序列 (测试 0, 31, 32, 63 等边缘)', value: 'boundary' },
      ],
    },
  ],
  generateSteps: (input) => {
    const scenario = input.scenario || 'standard';
    let ops: BitMapOp[] = [];
    if (scenario === 'boundary') {
      ops = [
        { type: 'add', num: 0 },
        { type: 'add', num: 31 },
        { type: 'add', num: 32 },
        { type: 'add', num: 63 },
        { type: 'contains', num: 31 },
        { type: 'contains', num: 32 },
        { type: 'remove', num: 31 },
        { type: 'contains', num: 31 },
      ];
    } else {
      ops = [
        { type: 'add', num: 3 },
        { type: 'add', num: 17 },
        { type: 'add', num: 35 },
        { type: 'contains', num: 17 },
        { type: 'remove', num: 17 },
        { type: 'contains', num: 17 },
        { type: 'add', num: 60 },
      ];
    }
    return generateBitMapSteps(63, ops);
  },
  renderCanvas: (container, step) => {
    renderBitMapCanvas(container, step);
  },
});
