import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface VerifyPreorderBstStep extends StepBase {
  preorder: number[];
  currentIndex: number;
  stack: number[];
  lowerBound: number;
  isValidSoFar: boolean;
  poppedValues: number[];
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const VERIFY_PREORDER_BST_CODES = {
  java: `public class Solution {
    public boolean verifyPreorder(int[] preorder) {
        Deque<Integer> stack = new ArrayDeque<>();
        int lowerBound = Integer.MIN_VALUE;
        for (int val : preorder) {
            if (val < lowerBound) return false;
            while (!stack.isEmpty() && val > stack.peek()) {
                lowerBound = stack.pop();
            }
            stack.push(val);
        }
        return true;
    }
}`,
  cpp: `class Solution {
public:
    bool verifyPreorder(vector<int>& preorder) {
        stack<int> stk;
        int lowerBound = INT_MIN;
        for (int val : preorder) {
            if (val < lowerBound) return false;
            while (!stk.empty() && val > stk.top()) {
                lowerBound = stk.top();
                stk.pop();
            }
            stk.push(val);
        }
        return true;
    }
};`,
  python: `class Solution:
    def verifyPreorder(self, preorder: List[int]) -> bool:
        stack = []
        lower_bound = float('-inf')
        for val in preorder:
            if val < lower_bound:
                return False
            while stack and val > stack[-1]:
                lower_bound = stack.pop()
            stack.append(val)
        return True`,
  javascript: `function verifyPreorder(preorder) {
    const stack = [];
    let lowerBound = -Infinity;
    for (const val of preorder) {
        if (val < lowerBound) return false;
        while (stack.length > 0 && val > stack[stack.length - 1]) {
            lowerBound = stack.pop();
        }
        stack.push(val);
    }
    return true;
}`
};

const CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  init: { java: 4, cpp: 6, python: 4, javascript: 3 },
  loop: { java: 5, cpp: 7, python: 5, javascript: 4 },
  checkLower: { java: 6, cpp: 8, python: 6, javascript: 5 },
  whilePop: { java: 7, cpp: 9, python: 8, javascript: 6 },
  push: { java: 10, cpp: 13, python: 10, javascript: 9 },
  returnTrue: { java: 12, cpp: 15, python: 11, javascript: 11 },
  returnFalse: { java: 6, cpp: 8, python: 7, javascript: 5 }
};

