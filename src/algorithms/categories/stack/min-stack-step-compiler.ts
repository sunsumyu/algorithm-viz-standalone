import { StepBase } from '../../../core/step-visualizer';

export interface MinStackStep extends StepBase {
  op: string;
  val?: number;
  dataStack: number[];
  minStack: number[];
  currentMin: number | null;
  returnedVal?: number;
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const MIN_STACK_CODES = {
  java: `public class MinStack {
    private Deque<Integer> dataStack = new ArrayDeque<>();
    private Deque<Integer> minStack = new ArrayDeque<>();

    public void push(int val) {
        dataStack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) {
            minStack.push(val);
        } else {
            minStack.push(minStack.peek());
        }
    }

    public void pop() {
        dataStack.pop();
        minStack.pop();
    }

    public int top() {
        return dataStack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }
}`,
  cpp: `class MinStack {
    stack<int> dataStack;
    stack<int> minStack;
public:
    void push(int val) {
        dataStack.push(val);
        if (minStack.empty() || val <= minStack.top()) {
            minStack.push(val);
        } else {
            minStack.push(minStack.top());
        }
    }

    void pop() {
        dataStack.pop();
        minStack.pop();
    }

    int top() {
        return dataStack.top();
    }

    int getMin() {
        return minStack.top();
    }
};`,
  python: `class MinStack:
    def __init__(self):
        self.data_stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.data_stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self) -> None:
        self.data_stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.data_stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]`,
  javascript: `class MinStack {
    constructor() {
        this.dataStack = [];
        this.minStack = [];
    }
    push(val) {
        this.dataStack.push(val);
        if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
            this.minStack.push(val);
        } else {
            this.minStack.push(this.minStack[this.minStack.length - 1]);
        }
    }
    pop() {
        this.dataStack.pop();
        this.minStack.pop();
    }
    top() {
        return this.dataStack[this.dataStack.length - 1];
    }
    getMin() {
        return this.minStack[this.minStack.length - 1];
    }
}`
};

export const CODE_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  pushEntry: { java: 5, cpp: 5, python: 6, javascript: 7 },
  pushData: { java: 6, cpp: 6, python: 7, javascript: 8 },
  pushMin: { java: 8, cpp: 8, python: 9, javascript: 10 },
  popEntry: { java: 14, cpp: 14, python: 13, javascript: 14 },
  popDo: { java: 15, cpp: 15, python: 14, javascript: 15 },
  top: { java: 20, cpp: 20, python: 18, javascript: 19 },
  getMin: { java: 24, cpp: 24, python: 21, javascript: 22 }
};

