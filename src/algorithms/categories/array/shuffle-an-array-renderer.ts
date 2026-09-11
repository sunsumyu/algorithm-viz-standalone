import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface ShuffleArrayStep extends StepBase {
  original: number[];
  current: number[];
  currentIndex: number; // i 游标
  randomIndex: number;  // 随机选取的 j 游标
  swapped: boolean;
  shuffledIndices: number[]; // 已归位/已固定的下标
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const SHUFFLE_CODES = {
  java: `public class Solution {
    private int[] original;
    private int[] array;
    private Random rand = new Random();

    public Solution(int[] nums) {
        original = nums.clone();
        array = nums;
    }

    public int[] reset() {
        array = original.clone();
        return array;
    }

    public int[] shuffle() {
        for (int i = array.length - 1; i > 0; i--) {
            int j = rand.nextInt(i + 1);
            int temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}`,
  cpp: `class Solution {
    vector<int> original;
    vector<int> array;
public:
    Solution(vector<int>& nums) : original(nums), array(nums) {}

    vector<int> reset() {
        array = original;
        return array;
    }

    vector<int> shuffle() {
        for (int i = array.size() - 1; i > 0; --i) {
            int j = rand() % (i + 1);
            swap(array[i], array[j]);
        }
        return array;
    }
};`,
  python: `class Solution:
    def __init__(self, nums: List[int]):
        self.original = list(nums)
        self.array = list(nums)

    def reset(self) -> List[int]:
        self.array = list(self.original)
        return self.array

    def shuffle(self) -> List[int]:
        for i in range(len(self.array) - 1, 0, -1):
            j = random.randint(0, i)
            self.array[i], self.array[j] = self.array[j], self.array[i]
        return self.array`,
  javascript: `class Solution {
    constructor(nums) {
        this.original = [...nums];
        this.array = [...nums];
    }
    reset() {
        this.array = [...this.original];
        return this.array;
    }
    shuffle() {
        for (let i = this.array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        }
        return this.array;
    }
}`
};

const CODE_LINES = {
  entry: { java: 16, cpp: 13, python: 10, javascript: 11 },
  loop: { java: 17, cpp: 14, python: 11, javascript: 12 },
  pickRand: { java: 18, cpp: 15, python: 12, javascript: 13 },
  swap: { java: 19, cpp: 16, python: 13, javascript: 14 },
  returnAns: { java: 23, cpp: 18, python: 14, javascript: 16 }
};

export function buildShuffleSteps(nums: number[], seedRandoms?: number[]): ShuffleArrayStep[] {
  const steps: ShuffleArrayStep[] = [];
  const original = [...nums];
  const current = [...nums];
  const n = current.length;

  // Step 0: 入口
  steps.push({
    original: [...original],
    current: [...current],
    currentIndex: -1,
    randomIndex: -1,
    swapped: false,
    shuffledIndices: [],
    decision: `主函数入口：初始序列 [${original.join(', ')}]，准备启动 Fisher-Yates 现代洗牌`,
    message: '算法从数组末尾向前遍历，确保每个元素被放置到各个位置的概率均为严格等概率 1/N',
    log: `enter shuffle(nums=[${original.join(',')}])`,
    codeLine: CODE_LINES.entry,
    metrics: { '数组长度': `${n}`, '未洗乱范围': `[0, ${n - 1}]`, '当前状态': '准备就绪' }
  });

  if (n <= 1) {
    steps.push({
      original: [...original],
      current: [...current],
      currentIndex: 0,
      randomIndex: 0,
      swapped: false,
      shuffledIndices: [0],
      decision: '数组长度 <= 1，洗牌结果即为原序列',
      message: '无需执行洗牌置乱',
      log: 'trivial shuffle, length <= 1',
      codeLine: CODE_LINES.returnAns,
      metrics: { '最终结果': `[${current.join(', ')}]` }
    });
    return steps;
  }

  const shuffled: number[] = [];
  let randPointer = 0;

  for (let i = n - 1; i > 0; i--) {
    // 决定随机数 j 在 [0, i]
    let j: number;
    if (seedRandoms && randPointer < seedRandoms.length) {
      j = seedRandoms[randPointer++] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }

    // Step A: 进入当前循环头
    steps.push({
      original: [...original],
      current: [...current],
      currentIndex: i,
      randomIndex: -1,
      swapped: false,
      shuffledIndices: [...shuffled],
      decision: `当前轮次考察下标 i = ${i}，需在区间 [0, ${i}] 中等概率抽取目标位置`,
      message: `区间 [0, ${i}] 共包含 ${i + 1} 个候选元素，被选概率均为 1/${i + 1}`,
      log: `loop i=${i}, range=[0, ${i}]`,
      codeLine: CODE_LINES.loop,
      metrics: { '当前游标 i': `${i}`, '候选区间': `[0, ${i}]`, '候选元素数': `${i + 1}` }
    });

    // Step B: 随机生成 j
    steps.push({
      original: [...original],
      current: [...current],
      currentIndex: i,
      randomIndex: j,
      swapped: false,
      shuffledIndices: [...shuffled],
      decision: `随机抽取抽取到下标 j = ${j} (对应值 ${current[j]})`,
      message: `准备将 array[${i}] (${current[i]}) 与 array[${j}] (${current[j]}) 交换`,
      log: `picked rand j=${j}, array[j]=${current[j]}`,
      codeLine: CODE_LINES.pickRand,
      metrics: { '抽中下标 j': `${j}`, '抽中数值': `${current[j]}`, '当前位置 i': `${i}` }
    });

    // Step C: 执行 swap 交换
    const temp = current[i];
    current[i] = current[j];
    current[j] = temp;
    shuffled.push(i);

    steps.push({
      original: [...original],
      current: [...current],
      currentIndex: i,
      randomIndex: j,
      swapped: true,
      shuffledIndices: [...shuffled],
      decision: `交换 array[${i}] 和 array[${j}] ➔ 下标 ${i} 位置锁定为值 ${current[i]}`,
      message: `下标 ${i} 已经完成置乱归位，后续轮次不再对其进行扰动`,
      log: `swapped i=${i} and j=${j}, array now: [${current.join(',')}]`,
      codeLine: CODE_LINES.swap,
      metrics: { '已洗乱固定': `[${shuffled.join(', ')}]`, '当前序列': `[${current.join(', ')}]` }
    });
  }

  // 最后一个元素 0 自动归位
  shuffled.push(0);

  // Step Done: 完成返回
  steps.push({
    original: [...original],
    current: [...current],
    currentIndex: -1,
    randomIndex: -1,
    swapped: false,
    shuffledIndices: [...shuffled],
    decision: `🎉 洗牌完成！生成等概率随机排列 [${current.join(', ')}]`,
    message: 'Knuth / Fisher-Yates 算法以 O(N) 时间复杂度、O(1) 额外空间完成严格等概率均匀置乱',
    log: `shuffle completed, result=[${current.join(',')}]`,
    codeLine: CODE_LINES.returnAns,
    metrics: { '洗牌结果': `[${current.join(', ')}]`, '原数组': `[${original.join(', ')}]`, '耗时': 'O(N)' }
  });

  return steps;
}

export function renderShuffleCanvas(container: HTMLElement, step: ShuffleArrayStep): void {
  const { original, current, currentIndex, randomIndex, shuffledIndices } = step;

  const itemsHtml = current.map((val, idx) => {
    const isCurrent = idx === currentIndex;
    const isRandom = idx === randomIndex;
    const isShuffled = shuffledIndices.includes(idx);

    let bg = 'rgba(30, 41, 59, 0.6)';
    let border = '1px solid rgba(255, 255, 255, 0.1)';
    let color = '#f8fafc';
    let label = `idx: ${idx}`;
    let shadow = 'none';

    if (isCurrent && isRandom) {
      bg = 'rgba(234, 179, 8, 0.25)';
      border = '2px solid #eab308';
      color = '#fde047';
      label = `i=j: ${idx}`;
      shadow = '0 0 16px rgba(234, 179, 8, 0.4)';
    } else if (isCurrent) {
      bg = 'rgba(56, 189, 248, 0.25)';
      border = '2px solid #38bdf8';
      color = '#38bdf8';
      label = `游标 i: ${idx}`;
      shadow = '0 0 16px rgba(56, 189, 248, 0.4)';
    } else if (isRandom) {
      bg = 'rgba(244, 114, 182, 0.25)';
      border = '2px dashed #f472b6';
      color = '#f472b6';
      label = `随机 j: ${idx}`;
      shadow = '0 0 16px rgba(244, 114, 182, 0.4)';
    } else if (isShuffled) {
      bg = 'rgba(52, 211, 153, 0.18)';
      border = '1px solid #34d399';
      color = '#34d399';
      label = '已置乱锁定';
    }

    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <div style="
          width: 58px;
          height: 64px;
          border-radius: 10px;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.35rem;
          color: ${color};
          box-shadow: ${shadow};
          transition: all 0.2s ease;
        ">
          ${val}
        </div>
        <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">${label}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 状态与图例 -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#38bdf8;">
            <span style="width:10px; height:10px; border-radius:3px; background:#38bdf8; display:inline-block;"></span> 当前游标 i (待填入)
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#f472b6;">
            <span style="width:10px; height:10px; border-radius:3px; background:#f472b6; display:inline-block;"></span> 随机抽中 j (从 [0, i])
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#34d399;">
            <span style="width:10px; height:10px; border-radius:3px; background:#34d399; display:inline-block;"></span> 已置乱锁定区
          </span>
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8;">
          原数组: <code style="color: #cbd5e1;">[${original.join(', ')}]</code>
        </div>
      </div>

      <!-- 核心数组视觉卡片 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
      ">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; align-items: center;">
          ${itemsHtml}
        </div>

        <!-- 随机发生器指示卡 -->
        <div style="
          padding: 12px 20px;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          display: flex;
          gap: 20px;
          align-items: center;
          font-size: 0.88rem;
        ">
          <div>🎲 <b>随机选择</b>: ${randomIndex >= 0 ? `j = <span style="color:#f472b6; font-weight:700;">${randomIndex}</span> (数值 ${current[randomIndex]})` : '<span style="color:#64748b;">等待生成</span>'}</div>
          <div style="color: rgba(255,255,255,0.2);">|</div>
          <div>🔄 <b>区间范围</b>: ${currentIndex > 0 ? `[0, ${currentIndex}]` : '全域已锁定'}</div>
        </div>

        <!-- 数学均匀性提示 -->
        <div style="
          max-width: 600px;
          padding: 10px 16px;
          background: rgba(30, 41, 59, 0.4);
          border-radius: 8px;
          border-left: 3px solid #34d399;
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.5;
          text-align: center;
        ">
          Fisher-Yates 算法关键：第 i 步从前 i+1 个位置中挑一个与第 i 个交换。总排列数 N! 种，每种被选概率严格相等且为 1/N!。
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'shuffle-an-array',
  name: '打乱数组',
  category: 'array',
  learningGoal: '理解现代 Fisher-Yates (Knuth) 洗牌算法在 O(N) 复杂度下实现真等概率随机置乱的数学原理',
  inputs: [
    {
      id: 'nums',
      label: '输入数组',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6',
      placeholder: '逗号分隔数字，如 1, 2, 3, 4, 5, 6'
    }
  ],
  codeLanguages: SHUFFLE_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '1, 2, 3, 4, 5, 6');
    const nums = raw.split(/[,，\s]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
    return buildShuffleSteps(nums.length ? nums : [1, 2, 3, 4, 5, 6]);
  },
  renderCanvas: (container, step) => {
    renderShuffleCanvas(container, step as ShuffleArrayStep);
  }
});
