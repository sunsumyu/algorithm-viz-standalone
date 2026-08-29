/**
 * 计数排序 (Counting Sort)
 * 领域知识与题解精讲配置声明
 */

export const COUNTING_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Linear</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">计数排序 (Counting Sort / 频率统计与前缀累加)</h2>
    </div>
    <p style="margin: 0;"><strong>计数排序（Counting Sort）</strong> 是一种非基于比较的线性时间排序算法。其核心在于将输入的数据值转化为键存储在额外开辟的数组空间中，通过统计每个数值出现的频次和前缀和定位，实现高效排序。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [4, 2, 2, 8, 3, 3, 1] (范围 1..8)</div>
      <div>输出: [1, 2, 2, 3, 3, 4, 8]</div>
      <div style="color: #94a3b8;">解释: 统计 count 数组 [0, 1, 2, 2, 1, 0, 0, 0, 1]，前缀累加后稳定反向回填。</div>
    </div>
  </div>
`;

export const COUNTING_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 计数表统计、前缀和累加与稳定逆序填回
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 算法执行三步法</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>找极值与定容量：</strong> 扫描获取 <code style="color: #38bdf8; font-family: monospace;">minVal</code> 与 <code style="color: #38bdf8; font-family: monospace;">maxVal</code>，建立长度为 <code style="color: #fde047; font-family: monospace;">k = maxVal - minVal + 1</code> 的计数数组 <code style="color: #fde047; font-family: monospace;">count</code>；<br/>
        2. <strong>频次统计与前缀和：</strong> 统计各数值频次，并累加 <code style="color: #fbbf24; font-family: monospace;">count[i] += count[i - 1]</code>，表示 &le; i 的元素总数；<br/>
        3. <strong>从后向前稳定回填：</strong> 从原数组末尾逆序遍历元素 <code style="color: #38bdf8; font-family: monospace;">x</code>，其在输出数组的位置为 <code style="color: #34d399; font-family: monospace;">output[--count[x - minVal]] = x</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：严格为线性 <code style="color: #34d399; font-family: monospace;">O(n + k)</code>（k 为数据值域范围）。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n + k)</code>。<br/>
        • 稳定性：<strong>稳定</strong>（逆序扫描保证相同元素的相对次序不变）。<br/>
        • <strong>局限性：</strong> 仅适用于<strong>整数或离散键值</strong>，且当值域范围 <code style="color: #f87171; font-family: monospace;">k >> n</code>（例如包含极端离群值）时内存开销巨大。
        </p>
      </div>
    </div>
  </div>
`;

export const COUNTING_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[] countingSort(int[] arr) {',
    '    if (arr.length <= 1) return arr;',
    '    int min = arr[0], max = arr[0];',
    '    for (int num : arr) {',
    '        if (num < min) min = num;',
    '        if (num > max) max = num;',
    '    }',
    '    int k = max - min + 1;',
    '    int[] count = new int[k];',
    '    for (int num : arr) count[num - min]++;',
    '    for (int i = 1; i < k; i++) count[i] += count[i - 1]; // 前缀和',
    '    int[] output = new int[arr.length];',
    '    for (int i = arr.length - 1; i >= 0; i--) { // 倒序保证稳定性',
    '        output[--count[arr[i] - min]] = arr[i];',
    '    }',
    '    return output;',
    '}',
  ],
  cpp: [
    'vector<int> countingSort(vector<int>& arr) {',
    '    if (arr.size() <= 1) return arr;',
    '    int minVal = *min_element(arr.begin(), arr.end());',
    '    int maxVal = *max_element(arr.begin(), arr.end());',
    '    int k = maxVal - minVal + 1;',
    '    vector<int> count(k, 0);',
    '    for (int num : arr) count[num - minVal]++;',
    '    for (int i = 1; i < k; i++) count[i] += count[i - 1];',
    '    vector<int> output(arr.size());',
    '    for (int i = arr.size() - 1; i >= 0; i--) {',
    '        output[--count[arr[i] - minVal]] = arr[i];',
    '    }',
    '    return output;',
    '}',
  ],
  python: [
    'def counting_sort(arr: list[int]) -> list[int]:',
    '    if len(arr) <= 1: return arr',
    '    min_val, max_val = min(arr), max(arr)',
    '    k = max_val - min_val + 1',
    '    count = [0] * k',
    '    for x in arr: count[x - min_val] += 1',
    '    for i in range(1, k): count[i] += count[i - 1]',
    '    output = [0] * len(arr)',
    '    for x in reversed(arr):',
    '        count[x - min_val] -= 1',
    '        output[count[x - min_val]] = x',
    '    return output',
  ],
  javascript: [
    'function countingSort(arr) {',
    '    if (arr.length <= 1) return arr;',
    '    const min = Math.min(...arr);',
    '    const max = Math.max(...arr);',
    '    const k = max - min + 1;',
    '    const count = new Array(k).fill(0);',
    '    for (const num of arr) count[num - min]++;',
    '    for (let i = 1; i < k; i++) count[i] += count[i - 1];',
    '    const output = new Array(arr.length);',
    '    for (let i = arr.length - 1; i >= 0; i--) {',
    '        output[--count[arr[i] - min]] = arr[i];',
    '    }',
    '    return output;',
    '}',
  ],
};
