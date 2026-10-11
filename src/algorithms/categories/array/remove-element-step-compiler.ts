/**
 * 移除元素 — 步进推演编译器
 * LeetCode 27：快慢双指针原地覆盖
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RemoveStep {
  array: number[];
  fast: number;
  slow: number;
  val: number;
  status: 'check' | 'skip' | 'copy' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
}

export function buildRemoveElementSteps(arr: number[], val: number): RemoveStep[] {
  const steps: RemoveStep[] = [];
  let slow = 0;
  const work = [...arr];

  const lines = {
    init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    loop: { java: 3, cpp: 5, python: 4, javascript: 3 },
    copy: { java: 5, cpp: 7, python: 6, javascript: 5 },
    skip: { java: 3, cpp: 5, python: 4, javascript: 3 },
    done: { java: 9, cpp: 11, python: 8, javascript: 9 },
  };

  steps.push({
    array: [...work],
    fast: 0,
    slow: 0,
    val,
    status: 'check',
    message: `初始化 slow = 0，fast 从 0 开始遍历，待移除的目标值 val = ${val}。`,
    log: `初始化快慢指针：slow=0, fast=0, val=${val}`,
    codeLine: lines.init,
  });

  for (let fast = 0; fast < work.length; fast++) {
    steps.push({
      array: [...work],
      fast,
      slow,
      val,
      status: 'check',
      message: `快指针 fast=${fast}，检查 nums[${fast}]=${work[fast]} 是否等于 val=${val}。`,
      log: `检查 nums[${fast}] = ${work[fast]}`,
      codeLine: lines.loop,
    });

    if (work[fast] !== val) {
      const prevVal = work[slow];
      work[slow] = work[fast];
      steps.push({
        array: [...work],
        fast,
        slow,
        val,
        status: 'copy',
        message: `nums[fast]=${work[fast]} ≠ val，保留此元素：覆写到 nums[slow=${slow}]（原值 ${prevVal}），slow++ → ${slow + 1}。`,
        log: `保留元素: nums[${slow}] = ${work[fast]}，slow 右移至 ${slow + 1}`,
        codeLine: lines.copy,
      });
      slow++;
    } else {
      steps.push({
        array: [...work],
        fast,
        slow,
        val,
        status: 'skip',
        message: `nums[fast]=${work[fast]} == val，遇到待移除元素，跳过不复制，慢指针 slow 保持在 ${slow}。`,
        log: `跳过目标值: nums[${fast}] == ${val}`,
        codeLine: lines.skip,
      });
    }
  }

  steps.push({
    array: [...work],
    fast: work.length,
    slow,
    val,
    status: 'done',
    message: `🎉 遍历完成！新数组有效长度为 slow = ${slow}，前 ${slow} 个元素为最终保留结果 [${work.slice(0, slow).join(', ')}]。`,
    log: `✓ 完成：有效长度 k = ${slow}`,
    codeLine: lines.done,
  });

  return steps;
}
