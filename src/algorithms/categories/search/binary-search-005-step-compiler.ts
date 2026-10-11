/**
 * Class 005: 二分搜索与局部最小值检测 (Binary Search & Local Minimum) - 步进编译器
 */

import { StepBase } from '../../../core/step-visualizer';

export interface BinarySearch005Step extends StepBase {
  nums: number[];
  mode: 'find' | 'findLeft' | 'localMin';
  l: number;
  r: number;
  mid: number;
  target?: number;
  foundIndex: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BINARY_SEARCH_005_CODES = {
  java: `public class BinarySearch {
    // 1. 查找某个数是否存在
    public static int find(int[] arr, int target) {
        int l = 0, r = arr.length - 1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
    // 2. >= target 的最左位置
    public static int findLeft(int[] arr, int target) {
        int l = 0, r = arr.length - 1, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] >= target) { ans = mid; r = mid - 1; }
            else l = mid + 1;
        }
        return ans;
    }
    // 3. 局部最小值 (无序但相邻不等)
    public static int localMin(int[] arr) {
        int n = arr.length;
        if (n == 1 || arr[0] < arr[1]) return 0;
        if (arr[n - 1] < arr[n - 2]) return n - 1;
        int l = 1, r = n - 2;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] > arr[mid - 1]) r = mid - 1;
            else if (arr[mid] > arr[mid + 1]) l = mid + 1;
            else return mid;
        }
        return l;
    }
}`,
  cpp: `int find(const vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}
int findLeft(const vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1, ans = -1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] >= target) { ans = mid; r = mid - 1; }
        else l = mid + 1;
    }
    return ans;
}
int localMin(const vector<int>& arr) {
    int n = arr.size();
    if (n == 1 || arr[0] < arr[1]) return 0;
    if (arr[n - 1] < arr[n - 2]) return n - 1;
    int l = 1, r = n - 2;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] > arr[mid - 1]) r = mid - 1;
        else if (arr[mid] > arr[mid + 1]) l = mid + 1;
        else return mid;
    }
    return l;
}`,
  python: `def find(arr, target):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1

def find_left(arr, target):
    l, r, ans = 0, len(arr) - 1, -1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] >= target: ans, r = mid, mid - 1
        else: l = mid + 1
    return ans

def local_min(arr):
    n = len(arr)
    if n == 1 or arr[0] < arr[1]: return 0
    if arr[n - 1] < arr[n - 2]: return n - 1
    l, r = 1, n - 2
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] > arr[mid - 1]: r = mid - 1
        elif arr[mid] > arr[mid + 1]: l = mid + 1
        else: return mid
    return l`,
  typescript: `export function find(arr: number[], target: number): number {
    let l = 0, r = arr.length - 1;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}
export function findLeft(arr: number[], target: number): number {
    let l = 0, r = arr.length - 1, ans = -1;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (arr[mid] >= target) { ans = mid; r = mid - 1; }
        else l = mid + 1;
    }
    return ans;
}
export function localMin(arr: number[]): number {
    const n = arr.length;
    if (n === 1 || arr[0] < arr[1]) return 0;
    if (arr[n - 1] < arr[n - 2]) return n - 1;
    let l = 1, r = n - 2;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (arr[mid] > arr[mid - 1]) r = mid - 1;
        else if (arr[mid] > arr[mid + 1]) l = mid + 1;
        else return mid;
    }
    return l;
}`
};

export const BINARY_SEARCH_005_CODE_LINES: Record<string, Record<string, number>> = {
  findEntry: { java: 4, cpp: 2, python: 2, typescript: 2 },
  findCheck: { java: 6, cpp: 4, python: 4, typescript: 4 },
  findHit: { java: 7, cpp: 5, python: 5, typescript: 5 },
  findNotFound: { java: 11, cpp: 9, python: 8, typescript: 9 },
  findLeftEntry: { java: 15, cpp: 12, python: 11, typescript: 12 },
  findLeftCompare: { java: 18, cpp: 15, python: 14, typescript: 15 },
  findLeftFinish: { java: 21, cpp: 18, python: 16, typescript: 18 },
  localMinEntry: { java: 25, cpp: 21, python: 19, typescript: 21 },
  localMinLeftHit: { java: 26, cpp: 22, python: 20, typescript: 22 },
  localMinRightHit: { java: 27, cpp: 23, python: 21, typescript: 23 },
  localMinCheck: { java: 30, cpp: 26, python: 24, typescript: 26 },
  localMinHit: { java: 33, cpp: 29, python: 27, typescript: 29 },
};

export function buildBinarySearch005Steps(
  nums: number[],
  mode: 'find' | 'findLeft' | 'localMin',
  target: number = 5
): BinarySearch005Step[] {
  const steps: BinarySearch005Step[] = [];
  const n = nums.length;

  const entryLine =
    mode === 'find'
      ? BINARY_SEARCH_005_CODE_LINES.findEntry
      : mode === 'findLeft'
      ? BINARY_SEARCH_005_CODE_LINES.findLeftEntry
      : BINARY_SEARCH_005_CODE_LINES.localMinEntry;

  steps.push({
    nums,
    mode,
    l: 0,
    r: n - 1,
    mid: -1,
    target,
    foundIndex: -1,
    decision: `主函数入口：模式【${mode === 'find' ? '精确二分查找' : mode === 'findLeft' ? '>=目标最左位置' : '局部极小值检测'}】`,
    message: '二分的本质不在于是否有序，而在于能否根据中点判定单侧丢弃一半解空间',
    log: `enter binarySearch(mode=${mode})`,
    codeLine: entryLine,
    statusBadge: { text: '初始化范围', type: 'info' },
  });

  if (mode === 'find') {
    let l = 0, r = n - 1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const val = nums[mid];
      steps.push({
        nums,
        mode,
        l,
        r,
        mid,
        target,
        foundIndex: -1,
        decision: `考察中点 mid = ${mid} (值 ${val})，搜索区间 [${l} .. ${r}]，目标 target = ${target}`,
        message: val === target ? `🎉 命中目标！返回下标 ${mid}` : val < target ? `当前值小于目标，左半区间全丢弃，收缩至 [${mid + 1} .. ${r}]` : `当前值大于目标，右半区间全丢弃，收缩至 [${l} .. ${mid - 1}]`,
        log: `mid=${mid}, val=${val}`,
        codeLine: BINARY_SEARCH_005_CODE_LINES.findCheck,
        statusBadge: val === target ? { text: '命中目标', type: 'success' } : { text: '区间折半', type: 'warning' },
      });
      if (val === target) {
        steps.push({
          nums,
          mode,
          l,
          r,
          mid,
          target,
          foundIndex: mid,
          decision: `最终返回目标在数组中的下标: ${mid}`,
          message: '二分查找成功结束',
          log: `return ${mid}`,
          codeLine: BINARY_SEARCH_005_CODE_LINES.findHit,
          statusBadge: { text: `找到下标 [${mid}]`, type: 'success' },
        });
        return steps;
      } else if (val < target) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
    steps.push({
      nums,
      mode,
      l,
      r,
      mid: -1,
      target,
      foundIndex: -1,
      decision: `区间折半收敛为空 (l > r)，数组中不存在值为 ${target} 的元素，返回 -1`,
      message: '目标不存在',
      log: 'return -1',
      codeLine: BINARY_SEARCH_005_CODE_LINES.findNotFound,
      statusBadge: { text: '未找到 (-1)', type: 'danger' },
    });
  } else if (mode === 'findLeft') {
    let l = 0, r = n - 1, ans = -1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const val = nums[mid];
      const isGe = val >= target;
      if (isGe) ans = mid;
      steps.push({
        nums,
        mode,
        l,
        r,
        mid,
        target,
        foundIndex: ans,
        decision: `考察中点 mid = ${mid} (值 ${val})：${val} >= ${target} 判定为 ${isGe}`,
        message: isGe ? `暂存潜在答案 ans=${mid}，尝试向左继续寻找更左边界，r 收缩为 ${mid - 1}` : `中点值小于目标，左侧不可能满足条件，l 调整为 ${mid + 1}`,
        log: `mid=${mid}, ans=${ans}`,
        codeLine: BINARY_SEARCH_005_CODE_LINES.findLeftCompare,
        statusBadge: isGe ? { text: `更新最左 ans=${mid}`, type: 'success' } : { text: '向右探测', type: 'info' },
      });
      if (isGe) r = mid - 1;
      else l = mid + 1;
    }
    steps.push({
      nums,
      mode,
      l,
      r,
      mid: ans,
      target,
      foundIndex: ans,
      decision: `搜索完毕！>= ${target} 的最左位置为下标 [${ans}] (值 ${ans >= 0 ? nums[ans] : '无'})`,
      message: '找到最优边界',
      log: `return leftBound=${ans}`,
      codeLine: BINARY_SEARCH_005_CODE_LINES.findLeftFinish,
      statusBadge: { text: `最左位置 [${ans}]`, type: 'success' },
    });
  } else {
    // 局部最小值
    if (n === 1 || nums[0] < nums[1]) {
      steps.push({
        nums,
        mode,
        l: 0,
        r: 0,
        mid: 0,
        foundIndex: 0,
        decision: `边界判断：0 号位置 ${nums[0]} 小于右侧 ${nums[1] || '边界'}，0 自身即为局部最小点！`,
        message: '左边界命中极小值',
        log: 'return 0',
        codeLine: BINARY_SEARCH_005_CODE_LINES.localMinLeftHit,
        statusBadge: { text: '边界命中 [0]', type: 'success' },
      });
      return steps;
    }
    if (nums[n - 1] < nums[n - 2]) {
      steps.push({
        nums,
        mode,
        l: n - 1,
        r: n - 1,
        mid: n - 1,
        foundIndex: n - 1,
        decision: `边界判断：末尾位置 ${nums[n - 1]} 小于左侧 ${nums[n - 2]}，末尾自身即为局部最小点！`,
        message: '右边界命中极小值',
        log: `return ${n - 1}`,
        codeLine: BINARY_SEARCH_005_CODE_LINES.localMinRightHit,
        statusBadge: { text: `边界命中 [${n - 1}]`, type: 'success' },
      });
      return steps;
    }
    let l = 1, r = n - 2;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const isLeftDown = nums[mid] > nums[mid - 1];
      const isRightDown = nums[mid] > nums[mid + 1];
      steps.push({
        nums,
        mode,
        l,
        r,
        mid,
        foundIndex: -1,
        decision: `考察中点 mid=${mid} (值 ${nums[mid]})，邻近左侧=${nums[mid - 1]}，右侧=${nums[mid + 1]}`,
        message: isLeftDown ? `左侧更低，根据斜率判断，[l .. mid-1] 内必定存在极小点！` : isRightDown ? `右侧更低，根据斜率判断，[mid+1 .. r] 内必定存在极小点！` : `左右皆高于自身，当前 mid=${mid} 即为局部极小谷底！`,
        log: `localMin mid=${mid}`,
        codeLine: BINARY_SEARCH_005_CODE_LINES.localMinCheck,
        statusBadge: (!isLeftDown && !isRightDown) ? { text: `命中谷底 [${mid}]`, type: 'success' } : { text: '斜率收缩', type: 'warning' },
      });
      if (isLeftDown) {
        r = mid - 1;
      } else if (isRightDown) {
        l = mid + 1;
      } else {
        steps.push({
          nums,
          mode,
          l,
          r,
          mid,
          foundIndex: mid,
          decision: `🎉 成功捕获局部最小值！下标 [${mid}] 对应数值为 ${nums[mid]}`,
          message: '局部极小值二分检测完成',
          log: `return localMin=${mid}`,
          codeLine: BINARY_SEARCH_005_CODE_LINES.localMinHit,
          statusBadge: { text: `谷底点 [${mid}]`, type: 'success' },
        });
        return steps;
      }
    }
  }

  return steps;
}
