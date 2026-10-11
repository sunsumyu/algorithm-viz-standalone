import { StepBase } from '../../../core/step-visualizer';

export interface SmallSumStep extends StepBase {
  stepIndex?: number;
  arr: number[];
  left: number;
  mid: number;
  right: number;
  p1: number;
  p2: number;
  totalSmallSum: number;
  currentAddedSum: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MERGE_SORT_SMALL_SUM_CODES = {
  java: `public class SmallSum022 {
    public static long smallSum(int[] arr) {
        if (arr == null || arr.length < 2) return 0;
        return process(arr, 0, arr.length - 1);
    }

    private static long process(int[] arr, int l, int r) {
        if (l == r) return 0;
        int mid = l + ((r - l) >> 1);
        return process(arr, l, mid) + process(arr, mid + 1, r) + merge(arr, l, mid, r);
    }

    private static long merge(int[] arr, int l, int m, int r) {
        int[] help = new int[r - l + 1];
        int i = 0, p1 = l, p2 = m + 1;
        long res = 0;

        while (p1 <= m && p2 <= r) {
            // 当左组小于右组时，右组从 p2 到 r 全都大于 arr[p1]
            res += arr[p1] < arr[p2] ? (long) (r - p2 + 1) * arr[p1] : 0;
            help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];
        }
        while (p1 <= m) help[i++] = arr[p1++];
        while (p2 <= r) help[i++] = arr[p2++];
        for (i = 0; i < help.length; i++) arr[l + i] = help[i];
        return res;
    }
}`,
  cpp: `class SmallSum022 {
public:
    static long long smallSum(vector<int>& arr) {
        if (arr.size() < 2) return 0;
        return process(arr, 0, (int)arr.size() - 1);
    }

    static long long process(vector<int>& arr, int l, int r) {
        if (l == r) return 0;
        int mid = l + ((r - l) >> 1);
        return process(arr, l, mid) + process(arr, mid + 1, r) + merge(arr, l, mid, r);
    }

    static long long merge(vector<int>& arr, int l, int m, int r) {
        vector<int> help(r - l + 1);
        int i = 0, p1 = l, p2 = m + 1;
        long long res = 0;

        while (p1 <= m && p2 <= r) {
            res += arr[p1] < arr[p2] ? (long long)(r - p2 + 1) * arr[p1] : 0;
            help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];
        }
        while (p1 <= m) help[i++] = arr[p1++];
        while (p2 <= r) help[i++] = arr[p2++];
        for (i = 0; i < (int)help.length; i++) arr[l + i] = help[i];
        return res;
    }
};`,
  python: `class SmallSum022:
    @staticmethod
    def small_sum(arr: list[int]) -> int:
        if len(arr) < 2: return 0

        def process(l: int, r: int) -> int:
            if l == r: return 0
            mid = l + ((r - l) >> 1)
            return process(l, mid) + process(mid + 1, r) + merge(l, mid, r)

        def merge(l: int, m: int, r: int) -> int:
            help_arr = []
            p1, p2 = l, m + 1
            res = 0
            while p1 <= m and p2 <= r:
                if arr[p1] < arr[p2]:
                    res += (r - p2 + 1) * arr[p1]
                    help_arr.append(arr[p1])
                    p1 += 1
                else:
                    help_arr.append(arr[p2])
                    p2 += 1
            help_arr.extend(arr[p1:m + 1])
            help_arr.extend(arr[p2:r + 1])
            arr[l:r + 1] = help_arr
            return res

        return process(0, len(arr) - 1)`,
  typescript: `export class SmallSum022 {
  static smallSum(arr: number[]): number {
    if (arr.length < 2) return 0;

    const process = (l: number, r: number): number => {
      if (l === r) return 0;
      const mid = l + ((r - l) >> 1);
      return process(l, mid) + process(mid + 1, r) + merge(l, mid, r);
    };

    const merge = (l: number, m: number, r: number): number => {
      const help: number[] = [];
      let p1 = l, p2 = m + 1;
      let res = 0;

      while (p1 <= m && p2 <= r) {
        if (arr[p1] < arr[p2]) {
          res += (r - p2 + 1) * arr[p1];
          help.push(arr[p1++]);
        } else {
          help.push(arr[p2++]);
        }
      }
      while (p1 <= m) help.push(arr[p1++]);
      while (p2 <= r) help.push(arr[p2++]);
      for (let i = 0; i < help.length; i++) arr[l + i] = help[i];
      return res;
    };

    return process(0, arr.length - 1);
  }
}`
};

export function generateSmallSumSteps(inputNums: number[]): SmallSumStep[] {
  const arr = [...inputNums];
  const steps: SmallSumStep[] = [];
  const n = arr.length;
  let totalSmallSum = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    left: 0,
    mid: -1,
    right: n - 1,
    p1: -1,
    p2: -1,
    totalSmallSum: 0,
    currentAddedSum: 0,
    decision: '开始归并小和计算：分治递归切分数组，在 merge 阶段跨区间统计',
    message: '算法启动',
    log: '初始化 SmallSum',
    codeLine: 4,
    statusBadge: { text: '算法启动', type: 'info' }
  });

  function mergeSort(l: number, r: number) {
    if (l >= r) return;
    const mid = l + ((r - l) >> 1);
    mergeSort(l, mid);
    mergeSort(mid + 1, r);

    // 录制当前 merge 过程
    const help: number[] = [];
    let p1 = l;
    let p2 = mid + 1;

    while (p1 <= mid && p2 <= r) {
      if (arr[p1] < arr[p2]) {
        const count = r - p2 + 1;
        const add = count * arr[p1];
        totalSmallSum += add;

        steps.push({
          stepIndex: stepIdx++,
          arr: [...arr],
          left: l,
          mid,
          right: r,
          p1,
          p2,
          totalSmallSum,
          currentAddedSum: add,
          decision: `左组 arr[${p1}]=${arr[p1]} < 右组 arr[${p2}]=${arr[p2]}！右组从下标 ${p2} 到 ${r} 共 ${count} 个数均大于 ${arr[p1]}，产生小和贡献 ${arr[p1]} * ${count} = ${add}。当前累计小和 = ${totalSmallSum}`,
          message: `贡献小和 +${add}`,
          log: `[${l}..${r}] 贡献: ${arr[p1]} * ${count} = ${add}`,
          codeLine: 18,
          statusBadge: { text: `小和 +${add}`, type: 'success' }
        });

        help.push(arr[p1++]);
      } else {
        steps.push({
          stepIndex: stepIdx++,
          arr: [...arr],
          left: l,
          mid,
          right: r,
          p1,
          p2,
          totalSmallSum,
          currentAddedSum: 0,
          decision: `左组 arr[${p1}]=${arr[p1]} >= 右组 arr[${p2}]=${arr[p2]}，不产生小和贡献，拷贝右组元素 ${arr[p2]}`,
          message: `拷贝右组 ${arr[p2]}`,
          log: `[${l}..${r}] 右组较小或相等，无小和`,
          codeLine: 19,
          statusBadge: { text: '右组移动', type: 'warning' }
        });
        help.push(arr[p2++]);
      }
    }

    while (p1 <= mid) help.push(arr[p1++]);
    while (p2 <= r) help.push(arr[p2++]);
    for (let i = 0; i < help.length; i++) {
      arr[l + i] = help[i];
    }
  }

  mergeSort(0, n - 1);

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    left: 0,
    mid: Math.floor((n - 1) / 2),
    right: n - 1,
    p1: -1,
    p2: -1,
    totalSmallSum,
    currentAddedSum: 0,
    decision: `归并排序与小和计算全流程完毕！全局小和累加和为 ${totalSmallSum}，数组最终有序`,
    message: `最终小和: ${totalSmallSum}`,
    log: `归并小和计算完毕: ${totalSmallSum}`,
    codeLine: 25,
    statusBadge: { text: `小和总计: ${totalSmallSum}`, type: 'success' }
  });

  return steps;
}
