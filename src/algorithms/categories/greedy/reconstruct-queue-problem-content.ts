/**
 * LeetCode 406: 根据身高重建队列 (Queue Reconstruction by Height)
 * 领域知识与题解精讲配置声明
 */

export const RECONSTRUCT_QUEUE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 406</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">根据身高重建队列 (Queue Reconstruction by Height)</h2>
    </div>
    <p style="margin: 0;">假设有打乱顺序的一群人站成一个队列，数组 <code style="color: #fde047; font-family: monospace;">people</code> 表示每个人的属性，其中 <code style="color: #fde047; font-family: monospace;">people[i] = [h_i, k_i]</code> 表示第 <code style="color: #fde047; font-family: monospace;">i</code> 个人的身高为 <code style="color: #fde047; font-family: monospace;">h_i</code> ，前面 <strong>正好</strong> 有 <code style="color: #fde047; font-family: monospace;">k_i</code> 个身高大于或等于 <code style="color: #fde047; font-family: monospace;">h_i</code> 的人。</p>
    <p style="margin: 0;">请你重新构造并返回输入数组 <code style="color: #fde047; font-family: monospace;">people</code> 所表示的队列。返回的队列应该格式化为数组 <code style="color: #fde047; font-family: monospace;">queue</code> ，其中 <code style="color: #fde047; font-family: monospace;">queue[j] = [h_j, k_j]</code> 是队列中第 <code style="color: #fde047; font-family: monospace;">j</code> 个人的属性。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]</div>
      <div>输出: [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]</div>
      <div>解释: 编号为 0 的人身高为 5 ，没有身高更高或相同的人排在前面。编号为 1 的人身高为 7 ，没有身高更高或相同的人排在前面...</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: people = [[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]]</div>
      <div>输出: [[4,0],[5,0],[2,2],[3,2],[1,4],[6,0]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; people.length &le; 2000</div>
      <div>• 0 &le; h_i &le; 10^6</div>
      <div>• 0 &le; k_i &lt; people.length</div>
    </div>
  </div>
`;

export const RECONSTRUCT_QUEUE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：身高降序 + k 升序排序，按 k 值直接插入队列
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 两个维度的贪心排序法则</div>
        <p style="margin: 0; color: #94a3b8;">• 身高高的排在前面（<code style="color: #7dd3fc; font-family: monospace;">h 降序</code>）；<br/>
        • 身高相同者，<code style="color: #fbbf24; font-family: monospace;">k 升序</code>。<br/>
        这保证了先排入队列的人都是高个子。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 为什么可以直接按照 k 插入队列？</div>
        <p style="margin: 0; color: #94a3b8;">当处理第 <code style="color: #7dd3fc; font-family: monospace;">i</code> 个人 <code style="color: #fde047; font-family: monospace;">[h, k]</code> 时，已经在队列中的所有人身高都 <code style="color: #34d399; font-family: monospace;">&ge; h</code>。<br/>
        因此，只需直接将其插入到队列的 <code style="color: #fbbf24; font-family: monospace;">index = k</code> 位置，前面就恰好有 <code style="color: #7dd3fc; font-family: monospace;">k</code> 个更高或等高的人！<br/>
        而后续插入的矮个子，无论插在哪里，都不会对已插入的高个子的 <code style="color: #7dd3fc; font-family: monospace;">k</code> 值产生任何影响！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 数据结构选用 LinkedList</div>
        <p style="margin: 0; color: #94a3b8;">频繁在任意位置插入元素，选用 <code style="color: #7dd3fc; font-family: monospace;">LinkedList</code> 可以避免数组整体平移的开销。</p>
      </div>
    </div>
  </div>
`;

export const RECONSTRUCT_QUEUE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public int[][] reconstructQueue(int[][] people) {',
    '    // 1. 身高从大到小排（身高相同 k 小的在前面）',
    '    Arrays.sort(people, (a, b) -> {',
    '        if (a[0] == b[0]) return a[1] - b[1];',
    '        return b[0] - a[0];',
    '    });',
    '    LinkedList<int[]> que = new LinkedList<>();',
    '    // 2. 按照 k 作为下标插入链表',
    '    for (int[] p : people) {',
    '        que.add(p[1], p);',
    '    }',
    '    return que.toArray(new int[people.length][]);',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {',
    '        sort(people.begin(), people.end(), [](const vector<int>& a, const vector<int>& b) {',
    '            if (a[0] == b[0]) return a[1] < b[1];',
    '            return a[0] > b[0];',
    '        });',
    '        vector<vector<int>> que;',
    '        for (int i = 0; i < people.size(); i++) {',
    '            int position = people[i][1];',
    '            que.insert(que.begin() + position, people[i]);',
    '        }',
    '        return que;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:',
    '        # 身高降序，k 升序',
    '        people.sort(key=lambda x: (-x[0], x[1]))',
    '        que = []',
    '        for p in people:',
    '            que.insert(p[1], p)',
    '        return que',
  ],
  javascript: [
    'var reconstructQueue = function(people) {',
    '    people.sort((a, b) => {',
    '        if (a[0] === b[0]) return a[1] - b[1];',
    '        return b[0] - a[0];',
    '    });',
    '    const queue = [];',
    '    for (let i = 0; i < people.length; i++) {',
    '        queue.splice(people[i][1], 0, people[i]);',
    '    }',
    '    return queue;',
    '};',
  ],
};