export function buildVerifyPreorderBstSteps(preorder: number[]): VerifyPreorderBstStep[] {
  const steps: VerifyPreorderBstStep[] = [];
  const stack: number[] = [];
  let lowerBound = -Infinity;

  // Step 0: 入口
  steps.push({
    preorder: [...preorder],
    currentIndex: -1,
    stack: [],
    lowerBound,
    isValidSoFar: true,
    poppedValues: [],
    decision: `主函数入口：前序序列 [${preorder.join(', ')}]，准备利用单调栈验证 BST 合法性`,
    message: '单调递减栈维护向左深入的祖先路径，拐向右子树时弹出节点并提升合法下界水位线 lowerBound',
    log: `enter verifyPreorder([${preorder.join(',')}])`,
    codeLine: CODE_LINES.entry,
    metrics: { '序列长度': `${preorder.length}`, '下界 lowerBound': '-∞', '当前状态': '初始化' }
  });

  // Step 1: 初始化下界
  steps.push({
    preorder: [...preorder],
    currentIndex: -1,
    stack: [],
    lowerBound,
    isValidSoFar: true,
    poppedValues: [],
    decision: '初始化单调栈 stack = []，当前下界 lowerBound = -∞',
    message: '未向右拐之前，左子树可以接受任意小于根的值',
    log: 'init stack and lowerBound = -inf',
    codeLine: CODE_LINES.init,
    metrics: { '栈大小': '0', '下界 lowerBound': '-∞' }
  });

  for (let i = 0; i < preorder.length; i++) {
    const val = preorder[i];

    // Step A: 进入循环检查当前值
    steps.push({
      preorder: [...preorder],
      currentIndex: i,
      stack: [...stack],
      lowerBound,
      isValidSoFar: true,
      poppedValues: [],
      decision: `遍历到元素 val = ${val} (下标 ${i})`,
      message: `检查该值是否满足下界约束 val >= lowerBound (${lowerBound === -Infinity ? '-∞' : lowerBound})`,
      log: `iter index=${i}, val=${val}`,
      codeLine: CODE_LINES.loop,
      metrics: { '当前值 val': `${val}`, '下界 lowerBound': lowerBound === -Infinity ? '-∞' : `${lowerBound}` }
    });

    // Step B: 校验是否低于下界
    if (val < lowerBound) {
      steps.push({
        preorder: [...preorder],
        currentIndex: i,
        stack: [...stack],
        lowerBound,
        isValidSoFar: false,
        poppedValues: [],
        decision: `❌ 违规！元素 val = ${val} 小于已确定的右子树下界 lowerBound = ${lowerBound}`,
        message: '在进入某个祖先的右子树后，后续所有节点值均必须大于该祖先节点，当前序列不符合 BST 前序遍历',
        log: `invalid BST: val ${val} < lowerBound ${lowerBound}`,
        codeLine: CODE_LINES.returnFalse,
        metrics: { '当前状态': '判定失败', '违背规则': `${val} < ${lowerBound}` }
      });
      return steps;
    }

    // Step C: 单调栈弹出更新下界
    const popped: number[] = [];
    while (stack.length > 0 && val > stack[stack.length - 1]) {
      const p = stack.pop()!;
      popped.push(p);
      lowerBound = p;
    }

    if (popped.length > 0) {
      steps.push({
        preorder: [...preorder],
        currentIndex: i,
        stack: [...stack],
        lowerBound,
        isValidSoFar: true,
        poppedValues: [...popped],
        decision: `val = ${val} 大于栈顶，发生向右拐！弹出栈顶元素 [${popped.join(', ')}]，更新下界 lowerBound 跃升至 ${lowerBound}`,
        message: `当前节点 ${val} 位于节点 ${lowerBound} 的右子树中，后续所有节点必须严格大于 ${lowerBound}`,
        log: `popped [${popped.join(',')}], new lowerBound = ${lowerBound}`,
        codeLine: CODE_LINES.whilePop,
        metrics: { '弹出元素': `[${popped.join(', ')}]`, '新下界 lowerBound': `${lowerBound}` }
      });
    }

    // Step D: 将当前值压入栈
    stack.push(val);
    steps.push({
      preorder: [...preorder],
      currentIndex: i,
      stack: [...stack],
      lowerBound,
      isValidSoFar: true,
      poppedValues: [],
      decision: `将 val = ${val} 压入单调递减栈`,
      message: `当前栈内元素保持严格单调递减: [${stack.join(', ')}]`,
      log: `pushed ${val}, stack now: [${stack.join(',')}]`,
      codeLine: CODE_LINES.push,
      metrics: { '栈内元素': `[${stack.join(', ')}]`, '下界 lowerBound': lowerBound === -Infinity ? '-∞' : `${lowerBound}` }
    });
  }

  // Step End: 成功返回
  steps.push({
    preorder: [...preorder],
    currentIndex: preorder.length,
    stack: [...stack],
    lowerBound,
    isValidSoFar: true,
    poppedValues: [],
    decision: '🎉 验证通过！该序列完全符合二叉搜索树的前序遍历规则，return true',
    message: '全序列扫描完毕，未违反 BST 左小右大及单调下界约束',
    log: 'preorder verified successfully, return true',
    codeLine: CODE_LINES.returnTrue,
    metrics: { '最终判定': '合法 (true)', '时间复杂度': 'O(N)', '空间复杂度': 'O(N)' }
  });

  return steps;
}