export function buildMinStackSteps(commands: string[]): MinStackStep[] {
  const steps: MinStackStep[] = [];
  const dataStack: number[] = [];
  const minStack: number[] = [];

  // Step 0: 初始化
  steps.push({
    op: 'init',
    dataStack: [],
    minStack: [],
    currentMin: null,
    decision: '初始化最小栈：创建主数据栈 dataStack 与辅助最小栈 minStack',
    message: '两栈保持高度同步，辅助栈的栈顶始终映射当前数据栈所有元素的全局最小值',
    log: 'init MinStack()',
    codeLine: CODE_LINES.entry,
    metrics: { '数据栈容量': '0', '最小栈容量': '0', '当前最小值': 'null' }
  });

  for (const cmd of commands) {
    const trimmed = cmd.trim();
    if (trimmed.startsWith('push')) {
      const match = trimmed.match(/push\(([-]?\d+)\)/);
      const val = match ? Number(match[1]) : 0;

      // 1. push 开始
      steps.push({
        op: `push(${val})`,
        val,
        dataStack: [...dataStack],
        minStack: [...minStack],
        currentMin: minStack.length > 0 ? minStack[minStack.length - 1] : null,
        decision: `执行 push(${val}) 操作`,
        message: `准备将数值 ${val} 分别压入数据栈与同步辅助栈`,
        log: `calling push(${val})`,
        codeLine: CODE_LINES.pushEntry,
        metrics: { '操作': `push(${val})`, '待入栈值': `${val}` }
      });

      // 2. dataStack push
      dataStack.push(val);
      steps.push({
        op: `push(${val})`,
        val,
        dataStack: [...dataStack],
        minStack: [...minStack],
        currentMin: minStack.length > 0 ? minStack[minStack.length - 1] : null,
        decision: `主数据栈压入: dataStack.push(${val})`,
        message: `数据栈当前元素: [${dataStack.join(', ')}]`,
        log: `dataStack pushed ${val}`,
        codeLine: CODE_LINES.pushData,
        metrics: { '数据栈栈顶': `${val}`, '操作': '压入主栈' }
      });

      // 3. minStack push
      const currentMinTop = minStack.length > 0 ? minStack[minStack.length - 1] : Infinity;
      const newMin = Math.min(val, currentMinTop);
      minStack.push(newMin);

      steps.push({
        op: `push(${val})`,
        val,
        dataStack: [...dataStack],
        minStack: [...minStack],
        currentMin: newMin,
        decision: `辅助最小栈同步压入 min(${val}, ${currentMinTop === Infinity ? '无' : currentMinTop}) = ${newMin}`,
        message: `辅助栈记录当前高度下的历史最小值：${newMin}`,
        log: `minStack pushed ${newMin}`,
        codeLine: CODE_LINES.pushMin,
        metrics: { '最新最小值': `${newMin}`, '当前状态': '压栈完毕' }
      });
    } else if (trimmed === 'pop()') {
      if (dataStack.length > 0) {
        steps.push({
          op: 'pop()',
          dataStack: [...dataStack],
          minStack: [...minStack],
          currentMin: minStack[minStack.length - 1],
          decision: '执行 pop() 出栈操作',
          message: '主栈与辅助栈同时弹出顶部元素，同步回退状态',
          log: 'calling pop()',
          codeLine: CODE_LINES.popEntry,
          metrics: { '操作': 'pop()', '待弹出': `${dataStack[dataStack.length - 1]}` }
        });

        const poppedVal = dataStack.pop()!;
        minStack.pop();
        const curMin = minStack.length > 0 ? minStack[minStack.length - 1] : null;

        steps.push({
          op: 'pop()',
          dataStack: [...dataStack],
          minStack: [...minStack],
          currentMin: curMin,
          decision: `弹出元素 ${poppedVal}，当前最小值恢复为 ${curMin ?? '空'}`,
          message: `O(1) 完成出栈，辅助栈同步维护历史极值`,
          log: `popped ${poppedVal}, current min = ${curMin}`,
          codeLine: CODE_LINES.popDo,
          metrics: { '已弹出': `${poppedVal}`, '当前最小值': `${curMin ?? '无'}` }
        });
      }
    } else if (trimmed === 'top()') {
      const topVal = dataStack.length > 0 ? dataStack[dataStack.length - 1] : null;
      steps.push({
        op: 'top()',
        dataStack: [...dataStack],
        minStack: [...minStack],
        currentMin: minStack.length > 0 ? minStack[minStack.length - 1] : null,
        returnedVal: topVal ?? undefined,
        decision: `查看栈顶: top() ➔ 返回 ${topVal}`,
        message: '常数时间 O(1) 读取主数据栈栈顶',
        log: `top() returned ${topVal}`,
        codeLine: CODE_LINES.top,
        metrics: { '栈顶 top': `${topVal}`, '复杂度': 'O(1)' }
      });
    } else if (trimmed === 'getMin()') {
      const minVal = minStack.length > 0 ? minStack[minStack.length - 1] : null;
      steps.push({
        op: 'getMin()',
        dataStack: [...dataStack],
        minStack: [...minStack],
        currentMin: minVal,
        returnedVal: minVal ?? undefined,
        decision: `🎯 查询全局最小值: getMin() ➔ 返回 ${minVal}`,
        message: '常数时间 O(1) 直接读取辅助最小栈栈顶',
        log: `getMin() returned ${minVal}`,
        codeLine: CODE_LINES.getMin,
        metrics: { '全局最小值': `${minVal}`, '复杂度': 'O(1)' }
      });
    }
  }

  return steps;
}
