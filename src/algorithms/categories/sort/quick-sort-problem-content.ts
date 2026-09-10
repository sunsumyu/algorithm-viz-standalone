/**
 * 快速排序 (Quick Sort)
 * 领域知识与题解精讲配置声明
 */

export const QUICK_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">快速排序 (Quick Sort / 挖坑填补法与双向指针)</h2>
    </div>
    <p style="margin: 0;"><strong>快速排序（Quicksort）</strong> 是一种高效的排序算法。通过一趟排序将待排记录分隔成独立的两部分，其中一部分记录的关键字均比另一部分的关键字小，则可分别对这两部分记录继续进行排序，以达到整个序列有序。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [6, 1, 2, 7, 9, 3, 4, 5, 10, 8]</div>
      <div>输出: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]</div>
      <div style="color: #94a3b8;">解释: 以 6 为基准值 pivot，双指针两端向内扫描交换，最终 6 落入正确索引 5，左右递归求解。</div>
    </div>
  </div>
`;

export const QUICK_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 基准值划分（Pivot Partition）与原地双指针夹逼
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 双指针 Partition 流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 选取基准值 <code style="color: #fde047; font-family: monospace;">pivot = arr[left]</code>，指针 <code style="color: #38bdf8; font-family: monospace;">i = left</code>，<code style="color: #a855f7; font-family: monospace;">j = right</code>；<br/>
        2. 指针 <code style="color: #a855f7; font-family: monospace;">j</code> 从右向左找<strong>第一个小于 pivot 的数</strong>；<br/>
        3. 指针 <code style="color: #38bdf8; font-family: monospace;">i</code> 从左向右找<strong>第一个大于 pivot 的数</strong>；<br/>
        4. 若 <code style="color: #fbbf24; font-family: monospace;">i < j</code>，交换 <code style="color: #fbbf24; font-family: monospace;">swap(arr[i], arr[j])</code>；<br/>
        5. 当 <code style="color: #34d399; font-family: monospace;">i == j</code> 相遇时，交换相遇点与基准值 <code style="color: #34d399; font-family: monospace;">swap(arr[left], arr[i])</code>；<br/>
        6. 此时基准值已精准归位，递归对 <code style="color: #38bdf8; font-family: monospace;">[left, i - 1]</code> 和 <code style="color: #a855f7; font-family: monospace;">[i + 1, right]</code> 求解。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与稳定性</div>
        <p style="margin: 0; color: #94a3b8;">
        • 平均时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n log n)</code>（常数极小，缓存友好）。<br/>
        • 最坏时间复杂度：<code style="color: #f87171; font-family: monospace;">O(n²)</code>（完全有序且每次固定选端点为 pivot，退化为链表，可通过三数取中/随机基准避免）。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(log n)</code>（递归调用栈）。<br/>
        • 稳定性：<strong>不稳定</strong>（跨越式交换破坏相同元素相对次序）。
        </p>
      </div>
    </div>
  </div>
`;

export const QUICK_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void quickSort(int[] arr, int left, int right) {',
    '    if (left >= right) return;',
    '    int pivotIdx = partition(arr, left, right);',
    '    quickSort(arr, left, pivotIdx - 1);',
    '    quickSort(arr, pivotIdx + 1, right);',
    '}',
    '',
    'private int partition(int[] arr, int left, int right) {',
    '    int pivot = arr[left];',
    '    int i = left, j = right;',
    '    while (i < j) {',
    '        while (i < j && arr[j] >= pivot) j--;',
    '        while (i < j && arr[i] <= pivot) i++;',
    '        if (i < j) {',
    '            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;',
    '        }',
    '    }',
    '    arr[left] = arr[i]; arr[i] = pivot;',
    '    return i;',
    '}',
  ],
  cpp: [
    'void quickSort(vector<int>& arr, int left, int right) {',
    '    if (left >= right) return;',
    '    int pivotIdx = partition(arr, left, right);',
    '    quickSort(arr, left, pivotIdx - 1);',
    '    quickSort(arr, pivotIdx + 1, right);',
    '}',
    'int partition(vector<int>& arr, int left, int right) {',
    '    int pivot = arr[left];',
    '    int i = left, j = right;',
    '    while (i < j) {',
    '        while (i < j && arr[j] >= pivot) j--;',
    '        while (i < j && arr[i] <= pivot) i++;',
    '        if (i < j) swap(arr[i], arr[j]);',
    '    }',
    '    swap(arr[left], arr[i]);',
    '    return i;',
    '}',
  ],
  python: [
    'def quick_sort(arr: list[int], left: int, right: int) -> None:',
    '    if left >= right: return',
    '    pivot = arr[left]',
    '    i, j = left, right',
    '    while i < j:',
    '        while i < j and arr[j] >= pivot: j -= 1',
    '        while i < j and arr[i] <= pivot: i += 1',
    '        if i < j: arr[i], arr[j] = arr[j], arr[i]',
    '    arr[left], arr[i] = arr[i], pivot',
    '    quick_sort(arr, left, i - 1)',
    '    quick_sort(arr, i + 1, right)',
  ],
  javascript: [
    'function quickSort(arr, left, right) {',
    '    if (left >= right) return;',
    '    const pivot = arr[left];',
    '    let i = left, j = right;',
    '    while (i < j) {',
    '        while (i < j && arr[j] >= pivot) j--;',
    '        while (i < j && arr[i] <= pivot) i++;',
    '        if (i < j) [arr[i], arr[j]] = [arr[j], arr[i]];',
    '    }',
    '    [arr[left], arr[i]] = [arr[i], pivot];',
    '    quickSort(arr, left, i - 1);',
    '    quickSort(arr, i + 1, right);',
    '}',
  ],
};
