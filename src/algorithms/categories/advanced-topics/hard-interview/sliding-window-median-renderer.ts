/**
 * 大厂高频真题 04: 滑动窗口中位数 (Sliding Window Median)
 * LeetCode 480 / 大厂高频压轴题
 * 对顶堆 (大根堆 + 小根堆) + 延迟删除机制
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

  return steps;
}

export function renderMedianSandbox(step: MedianStep): string {
  const arrayElementsHtml = step.nums.map((val, idx) => {
    const inWindow = idx >= step.windowLeft && idx <= step.windowRight;
    const isEnter = idx === step.windowRight;
    const isLeftEdge = idx === step.windowLeft;

    let border = '1px solid #e2e8f0';
    let bg = '#ffffff';
    let color = '#64748b';

    if (inWindow) {
      bg = '#e0f2fe';
      border = '1px solid #38bdf8';
      color = '#0369a1';
    }
    if (isEnter) {
      border = '2px solid #10b981';
    } else if (isLeftEdge) {
      border = '2px solid #f59e0b';
    }

    return `
      <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 3px;">
        <div style="width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; background: ${bg}; border: ${border}; color: ${color};">
          ${val}
        </div>
        <span style="font-size: 10px; color: #94a3b8; margin-top: 2px;">[${idx}]</span>
      </div>
    `;
  }).join('');

  const mediansHistoryHtml = step.mediansResult.map((m, idx) => {
    const isLatest = idx === step.mediansResult.length - 1;
    return `
      <span style="display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 4px; font-weight: 700; font-size: 12px; background: ${isLatest ? '#dcfce7' : '#f1f5f9'}; color: ${isLatest ? '#15803d' : '#64748b'};">
        ${m}
      </span>
    `;
  }).join(' ');

  return `
    <div style="display: flex; flex-direction: column; gap: 12px; font-family: inherit;">
      <!-- Card 1: 状态概览看板 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前滑窗 [L, R]</div>
          <div style="font-size: 16px; font-weight: 800; color: #0284c7;">[${step.windowLeft}, ${step.windowRight}]</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">移出 / 移入</div>
          <div style="font-size: 14px; font-weight: 700;">
            <span style="color: #ef4444;">-${step.outNum ?? '无'}</span> / <span style="color: #10b981;">+${step.inNum ?? '无'}</span>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前窗口中位数</div>
          <div style="font-size: 17px; font-weight: 800; color: #15803d;">${step.currentMedian}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: #64748b;">天平状态</div>
          <div style="font-size: 13px; font-weight: 700; color: #d97706;">
            大根${step.smallHeap.length} ⚖️ 小根${step.largeHeap.length}
          </div>
        </div>
      </div>

      <!-- Card 2: 数组滑窗物理全景 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; font-size: 13px; color: #0f172a;">
            🪟 数组滑窗物理全景 (Window Size K = ${step.k})
          </span>
          <span style="font-size: 11px; color: #64748b;">高亮区域为当前有效窗口</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; align-items: center;">
          ${arrayElementsHtml}
        </div>
      </div>

      <!-- Card 3: 对顶堆天平视效 -->
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center;">
        <div style="background: #ffffff; border: 1px solid #38bdf8; border-radius: 10px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 12px; color: #0284c7;">🔻 Small Heap (大根堆: ≤中位数)</span>
            <span style="font-size: 11px; color: #64748b;">Top: <b style="color: #0284c7;">${step.smallTop ?? '-'}</b></span>
          </div>
          <div style="font-size: 12px; color: #334155; word-break: break-all;">
            元素: [${step.smallHeap.join(', ')}]
          </div>
        </div>

        <div style="font-size: 24px; text-align: center; color: #f59e0b;">⚖️</div>

        <div style="background: #ffffff; border: 1px solid #22c55e; border-radius: 10px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 12px; color: #15803d;">🔺 Large Heap (小根堆: ≥中位数)</span>
            <span style="font-size: 11px; color: #64748b;">Top: <b style="color: #15803d;">${step.largeTop ?? '-'}</b></span>
          </div>
          <div style="font-size: 12px; color: #334155; word-break: break-all;">
            元素: [${step.largeHeap.join(', ')}]
          </div>
        </div>
      </div>

      <!-- Card 4: 结果历史 -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">🎯 累计中位数输出列表:</div>
        <div style="margin-bottom: 8px;">${mediansHistoryHtml}</div>
      </div>

      ${renderFormulaCard(
        '对顶堆动态平衡法则',
        'small 存较小一半，large 存较大一半；维护天平 small.size >= large.size；结合延迟删除哈希表 O(log K) 动态滑窗',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const slidingWindowMedianVisualizer = registerDeclarativeAlgorithm<MedianStep>({
  id: 'sliding-window-median',
  name: '大厂高频真题: 滑动窗口中位数 (Sliding Window Median)',
  category: 'array',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 480,
  learningGoal: '掌握对顶堆动态天平与延迟删除机制，在 O(log k) 效率下维护滑动窗口中位数',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 480)</h3>
      <p>中位数是有序序列最中间的那个数。给你一个整数数组 <code>nums</code> 和一个大小为 <code>k</code> 的滑动窗口，请给出每次窗口向右滑动时包含的 <code>k</code> 个数的中位数数组。</p>
    </div>
  `,
  codeLanguages: SLIDING_WINDOW_MEDIAN_CODES,
  inputs: [
    {
      id: 'k',
      label: '滑动窗口大小 (K)',
      type: 'number',
      defaultValue: 3,
    },
  ],
  generateSteps: (input) => {
    const nums = [1, 3, -1, -3, 5, 3, 6, 7];
    const k = Math.max(1, Math.min(Number(input.k) || 3, nums.length));
    return generateMedianSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMedianSandbox(step)}
      </div>
    `;
  },
});
