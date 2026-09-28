/**
 * Class 059: 拓扑排序与 Kahn 算法 体系化名师讲义
 * 涵盖：
 * Code01: 课程表拓扑排序与判环 (LeetCode 207)
 */

export const GRAPH_059_PROBLEMS = {
  courseSchedule059: {
    title: '课程表与拓扑排序判环 (Class 059 / LeetCode 207)',
    difficulty: 'Medium',
    tag: '拓扑排序 · Kahn 算法 · 有向环检测',
    badge: '【必备】拓扑排序 Code01',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          你这个学期必须选修 <code>numCourses</code> 门课程，记为 <code>0</code> 到 <code>numCourses - 1</code>。
          在选修某些课程之前需要一些先修课程。先修课程按数组 <code>prerequisites</code> 给出，其中 <code>prerequisites[i] = [a, b]</code> 表示必须先修 <code>b</code> 才能修 <code>a</code>（即存在一条有向边 $b \to a$）。
          请你判断是否可能完成所有课程的学习？如果可以返回 <code>true</code>；否则返回 <code>false</code>。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
          <strong style="color: #1e40af;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>有向无环图 (DAG) 拓扑排序：</strong>一个有向图能够完成全部先修依赖，<strong>当且仅当该图是一个 DAG（有向无环图）</strong>！如果存在环（例如 A 先修 B，B 先修 A），则陷入鸡生蛋蛋生鸡的循环依赖死锁，任何一门课都无法开始修读。</li>
            <li><strong>Kahn 算法三步曲：</strong>
              <br>1. <strong>入度统计：</strong>统计每个课程节点的入度 <code>inDegree[u]</code>（即有多少门先修课程必须在它之前完成）；
              <br>2. <strong>零入度入队：</strong>将所有入度为 0 的节点（无需任何先修课，可立刻开修）推入 FIFO 就绪队列；
              <br>3. <strong>链式削减：</strong>队头节点出队修读，并将该课程所有后继课程的入度减 1。一旦某个后继课程入度削减至 0，立即入队！
            </li>
            <li><strong>终局判环定理：</strong>
              全图总计出队修完的课程数记为 <code>learnedCount</code>：<br>
              若 <code>learnedCount == numCourses</code>，说明所有节点均成功解耦，图无环（返回 <code>true</code>）；<br>
              若 <code>learnedCount < numCourses</code>，说明留在图中的节点彼此错位纠缠形成了环，环内节点的入度永远无法降为 0，无法修完（返回 <code>false</code>）！
            </li>
            <li><strong>复杂度：</strong>时间复杂度 $O(V + E)$，空间复杂度 $O(V + E)$，高效率一次遍历完成全图拓扑判环。</li>
          </ul>
        </div>
      </div>
    `,
  },
};
