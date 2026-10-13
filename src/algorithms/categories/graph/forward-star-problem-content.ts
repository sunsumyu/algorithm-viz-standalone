/**
 * 链式前向星 (Chained Forward Star) 题目描述、算法精讲与多语言代码
 */

export const FORWARD_STAR_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <cstring>',
    'using namespace std;',
    '',
    'const int MAXN = 1005;',
    'const int MAXM = 10005;',
    '',
    '// 链式前向星四大扁平平行数组 (左神 059 规范)',
    'int head[MAXN];',
    'int next_edge[MAXM];',
    'int to[MAXM];',
    'int weight[MAXM];',
    'int cnt;',
    '',
    'void build(int n) {',
    '    cnt = 1;',
    '    memset(head, 0, sizeof(head));',
    '}',
    '',
    '// 添加有向边 (头插法 O(1))',
    'void addEdge(int u, int v, int w) {',
    '    to[cnt] = v;              // 1. 记录终点 (方法体首行立即执行)',
    '    weight[cnt] = w;          // 2. 记录边权',
    '    next_edge[cnt] = head[u]; // 3. 继承旧表头',
    '    head[u] = cnt++;          // 4. 更新表头指针',
    '}',
    '',
    '// 遍历顶点 u 的所有出边',
    'void traverse(int u) {',
    '    for (int ei = head[u]; ei > 0; ei = next_edge[ei]) {',
    '        int v = to[ei], w = weight[ei];',
    '        cout << "边: " << u << " -> " << v << ", 权: " << w << endl;',
    '    }',
    '}',
  ],
  java: [
    'import java.util.Arrays;',
    '',
    '// 算法讲解059: 链式前向星 (左神 Code01_CreateGraph 原版静态数组实现)',
    'public class Code01_CreateGraph {',
    '    public static final int MAXN = 1005;',
    '    public static final int MAXM = 10005;',
    '',
    '    // 链式前向星四大扁平平行数组 (零对象分配，CPU Cache 友好)',
    '    public static int[] head = new int[MAXN];',
    '    public static int[] next = new int[MAXM];',
    '    public static int[] to = new int[MAXM];',
    '    public static int[] weight = new int[MAXM];',
    '    public static int cnt;',
    '',
    '    public static void build(int n) {',
    '        cnt = 1;',
    '        Arrays.fill(head, 1, n + 1, 0);',
    '    }',
    '',
    '    // 头插法加边 O(1)',
    '    public static void addEdge(int u, int v, int w) {',
    '        to[cnt] = v;         // 1. 记录终点 (方法体首行立即高亮执行)',
    '        weight[cnt] = w;     // 2. 记录边权',
    '        next[cnt] = head[u]; // 3. 继承旧表头',
    '        head[u] = cnt++;     // 4. 更新表头指针',
    '    }',
    '',
    '    // 逆序遍历顶点 u 的所有出边',
    '    public static void traverse(int u) {',
    '        for (int ei = head[u]; ei > 0; ei = next[ei]) {',
    '            int v = to[ei], w = weight[ei];',
    '            System.out.printf("边: %d -> %d, 权值: %d%n", u, v, w);',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class ForwardStar:',
    '    def __init__(self, max_nodes=1005, max_edges=10005):',
    '        self.head = [0] * max_nodes',
    '        self.to = [0] * max_edges',
    '        self.next = [0] * max_edges',
    '        self.weight = [0] * max_edges',
    '        self.cnt = 1',
    '',
    '    def add_edge(self, u: int, v: int, w: int = 1):',
    '        """以头插法添加一条从 u 到 v 权值为 w 的有向边 O(1)"""',
    '        self.to[self.cnt] = v                # 1. 记录终点 (方法体首行立即执行)',
    '        self.weight[self.cnt] = w            # 2. 记录边权',
    '        self.next[self.cnt] = self.head[u]   # 3. 继承旧表头',
    '        self.head[u] = self.cnt              # 4. 更新表头',
    '        self.cnt += 1',
    '',
    '    def traverse(self, u: int):',
    '        """遍历顶点 u 的所有出边"""',
    '        ei = self.head[u]',
    '        while ei > 0:',
    '            v, w = self.to[ei], self.weight[ei]',
    '            print(f"边: {u} -> {v}, 权值: {w}")',
    '            ei = self.next[ei]',
  ],
  javascript: [
    'class ForwardStar {',
    '  constructor(maxNodes = 1005, maxEdges = 10005) {',
    '    this.head = new Int32Array(maxNodes).fill(0);',
    '    this.to = new Int32Array(maxEdges);',
    '    this.next = new Int32Array(maxEdges).fill(0);',
    '    this.weight = new Int32Array(maxEdges);',
    '    this.cnt = 1;',
    '  }',
    '',
    '  // 添加边 (头插法 O(1))',
    '  addEdge(u, v, w = 1) {',
    '    this.to[this.cnt] = v;              // 1. 记录终点 (方法体首行立即执行)',
    '    this.weight[this.cnt] = w;          // 2. 记录边权',
    '    this.next[this.cnt] = this.head[u]; // 3. 继承旧表头',
    '    this.head[u] = this.cnt++;          // 4. 更新表头指针',
    '  }',
    '',
    '  // 遍历节点 u 的所有出边',
    '  traverse(u) {',
    '    for (let ei = this.head[u]; ei > 0; ei = this.next[ei]) {',
    '      const v = this.to[ei], w = this.weight[ei];',
    '      console.log(`边: ${u} -> ${v}, 权值: ${w}`);',
    '    }',
    '  }',
    '}',
  ],
};

