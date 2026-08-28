/**
 * LeetCode 239: 滑动窗口最大值 (Sliding Window Maximum)
 * 领域知识与题解精讲配置声明
 */

export const SLIDING_WINDOW_MAX_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">LeetCode 239</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">滑动窗口最大值 (Sliding Window Maximum)</h2>
    </div>
    <p style="margin: 0;">给你一个整数数组 <code style="color: #fde047; font-family: monospace;">nums</code>，有一个大小为 <code style="color: #fde047; font-family: monospace;">k</code> 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 <code style="color: #fde047; font-family: monospace;">k</code> 个数字。滑动窗口每次只向右移动一位。</p>
    <p style="margin: 0;">返回 <em>滑动窗口中的最大值</em> 。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: nums = [1,3,-1,-3,5,3,6,7], k = 3</div>
      <div>输出: [3,3,5,5,6,7]</div>
      <div>解释:</div>
      <div>滑动窗口的位置                最大值</div>
      <div>---------------               -----</div>
      <div>[1  3  -1] -3  5  3  6  7       3</div>
      <div> 1 [3  -1  -3] 5  3  6  7       3</div>
      <div> 1  3 [-1  -3  5] 3  6  7       5</div>
      <div> 1  3  -1 [-3  5  3] 6  7       5</div>
      <div> 1  3  -1  -3 [5  3  6] 7       6</div>
      <div> 1  3  -1  -3  5 [3  6  7]      7</div>
    </div>
  </div>
`;

export const SLIDING_WINDOW_MAX_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 单调队列设计：队头到队尾单调递减，队头恒为当前窗口最大值！
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么普通队列或大顶堆不够好？</div>
        <p style="margin: 0; color: #94a3b8;">
        • 普通队列无法在 O(1) 内获取最大值；<br/>
        • 大顶堆虽然可以获取最大值，但无法高效在滑动移出时精确定位并删除滑出窗口的元素（若延迟删除复杂度为 O(N log N)）。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 自定义单调队列三大规则</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <code style="color: #7dd3fc; font-family: monospace;">push(value)</code>：如果当前 push 的数值大于队尾数值，将队尾数值持续弹出，直到队尾数值大于等于当前数值（维持单调递减）；<br/>
        2. <code style="color: #7dd3fc; font-family: monospace;">pop(value)</code>：如果窗口滑出的数值等于单调队列的队头数值，则弹出队头；否则不作操作（说明该数早已在之前的 push 中被淘汰出队了）；<br/>
        3. <code style="color: #34d399; font-family: monospace;">front()</code>：直接返回队头元素，即为当前滑动窗口内的<strong>绝对最大值</strong>！时间复杂度 <strong>O(1)</strong>！
        </p>
      </div>
    </div>
  </div>
`;

export const SLIDING_WINDOW_MAX_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class MyQueue {',
    '    Deque<Integer> deque = new LinkedList<>();',
    '    void poll(int val) {',
    '        if (!deque.isEmpty() && val == deque.peek()) {',
    '            deque.poll();',
    '        }',
    '    }',
    '    void add(int val) {',
    '        while (!deque.isEmpty() && val > deque.getLast()) {',
    '            deque.removeLast();',
    '        }',
    '        deque.add(val);',
    '    }',
    '    int peek() {',
    '        return deque.peek();',
    '    }',
    '}',
    'class Solution {',
    '    public int[] maxSlidingWindow(int[] nums, int k) {',
    '        if (nums.length == 0 || k == 0) return new int[0];',
    '        MyQueue myQueue = new MyQueue();',
    '        int[] res = new int[nums.length - k + 1];',
    '        for (int i = 0; i < k; i++) myQueue.add(nums[i]);',
    '        res[0] = myQueue.peek();',
    '        for (int i = k; i < nums.length; i++) {',
    '            myQueue.poll(nums[i - k]);',
    '            myQueue.add(nums[i]);',
    '            res[i - k + 1] = myQueue.peek();',
    '        }',
    '        return res;',
    '    }',
    '}',
  ],
  cpp: [
    'class MyQueue {',
    'public:',
    '    deque<int> que;',
    '    void pop(int value) {',
    '        if (!que.empty() && value == que.front()) que.pop_front();',
    '    }',
    '    void push(int value) {',
    '        while (!que.empty() && value > que.back()) que.pop_back();',
    '        que.push_back(value);',
    '    }',
    '    int front() { return que.front(); }',
    '};',
    'class Solution {',
    'public:',
    '    vector<int> maxSlidingWindow(vector<int>& nums, int k) {',
    '        MyQueue que;',
    '        vector<int> result;',
    '        for (int i = 0; i < k; i++) que.push(nums[i]);',
    '        result.push_back(que.front());',
    '        for (int i = k; i < nums.size(); i++) {',
    '            que.pop(nums[i - k]);',
    '            que.push(nums[i]);',
    '            result.push_back(que.front());',
    '        }',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'from collections import deque',
    '',
    'class MyQueue:',
    '    def __init__(self):',
    '        self.queue = deque()',
    '    def pop(self, value):',
    '        if self.queue and value == self.queue[0]:',
    '            self.queue.popleft()',
    '    def push(self, value):',
    '        while self.queue and value > self.queue[-1]:',
    '            self.queue.pop()',
    '        self.queue.append(value)',
    '    def front(self):',
    '        return self.queue[0]',
    '',
    'class Solution:',
    '    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:',
    '        que = MyQueue()',
    '        result = []',
    '        for i in range(k): que.push(nums[i])',
    '        result.append(que.front())',
    '        for i in range(k, len(nums)):',
    '            que.pop(nums[i - k])',
    '            que.push(nums[i])',
    '            result.append(que.front())',
    '        return result',
  ],
  javascript: [
    'class MyQueue {',
    '    constructor() { this.queue = []; }',
    '    pop(value) {',
    '        if (this.queue.length && value === this.queue[0]) this.queue.shift();',
    '    }',
    '    push(value) {',
    '        while (this.queue.length && value > this.queue[this.queue.length - 1]) {',
    '            this.queue.pop();',
    '        }',
    '        this.queue.push(value);',
    '    }',
    '    front() { return this.queue[0]; }',
    '}',
    'var maxSlidingWindow = function(nums, k) {',
    '    const que = new MyQueue();',
    '    const result = [];',
    '    for (let i = 0; i < k; i++) que.push(nums[i]);',
    '    result.push(que.front());',
    '    for (let i = k; i < nums.length; i++) {',
    '        que.pop(nums[i - k]);',
    '        que.push(nums[i]);',
    '        result.push(que.front());',
    '    }',
    '    return result;',
    '};',
  ],
};
