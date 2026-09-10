/**
 * 找出知晓秘密的所有专家与时序图论 (Find All People With Secret)
 * 参考左程云《算法通关课》【必备篇】class057: 同一时刻瞬时传递、并查集状态传播与未获知者时间窗口回退 (LeetCode 2092)
 */

export const PEOPLE_SECRET_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    '#include <numeric>',
    'using namespace std;',
    '',
    '// 找出知晓秘密的所有专家 (LeetCode 2092)',
    '// 核心：按时间分组 + 并查集同层级联 + 未知密者撤销重置',
    'vector<int> findAllPeople(int n, vector<vector<int>>& meetings, int firstPerson) {',
    '    sort(meetings.begin(), meetings.end(), [](const auto& a, const auto& b) {',
    '        return a[2] < b[2];',
    '    });',
    '    ',
    '    vector<int> parent(n);',
    '    iota(parent.begin(), parent.end(), 0);',
    '    ',
    '    auto find = [&](auto& self, int i) -> int {',
    '        if (parent[i] != i) parent[i] = self(self, parent[i]);',
    '        return parent[i];',
    '    };',
    '    auto unite = [&](int x, int y) {',
    '        int fx = find(find, x), fy = find(find, y);',
    '        if (fx != fy) parent[fx] = fy;',
    '    };',
    '    ',
    '    // 初始 0 与 firstPerson 知晓秘密 (统一合并到 0)',
    '    unite(0, firstPerson);',
    '    ',
    '    int m = meetings.size();',
    '    for (int l = 0, r = 0; l < m; l = r) {',
    '        while (r < m && meetings[r][2] == meetings[l][2]) r++;',
    '        ',
    '        // 1. 同一时间步内开会的人合并',
    '        for (int i = l; i < r; ++i) {',
    '            unite(meetings[i][0], meetings[i][1]);',
    '        }',
    '        ',
    '        // 2. 撤销重置：若未与 0 连通，重置回独立状态',
    '        for (int i = l; i < r; ++i) {',
    '            int u = meetings[i][0], v = meetings[i][1];',
    '            if (find(find, u) != find(find, 0)) parent[u] = u;',
    '            if (find(find, v) != find(find, 0)) parent[v] = v;',
    '        }',
    '    }',
    '    ',
    '    vector<int> ans;',
    '    for (int i = 0; i < n; ++i) {',
    '        if (find(find, i) == find(find, 0)) ans.push_back(i);',
    '    }',
    '    return ans;',
    '}',
  ],
  java: [
    'package class057;',
    '',
    'import java.util.*;',
    '',
    '// 找出知晓秘密的所有专家 - 左程云标准并查集时间步撤销实现',
    'public class Code02_FindAllPeopleWithSecret {',
    '    public static int[] father;',
    '    ',
    '    public static int find(int i) {',
    '        if (father[i] != i) father[i] = find(father[i]);',
    '        return father[i];',
    '    }',
    '    ',
    '    public static void union(int x, int y) {',
    '        int fx = find(x), fy = find(y);',
    '        if (fx != fy) father[fx] = fy;',
    '    }',
    '    ',
    '    public static List<Integer> findAllPeople(int n, int[][] meetings, int firstPerson) {',
    '        father = new int[n];',
    '        for (int i = 0; i < n; i++) father[i] = i;',
    '        union(0, firstPerson);',
    '        ',
    '        Arrays.sort(meetings, (a, b) -> a[2] - b[2]);',
    '        int m = meetings.length;',
    '        ',
    '        for (int l = 0, r = 0; l < m; l = r) {',
    '            while (r < m && meetings[r][2] == meetings[l][2]) r++;',
    '            ',
    '            for (int i = l; i < r; i++) {',
    '                union(meetings[i][0], meetings[i][1]);',
    '            }',
    '            ',
    '            for (int i = l; i < r; i++) {',
    '                int u = meetings[i][0], v = meetings[i][1];',
    '                if (find(u) != find(0)) father[u] = u;',
    '                if (find(v) != find(0)) father[v] = v;',
    '            }',
    '        }',
    '        ',
    '        List<Integer> ans = new ArrayList<>();',
    '        for (int i = 0; i < n; i++) {',
    '            if (find(i) == find(0)) ans.add(i);',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'from collections import defaultdict',
    '',
    'def find_all_people(n: int, meetings: list[list[int]], first_person: int) -> list[int]:',
    '    meetings.sort(key=lambda x: x[2])',
    '    parent = list(range(n))',
    '    ',
    '    def find(i):',
    '        if parent[i] != i:',
    '            parent[i] = find(parent[i])',
    '        return parent[i]',
    '        ',
    '    def union(x, y):',
    '        fx, fy = find(x), find(y)',
    '        if fx != fy:',
    '            parent[fx] = fy',
    '            ',
    '    union(0, first_person)',
    '    m = len(meetings)',
    '    l = 0',
    '    ',
    '    while l < m:',
    '        r = l',
    '        while r < m and meetings[r][2] == meetings[l][2]:',
    '            r += 1',
    '            ',
    '        for i in range(l, r):',
    '            union(meetings[i][0], meetings[i][1])',
    '            ',
    '        for i in range(l, r):',
    '            u, v = meetings[i][0], meetings[i][1]',
    '            if find(u) != find(0): parent[u] = u',
    '            if find(v) != find(0): parent[v] = v',
    '            ',
    '        l = r',
    '        ',
    '    return [i for i in range(n) if find(i) == find(0)]',
  ],
  javascript: [
    '// 找出知晓秘密的所有专家 (JavaScript 版)',
    'function findAllPeople(n, meetings, firstPerson) {',
    '  meetings.sort((a, b) => a[2] - b[2]);',
    '  const parent = Array.from({ length: n }, (_, i) => i);',
    '  ',
    '  function find(i) {',
    '    if (parent[i] !== i) parent[i] = find(parent[i]);',
    '    return parent[i];',
    '  }',
    '  function union(x, y) {',
    '    const fx = find(x), fy = find(y);',
    '    if (fx !== fy) parent[fx] = fy;',
    '  }',
    '  ',
    '  union(0, firstPerson);',
    '  const m = meetings.length;',
    '  let l = 0;',
    '  ',
    '  while (l < m) {',
    '    let r = l;',
    '    while (r < m && meetings[r][2] === meetings[l][2]) r++;',
    '    ',
    '    for (let i = l; i < r; i++) {',
    '      union(meetings[i][0], meetings[i][1]);',
    '    }',
    '    for (let i = l; i < r; i++) {',
    '      const u = meetings[i][0], v = meetings[i][1];',
    '      if (find(u) !== find(0)) parent[u] = u;',
    '      if (find(v) !== find(0)) parent[v] = v;',
    '    }',
    '    l = r;',
    '  }',
    '  ',
    '  return Array.from({ length: n }, (_, i) => i).filter(i => find(i) === find(0));',
    '}',
  ],
};

