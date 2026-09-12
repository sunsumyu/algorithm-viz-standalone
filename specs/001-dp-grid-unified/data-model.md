# Data Model: 全局 DP 网格适配器与足迹机制统一

**Feature Branch**: `001-dp-grid-unified` | **Date**: 2026-09-12

## 1. 实体与接口模型 (Entities & Interfaces)

### ① `GridRenderOptions` (扩展)
全局网格渲染器的入参配置接口，位于 `src/core/renderers/grid-visual-adapter.ts`：

```typescript
export interface GridRenderOptions {
  m: number;                   // 网格总行数
  n: number;                   // 网格总列数
  isReverse?: boolean;         // 是否为逆向推导 (从尾到首)
  isGridProblem?: boolean;     // 是否为纯迷宫网格问题 (默认 true)
  modelId?: string;            // 算法模型标识符 (如 'longest-common-subsequence', 'unique-paths-ii')
  
  // 新增：行列语义标尺
  rowLabels?: string[];        // 行轴标尺 (如 ['Ø', 'a', 'b', 'c'])
  colLabels?: string[];        // 列轴标尺 (如 ['Ø', 'a', 'c', 'e'])
  
  // 新增：领域特异性判断
  isMatch?: (r: number, c: number) => boolean; // 判定该坐标是否属于字符匹配
}
```

### ② `UniversalStep` (步骤数据规范)
探险家行走与网格状态的单步数据载体：

```typescript
export interface UniversalStep {
  i: number;                   // 当前探险家行坐标
  j: number;                   // 当前探险家列坐标
  grid?: (number | null)[][];  // 已求解状态矩阵 (已求解为 number, 待求解为 null)
  activeStack?: string[];      // 活动调用栈路径 (如 ["0,0", "0,1", "1,1"])
  fromI?: number;              // 来源行坐标 (用于物理反弹或连线起点)
  fromJ?: number;              // 来源列坐标
  obstacleGrid?: number[][];   // 障碍物矩阵 (如有)
  type?: string;               // 步骤类型
  msg?: string;                // 步骤说明
}
```

## 2. 单元格状态机 (Cell State Transitions)

每个单元格 `(r, c)` 在渲染时严格遵循无二义性优先级状态机：

```
                    ┌─────────────────────────┐
                    │     未探索 (isEmpty)     │
                    │      白底 / 单字符 '-'    │
                    └────────────┬────────────┘
                                 │
                     入栈调用 (push activeStack)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     当前探索 (isCur)     │
                    │ 浅蓝高亮 / 探险家 🤠 独立立 │
                    └────────────┬────────────┘
                                 │
                     继续深层调用 (子递归入栈)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    活动调用栈 (isTrail)   │
                    │ 浅蓝虚线框 / 脉冲单脚印 👣 │
                    │     带有 SVG 安全绳连线   │
                    └────────────┬────────────┘
                                 │
                     回溯出栈 (pop activeStack & 返回解)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     已解通 (isDone)      │
                    │ 淡绿底色 / 大号加粗解值    │
                    │ (若匹配带 ✨，无其它噪点) │
                    └─────────────────────────┘
```

## 3. 约束与不变式 (Invariants)

1. **足迹与解永久性不变式**：一旦某坐标 `(r, c)` 被回溯赋予计算结果 `val`，无论后续调用栈伸缩到何处，该格子永久保持 `isDone` 状态，绝不清空重置为空白。
2. **角色互斥性不变式**：探险家 🤠 小人只出现在唯一步骤活跃格（`isCur`），且脚下绝不重叠生成多余的 `👣` 字符。
3. **视觉降噪不变式**：单元格内绝不出现 `×2`、`栈` 等破坏几何整洁度的辅助文本，保持与 LeetCode / 不同路径 II 一致的高级感。
