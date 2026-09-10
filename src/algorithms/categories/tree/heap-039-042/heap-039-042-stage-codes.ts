/**
 * 左神算法通关课 039 ~ 042 比较器、堆结构与加强堆专题 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 039: 比较器与优先级队列
// ==========================================
export const COMPARATOR_PRIORITY_QUEUE_039_CODES: Record<string, string[]> = {
  java: [
    'public static class CustomComparator implements Comparator<Task> {', // 1
    '    @Override', // 2
    '    public int compare(Task o1, Task o2) {', // 3
    '        if (o1.priority != o2.priority) {', // 4
    '            return o2.priority - o1.priority; // 优先级高的排在前面 (降序)', // 5
    '        }', // 6
    '        return o1.id - o2.id; // 优先级相同时，ID 小的排在前面 (升序)', // 7
    '    }', // 8
    '}', // 9
  ],
  cpp: [
    'struct CustomComparator {', // 1
    '    bool operator()(const Task& o1, const Task& o2) const {', // 2
    '        if (o1.priority != o2.priority) {', // 3
    '            return o1.priority < o2.priority; // 优先级高的在队头', // 4
    '        }', // 5
    '        return o1.id > o2.id; // ID 小的在队头', // 6
    '    }', // 7
    '};', // 8
  ],
  python: [
    'class Task:', // 1
    '    def __init__(self, id: int, priority: int):', // 2
    '        self.id = id; self.priority = priority', // 3
    '    def __lt__(self, other): # 自定义比较准则', // 4
    '        if self.priority != other.priority:', // 5
    '            return self.priority > other.priority # 优先级高的优先', // 6
    '        return self.id < other.id # ID 小的优先', // 7
  ],
  javascript: [
    'function taskComparator(o1, o2) {', // 1
    '    if (o1.priority !== o2.priority) {', // 2
    '        return o2.priority - o1.priority; // 优先级降序', // 3
    '    }', // 4
    '    return o1.id - o2.id; // ID 升序', // 5
    '}', // 6
  ],
};

export const COMPARATOR_PRIORITY_QUEUE_039_LINES: Record<string, CodeMapping> = {
  entry:         { java: 1, cpp: 1, python: 1, javascript: 1 },
  compareMethod: { java: 3, cpp: 2, python: 4, javascript: 1 },
  checkPriority: { java: 5, cpp: 4, python: 6, javascript: 3 },
  checkId:       { java: 7, cpp: 6, python: 7, javascript: 5 },
};

// ==========================================
// 2. Class 040: 堆结构与堆排序
// ==========================================
export const HEAP_SORT_040_CODES: Record<string, string[]> = {
  java: [
    'public void heapSort(int[] arr) {', // 1
    '    if (arr == null || arr.length < 2) return;', // 2
    '    for (int i = arr.length - 1; i >= 0; i--) { heapify(arr, i, arr.length); } // O(N) 建立大根堆', // 3
    '    int heapSize = arr.length;', // 4
    '    swap(arr, 0, --heapSize); // 堆顶最大值移至末尾', // 5
    '    while (heapSize > 0) {', // 6
    '        heapify(arr, 0, heapSize); // 重新下沉调整堆顶', // 7
    '        swap(arr, 0, --heapSize);  // 缩减堆规模并沉淀次大值', // 8
    '    }', // 9
    '}', // 10
  ],
  cpp: [
    'void heapSort(vector<int>& arr) {', // 1
    '    if (arr.size() < 2) return;', // 2
    '    for (int i = (int)arr.size() - 1; i >= 0; i--) heapify(arr, i, arr.size());', // 3
    '    int heapSize = arr.size();', // 4
    '    swap(arr[0], arr[--heapSize]);', // 5
    '    while (heapSize > 0) {', // 6
    '        heapify(arr, 0, heapSize);', // 7
    '        swap(arr[0], arr[--heapSize]);', // 8
    '    }', // 9
    '}', // 10
  ],
  python: [
    'def heap_sort(self, arr: list):', // 1
    '    if len(arr) < 2: return', // 2
    '    for i in range(len(arr) - 1, -1, -1): self.heapify(arr, i, len(arr)) # O(N) 建堆', // 3
    '    heap_size = len(arr); heap_size -= 1', // 4
    '    arr[0], arr[heap_size] = arr[heap_size], arr[0]', // 5
    '    while heap_size > 0:', // 6
    '        self.heapify(arr, 0, heap_size)', // 7
    '        heap_size -= 1; arr[0], arr[heap_size] = arr[heap_size], arr[0]', // 8
  ],
  javascript: [
    'function heapSort(arr) {', // 1
    '    if (!arr || arr.length < 2) return;', // 2
    '    for (let i = arr.length - 1; i >= 0; i--) heapify(arr, i, arr.length);', // 3
    '    let heapSize = arr.length;', // 4
    '    swap(arr, 0, --heapSize);', // 5
    '    while (heapSize > 0) {', // 6
    '        heapify(arr, 0, heapSize);', // 7
    '        swap(arr, 0, --heapSize);', // 8
    '    }', // 9
    '}', // 10
  ],
};

export const HEAP_SORT_040_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  buildHeap:   { java: 3, cpp: 3, python: 3, javascript: 3 },
  swapMax:     { java: 5, cpp: 5, python: 5, javascript: 5 },
  heapifyRoot: { java: 7, cpp: 7, python: 7, javascript: 7 },
  repeatSwap:  { java: 8, cpp: 8, python: 8, javascript: 8 },
};

// ==========================================
// 3. Class 041: 手动实现加强堆
// ==========================================
export const HEAP_GREATER_041_CODES: Record<string, string[]> = {
  java: [
    'public void resign(T obj) { // 动态重新调整指定对象的堆位', // 1
    '    Integer index = indexMap.get(obj); // O(1) 从反向索引表查出下标', // 2
    '    if (index != null) {', // 3
    '        heapInsert(index); // 向上漂移上浮', // 4
    '        heapify(index, heapSize); // 向下沉降调整', // 5
    '    }', // 6
    '}', // 7
    'public void remove(T obj) { // O(log N) 任意删除非堆顶元素', // 8
    '    T replace = heap[--heapSize]; int index = indexMap.remove(obj);', // 9
    '    if (obj != replace) { heap[index] = replace; indexMap.put(replace, index); resign(replace); }', // 10
    '}', // 11
  ],
  cpp: [
    'void resign(T obj) {', // 1
    '    if (indexMap.find(obj) == indexMap.end()) return;', // 2
    '    int index = indexMap[obj];', // 3
    '    heapInsert(index);', // 4
    '    heapify(index, heapSize);', // 5
    '}', // 6
    'void remove(T obj) {', // 7
    '    T replace = heap[--heapSize]; int index = indexMap[obj]; indexMap.erase(obj);', // 8
    '    if (obj != replace) { heap[index] = replace; indexMap[replace] = index; resign(replace); }', // 9
    '}', // 10
  ],
  python: [
    'def resign(self, obj): # 动态重排', // 1
    '    if obj not in self.index_map: return', // 2
    '    idx = self.index_map[obj]', // 3
    '    self.heap_insert(idx); self.heapify(idx, self.heap_size)', // 4
    'def remove(self, obj): # 任意删除', // 5
    '    self.heap_size -= 1; replace = self.heap[self.heap_size]', // 6
    '    idx = self.index_map.pop(obj)', // 7
    '    if obj != replace: self.heap[idx] = replace; self.index_map[replace] = idx; self.resign(replace)', // 8
  ],
  javascript: [
    'function resign(obj) {', // 1
    '    const index = indexMap.get(obj);', // 2
    '    if (index !== undefined) {', // 3
    '        heapInsert(index);', // 4
    '        heapify(index, heapSize);', // 5
    '    }', // 6
    '}', // 7
    'function remove(obj) {', // 8
    '    const replace = heap[--heapSize]; const index = indexMap.get(obj); indexMap.delete(obj);', // 9
    '    if (obj !== replace) { heap[index] = replace; indexMap.set(replace, index); resign(replace); }', // 10
    '}', // 11
  ],
};

export const HEAP_GREATER_041_LINES: Record<string, CodeMapping> = {
  entryResign: { java: 1, cpp: 1, python: 1, javascript: 1 },
  findMapIndex:{ java: 2, cpp: 3, python: 3, javascript: 2 },
  callInsert:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  callHeapify: { java: 5, cpp: 5, python: 4, javascript: 5 },
  entryRemove: { java: 8, cpp: 7, python: 5, javascript: 8 },
  swapReplace: { java: 10, cpp: 9, python: 8, javascript: 10 },
};

// ==========================================
// 4. Class 042: 对顶堆与数据流中位数
// ==========================================
export const HEAP_MEDIAN_STREAM_042_CODES: Record<string, string[]> = {
  java: [
    'public void addNum(int num) {', // 1
    '    if (maxHeap.isEmpty() || num <= maxHeap.peek()) { maxHeap.add(num); }', // 2
    '    else { minHeap.add(num); }', // 3
    '    // 平衡两堆规模', // 4
    '    if (maxHeap.size() > minHeap.size() + 1) { minHeap.add(maxHeap.poll()); }', // 5
    '    else if (minHeap.size() > maxHeap.size()) { maxHeap.add(minHeap.poll()); }', // 6
    '}', // 7
    'public double findMedian() {', // 8
    '    if (maxHeap.size() > minHeap.size()) return maxHeap.peek();', // 9
    '    return (maxHeap.peek() + minHeap.peek()) / 2.0; // 偶数取平均值', // 10
    '}', // 11
  ],
  cpp: [
    'void addNum(int num) {', // 1
    '    if (maxHeap.empty() || num <= maxHeap.top()) maxHeap.push(num);', // 2
    '    else minHeap.push(num);', // 3
    '    if (maxHeap.size() > minHeap.size() + 1) { minHeap.push(maxHeap.top()); maxHeap.pop(); }', // 4
    '    else if (minHeap.size() > maxHeap.size()) { maxHeap.push(minHeap.top()); minHeap.pop(); }', // 5
    '}', // 6
    'double findMedian() {', // 7
    '    if (maxHeap.size() > minHeap.size()) return maxHeap.top();', // 8
    '    return (maxHeap.top() + minHeap.top()) / 2.0;', // 9
    '}', // 10
  ],
  python: [
    'def add_num(self, num: int):', // 1
    '    if not self.max_heap or num <= -self.max_heap[0]: heapq.heappush(self.max_heap, -num)', // 2
    '    else: heapq.heappush(self.min_heap, num)', // 3
    '    if len(self.max_heap) > len(self.min_heap) + 1: heapq.heappush(self.min_heap, -heapq.heappop(self.max_heap))', // 4
    '    elif len(self.min_heap) > len(self.max_heap): heapq.heappush(self.max_heap, -heapq.heappop(self.min_heap))', // 5
    'def find_median(self) -> float:', // 6
    '    if len(self.max_heap) > len(self.min_heap): return -self.max_heap[0]', // 7
    '    return (-self.max_heap[0] + self.min_heap[0]) / 2.0', // 8
  ],
  javascript: [
    'function addNum(num) {', // 1
    '    if (maxHeap.isEmpty() || num <= maxHeap.peek()) maxHeap.push(num);', // 2
    '    else minHeap.push(num);', // 3
    '    if (maxHeap.size() > minHeap.size() + 1) minHeap.push(maxHeap.pop());', // 4
    '    else if (minHeap.size() > maxHeap.size()) maxHeap.push(minHeap.pop());', // 5
    '}', // 6
    'function findMedian() {', // 7
    '    if (maxHeap.size() > minHeap.size()) return maxHeap.peek();', // 8
    '    return (maxHeap.peek() + minHeap.peek()) / 2.0;', // 9
    '}', // 10
  ],
};

export const HEAP_MEDIAN_STREAM_042_LINES: Record<string, CodeMapping> = {
  entryAdd:    { java: 1, cpp: 1, python: 1, javascript: 1 },
  insertHeap:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  balanceHeap: { java: 5, cpp: 4, python: 4, javascript: 4 },
  findMedian:  { java: 8, cpp: 7, python: 6, javascript: 7 },
  returnOdd:   { java: 9, cpp: 8, python: 7, javascript: 8 },
  returnEven:  { java: 10, cpp: 9, python: 8, javascript: 9 },
};
