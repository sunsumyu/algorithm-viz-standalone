# 3D 立体分层立交体素沙盘 (Layer-Stacked Exploded 3D Voxel Engine) 设计规格书

## 1. 背景与目标
在当前的算法可视化平台中，`ThreeGridVisualAdapter` 提供了针对 2D 网格类 DP（如不同路径、最小路径和等）的 3D 体素沙盘透视。然而，针对真正的高维与三维动态规划题目（如 $dp[step][r][c]$、$dp[i][j][k]$，例如《出界的路径数》、《骑士在棋盘上的概率》、《和能被 K 整除的路径》等），目前仍使用平面表格或滚动槽位展示，无法直观展现状态在空间多层维度间的汇聚与递推演化。

本项目旨在构建一个高表现力、高内聚的 **分层立交浮空层叠 3D 体素沙盘引擎 (ThreeLayeredVoxelAdapter)**，将三维 DP 状态在 WebGL 空间中沿垂直 Y 轴分层展开，并通过跨层发光能量光柱（Inter-layer Quantum Beams）生动呈现 $dp[k-1]$ 向 $dp[k]$ 状态汇聚的演化全过程。

---

## 2. 核心架构与深模块设计

遵循 `codebase-design` 深模块原则，新引擎作为完全自治的渲染器，对外部控制器暴露极窄、高杠锤的接口，彻底隔离内部的 Three.js 场景图、材质着色、几何体池化与动画时钟。

```
┌─────────────────────────────────────────────────────────────┐
│                 StateSpacePresenter (调用门面)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ 依据 is3DLayered / model.category === '三维 DP' 派发
                               ▼
┌─────────────────────────────────────────────────────────────┐
│      ★ ThreeLayeredVoxelAdapter (分层立交体素适配器深模块)    │
│  - 极窄公开契约：mount(container), render(step), dispose()    │
├──────────────────────────────┬──────────────────────────────┤
│  ├─ LayerStackManager        │ 管理 K 个 Y 轴网格层组与霓虹层标 │
│  ├─ VoxelMatrixCluster       │ 管理 VoxelCellMesh[k][r][c] 几何体与材质│
│  ├─ InterLayerBeamRenderer   │ 跨层贝塞尔能量管道与脉冲粒子光流 │
│  └─ LayerCameraCoordinator   │ 自动运镜：全景俯瞰 vs 当前活跃层跟随│
└─────────────────────────────────────────────────────────────┘
```

### 2.1 公开接口契约
位于 `src/core/renderers/three-layered-voxel-adapter.ts`：

```typescript
export interface LayeredVoxelCell {
  value: number | string;
  status: 'empty' | 'computed' | 'active' | 'dependency' | 'target';
  tag?: string;
}

export interface InterLayerDependency {
  from: { k: number; r: number; c: number };
  to: { k: number; r: number; c: number };
  label?: string;
}

export interface LayeredVoxelStepData {
  /** 当前活跃层索引 k */
  currentK: number;
  /** 当前层中活跃的网格坐标 (r, c) */
  currentR?: number;
  currentC?: number;
  /** 完整 3D 状态切片立方体: [k][r][c] */
  cube: LayeredVoxelCell[][][];
  /** 跨层转移依赖集合 (从上一层或历史层汇聚到当前单元) */
  interLayerDependencies?: InterLayerDependency[];
  /** 步骤文字说明 */
  message?: string;
}

export interface LayeredVoxelAdapterOptions {
  layers: number;      // K 维度大小 (如 maxMove + 1)
  rows: number;        // M 维度大小
  cols: number;        // N 维度大小
  layerGapY?: number;  // 垂直层间距 (默认 3.8)
  cellSize?: number;   // 体素大小 (默认 1.6)
}
```

---

## 3. 3D 空间视觉表现设计

### 3.1 空间布局与多层晶圆基座 (Y-Stack Positioning)
- 第 $k$ 层网格的中心坐标位于空间高度 $Y = k \times \text{layerGapY}$；
- 每一层均配备半透明发光网格平面（Grid Plane）与半透明浮空霓虹标牌（Sprite Badge: `Layer k: step=k`）；
- 层间距支持在初始化时自适应缩放，确保大层数时也能清晰透视。

### 3.2 水晶体素材质多态性 (Crystal Voxel Styling)
- **`active` (当前正在计算的单元)**:
  - 向上悬浮升起 $0.5 \times \text{cellSize}$；
  - 采用青蓝色/高亮金光材质，伴随微弱光晕外壳；
  - 顶部嵌有 Canvas 动态贴图渲染当前状态数值。
- **`dependency` (被依赖的历史层单元)**:
  - 呈现琥珀金色辉光，作为跨层导光柱的发射起点；
  - 具备微弱的高频呼吸脉冲动画。
- **`computed` (已推导完成的单元)**:
  - 采用深邃墨蓝/冰晶半透明材质（`roughness: 0.15, transmission: 0.7, transparent: true`），呈现水晶玻璃折射质感，避免阻挡下层视线。
- **`empty` (尚未触及的未来单元)**:
  - 仅呈现浅白色边框轮廓线（Wireframe Box）。

### 3.3 跨层能量光束与粒子流 (Inter-layer Energy Tubes & Sparks)
- 利用 `THREE.CatmullRomCurve3` 在起终点 $(k-1, nr, nc)$ 与 $(k, r, c)$ 之间构建顺滑 S 型空间样条；
- 管道采用半透明发光材质 `TubeGeometry`，内部由动画循环驱动发光粒子流（Energy Sparks）向上跃迁，真实反映「多路状态累加至当前单元」。

### 3.4 交互与运镜调度 (Camera Modes)
- 接入 `OrbitControls` 支持 360° 旋转、俯仰与滚轮缩放；
- 提供两种运镜预设：
  1. **全景等轴巡航 (All Layers Overview)**：斜俯视 45°，观察多层全局递推态势；
  2. **当前层特写跟踪 (Follow Active Layer)**：平滑飞跃并将相机焦点对准当前计算层 $Y$ 轴中心。

---

## 4. 状态提取与集成接缝 (Integration Seams)

1. **`LayeredVoxelStepAdapter` 提取器**：
   - 监听 `DpTraceStep` / `UniversalStep`；
   - 自动将 `out-of-boundary-paths` 等 3D DP 题目的步骤状态累积解析为 `LayeredVoxelStepData`；
   - 自动识别跨层依赖（如 `dependencies` 跨步引用）。
2. **`StateSpacePresenter` 渲染门面接轨**：
   - 在主沙盘区 Card 1 增加 `three-layered-voxel-adapter` 渲染分支；
   - 当算法类别属于 `三维 DP` 或元数据标记 `is3D` 时自动挂载分层立交视口。
3. **零内存泄漏（Lifecycle Teardown）**：
   - `dispose()` 遍历释放所有网格、材质、曲线与动画时钟；
   - 与 `ViewMountEngine` 算法切换生命周期严密咬合。

---

## 5. 测试与验证计划

1. **单元测试 (`three-layered-voxel-adapter.test.ts`)**：
   - 测试 Node.js / Mock 环境下的空间层坐标计算、多层网格组装、步进数据更新与生命周期销毁。
2. **三维 DP 联动测试 (`three-dimension-3d-visuals.test.ts`)**：
   - 验证 `out-of-boundary-paths` 等算法步进流到 3D 立交沙盘的数据转换准确性。
3. **全库回归验证**：
   - `npx vitest run src/core/fidelity-auditor.test.ts` (331 算法 100% 通过)；
   - `npm run typecheck` (零类型错误)；
   - `npm run build` (生产打包成功)。
