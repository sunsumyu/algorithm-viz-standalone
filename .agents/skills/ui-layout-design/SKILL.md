---
name: ui-layout-design
description: Standard guidelines and design patterns for algorithm visualizer responsive layouts, maximizing visual canvas area and eliminating panel redundancy.
---

# Algorithm Visualizer UI Layout Design Guidelines

## Core Principles

1. **Canvas Dominance (主画布优先)**
   - The core visualization node (SVG trees, graphs, execution arrays) MUST take at least 60-70% of the visible vertical and horizontal viewport area.
   - Never stack more than 2 high-cardinality panels vertically above the visualizer canvas.

2. **Zero Redundancy (消除数据冗余)**
   - Consolidate stat displays: Merge "Current Processing Item", "Path", and "Available Options" into unified, single-source stat badges/chips.
   - Do NOT duplicate state monitor panels across multiple cards.

3. **Integrated Control Top Bar (一体化控制顶栏)**
   - Group Inputs, Dialer/Keypad Selectors, Action Buttons, and Live Stat Chips into a single horizontal glassmorphic control bar.
   - Keep interactive selectors (e.g. phone dialer keys) compact (`40px` - `44px` height) with inline badges.

4. **Floating Viewport Controls (悬浮画布控制)**
   - SVG decision trees and graph nodes must feature standard interactive zoom (+/-), focus (📍), and reset (🎯) controls floating in the canvas corner.

5. **Responsive Code & Log Split (代码与日志并列)**
   - Place Code Panel and Execution Logs side-by-side or in a collapsible sidebar so main visual space is unobstructed.
