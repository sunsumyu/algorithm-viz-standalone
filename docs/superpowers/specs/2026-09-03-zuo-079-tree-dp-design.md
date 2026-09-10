# 算法讲解079 树型DP (下) 剩余算法补齐设计规范 (Design Spec)

## 1. 概述与背景

在左程云《算法与数据结构通关课》第079讲【树型dp-下】中，核心聚焦于**树的 DFS 序 / DFN 序打平技巧**与**树型动态规划结合**的高阶应用。
当前系统已实现 Code01（到达首都的最少油耗）、Code02（相邻字符不同的最长路径）与 Code05（选课/树上背包），本项目需补齐剩余两道极为经典的硬核算法：
1. **Code03: 移除子树后的二叉树高度 (Height of Binary Tree After Subtree Removal Queries / LeetCode 2458)**
2. **Code04: 从树中删除边的最小分数 (Minimum Score After Removals on a Tree / LeetCode 2322)**

---

## 2. 详细算法设计

### 2.1 Code03: 移除子树后的二叉树高度 (`height-removal-queries`)

- **对应标识**：`id: 'height-removal-queries'`
- **题目背景**：LeetCode 2458 (Hard)
- **核心算法**：
  1. 通过 DFS 先序遍历求出整棵树的 DFN 序，记录节点进出时间戳；节点 $u$ 的整棵子树映射到 DFN 数组的连续闭区间 $[dfn[u], dfn[u] + size[u] - 1]$。
  2. 记录每个 DFN 对应节点的深度 $deep[i]$。
  3. 预处理出 DFN 数组的前缀最大深度 $maxLeft[i]$ 与后缀最大深度 $maxRight[i]$。
  4. 针对查询 `queries[k]`，移除以 $queries[k]$ 为根的子树后，剩余节点的最大深度即为：
     $$\max(maxLeft[dfn[u] - 1], maxRight[dfn[u] + size[u]])$$
  5. 查询时间复杂度由朴素的 $O(n)$ 降至 **$O(1)$**，单次批量查询总复杂度 $O(n + m)$。
- **多语言代码标准**：Java、C++、Python、JavaScript 4 种语言均实现该标准 DFN 前后缀最值解法，并带有逐行语义映射与注释。
- **可视化设计**：
  - 树结构展示 + DFN 序列状态展示。
  - 查询某个节点时，将子树节点标为高亮剔除态（`disabled` / 灰色），DFN 序列上高亮左侧前缀区间与右侧后缀区间，动态呈现极值合并过程。

### 2.2 Code04: 从树中删除边的最小分数 (`minimum-score-after-removals`)

- **对应标识**：`id: 'minimum-score-after-removals'`
- **题目背景**：LeetCode 2322 (Hard)
- **核心算法**：
  1. 定根（以节点 0 为根）进行一次 DFS 后序遍历，预处理每个子树所有节点的异或和 $xor[u]$，整棵树的总异或和 $allXor = xor[0]$，以及每个节点的 DFN 序 $dfn[u]$ 和子树大小 $size[u]$。
  2. 树上删除两条边切分出 3 个连通块，等价于切除以节点 $a$ 和节点 $b$ 为根的两个子树。
  3. 枚举两棵被切除的子树根 $a$ 与 $b$（$O(n^2)$ 遍历所有边对）：
     - **包含关系**（$b$ 在 $a$ 的子树内，即 $dfn[a] \le dfn[b] < dfn[a] + size[a]$）：
       $x_1 = xor[b]$，$x_2 = xor[a] \oplus xor[b]$，$x_3 = allXor \oplus xor[a]$
     - **并列关系**（$a$ 与 $b$ 互不包含）：
       $x_1 = xor[a]$，$x_2 = xor[b]$，$x_3 = allXor \oplus xor[a] \oplus xor[b]$
  4. 每次判断拓扑关系只需 $O(1)$，计算分值 $\max(x_1, x_2, x_3) - \min(x_1, x_2, x_3)$ 并维护全局最小值。
- **多语言代码标准**：Java、C++、Python、JavaScript 4 种语言均提供标准建图、DFS 异或预处理与双重边枚举解法。
- **可视化设计**：
  - 树结构动态渲染，展示枚举的两条断边。
  - 将 3 个连通块赋予 3 种清晰区分的状态标签（例如：`Branch-A`、`Branch-B`、`Root-Remainder`），展示各自计算的节点值异或和、三者极差和全局最优更新。

---

## 3. 架构集成

1. **Spec 文件创建**：
   - `src/algorithms/categories/dynamic-programming/specs/tree/height-removal-queries.spec.ts`
   - `src/algorithms/categories/dynamic-programming/specs/tree/minimum-score-after-removals.spec.ts`
2. **导出与注册**：
   - 在 `src/algorithms/categories/dynamic-programming/specs/index.ts` 中导出并注册到 `DpStepEngine`。
3. **渲染器注册**：
   - 在 `src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts` 中注册 demo 渲染项。
4. **算法策略执行器适配**：
   - 在 `src/core/strategies/tree-dp-strategy.ts` 中扩充 `TreeDpModelId`，增加 `compileHeightRemovalQueries` 与 `compileMinimumScoreAfterRemovals`。
   - 在 `src/core/strategies/index.ts` 中完成策略注册。
   - 在 `src/core/model-repository.ts` 与 `src/core/algorithm-manifests-meta.ts` 中补充元数据。
5. **单元测试与验证**：
   - 在 `src/algorithms/categories/dynamic-programming/specs/tree/tree-specs.test.ts` 中编写完整的断言测试，验证元数据、多语言映射与算法执行正确性。
