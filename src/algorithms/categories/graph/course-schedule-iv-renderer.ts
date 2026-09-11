/**
 * 课程表 IV (Course Schedule IV)
 * LeetCode 1462 (Medium / 图论可达性与传递闭包)
 * 核心原语:
 *  判定先修课程依赖图中的任意两个课程之间是否存在【可达关系】(Reachability / Transitive Closure)。
 *  核心解法：基于拓扑排序的位集 (BitSet) 传递闭包，或者 Floyd-Warshall 全源连通性更新。
 *  每个节点维护一个布尔集合 isReachable[u][v]：
 *   当有边 u -> v 时，isReachable[u][v] = true，并且 u 的所有前驱也必然能到达 v。
 *  时间复杂度 O(V * (V + E))，空间复杂度 O(V^2)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface CourseScheduleIVStep extends StepBase {
  numCourses: number;
  prerequisites: [number, number][];
  closure: boolean[][];
  activeU: number;
  activeV: number;
  queryResults: { u: number; v: number; ans: boolean }[];
  phase: 'init' | 'propagate' | 'query' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const COURSE_SCHEDULE_IV_CODES = {
  java: `public class Solution {
    public List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
        boolean[][] isPre = new boolean[numCourses][numCourses];
        List<Integer>[] graph = new ArrayList[numCourses];
        int[] inDegree = new int[numCourses];
        for (int i = 0; i < numCourses; i++) graph[i] = new ArrayList<>();
        
        for (int[] p : prerequisites) {
            graph[p[0]].add(p[1]);
            isPre[p[0]][p[1]] = true;
            inDegree[p[1]]++;
        }
        
        // 拓扑排序传播可达性状态
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) queue.offer(i);
        
        while (!queue.isEmpty()) {
            int cur = queue.poll();
            for (int nxt : graph[cur]) {
                for (int i = 0; i < numCourses; i++) {
                    if (isPre[i][cur]) isPre[i][nxt] = true;
                }
                if (--inDegree[nxt] == 0) queue.offer(nxt);
            }
        }
        List<Boolean> ans = new ArrayList<>();
        for (int[] q : queries) ans.add(isPre[q[0]][q[1]]);
        return ans;
    }
}`,
  cpp: `class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
        vector<vector<bool>> isPre(numCourses, vector<bool>(numCourses, false));
        vector<vector<int>> graph(numCourses);
        vector<int> inDegree(numCourses, 0);
        for (auto& p : prerequisites) {
            graph[p[0]].push_back(p[1]);
            isPre[p[0]][p[1]] = true;
            inDegree[p[1]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) if (inDegree[i] == 0) q.push(i);
        while (!q.empty()) {
            int cur = q.front(); q.pop();
            for (int nxt : graph[cur]) {
                for (int i = 0; i < numCourses; ++i) {
                    if (isPre[i][cur]) isPre[i][nxt] = true;
                }
                if (--inDegree[nxt] == 0) q.push(nxt);
            }
        }
        vector<bool> ans;
        for (auto& query : queries) ans.push_back(isPre[query[0]][query[1]]);
        return ans;
    }
};`,
  python: `class Solution:
    def checkIfPrerequisite(self, numCourses: int, prerequisites: list[list[int]], queries: list[list[int]]) -> list[bool]:
        is_pre = [[False] * numCourses for _ in range(numCourses)]
        graph = [[] for _ in range(numCourses)]
        in_degree = [0] * numCourses
        for u, v in prerequisites:
            graph[u].append(v)
            is_pre[u][v] = True
            in_degree[v] += 1
        q = collections.deque([i for i in range(numCourses) if in_degree[i] == 0])
        while q:
            cur = q.popleft()
            for nxt in graph[cur]:
                for i in range(numCourses):
                    if is_pre[i][cur]:
                        is_pre[i][nxt] = True
                in_degree[nxt] -= 1
                if in_degree[nxt] == 0:
                    q.append(nxt)
        return [is_pre[u][v] for u, v in queries]`,
};

export function buildCourseScheduleIVSteps(
  numCourses: number = 4,
  prerequisites: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
  ],
  queries: [number, number][] = [
    [0, 2],
    [1, 3],
    [3, 0],
    [0, 3],
  ]
): CourseScheduleIVStep[] {
  const steps: CourseScheduleIVStep[] = [];

  const closure: boolean[][] = Array.from({ length: numCourses }, () =>
    new Array(numCourses).fill(false)
  );
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  // 初始化直接依赖
  for (const [u, v] of prerequisites) {
    graph[u].push(v);
    closure[u][v] = true;
    inDegree[v]++;
  }

  // Step 0: Init
  steps.push({
    numCourses,
    prerequisites,
    closure: closure.map((row) => [...row]),
    activeU: -1,
    activeV: -1,
    queryResults: [],
    phase: 'init',
    message: `算法启动：课程总数 ${numCourses}，直接先修依赖有 ${prerequisites.length} 条。建立入度数组与邻接表。`,
    log: `初始化先修图，直接先修标记就绪`,
    codeLine: 4,
  });

  // 拓扑排序传播
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;

    for (const nxt of graph[cur]) {
      // 传播闭包
      for (let i = 0; i < numCourses; i++) {
        if (closure[i][cur] && !closure[i][nxt]) {
          closure[i][nxt] = true;
          steps.push({
            numCourses,
            prerequisites,
            closure: closure.map((row) => [...row]),
            activeU: i,
            activeV: nxt,
            queryResults: [],
            phase: 'propagate',
            message: `传递闭包更新：因为课程 ${i} 是课程 ${cur} 的先修，而 ${cur} -> ${nxt}，故课程 ${i} 也是课程 ${nxt} 的先修！`,
            log: `传递闭包: isPre[${i}][${nxt}] = true`,
            codeLine: 24,
          });
        }
      }

      inDegree[nxt]--;
      if (inDegree[nxt] === 0) {
        queue.push(nxt);
      }
    }
  }

  // 校验查询
  const queryResults: { u: number; v: number; ans: boolean }[] = [];
  for (const [qu, qv] of queries) {
    const ans = closure[qu][qv];
    queryResults.push({ u: qu, v: qv, ans });
    steps.push({
      numCourses,
      prerequisites,
      closure: closure.map((row) => [...row]),
      activeU: qu,
      activeV: qv,
      queryResults: [...queryResults],
      phase: 'query',
      message: `执行查询 [${qu} -> ${qv}]：闭包矩阵 isPre[${qu}][${qv}] = ${ans}。课程 ${qu} ${ans ? '是' : '不是'} 课程 ${qv} 的先修。`,
      log: `查询 query(${qu}, ${qv}) => ${ans}`,
      codeLine: 29,
    });
  }

  // Finish
  steps.push({
    numCourses,
    prerequisites,
    closure: closure.map((row) => [...row]),
    activeU: -1,
    activeV: -1,
    queryResults: [...queryResults],
    phase: 'finish',
    message: `全部先修查询处理完毕！通过传递闭包矩阵在 O(1) 内完成了每项可达性回答。`,
    log: `算法执行完毕，返回查询结果集`,
    codeLine: 31,
  });

  return steps;
}

function renderCourseScheduleIVCanvas(step: CourseScheduleIVStep): string {
  const { numCourses, closure, activeU, activeV, queryResults, phase } = step;

  // 渲染闭包矩阵表
  let matrixHeader = `<th style="padding: 4px; border: 1px solid #334155; background: rgba(30,41,59,0.8); color: #94a3b8; font-size: 11px;">u\\v</th>`;
  for (let j = 0; j < numCourses; j++) {
    matrixHeader += `<th style="padding: 4px; border: 1px solid #334155; background: rgba(30,41,59,0.8); color: #38bdf8; font-size: 11px;">C${j}</th>`;
  }

  let matrixRows = '';
  for (let i = 0; i < numCourses; i++) {
    let cells = `<td style="padding: 4px; border: 1px solid #334155; background: rgba(30,41,59,0.8); color: #38bdf8; font-size: 11px; text-align: center; font-weight: 700;">C${i}</td>`;
    for (let j = 0; j < numCourses; j++) {
      const isReachable = closure[i][j];
      const isActive = i === activeU && j === activeV;

      let bg = 'rgba(255,255,255,0.02)';
      let color = '#475569';
      let border = '1px solid #334155';

      if (isActive) {
        bg = 'rgba(245, 158, 11, 0.4)';
        color = '#fbbf24';
        border = '2px solid #f59e0b';
      } else if (isReachable) {
        bg = 'rgba(16, 185, 129, 0.2)';
        color = '#34d399';
      }

      cells += `<td style="padding: 4px; border: ${border}; background: ${bg}; color: ${color}; font-size: 11px; text-align: center; font-weight: 600;">
        ${isReachable ? '✓ 是' : '—'}
      </td>`;
    }
    matrixRows += `<tr>${cells}</tr>`;
  }

  // 渲染查询列表徽章
  const queryBadges = queryResults
    .map((q) => {
      return `
      <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.04); border-radius: 4px; font-size: 11px;">
        <span style="color: #94a3b8;">查询 [C${q.u} ➔ C${q.v}]</span>
        <span style="color: ${q.ans ? '#34d399' : '#f87171'}; font-weight: 700;">${q.ans ? '✓ 先修' : '✗ 否'}</span>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px;">
        <!-- 左侧 传递闭包矩阵 (Transitive Closure Matrix) -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
            <span>全源可达性传递闭包 (isPre[u][v])</span>
            <span style="color: #34d399;">● 绿色代表 u 可达 v</span>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead><tr>${matrixHeader}</tr></thead>
            <tbody>${matrixRows}</tbody>
          </table>
        </div>

        <!-- 右侧 查询结果面板 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px; display: flex; flex-direction: column;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
            先修关系验证查询 (Queries)
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; max-height: 170px;">
            ${queryBadges || '<div style="color: #64748b; font-size: 11px; padding: 8px;">等待闭包构建完成后查询...</div>'}
          </div>
        </div>
      </div>

      <!-- 底部统计卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">课程总数</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${numCourses}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前活跃源课程 u</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${activeU >= 0 ? `C${activeU}` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前活跃目标课程 v</div>
          <div style="font-size: 16px; font-weight: 700; color: #a78bfa;">${activeV >= 0 ? `C${activeV}` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前推演阶段</div>
          <div style="font-size: 15px; font-weight: 700; color: #34d399;">
            ${phase === 'propagate' ? '闭包传递中' : phase === 'query' ? '查询解答中' : phase === 'finish' ? '已收敛完成' : '图初始化'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'course-schedule-iv',
  name: '课程表 IV',
  category: 'graph',
  difficulty: 2,
  learningGoal: 'LeetCode 1462: 判断有向图中任意两门课程是否存在先修可达性。使用拓扑排序带动状态传递闭包，将多路查询优化为 O(1)。',
  codeLanguages: COURSE_SCHEDULE_IV_CODES,
  generateSteps: (inputs) => {
    const rawN = Number(inputs?.numCourses ?? 4);
    const n = isNaN(rawN) || rawN < 2 ? 4 : Math.min(rawN, 8);
    const pre: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    const qry: [number, number][] = [
      [0, 2],
      [1, 3],
      [3, 0],
      [0, 3],
    ];
    return buildCourseScheduleIVSteps(n, pre, qry);
  },
  renderCanvas: (container: HTMLElement, step: CourseScheduleIVStep) => {
    container.innerHTML = renderCourseScheduleIVCanvas(step);
  },
  inputs: [
    {
      id: 'numCourses',
      label: '课程节点数 (2-8)',
      type: 'number',
      defaultValue: 4,
      placeholder: '课程总数',
    },
  ],
});
