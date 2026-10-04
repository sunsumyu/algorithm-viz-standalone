# 算法“四段式”与正逆序演化规范 (4-Stage Evolution & Bidirectional Traversal)

### 3.1 动态规划标准“四段式”体系
所有经典动态规划算法必须提供标准的四阶段演化演示：
1. **阶段 1：暴力递归 (Brute-Force Recursion)**
   - 目标：展示问题的递归树展开与重叠子问题。
   - 配套组件：递归树（Tree Visualizer）+ 局部栈帧调用。
2. **阶段 2：记忆化搜索 (Memoization Search)**
   - 目标：展示缓存表命中（Cache Hit / Prune）过程，对比剪枝效果。
   - 配套组件：递归树（剪枝变灰/高亮）+ 缓存表变化。
3. **阶段 3：严格表依赖 (Tabulation / 2D Grid)**
   - 目标：将递归调用反转为自底向上的迭代填表，明确网格方向性依赖。
   - 配套组件：二维状态网格 + 依赖单元格高亮 + 方向指示箭头。
4. **阶段 4：空间压缩优化 (Space Compression / 1D Rolling)**
   - 目标：展示维度消除（如 $O(M \times N) \to O(N)$），揭示状态覆盖风险。
   - 配套组件：一维滚动条 + **对角线暂存寄存器透明展示**。

### 3.2 空间压缩寄存器透明原则 (Space Compression Register Transparency)
当一维滚动数组存在对角线依赖（如 LCS 的 `leftUp`、LPS 的 `leftDown`）时，推演按细粒度三连步推进：
1. **暂存旧值**：高亮 `int backup = dp[j];`，展示寄存器缓存。
2. **转移计算**：高亮 `dp[j] = Math.max(...)`，使用暂存值与相邻格计算。
3. **寄存器推移**：高亮 `leftUp = backup;`，为下一列的对角线做好准备。
每一个寄存器状态更新均生成独立的展示步骤。

### 3.3 双向推演核心不变式 (Forward vs Reverse Traversal)
全库统一遵循顺逆推底层契约与标识命名：
- **顺推 (`id: 'forward'`)**：从原点/前缀基底向最终目标推导（如网格从 `(0, 0)` 开始，线性从首项自底向上填表）。默认配置统一为 `defaultMode: 'forward'`。
- **逆推 (`id: 'reverse'`)**：从末尾目标向子问题基底反推（如网格从 `(N-1, M-1)` 开始，线性倒序填表）。
- **标准化模式标识 (Standard Mode Identifiers)**：顶层 `declarative-stage-fragments.ts` 严格基于 `isForward = id === 'forward'` 判定。全库模式 ID 统一为 `'forward'` 与 `'reverse'`，触发红灯陷阱 13 & 14 门禁全自动核验。
