import { StepBase } from '../../../core/step-visualizer';

export interface RadixSortStep extends StepBase {
  stepIndex?: number;
  arr: number[];
  help: number[];
  currentDigit: number; // 当前处理的位 (1: 个位, 2: 十位, 3: 百位...)
  digitExp: number;     // 1, 10, 100...
  counts: number[];     // 0..9 计数数组
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const RADIX_SORT_028_CODES = {
  java: `public class RadixSort028 {
    public static void radixSort(int[] arr) {
        if (arr == null || arr.length < 2) return;
        int max = Integer.MIN_VALUE;
        for (int v : arr) max = Math.max(max, v);
        int bits = maxBits(max);
        radixSort(arr, 0, arr.length - 1, bits);
    }

    private static void radixSort(int[] arr, int l, int r, int bits) {
        final int radix = 10;
        int[] help = new int[r - l + 1];
        for (int d = 1; d <= bits; d++) {
            int[] count = new int[radix];
            for (int i = l; i <= r; i++) {
                int digit = getDigit(arr[i], d);
                count[digit]++;
            }
            // 转化为前缀累加和表，指示 <= 该位数字的最大出桶下标
            for (int i = 1; i < radix; i++) count[i] += count[i - 1];
            // 从右向左遍历保证排序稳定性
            for (int i = r; i >= l; i--) {
                int digit = getDigit(arr[i], d);
                help[--count[digit]] = arr[i];
            }
            for (int i = l, j = 0; i <= r; i++, j++) arr[i] = help[j];
        }
    }
    private static int getDigit(int x, int d) {
        return (x / (int)Math.pow(10, d - 1)) % 10;
    }
}`,
  cpp: `class RadixSort028 {
public:
    static void radixSort(vector<int>& arr) {
        if (arr.size() < 2) return;
        int maxVal = *max_element(arr.begin(), arr.end());
        int bits = 0;
        while (maxVal > 0) { bits++; maxVal /= 10; }

        int n = arr.size();
        vector<int> help(n);
        int offset = 1;

        for (int d = 1; d <= bits; ++d) {
            vector<int> count(10, 0);
            for (int x : arr) count[(x / offset) % 10]++;
            for (int i = 1; i < 10; ++i) count[i] += count[i - 1];
            for (int i = n - 1; i >= 0; --i) {
                int digit = (arr[i] / offset) % 10;
                help[--count[digit]] = arr[i];
            }
            arr = help;
            offset *= 10;
        }
    }
};`,
  python: `class RadixSort028:
    @staticmethod
    def radix_sort(arr: list[int]):
        if len(arr) < 2: return
        max_val = max(arr)
        offset = 1
        d = 1
        while max_val // offset > 0:
            count = [0] * 10
            for x in arr:
                digit = (x // offset) % 10
                count[digit] += 1
            for i in range(1, 10):
                count[i] += count[i - 1]
            help_arr = [0] * len(arr)
            for x in reversed(arr):
                digit = (x // offset) % 10
                count[digit] -= 1
                help_arr[count[digit]] = x
            arr[:] = help_arr
            offset *= 10
            d += 1`,
  typescript: `export class RadixSort028 {
  static radixSort(arr: number[]): void {
    if (arr.length < 2) return;
    const max = Math.max(...arr);
    let offset = 1;

    while (Math.floor(max / offset) > 0) {
      const count = new Array(10).fill(0);
      for (const x of arr) {
        const digit = Math.floor(x / offset) % 10;
        count[digit]++;
      }
      for (let i = 1; i < 10; i++) count[i] += count[i - 1];

      const help = new Array(arr.length);
      for (let i = arr.length - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / offset) % 10;
        help[--count[digit]] = arr[i];
      }
      for (let i = 0; i < arr.length; i++) arr[i] = help[i];
      offset *= 10;
    }
  }
}`
};

export function generateRadixSortSteps(inputNums: number[]): RadixSortStep[] {
  const arr = [...inputNums];
  const steps: RadixSortStep[] = [];
  const n = arr.length;

  if (n < 2) {
    steps.push({
      stepIndex: 0,
      arr: [...arr],
      help: [...arr],
      currentDigit: 1,
      digitExp: 1,
      counts: new Array(10).fill(0),
      decision: '数组长度小于 2，无需执行基数排序',
      message: '无需排序',
      log: '数组已有序',
      codeLine: 4,
      statusBadge: { text: '无需排序', type: 'info' }
    });
    return steps;
  }

  const maxVal = Math.max(...arr);
  let bits = 0;
  let tmp = maxVal;
  while (tmp > 0) {
    bits++;
    tmp = Math.floor(tmp / 10);
  }
  bits = Math.max(bits, 1);

  let stepIdx = 0;
  let offset = 1;

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    help: new Array(n).fill(0),
    currentDigit: 1,
    digitExp: 1,
    counts: new Array(10).fill(0),
    decision: `基数排序初始化：数组最大值 ${maxVal}，共需处理 ${bits} 个十进制位`,
    message: '算法初始化',
    log: `最大值 ${maxVal}, 总位数 ${bits}`,
    codeLine: 6,
    statusBadge: { text: '初始化', type: 'info' }
  });

  for (let d = 1; d <= bits; d++) {
    const digitName = d === 1 ? '个位' : d === 2 ? '十位' : d === 3 ? '百位' : `第 ${d} 位`;
    const count = new Array(10).fill(0);

    for (const x of arr) {
      const digit = Math.floor(x / offset) % 10;
      count[digit]++;
    }

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: new Array(n).fill(0),
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `处理【${digitName} (权值 ${offset})】：完成 0~9 数字频次统计`,
      message: `${digitName} 频次统计完成`,
      log: `${digitName} 计数完成`,
      codeLine: 16,
      statusBadge: { text: `${digitName} 计数`, type: 'info' }
    });

    // 前缀和
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: new Array(n).fill(0),
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `计算【${digitName}】前缀累加和表 count：count[i] 表示当前位 <= i 的元素最终应分配的最大出桶位置`,
      message: '前缀和表就绪',
      log: `${digitName} 前缀和计算完成`,
      codeLine: 20,
      statusBadge: { text: '前缀和转换', type: 'warning' }
    });

    const help = new Array(n);
    // 从右往左出桶以保证稳定性
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / offset) % 10;
      help[--count[digit]] = arr[i];
    }

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: [...help],
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `从右向左遍历原数组，依据 count 表将元素稳定放回辅助数组 help`,
      message: '稳定出桶分配完成',
      log: `${digitName} 出桶完成`,
      codeLine: 24,
      statusBadge: { text: '稳定出桶', type: 'warning' }
    });

    for (let i = 0; i < n; i++) arr[i] = help[i];

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: [...help],
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `【${digitName}】排序回合结束！原数组已按照当前低位保持相对有序`,
      message: `${digitName} 回合结束`,
      log: `${digitName} 排序完成: [${arr.join(', ')}]`,
      codeLine: 26,
      statusBadge: { text: `${digitName} 有序`, type: 'success' }
    });

    offset *= 10;
  }

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    help: [...arr],
    currentDigit: bits,
    digitExp: offset,
    counts: new Array(10).fill(0),
    decision: '基数排序全流程执行完毕！所有数位扫描完成，数组达到完全升序',
    message: '排序完全结束',
    log: '基数排序成功',
    codeLine: 28,
    statusBadge: { text: '完全升序', type: 'success' }
  });

  return steps;
}
