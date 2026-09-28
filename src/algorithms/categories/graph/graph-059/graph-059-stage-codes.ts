/**
 * Class 059: 拓扑排序与 Kahn 算法 四语言源码与精准 1-based 行号映射
 */

import { HighlightTarget } from '../../../../core/renderers/dark-code-terminal-presenter';

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

export const CODE01_COURSE_SCHEDULE_CODES: Record<string, string[]> = {
  java: [
    'public boolean canFinish(int numCourses, int[][] prerequisites) {', // 1
    '    int[] inDegree = new int[numCourses];', // 2
    '    List<List<Integer>> graph = new ArrayList<>();', // 3
    '    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());', // 4
    '    for (int[] p : prerequisites) {', // 5
    '        graph.get(p[1]).add(p[0]); // 先修课 p[1] -> 后续课 p[0]', // 6
    '        inDegree[p[0]]++;', // 7
    '    }', // 8
    '    Queue<Integer> queue = new ArrayDeque<>();', // 9
    '    for (int i = 0; i < numCourses; i++) {', // 10
    '        if (inDegree[i] == 0) queue.offer(i); // 零入度入队', // 11
    '    }', // 12
    '    int learned = 0;', // 13
    '    while (!queue.isEmpty()) {', // 14
    '        int cur = queue.poll();', // 15
    '        learned++;', // 16
    '        for (int next : graph.get(cur)) {', // 17
    '            if (--inDegree[next] == 0) queue.offer(next); // 链式削减', // 18
    '        }', // 19
    '    }', // 20
    '    return learned == numCourses; // 判环定理', // 21
    '}', // 22
  ],
  cpp: [
    'bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {', // 1
    '    vector<int> inDegree(numCourses, 0);', // 2
    '    vector<vector<int>> graph(numCourses);', // 3
    '    for (auto& p : prerequisites) {', // 4
    '        graph[p[1]].push_back(p[0]);', // 5
    '        inDegree[p[0]]++;', // 6
    '    }', // 7
    '    queue<int> q;', // 8
    '    for (int i = 0; i < numCourses; i++) {', // 9
    '        if (inDegree[i] == 0) q.push(i);', // 10
    '    }', // 11
    '    int learned = 0;', // 12
    '    while (!q.empty()) {', // 13
    '        int cur = q.front(); q.pop();', // 14
    '        learned++;', // 15
    '        for (int next : graph[cur]) {', // 16
    '            if (--inDegree[next] == 0) q.push(next);', // 17
    '        }', // 18
    '    }', // 19
    '    return learned == numCourses;', // 20
    '}', // 21
  ],
  python: [
    'def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:', // 1
    '    in_degree = [0] * num_courses', // 2
    '    graph = [[] for _ in range(num_courses)]', // 3
    '    for a, b in prerequisites:', // 4
    '        graph[b].append(a)', // 5
    '        in_degree[a] += 1', // 6
    '    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])', // 7
    '    learned = 0', // 8
    '    while queue:', // 9
    '        cur = queue.popleft()', // 10
    '        learned += 1', // 11
    '        for nxt in graph[cur]:', // 12
    '            in_degree[nxt] -= 1', // 13
    '            if in_degree[nxt] == 0:', // 14
    '                queue.append(nxt)', // 15
    '    return learned == num_courses', // 16
  ],
  javascript: [
    'function canFinish(numCourses, prerequisites) {', // 1
    '    const inDegree = new Array(numCourses).fill(0);', // 2
    '    const graph = Array.from({ length: numCourses }, () => []);', // 3
    '    for (const [a, b] of prerequisites) {', // 4
    '        graph[b].push(a);', // 5
    '        inDegree[a]++;', // 6
    '    }', // 7
    '    const queue = [];', // 8
    '    for (let i = 0; i < numCourses; i++) {', // 9
    '        if (inDegree[i] === 0) queue.push(i);', // 10
    '    }', // 11
    '    let learned = 0;', // 12
    '    while (queue.length > 0) {', // 13
    '        const cur = queue.shift();', // 14
    '        learned++;', // 15
    '        for (const next of graph[cur]) {', // 16
    '            if (--inDegree[next] === 0) queue.push(next);', // 17
    '        }', // 18
    '    }', // 19
    '    return learned === numCourses;', // 20
    '}', // 21
  ],
};

export const CODE01_COURSE_SCHEDULE_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  buildGraph:  { java: 6, cpp: 5, python: 5, javascript: 5 },
  initQueue:   { java: 11, cpp: 10, python: 7, javascript: 10 },
  pollQueue:   { java: 15, cpp: 14, python: 10, javascript: 14 },
  reduceDegree:{ java: 18, cpp: 17, python: 13, javascript: 17 },
  returnAns:   { java: 21, cpp: 20, python: 16, javascript: 20 },
};
