/**
 * 左神算法通关课 185 ~ 190 欧拉序/DFN序求LCA、边分治、欧拉路径/回路、强连通分量缩点、边双连通分量与点双连通分量 题目与解析
 */

export const ADVANCED_185_190_PROBLEMS = {
  eulerDfnLca: {
    title: '欧拉序与 DFN 序求 LCA (Class 185)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3379 【模板】最近公共祖先 / RMQ 转化)</h2>
        <p>传统倍增法求 LCA 单次查询需要 $O(\\log N)$ 时间。通过<strong>欧拉序 (Euler Tour)</strong> 或 <strong>DFN 序 (DFS序)</strong>，可以将树上祖先关系转化为线性数组上的区间最值查询 (RMQ)，结合 ST 表实现 <strong>$O(N \\log N)$ 预处理、$O(1)$ 常数时间秒出 LCA</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">欧拉序与 DFN 序两种方案</h3>
        <ul>
          <li>1. <strong>欧拉序 + 深度 RMQ</strong>：DFS 进出树时记录访问序列，总长度 $2N - 1$。节点 $u, v$ 首次出现位置之间的所有点中，深度最小的点即为 $\\text{LCA}(u, v)$。</li>
          <li>2. <strong>DFN 序 + 树上前驱 RMQ</strong>：只需记录长度为 $N$ 的 DFN 序。若 $u = v$ 则为自身；若 $u \\neq v$（设 $\\text{dfn}[u] < \\text{dfn}[v]$），则 LCA 为在区间 $(\\text{dfn}[u], \\text{dfn}[v]]$ 中各点在其原树中父节点里 DFN 最小者的父节点，空间比欧拉序减半。</li>
        </ul>
      </div>
    `,
  },

  edgeDecomposition: {
    title: '树上边分治与边分树 (Class 186)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (SPOJ - Free Tour II / 洛谷 P4178 衍生)</h2>
        <p>点分治将树根据重心拆分成多个子连通块，而<strong>边分治 (Edge Decomposition)</strong> 每次选取一条<strong>重心边 (Centroid Edge)</strong> 割断，将树严格二等分为两个连通块，递归结构天然是严格的<strong>二叉树</strong>，在合并信息时比点分治更适合维护凸包或单调队列。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">三度化与重心边选择</h3>
        <p>1. <strong>多叉树三度化</strong>：菊花图会使边分治退化至 $O(N^2)$。因此必须通过引入边权为 0 的虚点将多叉树重构成每个点度数 $\\le 3$ 的三度树，保证分割平衡。</p>
        <p>2. <strong>边分树 (Edge Centroid Tree)</strong>：每次递归断开中心边，将其作为边分树节点，左右子树为两侧连通块，天然构建出一棵高度 $O(\\log N)$ 的二叉重构树。</p>
      </div>
    `,
  },

  eulerianPathCircuit: {
    title: '欧拉路径与欧拉回路 (Class 187)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P7771 【模板】欧拉路径 / Hierholzer 算法)</h2>
        <p><strong>欧拉路径</strong>：恰好经过图中每条边一次的连续路径；若起点与终点重合，则称为<strong>欧拉回路</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">充要条件与 Hierholzer 算法</h3>
        <ul>
          <li>1. <strong>有向图欧拉路径判定</strong>：连通块内要么所有点入度等于出度（欧拉回路），要么恰好一个起点 (出度 = 入度 + 1) 与一个终点 (入度 = 出度 + 1)，其余点入度等于出度。</li>
          <li>2. <strong>Hierholzer 圈套圈算法</strong>：从起点出发 DFS，利用当前弧优化删边避免 $O(E^2)$ 回溯，在递归归途将顶点逆序压入栈中，最终弹栈顺序即为字典序最小欧拉路径。</li>
        </ul>
      </div>
    `,
  },

  tarjanSCC: {
    title: '强连通分量与 Tarjan 缩点 (Class 188)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3387 【模板】缩点 / 有向图 DAG 转换)</h2>
        <p>在有向图中，若两个顶点可以相互到达，则称其强连通。极大强连通子图称为<strong>强连通分量 (Strongly Connected Component, SCC)</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Tarjan 算法与 DAG 缩点</h3>
        <p>1. <strong>DFN 与 LOW 追溯值</strong>：$\\text{dfn}[u]$ 记录时间戳，$\\text{low}[u]$ 记录 $u$ 及其子树通过后向边能回溯到的最早栈内时间戳。</p>
        <p>2. <strong>分量出栈与缩点</strong>：当 $\\text{dfn}[u] = \\text{low}[u]$ 时，$u$ 为该 SCC 的根，连续弹出栈中节点直至 $u$。将每个 SCC 缩为一个巨点，有向环被消除，整张图转化为<strong>有向无环图 (DAG)</strong>，支持拓扑排序与动态规划。</p>
      </div>
    `,
  },

  edgeBCC: {
    title: '割边与边双连通分量 e-BCC (Class 189)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P8436 【模板】边双连通分量 / 桥判定)</h2>
        <p>无向图中，若删去一条边后连通块数量增加，该边称为<strong>割边 (桥, Bridge)</strong>。极大的不含任何割边的子图称为<strong>边双连通分量 (2-Edge-Connected Component, e-BCC)</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">桥判定准则与树形缩点</h3>
        <p>1. <strong>桥判定定理</strong>：若无向边 $(u, v)$ 满足 $\\text{low}[v] > \\text{dfn}[u]$，说明 $v$ 及其子树无法绕过该边回溯到 $u$ 或其祖先，因此 $(u, v)$ 必为割边（注意需忽略反向重边）。</p>
        <p>2. <strong>缩点成树</strong>：将所有非割边联通的块缩为一个点，割边作为连接边，无向图缩点后必然退化为一棵<strong>森林或树</strong>。</p>
      </div>
    `,
  },

  vertexBCC: {
    title: '割点与点双连通分量 v-BCC (Class 190)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3388 【模板】割点 / 顶点双连通)</h2>
        <p>无向图中，删去一个顶点及其相连的边后连通块增加，该点称为<strong>割点 (Cut Vertex / 割顶)</strong>。极大的不含割点的子图称为<strong>点双连通分量 (2-Vertex-Connected Component, v-BCC)</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">割点判定与栈维护</h3>
        <p>1. <strong>根节点判定</strong>：DFS 搜索树的根若拥有 $\\ge 2$ 棵子树，则根为割点。</p>
        <p>2. <strong>非根节点判定</strong>：若存在儿子 $v$ 满足 $\\text{low}[v] \\ge \\text{dfn}[u]$，则 $u$ 为割点（意味着 $v$ 无法脱离 $u$ 向上回溯）。</p>
        <p>3. <strong>点双特点</strong>：一个割点可以同时属于多个点双连通分量，每条边恰好属于一个点双，这是圆方树与图结构分析的核心基础。</p>
      </div>
    `,
  },
};
