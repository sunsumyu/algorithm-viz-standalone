/**
 * 左神算法通关课 191 ~ 195 边双缩点添边、虚点优化建图、前缀优化建图、2-SAT基础与2-SAT进阶 题目与解析
 */

export const ADVANCED_191_195_PROBLEMS = {
  ebccConstruction: {
    title: '边双连通缩点与加边构造 (Class 191)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P2860 / POJ 3177 冗余路径)</h2>
        <p>给定一张无向连通图，问<strong>至少需要添加多少条边</strong>，才能使整张图变为边双连通图（即不存在任何割边，任意两点间至少有两条边不相交的路径）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">缩点成树与叶子匹配定理</h3>
        <ul>
          <li>1. <strong>缩点成树</strong>：先用 Tarjan 算法将原图的所有边双连通分量 (e-BCC) 缩成单点，割边作为连接边，缩点后的图必定是一棵<strong>无向树</strong>。</li>
          <li>2. <strong>叶子度数统计</strong>：统计缩点树中所有度数为 1 的叶子节点数量 $L$。</li>
          <li>3. <strong>最优连边公式</strong>：一条新边最多能够覆盖并消除两条树枝上的割边，将两个叶子连通。因此最少需添加的边数严格为 $\\lceil L / 2 \\rceil = \\lfloor (L + 1) / 2 \\rfloor$。</li>
        </ul>
      </div>
    `,
  },

  virtualNodesConstruction: {
    title: '虚点优化建图与虚拟源汇 (Class 192)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P1983 车站分级 / 集合间高效连边)</h2>
        <p>在图论建模中，若集合 $A$ 中每个点都需要向集合 $B$ 中所有点连一条有向边，朴素建边复杂度高达 $O(|A| \\times |B|)$，在密集数据下会导致边数爆炸炸空间 (MLE) 或超时 (TLE)。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">虚拟中转中继与维度拆解</h3>
        <p>1. <strong>设立虚拟中转点</strong>：引入虚拟辅助节点 $V_{\\text{mid}}$，让集合 $A$ 中的每个点向 $V_{\\text{mid}}$ 连权值为 0 的边，再由 $V_{\\text{mid}}$ 向集合 $B$ 中的每个点连目标权值边。</p>
        <p>2. <strong>复杂度降维</strong>：边数由乘积关系 $O(|A| \\times |B|)$ 骤降为线性加和关系 $O(|A| + |B|)$，极大拓宽了图算法的规模承载力。</p>
      </div>
    `,
  },

  prefixSuffixGraph: {
    title: '前缀与后缀优化建图 (Class 193)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (CF 1215F / 区间互斥约束线性化)</h2>
        <p>在“序列中某个点 $u$ 成立时，其前缀 $[1, u]$ 中至多只能选一个”或者“某个区间内的点不能同时选取”等互斥问题中，两两连互斥边需要 $O(N^2)$ 条边。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">前缀树链传递推导</h3>
        <p>1. <strong>建立前缀辅助链</strong>：为每个前缀 $i$ 建立前缀虚点 $P_i$，连边 $P_{i-1} \\to P_i$ 表示前缀蕴含关系的传递。</p>
        <p>2. <strong>原点与前缀点绑定</strong>：节点 $u$ 选中时向 $P_u$ 连边，同时 $P_u$ 向其他互斥点连反向边，将任意连续区间的批量约束降为 $O(1)$ 条桥接边，总边数仅 $O(N)$。</p>
      </div>
    `,
  },

  twoSatAlgorithm: {
    title: '2-SAT 算法基础 (Class 194)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P4782 【模板】2-SAT 问题)</h2>
        <p><strong>2-SAT (2-Satisfiability)</strong> 问题研究每个布尔变量只能取 0 或 1，满足若干形如 $(A \\lor B)$ 的析取约束条件的全局布尔赋值求解。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">对称蕴含图与 SCC 判定</h3>
        <ul>
          <li>1. <strong>拆点与对称连边</strong>：每个变量 $x$ 拆为真点 $x$ 与假点 $\\neg x$。命题 $(A \\lor B)$ 逻辑等价于“若非 $A$ 则必选 $B$”且“若非 $B$ 则必选 $A$”，建立对称有向边 $\\neg A \\to B$ 与 $\\neg B \\to A$。</li>
          <li>2. <strong>无解充要条件</strong>：用 Tarjan 算法求强连通分量，若某个变量的真点与假点属于同一个 SCC (即 $\\text{scc}[x] == \\text{scc}[\\neg x]$)，意味着由 $x$ 可推导非 $x$ 且反向亦可，无解！</li>
          <li>3. <strong>解的构造</strong>：若均不相同则必有解；由于 Tarjan 缩点后的 SCC 编号逆序即为拓扑序，令赋值取 $\\text{scc}[x] < \\text{scc}[\\neg x]$ 者为真，即可在线性时间 $O(N + M)$ 构造出一组合法解。</li>
        </ul>
      </div>
    `,
  },

  twoSatAdvanced: {
    title: '2-SAT 进阶应用与方案构造 (Class 195)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P6378 [PA2010] Riddles / 恰好选一个的高阶规约)</h2>
        <p>在高级 2-SAT 问题中，常遇到复杂约束（如“某子集内恰好选一个变量”或“两变量异或/同或关系”）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">前缀优化 2-SAT 拆解技巧</h3>
        <p>1. <strong>至多选一个的 2-SAT 降维</strong>：“集合中任意两两不能同时为真”等价于两两连边 $O(K^2)$；结合 Class 193 的前缀优化建图，将二次方连边降解为 $O(K)$ 条链式蕴含边。</p>
        <p>2. <strong>至少选一个</strong>：简单连一条析取大闭环。</p>
        <p>3. <strong>两层结合</strong>：完美将“恰好选一个”严密规约为标准的线性 2-SAT 图模型，输出严谨无冲突的全局赋值。</p>
      </div>
    `,
  },
};
