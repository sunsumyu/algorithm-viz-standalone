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

export const CODE_LINES = {
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
    metrics: { '序列长度': `${preorder.length}`, '初始下界 lowerBound': '-∞' }
  });

  // Step 1: 初始化下界
  steps.push({
    preorder: [...preorder],
    currentIndex: -1,
    stack: [],
    lowerBound,
    isValidSoFar: true,
    poppedValues: [],
    decision: '初始化单调递减栈 stack = []，下界水位线 lowerBound = -∞',
    message: '栈内元素代表沿二叉搜索树一直向左走的祖先节点链路',
    log: 'stack initialized, lowerBound = -Infinity',
    codeLine: CODE_LINES.init,
    metrics: { '栈内大小': '0', '下界 lowerBound': '-∞' }
  });

  for (let i = 0; i < preorder.length; i++) {
    const val = preorder[i];

    // Step A: 检查下界
    if (val < lowerBound) {
      steps.push({
        preorder: [...preorder],
        currentIndex: i,
        stack: [...stack],
        lowerBound,
        isValidSoFar: false,
        poppedValues: [],
        decision: `❌ 违规！违背二叉搜索树性质！val = ${val} 小于已确立的右子树下界水位线 lowerBound = ${lowerBound}，直接判定非法 return false`,
        message: `出现倒流！既然此前已经拐入 ${lowerBound} 的右子树，后续所有节点必须大于 ${lowerBound}，而 ${val} 却小于 ${lowerBound}`,
        log: `violation detected: val ${val} < lowerBound ${lowerBound}, return false`,
        codeLine: CODE_LINES.returnFalse,
        metrics: { '违规节点': `${val}`, '冲突下界': `${lowerBound}`, '判定结论': '非法 (false)' }
      });
      return steps;
    }

    steps.push({
      preorder: [...preorder],
      currentIndex: i,
      stack: [...stack],
      lowerBound,
      isValidSoFar: true,
      poppedValues: [],
      decision: `考察节点 val = ${val}：与下界水位线 ${lowerBound === -Infinity ? '-∞' : lowerBound} 比较，通过合规检查`,
      message: `${val} ≥ ${lowerBound === -Infinity ? '-∞' : lowerBound}，未违背 BST 右子树下界`,
      log: `processing val ${val} at index ${i}`,
      codeLine: CODE_LINES.checkLower,
      metrics: { '当前数值': `${val}`, '当前下界': lowerBound === -Infinity ? '-∞' : `${lowerBound}` }
    });

    // Step B/C: 拐入右子树，弹出较小祖先并更新下界
    const popped: number[] = [];
    while (stack.length > 0 && val > stack[stack.length - 1]) {
      const top = stack.pop()!;
      popped.push(top);
      lowerBound = top;
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
