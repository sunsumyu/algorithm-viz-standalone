/**
 * 合并两个有序数组（逆向双指针）— 步进推演编译器
 * LeetCode 88
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface MSAStep {
  nums1: (number | null)[];
  nums2: number[];
  m: number;
  n: number;
  p1: number; // nums1 当前待比较指针
  p2: number; // nums2 当前待比较指针
  k: number; // 写入目标位置
  action: 'init' | 'compare' | 'fill_p1' | 'fill_p2' | 'done';
  chosenSource?: 'nums1' | 'nums2';
  chosenValue?: number;
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export function buildMSASteps(nums1Valid: number[], nums2Arr: number[]): MSAStep[] {
  const steps: MSAStep[] = [];
  const m = nums1Valid.length;
  const n = nums2Arr.length;
  // 物理 nums1 长度为 m + n，初始后 n 个为 null
  const nums1Full: (number | null)[] = [...nums1Valid, ...new Array(n).fill(null)];
  const nums2Copy = [...nums2Arr];

  const lines = {
    init: { java: [3, 4, 5], cpp: [4, 5, 6], python: 3, javascript: [2, 3, 4] },
    compare: { java: 7, cpp: 8, python: 5, javascript: 6 },
    fillP1: { java: 8, cpp: 9, python: [6, 7], javascript: 7 },
    fillP2: { java: 10, cpp: 11, python: [9, 10], javascript: 9 },
    done: { java: 12, cpp: 13, python: 4, javascript: 11 },
  };

  let p1 = m - 1;
  let p2 = n - 1;
  let k = m + n - 1;

  steps.push({
    nums1: [...nums1Full],
    nums2: [...nums2Copy],
    m,
    n,
    p1,
    p2,
    k,
    action: 'init',
    message: `初始化：nums1 有效长度 m=${m}，nums2 长度 n=${n}。分配写入指针 k=${k}，p1=${p1}，p2=${p2}。从后向前比较填充。`,
    codeLine: lines.init,
  });

  while (p2 >= 0) {
    if (p1 >= 0) {
      const v1 = nums1Full[p1] as number;
      const v2 = nums2Copy[p2];

      steps.push({
        nums1: [...nums1Full],
        nums2: [...nums2Copy],
        m,
        n,
        p1,
        p2,
        k,
        action: 'compare',
        message: `比较末尾元素：nums1[${p1}]=${v1} 与 nums2[${p2}]=${v2}。`,
        codeLine: lines.compare,
      });

      if (v1 > v2) {
        nums1Full[k] = v1;
        steps.push({
          nums1: [...nums1Full],
          nums2: [...nums2Copy],
          m,
          n,
          p1,
          p2,
          k,
          action: 'fill_p1',
          chosenSource: 'nums1',
          chosenValue: v1,
          message: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}，将 ${v1} 写入 nums1[${k}]。p1 和 k 前移。`,
          codeLine: lines.fillP1,
        });
        p1--;
      } else {
        nums1Full[k] = v2;
        steps.push({
          nums1: [...nums1Full],
          nums2: [...nums2Copy],
          m,
          n,
          p1,
          p2,
          k,
          action: 'fill_p2',
          chosenSource: 'nums2',
          chosenValue: v2,
          message: `nums1[${p1}]=${v1} <= nums2[${p2}]=${v2}，将 ${v2} 写入 nums1[${k}]。p2 和 k 前移。`,
          codeLine: lines.fillP2,
        });
        p2--;
      }
    } else {
      // p1 已经全部处理完，直接把 nums2 剩余元素拷贝进 nums1
      const v2 = nums2Copy[p2];
      nums1Full[k] = v2;
      steps.push({
        nums1: [...nums1Full],
        nums2: [...nums2Copy],
        m,
        n,
        p1,
        p2,
        k,
        action: 'fill_p2',
        chosenSource: 'nums2',
        chosenValue: v2,
        message: `nums1 原有效元素已处理完 (p1 < 0)，将 nums2[${p2}]=${v2} 写入 nums1[${k}]。`,
        codeLine: lines.fillP2,
      });
      p2--;
    }
    k--;
  }

  steps.push({
    nums1: [...nums1Full],
    nums2: [...nums2Copy],
    m,
    n,
    p1,
    p2,
    k,
    action: 'done',
    message: `🎉 合并完成！最终 nums1 为 [${nums1Full.join(', ')}]。`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMergeSortedArrayMetrics(steps: MSAStep[]): MSAStep[] {
  return steps.map((s) => {
    let phase = '初始化';
    if (s.action === 'compare') {
      phase = '双指针比对';
    } else if (s.action === 'fill_p1' || s.action === 'fill_p2') {
      phase = `写入 ${s.chosenValue}`;
    } else if (s.action === 'done') {
      phase = '合并完成';
    }

    return {
      ...s,
      log: s.message,
      metrics: {
        p1: s.p1 >= 0 ? `[${s.p1}]=${s.nums1[s.p1]}` : '已越界 (-1)',
        p2: s.p2 >= 0 ? `[${s.p2}]=${s.nums2[s.p2]}` : '已越界 (-1)',
        k: s.k >= 0 ? `[${s.k}]` : '已完成 (-1)',
        phase,
      },
    };
  });
}
