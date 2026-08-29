/**
 * 哈希表理论基础 (Hash Table Theory)
 * 领域知识与核心原理配置声明
 */

export const HASH_TABLE_THEORY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(168,85,247,0.2); color: #c084fc; font-weight: 700; border: 1px solid rgba(168,85,247,0.3);">Fundamentals</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">哈希表理论基础 (Hash Table Fundamentals)</h2>
    </div>
    <p style="margin: 0;"><strong>哈希表（Hash Table）</strong> 是根据关键码的值（Key value）而直接进行访问的数据结构。直白地说，就是通过把 Key 映射到表中的一个位置来访问记录，以加快查找速度。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;">
      <div style="color: #60a5fa; font-weight: 700;">哈希表三大核心结构：</div>
      <div>1. <strong>哈希函数（Hash Function）：</strong> 将任意大小的数据转换映射为固定大小的整数索引（例如：<code style="color: #fde047; font-family: monospace;">hash(key) = key % TableSize</code>）。</div>
      <div>2. <strong>哈希碰撞（Hash Collision）：</strong> 不同的 Key 经过哈希函数计算后映射到了同一个数组下标槽位。</div>
      <div>3. <strong>装载因子（Load Factor）：</strong> 已填入元素数 / 哈希表容量，通常超过 0.75 时触发动态扩容（Rehash）。</div>
    </div>
  </div>
`;

export const HASH_TABLE_THEORY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 哈希冲突解决两大经典策略
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 链地址法（拉链法 Separate Chaining）</div>
        <p style="margin: 0; color: #94a3b8;">
        哈希表的每一个桶（Bucket）都是一个单向链表（或红黑树）。当产生哈希碰撞时，直接将新节点挂载到对应桶的链表末尾。<br/>
        • <strong>优点：</strong> 插入删除简单，对高装载因子容忍度高。<br/>
        • <strong>应用：</strong> Java HashMap, C++ unordered_map。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 开放寻址法（线性探测 Linear Probing）</div>
        <p style="margin: 0; color: #94a3b8;">
        所有元素都存放在数组中。当发生哈希碰撞时，从发生冲突的槽位开始，依次向后探测下一个空闲槽位 <code style="color: #fde047; font-family: monospace;">(index + 1) % TableSize</code> 放入。<br/>
        • <strong>要求：</strong> 哈希表容量必须大于元素数量，装载因子必须严格控制（通常 &le; 0.5）。<br/>
        • <strong>应用：</strong> Python dict (紧凑数组探测), 内存敏感型系统。
        </p>
      </div>
    </div>
  </div>
`;

export const HASH_TABLE_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// 简易链地址法哈希表 (Java)',
    'class MyHashMap {',
    '    private static final int SIZE = 10;',
    '    private List<Node>[] buckets = new LinkedList[SIZE];',
    '    ',
    '    public void put(int key, int val) {',
    '        int idx = key % SIZE; // 哈希函数',
    '        if (buckets[idx] == null) buckets[idx] = new LinkedList<>();',
    '        for (Node node : buckets[idx]) {',
    '            if (node.key == key) { node.val = val; return; }',
    '        }',
    '        buckets[idx].add(new Node(key, val)); // 冲突挂载到链表',
    '    }',
    '}',
  ],
  cpp: [
    '// 简易链地址法哈希表 (C++)',
    'class MyHashMap {',
    '    static const int SIZE = 10;',
    '    vector<list<pair<int, int>>> buckets;',
    'public:',
    '    MyHashMap() : buckets(SIZE) {}',
    '    void put(int key, int val) {',
    '        int idx = key % SIZE; // 哈希函数',
    '        for (auto& p : buckets[idx]) {',
    '            if (p.first == key) { p.second = val; return; }',
    '        }',
    '        buckets[idx].push_back({key, val}); // 解决冲突',
    '    }',
    '};',
  ],
  python: [
    '# 简易链地址法哈希表 (Python)',
    'class MyHashMap:',
    '    def __init__(self):',
    '        self.size = 10',
    '        self.buckets = [[] for _ in range(self.size)]',
    '        ',
    '    def put(self, key: int, val: int):',
    '        idx = key % self.size  # 哈希函数',
    '        for item in self.buckets[idx]:',
    '            if item[0] == key:',
    '                item[1] = val',
    '                return',
    '        self.buckets[idx].append([key, val])  # 解决冲突',
  ],
  javascript: [
    '// 简易链地址法哈希表 (JavaScript)',
    'class MyHashMap {',
    '    constructor() {',
    '        this.size = 10;',
    '        this.buckets = Array.from({ length: 10 }, () => []);',
    '    }',
    '    put(key, val) {',
    '        const idx = key % this.size; // 哈希函数',
    '        const bucket = this.buckets[idx];',
    '        const found = bucket.find(item => item.key === key);',
    '        if (found) { found.val = val; }',
    '        else { bucket.push({ key, val }); } // 解决冲突',
    '    }',
    '}',
  ],
};
