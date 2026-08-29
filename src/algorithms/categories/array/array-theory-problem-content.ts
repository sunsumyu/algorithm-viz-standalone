/**
 * 数组理论基础 (Array Theory)
 * 领域知识与基础概念配置声明
 */

export const ARRAY_THEORY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Fundamental</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">数组理论基础 (Array Fundamentals)</h2>
    </div>
    <p style="margin: 0;">数组是存放在 <strong>连续内存空间</strong> 中的 <strong>相同类型数据</strong> 的集合。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;">
      <div style="color: #60a5fa; font-weight: 700;">数组两大核心关键特征：</div>
      <div>1. <strong>连续内存分配：</strong> 数组元素在内存中物理地址严格紧邻。</div>
      <div>2. <strong>下标随机访问：</strong> 根据寻址公式 <code style="color: #fde047; font-family: monospace;">Address(i) = Base + i &times; ElementSize</code> 可在 <code style="color: #34d399; font-family: monospace;">O(1)</code> 时间直达任意元素。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 4px; font-size: 11.5px;">
      <div style="color: #f87171; font-weight: 700;">不可避免的代价：</div>
      <div>• <strong>插入与删除：</strong> 因为内存连续，插入或删除指定位置的元素必须通过 <strong>整体移动后续所有元素</strong> 来保证连续性，时间复杂度为 <code style="color: #f87171; font-family: monospace;">O(n)</code>。</div>
    </div>
  </div>
`;

export const ARRAY_THEORY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 基础操作时间复杂度全景速查
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 操作复杂度对照表</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>下标访问 (Access)：</strong> <code style="color: #34d399; font-family: monospace;">O(1)</code> —— 直接内存物理偏移计算<br/>
        • <strong>线性搜索 (Search)：</strong> <code style="color: #fbbf24; font-family: monospace;">O(n)</code> —— 无序数组逐一比对（有序时可二分降至 O(log n)）<br/>
        • <strong>元素插入 (Insert)：</strong> <code style="color: #f87171; font-family: monospace;">O(n)</code> —— 必须将插入点及之后的元素全部后移一位<br/>
        • <strong>元素删除 (Delete)：</strong> <code style="color: #f87171; font-family: monospace;">O(n)</code> —— 必须将删除点之后的所有元素全部前移覆盖
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 二维数组内存模型</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>C++ / C 语言：</strong> 二维数组在内存中是真正严格平铺的连续内存块（行优先排列）。<br/>
        • <strong>Java / Python / JS：</strong> 二维数组本质是「数组的数组」（指针数组），外层数组存放每行的引用指针，每行的内存地址并不一定连续！
        </p>
      </div>
    </div>
  </div>
`;

export const ARRAY_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class ArrayBasics {',
    '    // 1. O(1) 下标直接访问',
    '    public int get(int[] arr, int i) {',
    '        return arr[i];',
    '    }',
    '    // 2. O(n) 线性搜索',
    '    public int search(int[] arr, int target) {',
    '        for (int i = 0; i < arr.length; i++) {',
    '            if (arr[i] == target) return i;',
    '        }',
    '        return -1;',
    '    }',
    '    // 3. O(n) 插入元素（后续元素后移）',
    '    public void insert(int[] arr, int idx, int val) {',
    '        for (int i = arr.length - 1; i > idx; i--) {',
    '            arr[i] = arr[i - 1];',
    '        }',
    '        arr[idx] = val;',
    '    }',
    '}',
  ],
  cpp: [
    'class ArrayBasics {',
    'public:',
    '    // 1. O(1) 下标访问',
    '    int get(const vector<int>& arr, int i) {',
    '        return arr[i];',
    '    }',
    '    // 2. O(n) 线性搜索',
    '    int search(const vector<int>& arr, int target) {',
    '        for (int i = 0; i < arr.size(); i++) {',
    '            if (arr[i] == target) return i;',
    '        }',
    '        return -1;',
    '    }',
    '    // 3. O(n) 插入元素',
    '    void insert(vector<int>& arr, int idx, int val) {',
    '        arr.insert(arr.begin() + idx, val);',
    '    }',
    '};',
  ],
  python: [
    'class ArrayBasics:',
    '    # 1. O(1) 下标访问',
    '    def get(self, arr: list, i: int) -> int:',
    '        return arr[i]',
    '    # 2. O(n) 线性搜索',
    '    def search(self, arr: list, target: int) -> int:',
    '        for i, val in enumerate(arr):',
    '            if val == target:',
    '                return i',
    '        return -1',
    '    # 3. O(n) 插入元素',
    '    def insert(self, arr: list, idx: int, val: int):',
    '        arr.insert(idx, val)',
  ],
  javascript: [
    'class ArrayBasics {',
    '    // 1. O(1) 下标访问',
    '    get(arr, i) { return arr[i]; }',
    '    // 2. O(n) 线性搜索',
    '    search(arr, target) {',
    '        for (let i = 0; i < arr.length; i++) {',
    '            if (arr[i] === target) return i;',
    '        }',
    '        return -1;',
    '    }',
    '    // 3. O(n) 插入元素',
    '    insert(arr, idx, val) { arr.splice(idx, 0, val); }',
    '}',
  ],
};