export function renderVerifyPreorderCanvas(container: HTMLElement, step: VerifyPreorderBstStep): void {
  const { preorder, currentIndex, stack, lowerBound, isValidSoFar, poppedValues } = step;

  const seqHtml = preorder.map((val, idx) => {
    const isCurrent = idx === currentIndex;
    const isPast = idx < currentIndex;
    let bg = 'rgba(30, 41, 59, 0.6)';
    let border = '1px solid rgba(255, 255, 255, 0.1)';
    let color = '#f8fafc';

    if (isCurrent) {
      bg = isValidSoFar ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.3)';
      border = isValidSoFar ? '2px solid #38bdf8' : '2px solid #ef4444';
      color = isValidSoFar ? '#38bdf8' : '#f87171';
    } else if (isPast) {
      bg = 'rgba(15, 23, 42, 0.4)';
      border = '1px solid rgba(255, 255, 255, 0.05)';
      color = '#64748b';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="
          width: 48px;
          height: 52px;
          border-radius: 8px;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.15rem;
          color: ${color};
          transition: all 0.2s;
        ">
          ${val}
        </div>
        <span style="font-size: 0.72rem; color: #64748b; font-family: monospace;">#${idx}</span>
      </div>
    `;
  }).join('');

  const stackHtml = stack.map((val, idx) => `
    <div style="
      padding: 8px 16px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid #38bdf8;
      border-radius: 6px;
      color: #38bdf8;
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 140px;
    ">
      <span>${val}</span>
      <span style="font-size: 0.7rem; color: #94a3b8;">${idx === stack.length - 1 ? '栈顶 top' : `[${idx}]`}</span>
    </div>
  `).reverse().join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 上半区：前序遍历序列游标 -->
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🔢 前序遍历序列考察流</span>
          <span style="font-size: 0.85rem; color: #94a3b8;">
            合法状态: <b style="color: ${isValidSoFar ? '#34d399' : '#ef4444'};">${isValidSoFar ? 'VALID (正常推进)' : 'INVALID (违规拦截)'}</b>
          </span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          ${seqHtml}
        </div>
      </div>

      <!-- 下半区：单调递减栈与下界指示 -->
      <div style="flex: 1; display: flex; gap: 16px;">
        <!-- 左侧：单调栈视图 -->
        <div style="
          flex: 1;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🥞 单调递减栈 (祖先链)</span>
            <span style="font-size: 0.8rem; color: #94a3b8;">容量: ${stack.length}</span>
          </div>
          <div style="
            flex: 1;
            background: rgba(2, 6, 23, 0.5);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            overflow-y: auto;
            min-height: 140px;
          ">
            ${stackHtml.length ? stackHtml : '<div style="color:#64748b; font-size:0.85rem; margin:auto;">栈为空</div>'}
          </div>
        </div>

        <!-- 右侧：下界水位线与决策板 -->
        <div style="
          flex: 1;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        ">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🌊 BST 右子树下界水位线 (Lower Bound)</span>

          <div style="
            padding: 16px;
            background: ${isValidSoFar ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.15)'};
            border: 1px solid ${isValidSoFar ? '#34d399' : '#ef4444'};
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          ">
            <div style="font-size: 0.85rem; color: #94a3b8;">当前右子树最低允许值:</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: ${isValidSoFar ? '#34d399' : '#f87171'};">
              ${lowerBound === -Infinity ? '-∞ (无下界约束)' : `≥ ${lowerBound}`}
            </div>
          </div>

          <div style="
            padding: 12px;
            background: rgba(30, 41, 59, 0.4);
            border-radius: 8px;
            font-size: 0.83rem;
            color: #94a3b8;
            line-height: 1.5;
          ">
            💡 <b>BST 核心法则</b>：<br>
            • 左子树遍历时持续压栈，保持递减；<br>
            • 遇到大于栈顶的数说明进入右子树，弹出所有左侧祖先，并将最后弹出的祖先值确立为后续全域下界！
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'verify-preorder-sequence-in-bst',
  name: '验证二叉搜索树的前序遍历序列',
  category: 'monotonic-stack',
  learningGoal: '利用单调栈与下界跃升机制，以 O(N) 时间和空间验证前序遍历是否符合二叉搜索树特性',
  inputs: [
    {
      id: 'preorder',
      label: '前序序列',
      type: 'text',
      defaultValue: '5, 2, 1, 3, 6',
      placeholder: '逗号分隔，如 5, 2, 1, 3, 6 或 5, 2, 6, 1, 3'
    }
  ],
  codeLanguages: VERIFY_PREORDER_BST_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.preorder || '5, 2, 1, 3, 6');
    const nums = raw.split(/[,，\s]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
    return buildVerifyPreorderBstSteps(nums.length ? nums : [5, 2, 1, 3, 6]);
  },
  renderCanvas: (container, step) => {
    renderVerifyPreorderCanvas(container, step as VerifyPreorderBstStep);
  }
});
