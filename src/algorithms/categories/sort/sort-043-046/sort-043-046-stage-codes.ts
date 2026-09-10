/**
 * 左神算法通关课 043 ~ 046 经典归并与快速排序专题 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 043: 归并排序
// ==========================================
export const MERGE_SORT_043_CODES: Record<string, string[]> = {
  java: [
    'public void mergeSort(int[] arr, int l, int r) {', // 1
    '    if (l >= r) return;', // 2
    '    int mid = l + ((r - l) >> 1);', // 3
    '    mergeSort(arr, l, mid);     // 递归左半区', // 4
    '    mergeSort(arr, mid + 1, r); // 递归右半区', // 5
    '    merge(arr, l, mid, r);      // 双指针合并两有序半区', // 6
    '}', // 7
  ],
  cpp: [
    'void mergeSort(vector<int>& arr, int l, int r) {', // 1
    '    if (l >= r) return;', // 2
    '    int mid = l + ((r - l) >> 1);', // 3
    '    mergeSort(arr, l, mid);', // 4
    '    mergeSort(arr, mid + 1, r);', // 5
    '    merge(arr, l, mid, r);', // 6
    '}', // 7
  ],
  python: [
    'def merge_sort(self, arr: list, l: int, r: int):', // 1
    '    if l >= r: return', // 2
    '    mid = (l + r) // 2', // 3
    '    self.merge_sort(arr, l, mid) # 左区递归', // 4
    '    self.merge_sort(arr, mid + 1, r) # 右区递归', // 5
    '    self.merge(arr, l, mid, r) # 双指针归并', // 6
  ],
  javascript: [
    'function mergeSort(arr, l, r) {', // 1
    '    if (l >= r) return;', // 2
    '    const mid = l + Math.floor((r - l) / 2);', // 3
    '    mergeSort(arr, l, mid);', // 4
    '    mergeSort(arr, mid + 1, r);', // 5
    '    merge(arr, l, mid, r);', // 6
    '}', // 7
  ],
};

export const MERGE_SORT_043_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCheck:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  splitMid:    { java: 3, cpp: 3, python: 3, javascript: 3 },
  recurseLeft: { java: 4, cpp: 4, python: 4, javascript: 4 },
  recurseRight:{ java: 5, cpp: 5, python: 5, javascript: 5 },
  callMerge:   { java: 6, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 2. Class 044: 小和问题
// ==========================================
export const SMALL_SUM_MERGE_044_CODES: Record<string, string[]> = {
  java: [
    'public long smallSum(int[] arr, int l, int r) {', // 1
    '    if (l >= r) return 0;', // 2
    '    int mid = l + ((r - l) >> 1);', // 3
    '    return smallSum(arr, l, mid) + smallSum(arr, mid + 1, r) + mergeSum(arr, l, mid, r);', // 4
    '}', // 5
    'public long mergeSum(int[] arr, int l, int mid, int r) {', // 6
    '    long sum = 0; int p1 = l, p2 = mid + 1, i = 0;', // 7
    '    while (p1 <= mid && p2 <= r) {', // 8
    '        sum += arr[p1] < arr[p2] ? (long)(r - p2 + 1) * arr[p1] : 0; // 核心小和贡献', // 9
    '        help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];', // 10
    '    }', // 11
    '    return sum;', // 12
    '}', // 13
  ],
  cpp: [
    'long long smallSum(vector<int>& arr, int l, int r) {', // 1
    '    if (l >= r) return 0;', // 2
    '    int mid = l + ((r - l) >> 1);', // 3
    '    return smallSum(arr, l, mid) + smallSum(arr, mid + 1, r) + mergeSum(arr, l, mid, r);', // 4
    '}', // 5
    'long long mergeSum(vector<int>& arr, int l, int mid, int r) {', // 6
    '    long long sum = 0; int p1 = l, p2 = mid + 1, i = 0;', // 7
    '    while (p1 <= mid && p2 <= r) {', // 8
    '        sum += arr[p1] < arr[p2] ? (long long)(r - p2 + 1) * arr[p1] : 0;', // 9
    '        help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];', // 10
    '    }', // 11
    '    return sum;', // 12
    '}', // 13
  ],
  python: [
    'def small_sum(self, arr: list, l: int, r: int) -> int:', // 1
    '    if l >= r: return 0', // 2
    '    mid = (l + r) // 2', // 3
    '    return self.small_sum(arr, l, mid) + self.small_sum(arr, mid + 1, r) + self.merge_sum(arr, l, mid, r)', // 4
    'def merge_sum(self, arr: list, l: int, mid: int, r: int) -> int:', // 5
    '    total_sum = 0; p1 = l; p2 = mid + 1; help_arr = []', // 6
    '    while p1 <= mid and p2 <= r:', // 7
    '        total_sum += (r - p2 + 1) * arr[p1] if arr[p1] < arr[p2] else 0 # 累加小和', // 8
    '        if arr[p1] < arr[p2]: help_arr.append(arr[p1]); p1 += 1', // 9
    '        else: help_arr.append(arr[p2]); p2 += 1', // 10
    '    return total_sum', // 11
  ],
  javascript: [
    'function smallSum(arr, l, r) {', // 1
    '    if (l >= r) return 0;', // 2
    '    const mid = l + Math.floor((r - l) / 2);', // 3
    '    return smallSum(arr, l, mid) + smallSum(arr, mid + 1, r) + mergeSum(arr, l, mid, r);', // 4
    '}', // 5
    'function mergeSum(arr, l, mid, r) {', // 6
    '    let sum = 0; let p1 = l; let p2 = mid + 1; let i = 0;', // 7
    '    while (p1 <= mid && p2 <= r) {', // 8
    '        sum += arr[p1] < arr[p2] ? (r - p2 + 1) * arr[p1] : 0;', // 9
    '        help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];', // 10
    '    }', // 11
    '    return sum;', // 12
    '}', // 13
  ],
};

export const SMALL_SUM_MERGE_044_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  splitSums:   { java: 4, cpp: 4, python: 4, javascript: 4 },
  entryMerge:  { java: 6, cpp: 6, python: 5, javascript: 6 },
  accumulateSum:{ java: 9, cpp: 9, python: 8, javascript: 9 },
  appendHelp:  { java: 10, cpp: 10, python: 9, javascript: 10 },
  returnSum:   { java: 12, cpp: 12, python: 11, javascript: 12 },
};

// ==========================================
// 3. Class 045: 快速排序与荷兰国旗三路划分
// ==========================================
export const QUICK_SORT_DUTCH_FLAG_045_CODES: Record<string, string[]> = {
  java: [
    'public void quickSort(int[] arr, int l, int r) {', // 1
    '    if (l >= r) return;', // 2
    '    int pivot = arr[l + (int)(Math.random() * (r - l + 1))]; // 随机选取基准值', // 3
    '    int[] equalArea = partition(arr, l, r, pivot); // 荷兰国旗三向切分', // 4
    '    quickSort(arr, l, equalArea[0] - 1); // 递归小于区', // 5
    '    quickSort(arr, equalArea[1] + 1, r); // 递归大于区', // 6
    '}', // 7
  ],
  cpp: [
    'void quickSort(vector<int>& arr, int l, int r) {', // 1
    '    if (l >= r) return;', // 2
    '    int pivot = arr[l + rand() % (r - l + 1)];', // 3
    '    auto equalArea = partition(arr, l, r, pivot);', // 4
    '    quickSort(arr, l, equalArea.first - 1);', // 5
    '    quickSort(arr, equalArea.second + 1, r);', // 6
    '}', // 7
  ],
  python: [
    'def quick_sort(self, arr: list, l: int, r: int):', // 1
    '    if l >= r: return', // 2
    '    pivot = arr[random.randint(l, r)] # 随机基准', // 3
    '    equal_l, equal_r = self.partition(arr, l, r, pivot) # 荷兰国旗划分', // 4
    '    self.quick_sort(arr, l, equal_l - 1) # 递归小于区', // 5
    '    self.quick_sort(arr, equal_r + 1, r) # 递归大于区', // 6
  ],
  javascript: [
    'function quickSort(arr, l, r) {', // 1
    '    if (l >= r) return;', // 2
    '    const pivot = arr[l + Math.floor(Math.random() * (r - l + 1))];', // 3
    '    const [equalL, equalR] = partition(arr, l, r, pivot);', // 4
    '    quickSort(arr, l, equalL - 1);', // 5
    '    quickSort(arr, equalR + 1, r);', // 6
    '}', // 7
  ],
};

export const QUICK_SORT_DUTCH_FLAG_045_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  pickRandom:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  dutchPartition:{ java: 4, cpp: 4, python: 4, javascript: 4 },
  recurseLess: { java: 5, cpp: 5, python: 5, javascript: 5 },
  recurseMore: { java: 6, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 4. Class 046: 快速选择算法
// ==========================================
export const QUICK_SELECT_046_CODES: Record<string, string[]> = {
  java: [
    'public int quickSelect(int[] arr, int l, int r, int index) {', // 1
    '    if (l == r) return arr[l];', // 2
    '    int pivot = arr[l + (int)(Math.random() * (r - l + 1))];', // 3
    '    int[] range = partition(arr, l, r, pivot); // [L, R] 等于区', // 4
    '    if (index >= range[0] && index <= range[1]) return arr[index]; // 命中等于区直接返回', // 5
    '    else if (index < range[0]) return quickSelect(arr, l, range[0] - 1, index); // 只查左边', // 6
    '    else return quickSelect(arr, range[1] + 1, r, index); // 只查右边', // 7
    '}', // 8
  ],
  cpp: [
    'int quickSelect(vector<int>& arr, int l, int r, int index) {', // 1
    '    if (l == r) return arr[l];', // 2
    '    int pivot = arr[l + rand() % (r - l + 1)];', // 3
    '    auto range = partition(arr, l, r, pivot);', // 4
    '    if (index >= range.first && index <= range.second) return arr[index];', // 5
    '    else if (index < range.first) return quickSelect(arr, l, range.first - 1, index);', // 6
    '    else return quickSelect(arr, range.second + 1, r, index);', // 7
    '}', // 8
  ],
  python: [
    'def quick_select(self, arr: list, l: int, r: int, index: int) -> int:', // 1
    '    if l == r: return arr[l]', // 2
    '    pivot = arr[random.randint(l, r)]', // 3
    '    range_l, range_r = self.partition(arr, l, r, pivot)', // 4
    '    if range_l <= index <= range_r: return arr[index] # 命中等于区', // 5
    '    elif index < range_l: return self.quick_select(arr, l, range_l - 1, index)', // 6
    '    else: return self.quick_select(arr, range_r + 1, r, index)', // 7
  ],
  javascript: [
    'function quickSelect(arr, l, r, index) {', // 1
    '    if (l === r) return arr[l];', // 2
    '    const pivot = arr[l + Math.floor(Math.random() * (r - l + 1))];', // 3
    '    const [rangeL, rangeR] = partition(arr, l, r, pivot);', // 4
    '    if (index >= rangeL && index <= rangeR) return arr[index];', // 5
    '    else if (index < rangeL) return quickSelect(arr, l, rangeL - 1, index);', // 6
    '    else return quickSelect(arr, rangeR + 1, r, index);', // 7
    '}', // 8
  ],
};

export const QUICK_SELECT_046_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  singleBase:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  pickPivot:   { java: 3, cpp: 3, python: 3, javascript: 3 },
  hitEqual:    { java: 5, cpp: 5, python: 5, javascript: 5 },
  recurseLeftOnly:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  recurseRightOnly:{ java: 7, cpp: 7, python: 7, javascript: 7 },
};
