/**
 * Class 004: 二分搜索与对数器 (Binary Search & Logarithmic Verifier) - 步进编译器
 * 左程云算法通关课入门篇 Class 004
 */

import { StepBase } from '../../../core/step-visualizer';

export interface BinarySearchStep extends StepBase {
  stepIndex?: number;
  nums: number[];
  target: number;
  left: number;
  right: number;
  mid: number;
  ansIndex: number;
  mode: 'find-leftmost' | 'find-rightmost' | 'local-minimum';
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BINARY_SEARCH_004_CODES = {
  java: `public class BinarySearch004 {
    // 1. 查找 >= target 的最左位置
    public static int findLeftmost(int[] arr, int target) {
        int l = 0, r = arr.length - 1, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] >= target) {
                ans = mid;
                r = mid - 1; // 继续向左收拢
            } else {
                l = mid + 1;
            }
        }
        return ans;
    }

    // 2. 无序数组寻找局部最小值（峰谷二分）
    public static int findLocalMin(int[] arr) {
        int n = arr.length;
        if (n == 1 || arr[0] < arr[1]) return 0;
        if (arr[n - 1] < arr[n - 2]) return n - 1;
        int l = 1, r = n - 2, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] > arr[mid - 1]) {
                r = mid - 1; // 左侧必有拐点
            } else if (arr[mid] > arr[mid + 1]) {
                l = mid + 1; // 右侧必有拐点
            } else {
                return mid; // 既小于左又小于右
            }
        }
        return ans;
    }
}`,
  cpp: `class BinarySearch004 {
public:
    // 查找 >= target 的最左位置
    static int findLeftmost(const vector<int>& arr, int target) {
        int l = 0, r = arr.size() - 1, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] >= target) {
                ans = mid;
                r = mid - 1;
            } else {
                l = mid + 1;
            }
        }
        return ans;
    }

    // 局部最小值
    static int findLocalMin(const vector<int>& arr) {
        int n = arr.size();
        if (n == 1 || arr[0] < arr[1]) return 0;
        if (arr[n - 1] < arr[n - 2]) return n - 1;
        int l = 1, r = n - 2;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] > arr[mid - 1]) r = mid - 1;
            else if (arr[mid] > arr[mid + 1]) l = mid + 1;
            else return mid;
        }
        return -1;
    }
};`,
  python: `class BinarySearch004:
    @staticmethod
    def find_leftmost(arr: list[int], target: int) -> int:
        l, r, ans = 0, len(arr) - 1, -1
        while l <= r:
            mid = l + ((r - l) >> 1)
            if arr[mid] >= target:
                ans = mid
                r = mid - 1
            else:
                l = mid + 1
        return ans

    @staticmethod
    def find_local_min(arr: list[int]) -> int:
        n = len(arr)
        if n == 1 or arr[0] < arr[1]: return 0
        if arr[n - 1] < arr[n - 2]: return n - 1
        l, r = 1, n - 2
        while l <= r:
            mid = l + ((r - l) >> 1)
            if arr[mid] > arr[mid - 1]:
                r = mid - 1
            elif arr[mid] > arr[mid + 1]:
                l = mid + 1
            else:
                return mid
        return -1`,
  typescript: `export class BinarySearch004 {
  static findLeftmost(arr: number[], target: number): number {
    let l = 0, r = arr.length - 1, ans = -1;
    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      if (arr[mid] >= target) {
        ans = mid;
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    }
    return ans;
  }

  static findLocalMin(arr: number[]): number {
    const n = arr.length;
    if (n === 1 || arr[0] < arr[1]) return 0;
    if (arr[n - 1] < arr[n - 2]) return n - 1;
    let l = 1, r = n - 2;
    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      if (arr[mid] > arr[mid - 1]) r = mid - 1;
      else if (arr[mid] > arr[mid + 1]) l = mid + 1;
      else return mid;
    }
    return -1;
  }
}`
};

export const BINARY_SEARCH_004_CODE_LINES: Record<string, Record<string, number>> = {
  leftmostInit: { java: 4, cpp: 5, python: 4, typescript: 3 },
  leftmostCandidate: { java: 8, cpp: 9, python: 8, typescript: 7 },
  leftmostRight: { java: 10, cpp: 11, python: 10, typescript: 9 },
  leftmostDone: { java: 13, cpp: 14, python: 11, typescript: 12 },

  localMinInit: { java: 18, cpp: 18, python: 15, typescript: 16 },
  localMinHead: { java: 19, cpp: 19, python: 16, typescript: 17 },
  localMinTail: { java: 20, cpp: 20, python: 17, typescript: 18 },
  localMinShrinkLeft: { java: 24, cpp: 24, python: 22, typescript: 22 },
  localMinShrinkRight: { java: 26, cpp: 25, python: 24, typescript: 23 },
  localMinFound: { java: 28, cpp: 26, python: 26, typescript: 24 },
};

export function generateBinarySearchSteps(
  nums: number[],
  target: number,
  mode: 'find-leftmost' | 'find-rightmost' | 'local-minimum' = 'find-leftmost'
): BinarySearchStep[] {
  const steps: BinarySearchStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({
      stepIndex: 0,
      nums: [],
      target,
      left: -1,
      right: -1,
      mid: -1,
      ansIndex: -1,
      mode,
      decision: '数组为空，直接返回 -1',
      message: '数组长度为 0',
      log: '空数组查找结束',
      codeLine: BINARY_SEARCH_004_CODE_LINES.leftmostInit,
      statusBadge: { text: '空输入', type: 'danger' }
    });
    return steps;
  }

