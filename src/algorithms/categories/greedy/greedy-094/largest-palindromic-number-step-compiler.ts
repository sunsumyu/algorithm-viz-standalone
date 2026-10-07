/**
 * 最大回文数字 (LeetCode 2384) - 步进推演编译器
 * 核心贪心：高位贪心成对填充与最高单数中心放置
 */

import { LARGEST_PALINDROMIC_NUMBER_LINES } from './greedy-094-stage-codes';
import { Greedy094Step } from './greedy-094-shared';

export interface LargestPalindromicStep extends Greedy094Step {
  line?: number;
  numStr: string;
  counts: number[];
  leftPart: string;
  midPart: string;
  currentDigit?: number;
  result?: string;
}

export function buildLargestPalindromicSteps(num: string): LargestPalindromicStep[] {
  const steps: LargestPalindromicStep[] = [];
  const lines = LARGEST_PALINDROMIC_NUMBER_LINES;

  // Step 0: 入口
  steps.push({
    line: lines.entry.java ?? 1,
    numStr: num,
    counts: new Array(10).fill(0),
    leftPart: '',
    midPart: '',
    decision: `主函数入口：输入字符串 num = "${num}"，准备统计 0-9 出现频次`,
    message: '核心思路：从数字 9 到 1 贪心成对构建回文两侧；前导零不可作为首位；选剩余最大数作为回文中心',
    log: `enter largestPalindromic(num="${num}")`,
    codeLine: lines.entry,
  });

  // Step 1: 统计词频
  const counts = new Array(10).fill(0);
  for (const ch of num) {
    const d = parseInt(ch, 10);
    if (!isNaN(d) && d >= 0 && d <= 9) {
      counts[d]++;
    }
  }

  steps.push({
    line: lines.countDigits.java ?? 2,
    numStr: num,
    counts: [...counts],
    leftPart: '',
    midPart: '',
    decision: `字符词频统计完成：${counts.map((c, i) => `${i}:${c}`).filter((_, i) => counts[i] > 0).join(', ')}`,
    message: '统计 0-9 每个数字的可用张数',
    log: `digit counts: ${JSON.stringify(counts)}`,
    codeLine: lines.countDigits,
  });

  // Step 2: 从 9 到 0 成对填充
  let left = '';
  for (let d = 9; d >= 0; d--) {
    if (d === 0 && left.length === 0) {
      steps.push({
        line: lines.placePairs.java ?? 3,
        numStr: num,
        counts: [...counts],
        leftPart: left,
        midPart: '',
        currentDigit: d,
        decision: `⚠️ 检测到数字 0 且当前回文左侧为空：前导零不能放在最高位，跳过 0 的成对拼接`,
        message: '避免前导零生成无效数字',
        log: `skip leading zeros for left part`,
        codeLine: lines.placePairs,
      });
      break;
    }

    const pairs = Math.floor(counts[d] / 2);
    if (pairs > 0) {
      const added = String(d).repeat(pairs);
      left += added;
      counts[d] -= pairs * 2;

      steps.push({
        line: lines.placePairs.java ?? 3,
        numStr: num,
        counts: [...counts],
        leftPart: left,
        midPart: '',
        currentDigit: d,
        decision: `贪心放置数字 ${d}：可用 ${pairs * 2} 张，两侧各放 ${pairs} 张 ➔ 当前左半部 left = "${left}"`,
        message: `大数字 ${d} 尽量放在高位以让数值最大化`,
        log: `placed ${pairs} pairs of digit ${d}`,
        codeLine: lines.placePairs,
      });
    }
  }

  // Step 3: 选最大的单一数字作为中间位
  let mid = '';
  for (let d = 9; d >= 0; d--) {
    if (counts[d] > 0) {
      mid = String(d);
      steps.push({
        line: lines.pickMid.java ?? 4,
        numStr: num,
        counts: [...counts],
        leftPart: left,
        midPart: mid,
        currentDigit: d,
        decision: `选择最大的剩余数字 ${d} 放置在回文中心 mid = "${mid}"`,
        message: '回文中心只需 1 位，取余下未成对的最大数字',
        log: `selected mid=${mid}`,
        codeLine: lines.pickMid,
      });
      break;
    }
  }

  // Step 4: 结果拼接与特判
  let finalAns = '';
  if (left.length === 0 && mid.length === 0) {
    finalAns = '0';
  } else {
    const right = left.split('').reverse().join('');
    finalAns = left + mid + right;
  }

  steps.push({
    line: lines.done.java ?? 5,
    numStr: num,
    counts: [...counts],
    leftPart: left,
    midPart: mid,
    result: finalAns,
    decision: `🎉 最终回文结果构建完成：${finalAns}（左半部分="${left}", 中心="${mid}", 右半部分="${left.split('').reverse().join('')}"）`,
    message: '对称贪心保证了所拼成回文数字的绝对最大值',
    log: `final result: ${finalAns}`,
    codeLine: lines.done,
  });

  return steps;
}
