import { StepBase } from '../../../core/step-visualizer';

export interface NetherlandsStep extends StepBase {
  nums: number[];
  target: number;
  less: number;
  more: number;
  cur: number;
  swappedIndices?: [number, number];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const NETHERLANDS_FLAG_024_CODES = {
  java: `public class NetherlandsFlag {
    // 荷兰国旗三向切分：小于区、等于区、大于区
    public static int[] partition(int[] arr, int l, int r, int target) {
        int less = l - 1;
        int more = r + 1;
        int cur = l;
        while (cur < more) {
            if (arr[cur] < target) {
                swap(arr, ++less, cur++);
            } else if (arr[cur] > target) {
                swap(arr, --more, cur);
            } else {
                cur++;
            }
        }
        return new int[] { less + 1, more - 1 };
    }
    static void swap(int[] arr, int i, int j) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}`,
  cpp: `pair<int, int> partition(vector<int>& arr, int l, int r, int target) {
    int less = l - 1, more = r + 1, cur = l;
    while (cur < more) {
        if (arr[cur] < target) swap(arr, ++less, cur++);
        else if (arr[cur] > target) swap(arr, --more, cur);
        else cur++;
    }
    return {less + 1, more - 1};
}`,
  python: `def partition(arr, l, r, target):
    less, more, cur = l - 1, r + 1, l
    while cur < more:
        if arr[cur] < target:
            less += 1
            arr[less], arr[cur] = arr[cur], arr[less]
            cur += 1
        elif arr[cur] > target:
            more -= 1
            arr[more], arr[cur] = arr[cur], arr[more]
        else:
            cur += 1
    return less + 1, more - 1`,
  typescript: `export function partition(arr: number[], l: number, r: number, target: number): [number, number] {
  let less = l - 1;
  let more = r + 1;
  let cur = l;
  while (cur < more) {
    if (arr[cur] < target) {
      less++;
      [arr[less], arr[cur]] = [arr[cur], arr[less]];
      cur++;
    } else if (arr[cur] > target) {
      more--;
      [arr[more], arr[cur]] = [arr[cur], arr[more]];
    } else {
      cur++;
    }
  }
  return [less + 1, more - 1];
}`
};

export function buildNetherlands024Steps(
  rawNums: number[] = [3, 5, 2, 6, 3, 1, 7, 3, 4],
  target: number = 3
): NetherlandsStep[] {
  const steps: NetherlandsStep[] = [];
  const a = [...rawNums];
  const n = a.length;

  let less = -1;
  let more = n;
  let cur = 0;

  steps.push({
    nums: [...a],
    target,
    less,
    more,
    cur,
    decision: `主函数入口：开始进行荷兰国旗三向切分，基准目标 target = ${target}`,
    message: `初始数组: [${a.join(', ')}]。小于区在 -1，大于区在 ${n}，cur 从 0 开始扫描。`,
    log: `Init partition: target=${target}, less=-1, more=${n}`,
    codeLine: 4,
    statusBadge: { text: '准备切分', type: 'info' }
  });

  while (cur < more) {
    if (a[cur] < target) {
      const targetLess = less + 1;
      const swapPair: [number, number] = [targetLess, cur];
      const tmp = a[targetLess];
      a[targetLess] = a[cur];
      a[cur] = tmp;
      less++;

      steps.push({
        nums: [...a],
        target,
        less,
        more,
        cur,
        swappedIndices: swapPair,
        decision: `a[cur=${cur}]=${a[targetLess]} < target(${target})：与小于区下一个位置 #${targetLess} 交换，小于区右扩至 #${less}`,
        message: `元素 ${a[targetLess]} 划入小于区，cur 和 less 同步递增。`,
        log: `swap(arr[${targetLess}], arr[${cur}]), less=${less}`,
        codeLine: 9,
        statusBadge: { text: '扩大小于区', type: 'success' }
      });
      cur++;
    } else if (a[cur] > target) {
      const targetMore = more - 1;
      const swapPair: [number, number] = [targetMore, cur];
      const tmp = a[targetMore];
      a[targetMore] = a[cur];
      a[cur] = tmp;
      more--;

      steps.push({
        nums: [...a],
        target,
        less,
        more,
        cur,
        swappedIndices: swapPair,
        decision: `a[cur=${cur}]=${a[targetMore]} > target(${target})：与大于区前一个位置 #${targetMore} 交换，大于区左扩至 #${more}`,
        message: `元素 ${a[targetMore]} 划入大于区。注意：换过来的元素未经考察，cur 指针不自增！`,
        log: `swap(arr[${targetMore}], arr[${cur}]), more=${more}`,
        codeLine: 11,
        statusBadge: { text: '扩大大于区', type: 'warning' }
      });
    } else {
      steps.push({
        nums: [...a],
        target,
        less,
        more,
        cur,
        decision: `a[cur=${cur}]=${a[cur]} == target(${target})：命中等于区，直接前进`,
        message: `属于等于区元素，留在中间无需交换，cur++。`,
        log: `cur++ (${cur} -> ${cur + 1})`,
        codeLine: 13,
        statusBadge: { text: '等于区通过', type: 'info' }
      });
      cur++;
    }
  }

  steps.push({
    nums: [...a],
    target,
    less,
    more,
    cur,
    decision: `三向切分完成！小于区 [0 .. ${less}]，等于区 [${less + 1} .. ${more - 1}]，大于区 [${more} .. ${n - 1}]`,
    message: `等于区所有元素值均为 ${target}，在随机快速排序中可直接归位，无需继续递归！`,
    log: `Finished. equals range = [${less + 1}, ${more - 1}]`,
    codeLine: 16,
    statusBadge: { text: '切分完成', type: 'success' }
  });

  return steps;
}
