/**
 * LeetCode 347: 前 K 个高频元素 (Top K Frequent Elements)
 * 领域知识与题解精讲配置声明
 */

export const TOP_K_FREQUENT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 347</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">前 K 个高频元素 (Top K Frequent Elements)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code> 和一个整数 <code style="color: #fde047; font-family: monospace;">k</code> ，请你返回其中出现频率前 <code style="color: #fde047; font-family: monospace;">k</code> 高的元素。你可以按 <strong>任意顺序</strong> 返回答案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,1,1,2,2,3], k = 2</div>
      <div>输出: [1,2]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: nums = [1], k = 1</div>
      <div>输出: [1]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; nums.length &le; 10^5</div>
      <div>• k 的取值范围是 [1, 数组中不相同的元素的个数]</div>
      <div>• 题目数据保证答案唯一，换句话说，数组中前 k 个高频元素的集合是唯一的</div>
      <div>• 你的算法的时间复杂度必须优于 O(n log n) ，其中 n 是数组大小。</div>
    </div>
  </div>
`;

export const TOP_K_FREQUENT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 优先级队列 / 小顶堆：维护大小为 k 的最小频率淘汰器
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么求前 K 大频率要用「小顶堆」？</div>
        <p style="margin: 0; color: #94a3b8;">
        • 如果用大顶堆，堆顶是最大值，当堆大小超过 k 时弹出的是<strong>最大的</strong>，反而把我们想要的最高频元素丢掉了！<br/>
        • 因此必须用<strong>小顶堆</strong>：堆顶始终是堆内<strong>频率最小</strong>的元素。当堆大小超过 k 时，弹出堆顶（淘汰掉相对低频的元素），最终留在堆中的 k 个元素自然就是<strong>频率最高的 k 个</strong>！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度优势</div>
        <p style="margin: 0; color: #94a3b8;">
        • 哈希统计：<code style="color: #7dd3fc; font-family: monospace;">O(N)</code>；<br/>
        • 维护大小为 k 的小顶堆：遍历不同元素入堆，单次调整 <code style="color: #7dd3fc; font-family: monospace;">O(log k)</code>，总时间复杂度为 <strong>O(N log k)</strong>！<br/>
        • 当 k &lt;&lt; N 时，效率远高于全局排序 O(N log N)！
        </p>
      </div>
    </div>
  </div>
`;

export const TOP_K_FREQUENT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] topKFrequent(int[] nums, int k) {',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    for (int num : nums) map.put(num, map.getOrDefault(num, 0) + 1);',
    '    // 小顶堆：按频率升序排列',
    '    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);',
    '    for (Map.Entry<Integer, Integer> entry : map.entrySet()) {',
    '        pq.add(new int[]{entry.getKey(), entry.getValue()});',
    '        if (pq.size() > k) {',
    '            pq.poll(); // 弹出频率最小的堆顶',
    '        }',
    '    }',
    '    int[] result = new int[k];',
    '    for (int i = k - 1; i >= 0; i--) {',
    '        result[i] = pq.poll()[0];',
    '    }',
    '    return result;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> topKFrequent(vector<int>& nums, int k) {',
    '        unordered_map<int, int> map;',
    '        for (int num : nums) map[num]++;',
    '        // 小顶堆：pair<freq, num>',
    '        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;',
    '        for (auto& it : map) {',
    '            pq.push({it.second, it.first});',
    '            if (pq.size() > k) pq.pop();',
    '        }',
    '        vector<int> result(k);',
    '        for (int i = k - 1; i >= 0; i--) {',
    '            result[i] = pq.top().second;',
    '            pq.pop();',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'import heapq',
    'from collections import Counter',
    '',
    'class Solution:',
    '    def topKFrequent(self, nums: List[int], k: int) -> List[int]:',
    '        count = Counter(nums)',
    '        # 小顶堆存储 (freq, num)',
    '        heap = []',
    '        for num, freq in count.items():',
    '            heapq.heappush(heap, (freq, num))',
    '            if len(heap) > k:',
    '                heapq.heappop(heap)',
    '        return [item[1] for item in heap]',
  ],
  javascript: [
    'var topKFrequent = function(nums, k) {',
    '    const map = new Map();',
    '    for (const num of nums) map.set(num, (map.get(num) || 0) + 1);',
    '    // 桶排序或排序取前 k',
    '    return Array.from(map.entries())',
    '        .sort((a, b) => b[1] - a[1])',
    '        .slice(0, k)',
    '        .map(entry => entry[0]);',
    '};',
  ],
};
