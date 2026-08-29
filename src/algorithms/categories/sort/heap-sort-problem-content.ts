/**
 * 堆排序 (Heap Sort)
 * 领域知识与题解精讲配置声明
 */

export const HEAP_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">堆排序 (Heap Sort / 大顶堆下沉建堆与堆顶弹出)</h2>
    </div>
    <p style="margin: 0;"><strong>堆排序（Heapsort）</strong> 是指利用堆这种数据结构所设计的一种选择排序算法。堆是一个近似完全二叉树的结构，并同时满足堆积的性质：即子结点的键值或索引总是小于（或者大于）它的父节点。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [4, 10, 3, 5, 1]</div>
      <div>输出: [1, 3, 4, 5, 10]</div>
      <div style="color: #94a3b8;">解释: 1. 构建大顶堆 [10, 5, 3, 4, 1]；2. 将堆顶 10 与末尾 1 交换并缩小堆容量；3. 重新下沉调整。</div>
    </div>
  </div>
`;

export const HEAP_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 大顶堆（Max Heap）与 Sift-Down（下沉）下滤
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 建堆与排序两步曲</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>从后往前建大顶堆：</strong> 从最后一个非叶子节点 <code style="color: #38bdf8; font-family: monospace;">i = n/2 - 1</code> 递减到 0，对每个节点执行 <code style="color: #fbbf24; font-family: monospace;">heapify(arr, n, i)</code> 下沉操作；<br/>
        2. <strong>循环提取堆顶最大值：</strong> 遍历 <code style="color: #38bdf8; font-family: monospace;">i = n - 1 .. 1</code>：<br/>
        &nbsp;&nbsp;• 交换堆顶与当前堆尾：<code style="color: #fde047; font-family: monospace;">swap(arr[0], arr[i])</code>；<br/>
        &nbsp;&nbsp;• 对新堆顶执行下沉：<code style="color: #34d399; font-family: monospace;">heapify(arr, i, 0)</code>，使前 <code style="color: #38bdf8; font-family: monospace;">i</code> 个元素重构大顶堆。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与稳定性</div>
        <p style="margin: 0; color: #94a3b8;">
        • 建堆时间复杂度：线性 <code style="color: #34d399; font-family: monospace;">O(n)</code>。<br/>
        • 整体时间复杂度：在最好、最坏、平均情况下均严格为 <code style="color: #34d399; font-family: monospace;">O(n log n)</code>。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>（原地完全二叉树映射数组）。<br/>
        • 稳定性：<strong>不稳定</strong>（堆调整时跨层级交换）。
        </p>
      </div>
    </div>
  </div>
`;

export const HEAP_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void heapSort(int[] arr) {',
    '    int n = arr.length;',
    '    // 1. 构建初始大顶堆',
    '    for (int i = n / 2 - 1; i >= 0; i--) {',
    '        heapify(arr, n, i);',
    '    }',
    '    // 2. 依次取出堆顶最大值并调整',
    '    for (int i = n - 1; i > 0; i--) {',
    '        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;',
    '        heapify(arr, i, 0);',
    '    }',
    '}',
    '',
    'private void heapify(int[] arr, int n, int i) {',
    '    int largest = i, left = 2 * i + 1, right = 2 * i + 2;',
    '    if (left < n && arr[left] > arr[largest]) largest = left;',
    '    if (right < n && arr[right] > arr[largest]) largest = right;',
    '    if (largest != i) {',
    '        int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;',
    '        heapify(arr, n, largest);',
    '    }',
    '}',
  ],
  cpp: [
    'void heapSort(vector<int>& arr) {',
    '    int n = arr.size();',
    '    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);',
    '    for (int i = n - 1; i > 0; i--) {',
    '        swap(arr[0], arr[i]);',
    '        heapify(arr, i, 0);',
    '    }',
    '}',
    'void heapify(vector<int>& arr, int n, int i) {',
    '    int largest = i, left = 2 * i + 1, right = 2 * i + 2;',
    '    if (left < n && arr[left] > arr[largest]) largest = left;',
    '    if (right < n && arr[right] > arr[largest]) largest = right;',
    '    if (largest != i) {',
    '        swap(arr[i], arr[largest]);',
    '        heapify(arr, n, largest);',
    '    }',
    '}',
  ],
  python: [
    'def heap_sort(arr: list[int]) -> None:',
    '    n = len(arr)',
    '    for i in range(n // 2 - 1, -1, -1):',
    '        heapify(arr, n, i)',
    '    for i in range(n - 1, 0, -1):',
    '        arr[0], arr[i] = arr[i], arr[0]',
    '        heapify(arr, i, 0)',
    '',
    'def heapify(arr: list[int], n: int, i: int) -> None:',
    '    largest = i',
    '    l, r = 2 * i + 1, 2 * i + 2',
    '    if l < n and arr[l] > arr[largest]: largest = l',
    '    if r < n and arr[r] > arr[largest]: largest = r',
    '    if largest != i:',
    '        arr[i], arr[largest] = arr[largest], arr[i]',
    '        heapify(arr, n, largest)',
  ],
  javascript: [
    'function heapSort(arr) {',
    '    const n = arr.length;',
    '    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);',
    '    for (let i = n - 1; i > 0; i--) {',
    '        [arr[0], arr[i]] = [arr[i], arr[0]];',
    '        heapify(arr, i, 0);',
    '    }',
    '}',
    'function heapify(arr, n, i) {',
    '    let largest = i, l = 2 * i + 1, r = 2 * i + 2;',
    '    if (l < n && arr[l] > arr[largest]) largest = l;',
    '    if (r < n && arr[r] > arr[largest]) largest = r;',
    '    if (largest !== i) {',
    '        [arr[i], arr[largest]] = [arr[largest], arr[i]];',
    '        heapify(arr, n, largest);',
    '    }',
    '}',
  ],
};