export const PEOPLE_SECRET_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🕵️ 找出知晓秘密的所有专家 (LeetCode 2092)</h3>
    <p>
      有 <code>n</code> 个专家编号从 <code>0</code> 到 <code>n - 1</code>。专家 <code>0</code> 在时刻 <code>0</code> 拥有一个秘密并告诉了专家 <code>firstPerson</code>。
    </p>
    <p>
      给定会议列表 <code>meetings[i] = [xi, yi, timei]</code>。在时刻 <code>timei</code>，如果参会的专家中有人知道秘密，秘密会在当前时刻<b>瞬时级联传播</b>给所有参会者。
      请返回所有会议结束后，<b>所有知晓秘密的专家列表</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        n = 6, meetings = [[1,2,5],[2,3,5],[0,1,5],[4,5,5]], firstPerson = 1
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>[0, 1, 2, 3]</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：时刻 5 时，0与1已知名，通过 (0,1) 传给 1，(1,2) 传给 2，(2,3) 传给 3！而 4与5 虽然在时刻 5 开会但都不知密，故无法获知！
      </div>
    </div>
  </div>
`;

export const PEOPLE_SECRET_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云并查集时间步回退机制解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 瞬时级联与时间批处理</div>
      <div style="font-size: 12px; color: #1e40af;">
        同一时刻 $time$ 发生的多场会议必须作为一个整体连通图处理（A 告诉 B，B 同一时刻又能告诉 C）。
        因此将会议按时间排序，利用双指针 <code>[l, r)</code> 截取同一时刻的所有会议，批量执行并查集 <code>union(u, v)</code>。
      </div>
    </div>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #991b1b; margin-bottom: 4px;">2. 关键陷阱：为什么必须撤销 (Rollback)？</div>
      <div style="font-size: 12px; color: #b91c1c;">
        若在时刻 5，专家 4 与 5 开会，他们被合并到了同一个集合。但他们此时并未连接到知晓秘密的 0 号节点。<br/>
        如果不重置，若未来时刻 10 专家 4 获知了秘密，通过并查集残留的指针，5 号专家会被<b>穿越时空错误地提前感染</b>！
        因此当前时刻结束后，所有 <code>find(p) != find(0)</code> 的节点必须立即执行 <code>father[p] = p</code> 恢复独立！
      </div>
    </div>
  </div>
`;
