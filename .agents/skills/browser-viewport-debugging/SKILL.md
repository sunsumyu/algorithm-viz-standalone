---
name: browser-viewport-debugging
description: "Configure Full HD (1920x1080) viewport for browser UI inspection and automated screenshot capture to avoid layout collapse."
---

# 浏览器视口与分辨率调试规范 (Browser Viewport & Resolution Debugging)

Authoring and inspection guidelines for browser/web visualizer debugging, Puppeteer screenshot capture, and layout fidelity.

---

## 0. Viewport Configuration & Reference

Full HD (1920×1080) ensures dual-column layouts (`lg:flex-row`, breakpoint 1024px) remain expanded with balanced state space sandbox (50%) and dark code terminal (50%).

> [!NOTE]
> For root cause analysis on default 800×600 viewport downsizing, see [viewport-postmortem.md](./references/viewport-postmortem.md).

---

## 1. Core Viewport Invariants

### 1.1 Explicit Full HD Screenshot Parameters
Every `puppeteer_screenshot` call must pass explicit width and height:
```json
{
  "name": "algo_stage_fhd",
  "width": 1920,
  "height": 1080
}
```

### 1.2 Viewport Initialization Check
After navigating with `puppeteer_navigate`, verify viewport width $\ge 1200\text{px}$ before capturing screenshots:
```javascript
(() => {
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    isLgActive: window.innerWidth >= 1024,
    hasBlankMargin: window.outerWidth - window.innerWidth > 200
  };
})()
```

### 1.3 iframe Container Size Inheritance
When using `UniversalStageVisualizer` (iframe-isolated container), ensure parent container and iframe fill 100% of their bounds:
- Outer mount node: `style="width: 100%; height: 100%; padding: 0;"`
- Internal iframe: `style="width: 100%; height: 100%; border: none; display: block;"`
- Internal main layout: `#main-content-layout` in `flex-row` state (left sandbox 50% + right terminal 50%).

---

## 2. Standard Viewport Presets

| 场景名称 | 分辨率 (宽 × 高) | 适用验证目标 |
| :--- | :--- | :--- |
| **全高清黄金标杆（默认）** | `1920 × 1080` | **所有日常验收标准**，双栏完整展开 |
| **标准笔记本视口** | `1440 × 900` | 中等屏幕响应式布局与缩放测试 |
| **小屏临界折叠验证** | `1024 × 768` | Splitter 分割条最小边界与 `lg` 临界状态 |
| **移动端竖屏兼容验证** | `375 × 812` | 单列向下滚动模式（手机端模式） |

---

## 3. 验收核对单 (Verification Checklist)

在向用户提交视觉截图或交付 UI 前，逐项核对：
- [ ] 截图分辨率确认为 `1920 × 1080`（右侧代码终端与左侧沙盘左右平铺展开）；
- [ ] 页面右侧和底部无多余空白留白（未发生 800×600 意外重置）；
- [ ] 顶栏 Stage 胶囊（`[1 贪心]` `[2 记忆化]` `[3 递推DP]` `[4 空间优化]`）与顺逆推切换器完整呈现无遮挡；
- [ ] Card 1（状态空间）、Card 2（业务看板/调用树）、Card 3（暗色代码终端）三卡联动就绪。
