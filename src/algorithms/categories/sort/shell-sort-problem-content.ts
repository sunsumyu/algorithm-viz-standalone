/**
 * 希尔排序 (Shell Sort)
 * 领域知识与题解精讲配置声明
 */

export const SHELL_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">希尔排序 (Shell Sort / 缩小增量排序)</h2>
    </div>
    <p style="margin: 0;"><strong>希尔排序（Shell's Sort）</strong> 是插入排序的一种更高效的改进版本。它通过将整个待排序列分割成若干子序列分别进行直接插入排序，待整个序列中的记录“基本有序”时，再对全体记录进行一次直接插入排序。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [9, 8, 3, 7, 5, 6, 4, 1]</div>
      <div>输出: [1, 3, 4, 5, 6, 7, 8, 9]</div>
      <div style="color: #94a3b8;">解释: 初始增量 gap = 8/2 = 4，进行 4-间隔插入排序；随后 gap = 2，最后 gap = 1。</div>
    </div>
  </div>
`;

export const SHELL_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 跨步长分组预排序与渐进缩小增量
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 增量序列（Gap Sequence）与分组插入</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 初始增量 <code style="color: #38bdf8; font-family: monospace;">gap = n / 2</code>；<br/>
        2. 循环遍历 <code style="color: #fbbf24; font-family: monospace;">i = gap .. n-1</code>，对间隔为 <code style="color: #38bdf8; font-family: monospace;">gap</code> 的子序列执行插入排序；<br/>
        3. 每轮结束后，缩小增量 <code style="color: #38bdf8; font-family: monospace;">gap = gap / 2</code>；<br/>
        4. 当 <code style="color: #34d399; font-family: monospace;">gap == 1</code> 时，数组已高度有序，直接执行最后一轮全量插入排序，耗时几乎为 <code style="color: #34d399; font-family: monospace;">O(n)</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与突破</div>
        <p style="margin: 0; color: #94a3b8;">
        • 希尔排序是<strong>计算机科学史上第一个突破 O(n²) 时间复杂度的排序算法</strong>！<br/>
        • 时间复杂度：取决于增量序列选取（折半增量平均约 <code style="color: #60a5fa; font-family: monospace;">O(n^1.3 ~ n^1.5)</code>，Hibbard 增量最坏 <code style="color: #60a5fa; font-family: monospace;">O(n^1.5)</code>，Sedgewick 增量最坏 <code style="color: #60a5fa; font-family: monospace;">O(n^(4/3))</code>）。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>（原地）。<br/>
        • 稳定性：<strong>不稳定</strong>（相同元素若分在不同 gap 组可能颠倒相对顺序）。
        </p>
      </div>
    </div>
  </div>
`;

export const SHELL_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void shellSort(int[] arr) {',
    '    int n = arr.length;',
    '    // 初始增量 gap = n / 2，逐步折半',
    '    for (int gap = n / 2; gap > 0; gap /= 2) {',
    '        for (int i = gap; i < n; i++) {',
    '            int key = arr[i];',
    '            int j = i;',
    '            while (j >= gap && arr[j - gap] > key) {',
    '                arr[j] = arr[j - gap];',
    '                j -= gap;',
    '            }',
    '            arr[j] = key;',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'void shellSort(vector<int>& arr) {',
    '    int n = arr.size();',
    '    for (int gap = n / 2; gap > 0; gap /= 2) {',
    '        for (int i = gap; i < n; i++) {',
    '            int key = arr[i];',
    '            int j = i;',
    '            while (j >= gap && arr[j - gap] > key) {',
    '                arr[j] = arr[j - gap];',
    '                j -= gap;',
    '            }',
    '            arr[j] = key;',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'def shell_sort(arr: list[int]) -> None:',
    '    n = len(arr)',
    '    gap = n // 2',
    '    while gap > 0:',
    '        for i in range(gap, n):',
    '            key = arr[i]',
    '            j = i',
    '            while j >= gap and arr[j - gap] > key:',
    '                arr[j] = arr[j - gap]',
    '                j -= gap',
    '            arr[j] = key',
    '        gap //= 2',
  ],
  javascript: [
    'function shellSort(arr) {',
    '    const n = arr.length;',
    '    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {',
    '        for (let i = gap; i < n; i++) {',
    '            const key = arr[i];',
    '            let j = i;',
    '            while (j >= gap && arr[j - gap] > key) {',
    '                arr[j] = arr[j - gap];',
    '                j -= gap;',
    '            }',
    '            arr[j] = key;',
    '        }',
    '    }',
    '}',
  ],
};
