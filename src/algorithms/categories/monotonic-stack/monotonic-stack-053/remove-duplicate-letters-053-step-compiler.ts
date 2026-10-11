import {
  REMOVE_DUP_LETTERS_LINES,
} from './stack-053-stage-codes';
import { renderStringStackBoard, type Step053 } from './stack-053-shared';

export function buildRemoveDuplicateLettersSteps(inputStr: string): Step053[] {
  const s = inputStr.trim().toLowerCase().replace(/[^a-z]/g, '') || 'bcabc';
  const steps: Step053[] = [];
  const chars = s.split('');
  const n = chars.length;

  const countMap: Record<string, number> = {};
  for (const c of chars) {
    countMap[c] = (countMap[c] || 0) + 1;
  }

  const stack: string[] = [];
  const inStack = new Set<string>();

  // Step 0: 入口帧
  steps.push({
    stage: '算法就绪',
    title: '统计全量字符频次并初始化贪心单调栈',
    narrative: `输入字符串 "${s}"。统计词频完成，我们将按序扫描字符，保持栈内字符字典序单调递增；若栈顶字符后续仍会出现且比当前字符大，果断弹出让位。`,
    codeLine: REMOVE_DUP_LETTERS_LINES.countFreq,
    sandboxes: [
      {
        id: 'string-board',
        type: 'custom',
        title: '去重字母演化沙盘',
        customHtml: renderStringStackBoard(chars, [], 0, 0, null, countMap, inStack),
      },
    ],
    variables: { 字符总长: n, 栈状态: '空', 栈内集合: '空' },
  });

  for (let i = 0; i < n; i++) {
    const c = chars[i];
    countMap[c]--;

    // 观察阶段
    steps.push({
      stage: '扫描字符',
      title: `考察字符 s[${i}] = '${c}' (后续剩余次数: ${countMap[c]})`,
      narrative: `扫描到字符 '${c}'。如果它已经在栈中，为了保持前面更早确立的优势位，直接跳过；否则尝试弹出栈顶较大且后续还有的字符。`,
      codeLine: REMOVE_DUP_LETTERS_LINES.forLoop,
      sandboxes: [
        {
          id: 'string-board',
          type: 'custom',
          title: '去重字母演化沙盘',
          customHtml: renderStringStackBoard(
            chars,
            [...stack],
            i,
            0,
            null,
            countMap,
            inStack
          ),
        },
      ],
      variables: {
        当前字符: c,
        后续剩余出现次数: countMap[c],
        是否已在栈中: inStack.has(c) ? '是' : '否',
      },
    });

    if (inStack.has(c)) {
      steps.push({
        stage: '跳过已存在',
        title: `字符 '${c}' 已在栈中，直接跳过`,
        narrative: `由于 '${c}' 先前已入栈并占据了更靠左的高位，若在当前位置再次加入必然使字典序变大，故果断跳过。`,
        codeLine: REMOVE_DUP_LETTERS_LINES.skipInStack,
        sandboxes: [
          {
            id: 'string-board',
            type: 'custom',
            title: '去重字母演化沙盘',
            customHtml: renderStringStackBoard(
              chars,
              [...stack],
              i,
              0,
              null,
              countMap,
              inStack
            ),
          },
        ],
        variables: { 当前跳过字符: c, 栈内字符: stack.join('') },
      });
      continue;
    }

    // 尝试弹出栈顶较大字符
    while (
      stack.length > 0 &&
      stack[stack.length - 1] > c &&
      (countMap[stack[stack.length - 1]] || 0) > 0
    ) {
      const top = stack.pop()!;
      inStack.delete(top);

      steps.push({
        stage: '贪心弹出',
        title: `栈顶 '${top}' > 当前 '${c}' 且后续仍有出现，弹出让位`,
        narrative: `栈顶字符 '${top}' 字典序劣于当前字符 '${c}'，且其在后续还会出现（剩余次数: ${countMap[top]}），因此现在弹出不会导致漏掉该字符，弹出能令当前位更优！`,
        codeLine: REMOVE_DUP_LETTERS_LINES.whilePop,
        sandboxes: [
          {
            id: 'string-board',
            type: 'custom',
            title: '去重字母演化沙盘',
            customHtml: renderStringStackBoard(
              chars,
              [...stack],
              i,
              0,
              null,
              countMap,
              inStack
            ),
          },
        ],
        variables: {
          被弹出字符: top,
          后续剩余次数: countMap[top],
          当前字符: c,
        },
      });
    }

    stack.push(c);
    inStack.add(c);

    steps.push({
      stage: '压栈收敛',
      title: `字符 '${c}' 压入单调栈并标记在栈中`,
      narrative: `字符 '${c}' 成功加入单调栈，当前拼装所得最小前缀为 "${stack.join('')}"。`,
      codeLine: REMOVE_DUP_LETTERS_LINES.push,
      sandboxes: [
        {
          id: 'string-board',
          type: 'custom',
          title: '去重字母演化沙盘',
          customHtml: renderStringStackBoard(
            chars,
            [...stack],
            i + 1,
            0,
            null,
            countMap,
            inStack
          ),
        },
      ],
      variables: {
        入栈字符: c,
        当前栈字符串: stack.join(''),
        栈深度: stack.length,
      },
    });
  }

  const finalRes = stack.join('');

  // 终局帧
  steps.push({
    stage: '去重完成',
    title: `所有字符考察完毕，最小字典序结果为 "${finalRes}"`,
    narrative: `全部扫描完成，每个字符恰好出现一次且保证了字典序最小。最终输出结果为 "${finalRes}"。`,
    codeLine: REMOVE_DUP_LETTERS_LINES.returnAns,
    sandboxes: [
      {
        id: 'string-board',
        type: 'custom',
        title: '去重字母演化沙盘',
        customHtml: renderStringStackBoard(
          chars,
          [...stack],
          n,
          0,
          null,
          countMap,
          inStack
        ),
      },
    ],
    variables: { 最终去重字符串: finalRes, 字符集合数: stack.length },
  });

  return steps;
}
