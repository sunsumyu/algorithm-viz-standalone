import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface MedianStep extends StepBase {
  nums: number[];
  k: number;
  windowLeft: number;
  windowRight: number;
  inNum?: number;
  outNum?: number;
  smallHeap: number[];
  largeHeap: number[];
  smallTop?: number;
  largeTop?: number;
  currentMedian: number;
  mediansResult: number[];
  delayedMap: { val: number; count: number }[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const SLIDING_WINDOW_MEDIAN_CODES = {
  java: `public class SlidingWindowMedian {
    PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> large = new PriorityQueue<>();
    Map<Integer, Integer> delayed = new HashMap<>();
    int smallSize = 0, largeSize = 0;

    public double[] medianSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        double[] ans = new double[n - k + 1];
        for (int i = 0; i < k; i++) insert(nums[i]);
        ans[0] = getMedian(k);
        for (int i = k; i < n; i++) {
            insert(nums[i]);
            erase(nums[i - k]);
            ans[i - k + 1] = getMedian(k);
        }
        return ans;
    }
    void insert(int num) {
        if (small.isEmpty() || num <= small.peek()) {
            small.offer(num); smallSize++;
        } else {
            large.offer(num); largeSize++;
        }
        makeBalance();
    }
    void erase(int num) {
        delayed.put(num, delayed.getOrDefault(num, 0) + 1);
        if (num <= small.peek()) {
            smallSize--;
            if (num == small.peek()) prune(small);
        } else {
            largeSize--;
            if (num == large.peek()) prune(large);
        }
        makeBalance();
    }
    void makeBalance() {
        if (smallSize > largeSize + 1) {
            large.offer(small.poll());
            smallSize--; largeSize++;
            prune(small);
        } else if (smallSize < largeSize) {
            small.offer(large.poll());
            smallSize++; largeSize--;
            prune(large);
        }
    }
    void prune(PriorityQueue<Integer> heap) {
        while (!heap.isEmpty()) {
            int num = heap.peek();
            if (delayed.containsKey(num)) {
                delayed.put(num, delayed.get(num) - 1);
                if (delayed.get(num) == 0) delayed.remove(num);
                heap.poll();
            } else break;
        }
    }
    double getMedian(int k) {
        return (k & 1) == 1 ? small.peek() : ((double)small.peek() + large.peek()) / 2.0;
    }
}`,
  cpp: `class DualHeap {
    priority_queue<int> small;
    priority_queue<int, vector<int>, greater<int>> large;
    unordered_map<int, int> delayed;
    int smallSize = 0, largeSize = 0;

    template<typename T>
    void prune(T& heap) {
        while (!heap.empty()) {
            int num = heap.top();
            if (delayed.count(num)) {
                if (--delayed[num] == 0) delayed.erase(num);
                heap.pop();
            } else break;
        }
    }
    void makeBalance() {
        if (smallSize > largeSize + 1) {
            large.push(small.top()); small.pop();
            smallSize--; largeSize++;
            prune(small);
        } else if (smallSize < largeSize) {
            small.push(large.top()); large.pop();
            smallSize++; largeSize--;
            prune(large);
        }
    }
public:
    void insert(int num) {
        if (small.empty() || num <= small.top()) {
            small.push(num); smallSize++;
        } else {
            large.push(num); largeSize++;
        }
        makeBalance();
    }
    void erase(int num) {
        delayed[num]++;
        if (num <= small.top()) {
            smallSize--;
            if (num == small.top()) prune(small);
        } else {
            largeSize--;
            if (num == large.top()) prune(large);
        }
        makeBalance();
    }
    double getMedian(int k) {
        return (k & 1) ? small.top() : ((double)small.top() + large.top()) / 2.0;
    }
};`,
  python: `class Solution:
    def medianSlidingWindow(self, nums: List[int], k: int) -> List[float]:
        small, large = [], []
        delayed = collections.defaultdict(int)
        small_sz, large_sz = 0, 0
        
        def prune(heap, is_small):
            while heap:
                num = -heap[0] if is_small else heap[0]
                if delayed[num] > 0:
                    delayed[num] -= 1
                    heapq.heappop(heap)
                else:
                    break
                    
        def balance():
            nonlocal small_sz, large_sz
            if small_sz > large_sz + 1:
                val = -heapq.heappop(small)
                heapq.heappush(large, val)
                small_sz -= 1
                large_sz += 1
                prune(small, True)
            elif small_sz < large_sz:
                val = heapq.heappop(large)
                heapq.heappush(small, -val)
                small_sz += 1
                large_sz -= 1
                prune(large, False)
                
        def insert(num):
            nonlocal small_sz, large_sz
            if not small or num <= -small[0]:
                heapq.heappush(small, -num)
                small_sz += 1
            else:
                heapq.heappush(large, num)
                large_sz += 1
            balance()
            
        def erase(num):
            nonlocal small_sz, large_sz
            delayed[num] += 1
            if num <= -small[0]:
                small_sz -= 1
                if num == -small[0]:
                    prune(small, True)
            else:
                large_sz -= 1
                if num == large[0]:
                    prune(large, False)
            balance()
            
        ans = []
        for i in range(k):
            insert(nums[i])
        ans.append(-small[0] if k % 2 == 1 else (-small[0] + large[0]) / 2.0)
        
        for i in range(k, len(nums)):
            insert(nums[i])
            erase(nums[i - k])
            ans.append(-small[0] if k % 2 == 1 else (-small[0] + large[0]) / 2.0)
        return ans`,
  typescript: `function medianSlidingWindow(nums: number[], k: number): number[] {
  const ans: number[] = [];
  const window: number[] = [];
  for (let i = 0; i < k; i++) {
    window.push(nums[i]);
  }
  window.sort((a, b) => a - b);
  const getMed = () => (k % 2 === 1 ? window[Math.floor(k / 2)] : (window[k / 2 - 1] + window[k / 2]) / 2);
  ans.push(getMed());

  for (let i = k; i < nums.length; i++) {
    const outVal = nums[i - k];
    const inVal = nums[i];
    const outIdx = window.indexOf(outVal);
    window.splice(outIdx, 1);
    let pos = window.findIndex(x => x >= inVal);
    if (pos === -1) window.push(inVal);
    else window.splice(pos, 0, inVal);
    ans.push(getMed());
  }
  return ans;
}`
};

export function generateMedianSteps(nums: number[], k: number): MedianStep[] {
  const steps: MedianStep[] = [];
  const n = nums.length;
  if (k > n || k <= 0) return steps;

  let smallHeap: number[] = [];
  let largeHeap: number[] = [];
  let smallSize = 0;
  let largeSize = 0;
  const delayed = new Map<number, number>();
  const mediansResult: number[] = [];

  const prune = (isSmall: boolean) => {
    const heap = isSmall ? smallHeap : largeHeap;
    while (heap.length > 0) {
      const top = heap[0];
      const count = delayed.get(top) || 0;
      if (count > 0) {
        if (count === 1) delayed.delete(top);
        else delayed.set(top, count - 1);
        heap.shift();
      } else {
        break;
      }
    }
  };

  const balance = () => {
    if (smallSize > largeSize + 1) {
      const moved = smallHeap.shift()!;
      largeHeap.push(moved);
      largeHeap.sort((a, b) => a - b);
      smallSize--;
      largeSize++;
      prune(true);
    } else if (smallSize < largeSize) {
      const moved = largeHeap.shift()!;
      smallHeap.push(moved);
      smallHeap.sort((a, b) => b - a);
      smallSize++;
      largeSize--;
      prune(false);
    }
  };

  const insert = (val: number) => {
    if (smallHeap.length === 0 || val <= smallHeap[0]) {
      smallHeap.push(val);
      smallHeap.sort((a, b) => b - a);
      smallSize++;
    } else {
      largeHeap.push(val);
      largeHeap.sort((a, b) => a - b);
      largeSize++;
    }
    balance();
  };

  const erase = (val: number) => {
    delayed.set(val, (delayed.get(val) || 0) + 1);
    if (smallHeap.length > 0 && val <= smallHeap[0]) {
      smallSize--;
      if (val === smallHeap[0]) prune(true);
    } else {
      largeSize--;
      if (largeHeap.length > 0 && val === largeHeap[0]) prune(false);
    }
    balance();
  };

  const getMedian = (): number => {
    prune(true);
    prune(false);
    if (k % 2 === 1) {
      return smallHeap[0];
    } else {
      return (smallHeap[0] + largeHeap[0]) / 2.0;
    }
  };

  const snapshotDelayed = () => {
    return Array.from(delayed.entries()).map(([val, count]) => ({ val, count }));
  };

  for (let i = 0; i < k; i++) {
    insert(nums[i]);
  }
  let med = getMedian();
  mediansResult.push(med);

  steps.push({
    nums,
    k,
    windowLeft: 0,
    windowRight: k - 1,
    inNum: nums[k - 1],
    smallHeap: [...smallHeap],
    largeHeap: [...largeHeap],
    smallTop: smallHeap[0],
    largeTop: largeHeap[0],
    currentMedian: med,
    mediansResult: [...mediansResult],
    delayedMap: snapshotDelayed(),
    decision: `首个窗口 [0..${k - 1}] 构建完成，中位数 = ${med}`,
    message: `初始装入前 ${k} 个元素。小根堆与大根堆达到天平平衡。当前窗口中位数为 ${med}。`,
    log: `Init window [0, ${k - 1}]: median=${med}`,
    codeLine: 12,
    statusBadge: { text: `中位数: ${med}`, type: 'success' }
  });

  for (let i = k; i < n; i++) {
    const inVal = nums[i];
    const outVal = nums[i - k];

    insert(inVal);
    erase(outVal);

    med = getMedian();
    mediansResult.push(med);

    const left = i - k + 1;
    const right = i;

    steps.push({
      nums,
      k,
      windowLeft: left,
      windowRight: right,
      inNum: inVal,
      outNum: outVal,
      smallHeap: [...smallHeap],
      largeHeap: [...largeHeap],
      smallTop: smallHeap[0],
      largeTop: largeHeap[0],
      currentMedian: med,
      mediansResult: [...mediansResult],
      delayedMap: snapshotDelayed(),
      decision: `窗口右滑: 移出 ${outVal}, 移入 ${inVal}，新中位数 = ${med}`,
      message: `滑窗 [${left}..${right}]: 移出 nums[${i - k}]=${outVal} (延迟删除登记)，移入 nums[${i}]=${inVal}。天平重新平衡，中位数 = ${med}。`,
      log: `Slide to [${left}, ${right}]: out=${outVal}, in=${inVal} -> med=${med}`,
      codeLine: 16,
      statusBadge: { text: `中位数: ${med}`, type: 'info' }
    });
  }

  return steps.map((s) => ({
    ...s,
    metrics: {
      median: `${s.currentMedian}`,
      windowRange: `[${s.windowLeft} .. ${s.windowRight}]`,
      inOut: `${s.inNum != null ? `+${s.inNum}` : ''}${s.outNum != null ? ` -${s.outNum}` : (s.inNum == null ? '—' : '')}`,
      balance: `大根 ${s.smallHeap.length} ⚖️ 小根 ${s.largeHeap.length}`,
    },
    ans: `[${s.mediansResult.join(', ')}]`,
  }));
}
