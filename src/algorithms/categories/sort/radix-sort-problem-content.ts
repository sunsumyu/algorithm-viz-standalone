/**
 * 基数排序 (Radix Sort)
 * 领域知识与题解精讲配置声明
 */

export const RADIX_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">基数排序 (Radix Sort / LSD 低位优先桶分发)</h2>
    </div>
    <p style="margin: 0;"><strong>基数排序（Radix Sort）</strong> 属于“分配式排序”（Distribution Sort），是非比较型整数排序算法。其原理是将整数按位数切割成不同的数字，然后按每个位数分别比较。由于整数也可以表达字符串及特定格式的浮点数，所以基数排序不仅限于整数。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [170, 45, 75, 90, 802, 24, 2, 66]</div>
      <div>输出: [2, 24, 45, 66, 75, 90, 170, 802]</div>
      <div style="color: #94a3b8;">解释: 1. 按个位 (exp=1) 排序；2. 按十位 (exp=10) 排序；3. 按百位 (exp=100) 排序。</div>
    </div>
  </div>
`;

export const RADIX_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> LSD 低位优先（Least Significant Digit）与稳定计数子排序
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 按位迭代流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 找到数组中的最大值 <code style="color: #38bdf8; font-family: monospace;">maxVal</code>，获取最大位数 <code style="color: #38bdf8; font-family: monospace;">d</code>；<br/>
        2. 从最低有效位开始（<code style="color: #fbbf24; font-family: monospace;">exp = 1, 10, 100, ...</code>，直到 <code style="color: #fbbf24; font-family: monospace;">maxVal / exp == 0</code>）；<br/>
        3. 对当前位上的数字 <code style="color: #fde047; font-family: monospace;">digit = (arr[i] / exp) % 10</code> 执行<strong>稳定计数排序（Counting Sort）</strong>；<br/>
        4. 每一轮排好后写回原数组，由于计数排序是稳定的，低位的相对顺序在高位相同的前提下得以完美保持。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(d * (n + b))</code>，其中 <code style="color: #38bdf8; font-family: monospace;">d</code> 为最大位数，<code style="color: #38bdf8; font-family: monospace;">b</code> 为基数（十进制下 b=10）。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n + b)</code>。<br/>
        • 稳定性：<strong>稳定</strong>。<br/>
        • <strong>优势：</strong> 当关键字位数较少（<code style="color: #34d399; font-family: monospace;">d</code> 为常数）且数据量很大时，效率远超基于比较的 <code style="color: #60a5fa; font-family: monospace;">O(n log n)</code> 算法。
        </p>
      </div>
    </div>
  </div>
`;

export const RADIX_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void radixSort(int[] arr) {',
    '    if (arr.length <= 1) return;',
    '    int max = arr[0];',
    '    for (int x : arr) if (x > max) max = x;',
    '    // 按个位、十位、百位...依次进行计数排序',
    '    for (int exp = 1; max / exp > 0; exp *= 10) {',
    '        countSortByDigit(arr, exp);',
    '    }',
    '}',
    '',
    'private void countSortByDigit(int[] arr, int exp) {',
    '    int n = arr.length;',
    '    int[] output = new int[n];',
    '    int[] count = new int[10];',
    '    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;',
    '    for (int i = 1; i < 10; i++) count[i] += count[i - 1];',
    '    for (int i = n - 1; i >= 0; i--) {',
    '        int d = (arr[i] / exp) % 10;',
    '        output[--count[d]] = arr[i];',
    '    }',
    '    for (int i = 0; i < n; i++) arr[i] = output[i];',
    '}',
  ],
  cpp: [
    'void radixSort(vector<int>& arr) {',
    '    if (arr.size() <= 1) return;',
    '    int maxVal = *max_element(arr.begin(), arr.end());',
    '    for (int exp = 1; maxVal / exp > 0; exp *= 10) {',
    '        countSortByDigit(arr, exp);',
    '    }',
    '}',
    'void countSortByDigit(vector<int>& arr, int exp) {',
    '    int n = arr.size();',
    '    vector<int> output(n), count(10, 0);',
    '    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;',
    '    for (int i = 1; i < 10; i++) count[i] += count[i - 1];',
    '    for (int i = n - 1; i >= 0; i--) {',
    '        int d = (arr[i] / exp) % 10;',
    '        output[--count[d]] = arr[i];',
    '    }',
    '    for (int i = 0; i < n; i++) arr[i] = output[i];',
    '}',
  ],
  python: [
    'def radix_sort(arr: list[int]) -> None:',
    '    if len(arr) <= 1: return',
    '    max_val = max(arr)',
    '    exp = 1',
    '    while max_val // exp > 0:',
    '        count = [0] * 10',
    '        output = [0] * len(arr)',
    '        for x in arr: count[(x // exp) % 10] += 1',
    '        for i in range(1, 10): count[i] += count[i - 1]',
    '        for x in reversed(arr):',
    '            d = (x // exp) % 10',
    '            count[d] -= 1',
    '            output[count[d]] = x',
    '        for i in range(len(arr)): arr[i] = output[i]',
    '        exp *= 10',
  ],
  javascript: [
    'function radixSort(arr) {',
    '    if (arr.length <= 1) return;',
    '    const maxVal = Math.max(...arr);',
    '    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {',
    '        const n = arr.length;',
    '        const output = new Array(n);',
    '        const count = new Array(10).fill(0);',
    '        for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;',
    '        for (let i = 1; i < 10; i++) count[i] += count[i - 1];',
    '        for (let i = n - 1; i >= 0; i--) {',
    '            const d = Math.floor(arr[i] / exp) % 10;',
    '            output[--count[d]] = arr[i];',
    '        }',
    '        for (let i = 0; i < n; i++) arr[i] = output[i];',
    '    }',
    '}',
  ],
};
