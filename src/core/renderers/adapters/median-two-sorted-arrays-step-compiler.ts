import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface MedianStep extends StepBase {
  stepIndex?: number;
  nums1: number[];
  nums2: number[];
  cut1: number; // i
  cut2: number; // j
  l1: number;
  r1: number;
  l2: number;
  r2: number;
  low: number;
  high: number;
  isPerfectCut: boolean;
  medianResult: number | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const MEDIAN_CODES = {
  java: `public class MedianTwoSortedArrays {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // 保证 nums1 是较短的数组，将二分复杂度降至 O(log(min(m, n)))
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        int m = nums1.length, n = nums2.length;
        int low = 0, high = m;

        while (low <= high) {
            int i = (low + high) / 2;
            int j = (m + n + 1) / 2 - i;

            int l1 = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int r1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int l2 = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int r2 = (j == n) ? Integer.MAX_VALUE : nums2[j];

            if (l1 <= r2 && l2 <= r1) {
                // 完美切分
                if ((m + n) % 2 == 1) {
                    return Math.max(l1, l2);
                } else {
                    return (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
                }
            } else if (l1 > r2) {
                high = i - 1; // nums1 切分点太靠右，左移
            } else {
                low = i + 1;  // nums1 切分点太靠左，右移
            }
        }
        return 0.0;
    }
}`,
  cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int low = 0, high = m;
        while (low <= high) {
            int i = (low + high) / 2;
            int j = (m + n + 1) / 2 - i;
            int l1 = (i == 0) ? INT_MIN : nums1[i - 1];
            int r1 = (i == m) ? INT_MAX : nums1[i];
            int l2 = (j == 0) ? INT_MIN : nums2[j - 1];
            int r2 = (j == n) ? INT_MAX : nums2[j];
            if (l1 <= r2 && l2 <= r1) {
                if ((m + n) % 2 == 1) return max(l1, l2);
                return (max(l1, l2) + min(r1, r2)) / 2.0;
            } else if (l1 > r2) {
                high = i - 1;
            } else {
                low = i + 1;
            }
        }
        return 0.0;
    }
};`,
  python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        m, n = len(nums1), len(nums2)
        low, high = 0, m

        while low <= high:
            i = (low + high) // 2
            j = (m + n + 1) // 2 - i

            l1 = float('-inf') if i == 0 else nums1[i - 1]
            r1 = float('inf') if i == m else nums1[i]
            l2 = float('-inf') if j == 0 else nums2[j - 1]
            r2 = float('inf') if j == n else nums2[j]

            if l1 <= r2 and l2 <= r1:
                if (m + n) % 2 == 1:
                    return max(l1, l2)
                return (max(l1, l2) + min(r1, r2)) / 2.0
            elif l1 > r2:
                high = i - 1
            else:
                low = i + 1
        return 0.0`,
  typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
    const m = nums1.length, n = nums2.length;
    let low = 0, high = m;

    while (low <= high) {
        const i = Math.floor((low + high) / 2);
        const j = Math.floor((m + n + 1) / 2) - i;

        const l1 = i === 0 ? -Infinity : nums1[i - 1];
        const r1 = i === m ? Infinity : nums1[i];
        const l2 = j === 0 ? -Infinity : nums2[j - 1];
        const r2 = j === n ? Infinity : nums2[j];

        if (l1 <= r2 && l2 <= r1) {
            if ((m + n) % 2 === 1) return Math.max(l1, l2);
            return (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
        } else if (l1 > r2) {
            high = i - 1;
        } else {
            low = i + 1;
        }
    }
    return 0.0;
}`
};

export const MEDIAN_TWO_SORTED_CODE_LINES = {
  entry: { java: 3, cpp: 3, python: 2, typescript: 1 },
  checkLen: { java: 5, cpp: 4, python: 3, typescript: 2 },
  whileLoop: { java: 11, cpp: 8, python: 7, typescript: 6 },
  calcCuts: { java: 12, cpp: 9, python: 8, typescript: 7 },
  extractBounds: { java: 15, cpp: 12, python: 11, typescript: 10 },
  checkPerfect: { java: 20, cpp: 17, python: 16, typescript: 15 },
  calcOddMedian: { java: 23, cpp: 18, python: 18, typescript: 16 },
  calcEvenMedian: { java: 25, cpp: 19, python: 19, typescript: 17 },
  adjustHigh: { java: 28, cpp: 21, python: 21, typescript: 19 },
  adjustLow: { java: 30, cpp: 23, python: 23, typescript: 21 },
};

export function generateMedianSteps(inputNums1: number[], inputNums2: number[]): MedianStep[] {
  const steps: MedianStep[] = [];
  let a = [...inputNums1];
  let b = [...inputNums2];

  if (a.length > b.length) {
    const tmp = a; a = b; b = tmp;
  }

  const m = a.length;
  const n = b.length;
  let low = 0;
  let high = m;

  const lines = MEDIAN_TWO_SORTED_CODE_LINES;

  // Step 0: 入口
  steps.push({
    nums1: a,
    nums2: b,
    cut1: 0,
    cut2: 0,
    l1: -Infinity,
    r1: Infinity,
    l2: -Infinity,
    r2: Infinity,
    low: 0,
    high: m,
    isPerfectCut: false,
    medianResult: null,
    decision: `启动双正序数组中位数求解：nums1 规模 m=${m}, nums2 规模 n=${n}`,
    message: '二分切分核心：将两数组分别切为两半，使左半部分总长度严格等于 (m+n+1)/2',
    log: `Init binary search cuts for m=${m}, n=${n}`,
    codeLine: lines.entry,
    statusBadge: { text: '二分就绪', type: 'info' },
    metrics: {
      median: '探查中',
      cuts: `i=0, j=0`,
      searchRange: `[0, ${m}]`,
      crossCheck: '准备比对',
    },
    ans: '-',
  });

  while (low <= high) {
    const i = Math.floor((low + high) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;

    const l1 = i === 0 ? -Infinity : a[i - 1];
    const r1 = i === m ? Infinity : a[i];
    const l2 = j === 0 ? -Infinity : b[j - 1];
    const r2 = j === n ? Infinity : b[j];

    const l1Display = l1 === -Infinity ? '-∞' : l1;
    const r1Display = r1 === Infinity ? '+∞' : r1;
    const l2Display = l2 === -Infinity ? '-∞' : l2;
    const r2Display = r2 === Infinity ? '+∞' : r2;

    if (l1 <= r2 && l2 <= r1) {
      // 完美切分
      let median = 0;
      if ((m + n) % 2 === 1) {
        median = Math.max(l1, l2);
      } else {
        median = (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
      }

      steps.push({
        nums1: a,
        nums2: b,
        cut1: i,
        cut2: j,
        l1, r1, l2, r2,
        low, high,
        isPerfectCut: true,
        medianResult: median,
        decision: `🎉 达成完美切分！nums1 切于 [${i}]，nums2 切于 [${j}]`,
        message: `交叉检验全部成立：L1(${l1Display}) <= R2(${r2Display}) 且 L2(${l2Display}) <= R1(${r1Display})。中位数 = ${median}`,
        log: `Perfect cut found at i=${i}, j=${j}. Median=${median}`,
        codeLine: (m + n) % 2 === 1 ? lines.calcOddMedian : lines.calcEvenMedian,
        statusBadge: { text: `中位数: ${median}`, type: 'success' },
        metrics: {
          median: median,
          cuts: `nums1[${i}] · nums2[${j}]`,
          searchRange: `[${low}, ${high}]`,
          crossCheck: '✓ 达成平衡',
        },
        ans: String(median),
      });
      break;
    } else if (l1 > r2) {
      steps.push({
        nums1: a,
        nums2: b,
        cut1: i,
        cut2: j,
        l1, r1, l2, r2,
        low, high,
        isPerfectCut: false,
        medianResult: null,
        decision: `切分失衡：L1(${l1Display}) > R2(${r2Display}) ➔ nums1 左侧元素过大，切分点太靠右`,
        message: `收缩右边界：high = ${i - 1}，将切分点向左收拢`,
        log: `Cut too far right: l1=${l1} > r2=${r2}. Set high=${i - 1}`,
        codeLine: lines.adjustHigh,
        statusBadge: { text: '向左调整', type: 'warning' },
        metrics: {
          median: '探查中',
          cuts: `nums1[${i}] · nums2[${j}]`,
          searchRange: `[${low}, ${high}]`,
          crossCheck: 'L1 > R2 (向左收缩)',
        },
        ans: '-',
      });
      high = i - 1;
    } else {
      steps.push({
        nums1: a,
        nums2: b,
        cut1: i,
        cut2: j,
        l1, r1, l2, r2,
        low, high,
        isPerfectCut: false,
        medianResult: null,
        decision: `切分失衡：L2(${l2Display}) > R1(${r1Display}) ➔ nums2 左侧元素过大，nums1 切分点太靠左`,
        message: `收缩左边界：low = ${i + 1}，将切分点向右推进`,
        log: `Cut too far left: l2=${l2} > r1=${r1}. Set low=${i + 1}`,
        codeLine: lines.adjustLow,
        statusBadge: { text: '向右调整', type: 'warning' },
        metrics: {
          median: '探查中',
          cuts: `nums1[${i}] · nums2[${j}]`,
          searchRange: `[${low}, ${high}]`,
          crossCheck: 'L2 > R1 (向右推进)',
        },
        ans: '-',
      });
      low = i + 1;
    }
  }

  return steps;
}