  if (mode === 'local-minimum') {
    // 局部最小值模式
    steps.push({
      stepIndex: 0,
      nums: [...nums],
      target: 0,
      left: 0,
      right: n - 1,
      mid: -1,
      ansIndex: -1,
      mode,
      decision: '开始无序数组局部最小值二分查找',
      message: `数组首尾检查：arr[0]=${nums[0]}, arr[n-1]=${nums[n - 1]}`,
      log: '算法初始化',
      codeLine: BINARY_SEARCH_004_CODE_LINES.localMinInit,
      statusBadge: { text: '启动搜索', type: 'info' }
    });

    if (n === 1 || nums[0] < nums[1]) {
      steps.push({
        stepIndex: 1,
        nums: [...nums],
        target: 0,
        left: 0,
        right: n - 1,
        mid: 0,
        ansIndex: 0,
        mode,
        decision: `arr[0]=${nums[0]} 小于右侧元素，0号位即为局部最小值！`,
        message: '首项命中局部最小值',
        log: '命中边界局部极小值',
        codeLine: BINARY_SEARCH_004_CODE_LINES.localMinHead,
        statusBadge: { text: '命中目标', type: 'success' }
      });
      return steps;
    }

    if (nums[n - 1] < nums[n - 2]) {
      steps.push({
        stepIndex: 1,
        nums: [...nums],
        target: 0,
        left: 0,
        right: n - 1,
        mid: n - 1,
        ansIndex: n - 1,
        mode,
        decision: `arr[${n - 1}]=${nums[n - 1]} 小于左侧元素，末项即为局部最小值！`,
        message: '末项命中局部最小值',
        log: '命中边界局部极小值',
        codeLine: BINARY_SEARCH_004_CODE_LINES.localMinTail,
        statusBadge: { text: '命中目标', type: 'success' }
      });
      return steps;
    }

    let l = 1;
    let r = n - 2;
    let stepCount = 2;

    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      const val = nums[mid];

      steps.push({
        stepIndex: stepCount++,
        nums: [...nums],
        target: 0,
        left: l,
        right: r,
        mid,
        ansIndex: -1,
        mode,
        decision: `探测中点 mid=${mid} (值 ${val})，比对邻居：arr[${mid - 1}]=${nums[mid - 1]}, arr[${mid + 1}]=${nums[mid + 1]}`,
        message: `中点 ${mid}: ${val}`,
        log: `探测中点 mid=${mid}`,
        codeLine: BINARY_SEARCH_004_CODE_LINES.localMinInit,
        statusBadge: { text: '区间探测', type: 'info' }
      });

      if (val > nums[mid - 1]) {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target: 0,
          left: l,
          right: r,
          mid,
          ansIndex: -1,
          mode,
          decision: `arr[${mid}]=${val} > arr[${mid - 1}]=${nums[mid - 1]}，左侧呈下降趋势必有极小值，右界收缩至 ${mid - 1}`,
          message: `右界收拢至 ${mid - 1}`,
          log: `左半区必有极值点，右界变动为 ${mid - 1}`,
          codeLine: BINARY_SEARCH_004_CODE_LINES.localMinShrinkLeft,
          statusBadge: { text: '左半区必有解', type: 'warning' }
        });
        r = mid - 1;
      } else if (val > nums[mid + 1]) {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target: 0,
          left: l,
          right: r,
          mid,
          ansIndex: -1,
          mode,
          decision: `arr[${mid}]=${val} > arr[${mid + 1}]=${nums[mid + 1]}，右侧呈下降趋势必有极小值，左界推进至 ${mid + 1}`,
          message: `左界推进至 ${mid + 1}`,
          log: `右半区必有极值点，左界变动为 ${mid + 1}`,
          codeLine: BINARY_SEARCH_004_CODE_LINES.localMinShrinkRight,
          statusBadge: { text: '右半区必有解', type: 'warning' }
        });
        l = mid + 1;
      } else {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target: 0,
          left: l,
          right: r,
          mid,
          ansIndex: mid,
          mode,
          decision: `arr[${mid}]=${val} 既小于左邻(${nums[mid - 1]})又小于右邻(${nums[mid + 1]})，成功锁定局部最小值！`,
          message: `命中局部最小值：${val}`,
          log: `成功找到局部最小值 mid=${mid}`,
          codeLine: BINARY_SEARCH_004_CODE_LINES.localMinFound,
          statusBadge: { text: '成功命中', type: 'success' }
        });
        return steps;
      }
    }
  } else {
    // 查找 >= target 的最左位置
    let l = 0;
    let r = n - 1;
    let ans = -1;
    let stepCount = 0;

    steps.push({
      stepIndex: stepCount++,
      nums: [...nums],
      target,
      left: l,
      right: r,
      mid: -1,
      ansIndex: -1,
      mode,
      decision: `初始化查找 >= ${target} 的最左边界，初始区间 [${l}, ${r}]`,
      message: `查找目标: ${target}`,
      log: `开始二分区间 [${l}, ${r}]`,
      codeLine: BINARY_SEARCH_004_CODE_LINES.leftmostInit,
      statusBadge: { text: '启动搜索', type: 'info' }
    });

    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      const val = nums[mid];

      if (val >= target) {
        ans = mid;
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target,
          left: l,
          right: r,
          mid,
          ansIndex: ans,
          mode,
          decision: `arr[${mid}]=${val} >= ${target}，记录候选下标 ${mid}，继续向左尝试 [${l}, ${mid - 1}]`,
          message: `更新候选 ans = ${ans}`,
          log: `命中达标点 mid=${mid}，向左压缩`,
          codeLine: BINARY_SEARCH_004_CODE_LINES.leftmostCandidate,
          statusBadge: { text: '记录候选', type: 'warning' }
        });
        r = mid - 1;
      } else {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target,
          left: l,
          right: r,
          mid,
          ansIndex: ans,
          mode,
          decision: `arr[${mid}]=${val} < ${target}，目标在右半区，左界提升至 ${mid + 1}`,
          message: `左界前移至 ${mid + 1}`,
          log: `排除左半区 [${l}, ${mid}]`,
          codeLine: BINARY_SEARCH_004_CODE_LINES.leftmostRight,
          statusBadge: { text: '向右收缩', type: 'info' }
        });
        l = mid + 1;
      }
    }

    steps.push({
      stepIndex: stepCount++,
      nums: [...nums],
      target,
      left: l,
      right: r,
      mid: -1,
      ansIndex: ans,
      mode,
      decision: ans !== -1
        ? `二分收敛结束，>= ${target} 的最左元素为 arr[${ans}]=${nums[ans]}`
        : `二分收敛结束，未找到任何 >= ${target} 的元素`,
      message: `最终结果：ans = ${ans}`,
      log: `二分查找完成，返回 ${ans}`,
      codeLine: BINARY_SEARCH_004_CODE_LINES.leftmostDone,
      statusBadge: ans !== -1 ? { text: '搜索成功', type: 'success' } : { text: '未找到', type: 'danger' }
    });
  }

  return steps;
}
