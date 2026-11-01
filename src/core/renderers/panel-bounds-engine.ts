/**
 * PanelBoundsEngine (Card 2 状态监视器自然边界与尺寸计算领域服务)
 *
 * 核心架构职责：
 * 1. 动态汇总 Card 2 内部各子组件（标题栏、指标网格、领域自定义流卡片、实时决策卡片、安全内边距）真实高度。
 * 2. 计算出“既包裹全部内容、零文字被遮挡，又绝无大面积空洞白板”的动态自然最小高度。
 * 3. 供 SplitterEngine 作为 minSize 限制下限，并在步进演变导致内容动态换行或膨胀时自动撑开保护。
 */

export interface PanelBoundsContext {
  cardEl?: HTMLElement | null;
  hasCustomMetrics?: boolean;
}

export class PanelBoundsEngine {
  /**
   * 动态精确计算 Card 2 最小自然安全高度
   */
  public static computeNaturalHeight(
    card: HTMLElement | null,
    options?: { hasCustomMetrics?: boolean }
  ): number {
    if (!card) return 180;

    const header = card.querySelector('.dsp-card-header') as HTMLElement | null;
    const metrics = card.querySelector('.dsp-metrics-grid') as HTMLElement | null;
    const custom = card.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
    const liveText = card.querySelector('#dsp-live-text') as HTMLElement | null;

    let total = 24; // padding: 10px 12px + 2px 边框呼吸间距

    if (header) {
      total += Math.max(header.offsetHeight, 32) + 6;
    }

    if (metrics && (metrics.children.length > 0 || metrics.innerHTML.trim().length > 0)) {
      total += Math.max(metrics.offsetHeight, 40) + 6;
    }

    if (custom) {
      let customH = 0;
      Array.from(custom.children).forEach((child) => {
        customH += Math.max((child as HTMLElement).offsetHeight, 28) + 6;
      });
      // 容器自身的 padding 与子项间距同样占据真实高度：逐子项累加会系统性低估，
      // 与容器实测内容高度 (scrollHeight，天然含 padding/gap) 取较大者，杜绝残余截断。
      // ⚠️ 拉伸盒谎言拦截：height:100% 滚动盒的 scrollHeight === clientHeight（当前盒高而非内容高度），
      // 直接采信会让「自然高度 ≈ 卡片现值」，splitter minSize 因此永远等于现高度，
      // 形成「只能拖大、永远拖不小」的单向棘轮（Card 2 拉取不下来根因）。
      // 仅当 scrollHeight 同时大于子项和与 clientHeight（真实溢出）时才采信。
      if (custom.scrollHeight > customH && custom.scrollHeight > custom.clientHeight) {
        customH = custom.scrollHeight;
      }
      // 初始化初次挂载尚未进入 step 渲染时，依据 options 预估最小自定义行高度 (如中序序列流/开区间/状态流)
      if (customH === 0 && options?.hasCustomMetrics) {
        customH = 34;
      }
      total += customH;
    }

    if (liveText && liveText.style.display !== 'none') {
      const liveH = Math.max(liveText.scrollHeight, liveText.offsetHeight, 28);
      total += liveH + 8;
    }

    return Math.ceil(Math.max(160, total));
  }

  /**
   * 当步骤演变产生新内容导致高度膨胀时，安全确保卡片高度不低于自然最小高度，杜绝截断
   */
  public static ensureContentFitted(
    card: HTMLElement | null,
    options?: { hasCustomMetrics?: boolean }
  ): void {
    if (!card) return;
    const requiredMin = this.computeNaturalHeight(card, options);
    const curH = card.offsetHeight;
    if (curH > 0 && curH < requiredMin) {
      card.style.height = `${requiredMin}px`;
      card.style.flex = `0 0 ${requiredMin}px`;
    }
  }
}
