---
name: browser-viewport-debugging
description: 浏览器可视化调试与视口分辨率强制规范。在进行任何浏览器端 UI 调试、Puppeteer 自动化交互或截图验收前必须调用本 Skill，强制配置 1920x1080 全高清视口，杜绝 800x600 局促缩放与大面积空白留白。
---

# 浏览器视口与分辨率调试规范 (Browser Viewport & Resolution Debugging)

本规范专为**算法可视化桌面/Web 端 UI 调试、Puppeteer 自动化截图与视觉验收**制定。彻底解决因 Puppeteer 默认低分辨率限制导致的「界面挤在左上角、大屏留白」问题。

---

## 0. 核心痛点与事故根因 (Post-Mortem)

### 为什么会出现“界面缩在左上角，右下大面积空白”？
1. **Puppeteer 的隐式陷阱**：
   Puppeteer MCP 的 `puppeteer_screenshot` 工具若未显式传参，默认参数为：
   ```json
   { "width": 800, "height": 600 }
   ```
   每次调用它时，底层会强制将 Chrome 渲染视口重设为 `800×600`（`page.setViewport({ width: 800, height: 600 })`）。
2. **物理窗口与视口错位**：
   用户的桌面窗口通常是 1920×1080 或 2K（2048×1112）最大化状态。此时外层 Chrome 窗口很大，但视口被死死压在左上角 800×600 盒子里，导致用户肉眼看到大面积白屏！
3. **响应式断点被破坏**：
   本项目采用 Tailwind CSS，左右双栏黄金排布依赖 `lg:flex-row`（断点为 `1024px`）。当视口被设为 800 时，系统会退化为上下堆叠的移动端布局（`flex-col`），造成布局严重失真。

---

## 1. 强制执行铁律 (Non-Negotiable Rules)

### 铁律 1：截图必须显式指定 1920 × 1080 全高清视口
严禁调用无参或仅带 `name` 的 `puppeteer_screenshot`！所有截图调用必须严格显式传递全高清分辨率：
```json
// ✅ 正确：显式声明 1920 x 1080
{
  "name": "algo_stage_fhd",
  "width": 1920,
  "height": 1080
}

// ❌ 严禁：省略宽高使用默认 800x600
{
  "name": "algo_stage"
}
```

### 铁律 2：浏览器导航进入后的“视口防缩唤醒”
在执行 `puppeteer_navigate` 打开页面后，进行任何截图或交互前，推荐通过 `puppeteer_evaluate` 或首张截图先确认视口宽度 $\ge 1200\text{px}$：
```javascript
// 在页面控制台执行一次视口尺寸与排版健康检查
(() => {
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    isLgActive: window.innerWidth >= 1024,
    hasBlankMargin: window.outerWidth - window.innerWidth > 200
  };
})()
```

### 铁律 3：iframe 嵌套宿主尺寸继承核验
由于顶层架构采用 `UniversalStageVisualizer`（iframe 隔离容器），必须保证外层容器和 iframe 均拥有完整撑满样式：
- 外层挂载节点：`style="width: 100%; height: 100%; padding: 0;"`
- 内部 iframe：`style="width: 100%; height: 100%; border: none; display: block;"`
- 内部主布局：`#main-content-layout` 处于 `flex-row` 状态（左沙盘 50% + 右代码终端 50%）。

---

## 2. 常用视口规格预设字典

在需要进行特定场景验证时，选用以下标准预设：

| 场景名称 | 分辨率 (宽 × 高) | 适用验证目标 |
| :--- | :--- | :--- |
| **全高清黄金标杆（默认）** | `1920 × 1080` | **所有日常验收必须使用此尺寸**，双栏完整展开 |
| **标准笔记本视口** | `1440 × 900` | 验证中等桌面屏幕下的紧凑响应式与缩放 |
| **小屏临界折叠验证** | `1024 × 768` | 验证 Splitter 分割条最小边界与 `lg` 临界状态 |
| **移动端竖屏兼容验证** | `375 × 812` | 验证单列向下滚动模式（手机端模式） |

---

## 3. 验收核对单 (Verification Checklist)

在向用户提交视觉截图或声称 UI 交付前，必须核对：
- [ ] 截图的分辨率是否为 `1920 × 1080`（右侧代码调试区与左侧沙盘是否左右齐平展示）；
- [ ] 页面右侧和底部是否存在无意义的巨幅空白边距（若有，说明误触发了 800x600 默认视口）；
- [ ] 顶栏 Stage 胶囊（`[1 贪心]` `[2 记忆化]` `[3 递推DP]` `[4 空间优化]`）与顺逆推切换器是否完整显示且无遮挡；
- [ ] Card 1（状态空间）、Card 2（业务看板/调用树）、Card 3（暗色代码终端）是否三卡联动就绪。