export const FORWARD_STAR_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span style="font-size: 20px;">🕸️</span>
      <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;">数据结构：链式前向星 (Chained Forward Star)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">图论核心底层</span>
    </div>

    <p style="font-size: 13px; color: #334155; margin-bottom: 12px;">
      <b>链式前向星</b> 是一种结合了 <b>数组连续内存的高性能</b> 与 <b>链表动态扩展灵活性</b> 的极佳图存储结构。在算法竞赛（ACM / OI）与高性能图算法引擎（如 Dijkstra、SPFA、网络流、Tarjan）中被极为广泛地应用。
    </p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
      <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0f172a;">核心数据定义</h4>
      <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569;">
        <li><code style="color: #2563eb; font-weight: 700;">head[u]</code>：存储以节点 <code style="font-weight: 700;">u</code> 为起点的 <b>最后一条加入的出边编号</b>（初始全为 <code style="color: #ef4444;">-1</code>）。</li>
        <li><code style="color: #059669; font-weight: 700;">edge[cnt]</code>：结构体数组（或平行数组），记录每条边的具体信息：
          <ul>
            <li><code style="color: #d97706; font-weight: 700;">to</code>：该边指向的目标顶点；</li>
            <li><code style="color: #9333ea; font-weight: 700;">next</code>：与当前边同起点的 <b>上一条出边编号</b>（即静态链表指针）；</li>
            <li><code style="color: #0284c7; font-weight: 700;">weight</code>：边的权值。</li>
          </ul>
        </li>
        <li><code style="color: #e11d48; font-weight: 700;">cnt</code>：边的自增全局索引计数器（从 0 开始）。</li>
      </ul>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 10px;">
        <div style="font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 4px;">⚡ 加边建图：O(1)</div>
        <div style="font-size: 11px; color: #047857;">采用头插法，新边挂在 head[u] 前面，仅需 2 次赋值即可完成，无动态内存分配开销。</div>
      </div>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px;">
        <div style="font-size: 12px; font-weight: 700; color: #0369a1; margin-bottom: 4px;">💾 空间效率：O(V + E)</div>
        <div style="font-size: 11px; color: #0284c7;">定长静态数组存储，连续内存局部性好（CPU Cache 友好），杜绝 vector 频繁扩容开销。</div>
      </div>
    </div>
  </div>
`;

export const FORWARD_STAR_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 15px; font-weight: 800; color: #0f172a;">深度剖析：为什么链式前向星如此高效？</h3>

    <div style="margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #2563eb;">1. 头插法 (Head Insertion) 的奥秘</h4>
      <p style="font-size: 12px; color: #475569; margin: 0;">
        每次调用 <code style="font-weight: 700;">addEdge(u, v, w)</code> 时：
        <br>① 将新边的 <code style="color: #9333ea;">next</code> 指向原本的 <code style="color: #2563eb;">head[u]</code>；
        <br>② 将 <code style="color: #2563eb;">head[u]</code> 更新为当前新边的编号 <code style="color: #e11d48;">cnt</code>；
        <br>这本质上是在维护每个顶点 <code style="font-weight: 700;">u</code> 专属的<b>单向链表</b>，且所有节点的链表节点都挤在同一个连续的 <code style="font-weight: 700;">edge[]</code> 数组中！
      </p>
    </div>

    <div style="margin-bottom: 12px;">
      <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #059669;">2. 遍历顺序与加边顺序为何相反？</h4>
      <p style="font-size: 12px; color: #475569; margin: 0;">
        因为是<b>头插法</b>，最后加入的有向边总是成为链表的表头。因此在使用 <code style="font-weight: 700;">for(int e = head[u]; e != -1; e = edge[e].next)</code> 遍历时，访问出边的顺序与加边顺序正好相反。这完全不影响图遍历的正确性。
      </p>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
      <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">三大存图方式对比总结</h4>
      <table style="width: 100%; font-size: 11px; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid #cbd5e1; color: #475569;">
            <th style="padding: 4px;">方式</th>
            <th style="padding: 4px;">空间复杂度</th>
            <th style="padding: 4px;">加边耗时</th>
            <th style="padding: 4px;">遍历出边耗时</th>
            <th style="padding: 4px;">特点</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 4px; font-weight: 700;">邻接矩阵</td>
            <td style="padding: 4px; color: #ef4444;">O(V²)</td>
            <td style="padding: 4px; color: #10b981;">O(1)</td>
            <td style="padding: 4px; color: #ef4444;">O(V)</td>
            <td style="padding: 4px;">适合稠密图，空间浪费大</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 4px; font-weight: 700;">邻接表 (vector)</td>
            <td style="padding: 4px; color: #10b981;">O(V + E)</td>
            <td style="padding: 4px; color: #f59e0b;">均摊 O(1)</td>
            <td style="padding: 4px; color: #10b981;">O(deg(u))</td>
            <td style="padding: 4px;">动态开辟内存，指针开销</td>
          </tr>
          <tr style="background: #eff6ff; font-weight: 700;">
            <td style="padding: 4px; color: #2563eb;">链式前向星</td>
            <td style="padding: 4px; color: #10b981;">O(V + E)</td>
            <td style="padding: 4px; color: #10b981;">严格 O(1)</td>
            <td style="padding: 4px; color: #10b981;">O(deg(u))</td>
            <td style="padding: 4px; color: #1d4ed8;">静态内存连续，极速高效</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`;
