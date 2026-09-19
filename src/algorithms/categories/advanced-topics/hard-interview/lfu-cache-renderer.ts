/**
 * 大厂高频真题 02: LFU 缓存机制 (LFU Cache)
 * LeetCode 460 / 大厂经典高难度系统设计与数据结构题
 * 双哈希表 + 双向频次链表 O(1) 操作
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { HighlightTarget } from '../../../../core/renderers/dark-code-terminal-presenter';

export interface LFUNode {
  key: number;
  val: number;
  freq: number;
}

export interface FreqBucket {
  freq: number;
  nodes: LFUNode[];
}

export interface LFUStep extends StepBase {
  capacity: number;
  operation: string;
  key: number;
  val?: number;
  returnedVal?: number;
  minFreq: number;
  keyMap: { key: number; val: number; freq: number }[];
  freqBuckets: FreqBucket[];
  evictedNode?: LFUNode;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const LFU_CACHE_CODES = {
  java: `class LFUCache {
    class Node {
        int key, val, freq;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; freq = 1; }
    }
    class DoublyList {
        Node head = new Node(0, 0), tail = new Node(0, 0);
        int size = 0;
        DoublyList() { head.next = tail; tail.prev = head; }
        void addLast(Node node) {
            node.prev = tail.prev; node.next = tail;
            tail.prev.next = node; tail.prev = node;
            size++;
        }
        void remove(Node node) {
            node.prev.next = node.next; node.next.prev = node.prev;
            size--;
        }
        Node removeFirst() {
            if (size == 0) return null;
            Node first = head.next; remove(first); return first;
        }
    }
    int capacity, minFreq;
    Map<Integer, Node> keyMap = new HashMap<>();
    Map<Integer, DoublyList> freqMap = new HashMap<>();

    public LFUCache(int capacity) {
        this.capacity = capacity; this.minFreq = 0;
    }
    public int get(int key) {
        if (!keyMap.containsKey(key)) return -1;
        Node node = keyMap.get(key);
        increaseFreq(node);
        return node.val;
    }
    public void put(int key, int value) {
        if (capacity == 0) return;
        if (keyMap.containsKey(key)) {
            Node node = keyMap.get(key);
            node.val = value;
            increaseFreq(node);
            return;
        }
        if (keyMap.size() >= capacity) {
            DoublyList minList = freqMap.get(minFreq);
            Node evicted = minList.removeFirst();
            keyMap.remove(evicted.key);
        }
        Node newNode = new Node(key, value);
        keyMap.put(key, newNode);
        freqMap.computeIfAbsent(1, k -> new DoublyList()).addLast(newNode);
        minFreq = 1;
    }
    void increaseFreq(Node node) {
        DoublyList list = freqMap.get(node.freq);
        list.remove(node);
        if (list.size == 0 && node.freq == minFreq) minFreq++;
        node.freq++;
        freqMap.computeIfAbsent(node.freq, k -> new DoublyList()).addLast(node);
    }
}`,
  cpp: `class LFUCache {
    struct Node { int key, val, freq; };
    int capacity, minFreq;
    unordered_map<int, list<Node>::iterator> keyMap;
    unordered_map<int, list<Node>> freqMap;
public:
    LFUCache(int cap) : capacity(cap), minFreq(0) {}
    int get(int key) {
        if (!keyMap.count(key)) return -1;
        auto it = keyMap[key];
        int val = it->val;
        update(key, val, it->freq);
        return val;
    }
    void put(int key, int value) {
        if (capacity <= 0) return;
        if (keyMap.count(key)) {
            update(key, value, keyMap[key]->freq);
            return;
        }
        if (keyMap.size() >= capacity) {
            auto& minList = freqMap[minFreq];
            keyMap.erase(minList.front().key);
            minList.pop_front();
        }
        freqMap[1].push_back({key, value, 1});
        keyMap[key] = --freqMap[1].end();
        minFreq = 1;
    }
private:
    void update(int key, int val, int freq) {
        freqMap[freq].erase(keyMap[key]);
        if (freqMap[freq].empty() && minFreq == freq) minFreq++;
        freqMap[freq + 1].push_back({key, val, freq + 1});
        keyMap[key] = --freqMap[freq + 1].end();
    }
};`,
  python: `class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.min_freq = 0
        self.key_map = {}   # key -> [val, freq]
        self.freq_map = collections.defaultdict(collections.OrderedDict)

    def get(self, key: int) -> int:
        if key not in self.key_map:
            return -1
        val, freq = self.key_map[key]
        self._update(key, val, freq)
        return val

    def put(self, key: int, value: int) -> None:
        if self.cap <= 0:
            return
        if key in self.key_map:
            _, freq = self.key_map[key]
            self._update(key, value, freq)
            return
        if len(self.key_map) >= self.cap:
            evict_k, _ = self.freq_map[self.min_freq].popitem(last=False)
            del self.key_map[evict_k]
        self.key_map[key] = [value, 1]
        self.freq_map[1][key] = None
        self.min_freq = 1

    def _update(self, key: int, val: int, freq: int):
        del self.freq_map[freq][key]
        if not self.freq_map[freq] and self.min_freq == freq:
            self.min_freq += 1
        self.key_map[key] = [val, freq + 1]
        self.freq_map[freq + 1][key] = None`,
  typescript: `class LFUCache {
  private capacity: number;
  private minFreq: number = 0;
  private keyMap = new Map<number, { val: number; freq: number }>();
  private freqMap = new Map<number, Set<number>>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    if (!this.keyMap.has(key)) return -1;
    const node = this.keyMap.get(key)!;
    this.update(key, node.val, node.freq);
    return node.val;
  }

  put(key: number, value: number): void {
    if (this.capacity <= 0) return;
    if (this.keyMap.has(key)) {
      this.update(key, value, this.keyMap.get(key)!.freq);
      return;
    }
    if (this.keyMap.size >= this.capacity) {
      const minSet = this.freqMap.get(this.minFreq)!;
      const evictKey = minSet.values().next().value!;
      minSet.delete(evictKey);
      this.keyMap.delete(evictKey);
    }
    this.keyMap.set(key, { val: value, freq: 1 });
    if (!this.freqMap.has(1)) this.freqMap.set(1, new Set());
    this.freqMap.get(1)!.add(key);
    this.minFreq = 1;
  }

  private update(key: number, val: number, freq: number): void {
    const set = this.freqMap.get(freq)!;
    set.delete(key);
    if (set.size === 0 && this.minFreq === freq) this.minFreq++;
    this.keyMap.set(key, { val, freq: freq + 1 });
    if (!this.freqMap.has(freq + 1)) this.freqMap.set(freq + 1, new Set());
    this.freqMap.get(freq + 1)!.add(key);
  }
}`
};

export interface Command {
  type: 'put' | 'get';
  k: number;
  v?: number;
}

export const LFU_CACHE_CODE_LINES = {
  init: { java: 2, cpp: 2, python: 4, typescript: 8 },
  getMiss: { java: 24, cpp: 16, python: 9, typescript: 12 },
  getHit: { java: 26, cpp: 18, python: 11, typescript: 13 },
  putIgnore: { java: 31, cpp: 21, python: 16, typescript: 16 },
  putUpdate: { java: 35, cpp: 24, python: 19, typescript: 18 },
  putInsert: { java: 41, cpp: 31, python: 25, typescript: 24 },
};

export function generateLFUSteps(capacity: number, commands: Command[]): LFUStep[] {
  const steps: LFUStep[] = [];
  const keyMap = new Map<number, { val: number; freq: number }>();
  const freqMap = new Map<number, number[]>();
  let minFreq = 0;

  const snapshotBuckets = (): FreqBucket[] => {
    const buckets: FreqBucket[] = [];
    const freqs = Array.from(freqMap.keys()).sort((a, b) => a - b);
    for (const f of freqs) {
      const keys = freqMap.get(f) || [];
      if (keys.length > 0) {
        buckets.push({
          freq: f,
          nodes: keys.map(k => ({
            key: k,
            val: keyMap.get(k)!.val,
            freq: f
          }))
        });
      }
    }
    return buckets;
  };

  const snapshotKeyMap = () => {
    return Array.from(keyMap.entries()).map(([k, v]) => ({
      key: k,
      val: v.val,
      freq: v.freq
    }));
  };

  steps.push({
    capacity,
    operation: 'INIT',
    key: -1,
    minFreq: 0,
    keyMap: [],
    freqBuckets: [],
    decision: 'LFU 缓存系统初始化',
    message: `初始化 LFU 缓存，容量上限 = ${capacity}。双哈希表 + 双向频次桶准备就绪。`,
    log: `Init LFUCache(capacity=${capacity})`,
    codeLine: LFU_CACHE_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' }
  });

  for (const cmd of commands) {
    if (cmd.type === 'get') {
      const k = cmd.k;
      if (!keyMap.has(k)) {
        steps.push({
          capacity,
          operation: `GET(${k})`,
          key: k,
          returnedVal: -1,
          minFreq,
          keyMap: snapshotKeyMap(),
          freqBuckets: snapshotBuckets(),
          decision: `缓存未命中: key=${k} 不存在`,
          message: `执行 get(${k})：在 keyMap 中未找到该键，返回 -1。`,
          log: `get(${k}) -> -1 (Miss)`,
          codeLine: LFU_CACHE_CODE_LINES.getMiss,
          statusBadge: { text: '未命中 (-1)', type: 'warning' }
        });
      } else {
        const node = keyMap.get(k)!;
        const oldFreq = node.freq;
        const newFreq = oldFreq + 1;

        const oldList = freqMap.get(oldFreq)!;
        const idx = oldList.indexOf(k);
        if (idx !== -1) oldList.splice(idx, 1);
        if (oldList.length === 0 && minFreq === oldFreq) {
          minFreq = newFreq;
        }

        node.freq = newFreq;
        if (!freqMap.has(newFreq)) freqMap.set(newFreq, []);
        freqMap.get(newFreq)!.push(k);

        steps.push({
          capacity,
          operation: `GET(${k})`,
          key: k,
          returnedVal: node.val,
          minFreq,
          keyMap: snapshotKeyMap(),
          freqBuckets: snapshotBuckets(),
          decision: `缓存命中！频次跃迁 ${oldFreq} -> ${newFreq}`,
          message: `执行 get(${k})：命中值 = ${node.val}。节点使用频次自增至 ${newFreq}，移动至对应频次链表尾部。`,
          log: `get(${k}) -> ${node.val} (Hit, freq: ${oldFreq}->${newFreq})`,
          codeLine: LFU_CACHE_CODE_LINES.getHit,
          statusBadge: { text: `命中 (${node.val})`, type: 'success' }
        });
      }
    } else {
      const k = cmd.k;
      const v = cmd.v ?? 0;

      if (capacity <= 0) {
        steps.push({
          capacity,
          operation: `PUT(${k}, ${v})`,
          key: k,
          val: v,
          minFreq,
          keyMap: [],
          freqBuckets: [],
          decision: '容量为 0，忽略写操作',
          message: `缓存容量为 0，无法存放任何数据。`,
          log: `put(${k}, ${v}) ignored (cap=0)`,
          codeLine: LFU_CACHE_CODE_LINES.putIgnore,
          statusBadge: { text: '容量不足', type: 'danger' }
        });
        continue;
      }

      if (keyMap.has(k)) {
        const node = keyMap.get(k)!;
        const oldFreq = node.freq;
        const newFreq = oldFreq + 1;
        node.val = v;

        const oldList = freqMap.get(oldFreq)!;
        const idx = oldList.indexOf(k);
        if (idx !== -1) oldList.splice(idx, 1);
        if (oldList.length === 0 && minFreq === oldFreq) {
          minFreq = newFreq;
        }

        node.freq = newFreq;
        if (!freqMap.has(newFreq)) freqMap.set(newFreq, []);
        freqMap.get(newFreq)!.push(k);

        steps.push({
          capacity,
          operation: `PUT(${k}, ${v})`,
          key: k,
          val: v,
          minFreq,
          keyMap: snapshotKeyMap(),
          freqBuckets: snapshotBuckets(),
          decision: `更新已有键 key=${k} 的值，频次 ${oldFreq} -> ${newFreq}`,
          message: `更新 key=${k} 的值为 ${v}，该键被再次访问，频次跃迁为 ${newFreq}。`,
          log: `put(${k}, ${v}) updated (freq: ${oldFreq}->${newFreq})`,
          codeLine: LFU_CACHE_CODE_LINES.putUpdate,
          statusBadge: { text: '更新节点', type: 'info' }
        });
      } else {
        let evictedNode: LFUNode | undefined;
        if (keyMap.size >= capacity) {
          const minList = freqMap.get(minFreq)!;
          const evictKey = minList.shift()!;
          const evictVal = keyMap.get(evictKey)!;
          evictedNode = { key: evictKey, val: evictVal.val, freq: minFreq };
          keyMap.delete(evictKey);
        }

        keyMap.set(k, { val: v, freq: 1 });
        if (!freqMap.has(1)) freqMap.set(1, []);
        freqMap.get(1)!.push(k);
        minFreq = 1;

        steps.push({
          capacity,
          operation: `PUT(${k}, ${v})`,
          key: k,
          val: v,
          minFreq,
          evictedNode,
          keyMap: snapshotKeyMap(),
          freqBuckets: snapshotBuckets(),
          decision: evictedNode
            ? `容量满！淘汰 minFreq=${evictedNode.freq} 最久未访问 key=${evictedNode.key}`
            : `插入新节点 key=${k}, 初始 freq=1`,
          message: evictedNode
            ? `容量已满 (${capacity})：驱逐淘汰频次最低 (${evictedNode.freq}) 的首节点 key=${evictedNode.key}。插入新节点 key=${k}, val=${v} 到 freq=1 桶。`
            : `插入新节点 key=${k}, val=${v}。置于 freq=1 桶中，重置 minFreq = 1。`,
          log: evictedNode
            ? `put(${k}, ${v}) evicted key=${evictedNode.key} (minFreq=${evictedNode.freq})`
            : `put(${k}, ${v}) inserted (freq=1)`,
          codeLine: LFU_CACHE_CODE_LINES.putInsert,
          statusBadge: evictedNode
            ? { text: `驱逐淘汰 (${evictedNode.key})`, type: 'danger' }
            : { text: '新增插入', type: 'success' }
        });
      }
    }
  }

  return steps.map((s) => ({
    ...s,
    metrics: {
      operation: s.operation,
      capacityUsage: `${s.keyMap.length} / ${s.capacity}`,
      minFreq: `${s.minFreq}`,
      evicted: s.evictedNode ? `Key:${s.evictedNode.key}` : '无',
    },
    ans: `${s.keyMap.length} / ${s.capacity}`,
  }));
}

export function renderLFUSandbox(step: LFUStep): string {
  const bucketsHtml = step.freqBuckets.length === 0
    ? '<div style="color: #94a3b8; font-style: italic; padding: 10px;">频次桶当前为空</div>'
    : step.freqBuckets.map(b => {
        const isMin = b.freq === step.minFreq;
        const nodePills = b.nodes.map((n, i) => {
          const isHead = i === 0;
          return `
            <div style="display: inline-flex; align-items: center; background: #ffffff; border: 1.5px solid ${isMin && isHead ? '#ef4444' : '#38bdf8'}; border-radius: 6px; padding: 4px 8px; margin: 2px 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <span style="font-weight: 800; color: #0284c7; margin-right: 4px;">K:${n.key}</span>
              <span style="color: #64748b; margin-right: 4px;">V:${n.val}</span>
              ${isHead && isMin ? '<span style="font-size: 10px; background: #ef4444; color: #fff; padding: 1px 4px; border-radius: 3px; font-weight: 700;">淘汰候选</span>' : ''}
            </div>
          `;
        }).join('<span style="color: #94a3b8; font-size: 12px; margin: 0 2px;">⇄</span>');

        return `
          <div style="margin-bottom: 8px; background: ${isMin ? 'rgba(239, 68, 68, 0.05)' : '#f8fafc'}; border: 1px solid ${isMin ? '#ef4444' : '#e2e8f0'}; border-radius: 8px; padding: 8px 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 700; color: ${isMin ? '#dc2626' : '#334155'}; font-size: 12px;">
                频次桶 Freq = ${b.freq} ${isMin ? '🔥 (minFreq 保护/淘汰区)' : ''}
              </span>
              <span style="font-size: 11px; color: #64748b;">共 ${b.nodes.length} 个节点</span>
            </div>
            <div style="display: flex; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 10px; color: #94a3b8; margin-right: 6px;">[最旧]</span>
              ${nodePills}
              <span style="font-size: 10px; color: #94a3b8; margin-left: 6px;">[最新]</span>
            </div>
          </div>
        `;
      }).join('');

  const keyMapHtml = step.keyMap.length === 0
    ? '<div style="color: #94a3b8; font-style: italic; padding: 10px;">哈希表为空</div>'
    : `<div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${step.keyMap.map(n => `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span style="font-size: 11px; color: #64748b;">Key: <strong style="color: #0284c7;">${n.key}</strong></span>
            <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${n.val}</span>
            <span style="font-size: 10px; background: #f3e8ff; color: #7c3aed; padding: 1px 5px; border-radius: 4px; font-weight: 700;">f:${n.freq}</span>
          </div>
        `).join('')}
      </div>`;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 频次桶与双向链表拓扑 (主画布优先) -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; font-size: 12px; color: #0f172a;">
            📊 频次双向链表拓扑 (Freq -> DoublyLinkedList)
          </span>
          <span style="font-size: 11px; color: #64748b;">同频按 LRU 从左至右淘汰</span>
        </div>
        ${bucketsHtml}
      </div>

      <!-- Key-Value 哈希快速检索表 -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-weight: 700; font-size: 12px; color: #0f172a; margin-bottom: 8px;">
          🗂️ keyMap 哈希表快照 (Key -> Node Reference)
        </div>
        ${keyMapHtml}
      </div>

      <!-- 底部说明 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 4px; font-size: 11px; color: #64748b;">
        <span>O(1) 定位: 哈希表查节点，双向链表快速摘取并插入高频桶</span>
        <span>当前 minFreq: <strong style="color: #d97706;">${step.minFreq}</strong></span>
      </div>
    </div>
  `;
}

export const lfuCacheVisualizer = registerDeclarativeAlgorithm<LFUStep>({
  id: 'lfu-cache',
  name: '大厂高频真题: LFU 缓存机制 (LFU Cache)',
  category: 'linked-list',
  icon: '🗄️',
  difficulty: 3,
  levelOrder: 460,
  learningGoal: '掌握双哈希表配合双向链表在 O(1) 时间内实现 LFU 频次晋升与淘汰机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 460)</h3>
      <p>请你为最不经常使用 (LFU) 缓存算法设计并实现数据结构。支持 <code>get</code> 和 <code>put</code> 操作，且时间复杂度均为 <code>O(1)</code>。</p>
      <p>当缓存容量达到上限时，淘汰使用频次最低的键；若存在平局，淘汰最久未使用的键。</p>
    </div>
  `,
  metrics: [
    { id: 'operation', label: '当前指令', color: '#0284c7' },
    { id: 'capacityUsage', label: '容量使用', color: '#16a34a' },
    { id: 'minFreq', label: '全局 minFreq', color: '#d97706' },
    { id: 'evicted', label: '驱逐记录', color: '#ef4444' },
  ],
  codeLanguages: LFU_CACHE_CODES,
  inputs: [
    {
      id: 'capacity',
      label: '缓存容量',
      type: 'number',
      defaultValue: 3,
    },
  ],
  generateSteps: (input) => {
    const cap = Number(input.capacity) || 3;
    const commands: Command[] = [
      { type: 'put', k: 1, v: 10 },
      { type: 'put', k: 2, v: 20 },
      { type: 'get', k: 1 },
      { type: 'put', k: 3, v: 30 },
      { type: 'get', k: 2 },
      { type: 'get', k: 3 },
      { type: 'put', k: 4, v: 40 },
      { type: 'get', k: 1 },
      { type: 'get', k: 3 },
      { type: 'get', k: 4 },
    ];
    return generateLFUSteps(cap, commands);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderLFUSandbox(step);
  },
});
