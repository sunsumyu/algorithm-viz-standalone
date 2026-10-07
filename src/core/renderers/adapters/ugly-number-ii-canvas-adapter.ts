/**
 * 丑数 II (Ugly Number II · LeetCode 264)
 * Canvas Adapter: 三指针进度条与候选值对比渲染器
 */

import { renderThreePointerUglyBar } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-shared';
import { type UglyNumberIIStep } from './ugly-number-ii-step-compiler';

export function renderUglyNumberIICanvas(container: HTMLElement, step: UglyNumberIIStep): void {
  const { dp, i2, i3, i5, candA = 0, candB = 0, candC = 0, currentUgly = 1 } = step;

  container.innerHTML = renderThreePointerUglyBar({
    dp,
    i2,
    i3,
    i5,
    candA,
    candB,
    candC,
    currentUgly,
  });
}
