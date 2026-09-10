export interface VisualizerInteractionActions {
  onPlayToggle?: () => void;
  onStepNext?: () => void;
  onStepPrev?: () => void;
  onReset?: () => void;
  onGenerate?: () => void;
  onSeek?: (step: number) => void;
  onSpeedChange?: (speed: number) => void;
  onFontScale?: (delta: number) => void;
  onStage3SubView?: (view: 'matrix' | 'tree') => void;
  onToggle3D?: () => void;
  onReset3DCam?: () => void;
  onApplyPreset?: (m: number, n: number) => void;
  onSwitchView?: (mode: 'full' | 'lite') => void;
  onQuickFaq?: () => void;
  onSwitchRightTab?: (tab: 'code' | 'problem' | 'analysis') => void;
  onOpenProblemModal?: () => void;
  onCloseProblemModal?: () => void;
}

/**
 * 画板全局交互事件绑定深模块 (VisualizerInteractionBinder)
 * 
 * 职责：
 * 1. 统一绑定播放控制、滑块拖拽、倍速选择事件
 * 2. 统一绑定字号缩放、3D 透视切换、子视图切换事件
 * 3. 统一绑定预设网格参数、全屏/极速视图路由跳转事件
 * 4. 统一绑定原题描述弹窗交互（按钮点击、遮罩点击、Escape 快捷键）
 */
export class VisualizerInteractionBinder {
  public static bind(actions: VisualizerInteractionActions): void {
    if (typeof document === 'undefined') return;

    // 1. 播放控制与时间轴
    const btnPlay = document.getElementById('btn-play-pause');
    const btnNext = document.getElementById('btn-step-next');
    const btnPrev = document.getElementById('btn-step-prev');
    const btnReset = document.getElementById('btn-reset');
    const btnGenerate = document.getElementById('btn-generate') || document.getElementById('btn-apply-size');
    const slider = document.getElementById('slider-progress');
    const selectSpeed = document.getElementById('select-speed');

    if (btnPlay) btnPlay.addEventListener('click', () => actions.onPlayToggle?.());
    if (btnNext) btnNext.addEventListener('click', () => actions.onStepNext?.());
    if (btnPrev) btnPrev.addEventListener('click', () => actions.onStepPrev?.());
    if (btnReset) btnReset.addEventListener('click', () => actions.onReset?.());
    if (btnGenerate) btnGenerate.addEventListener('click', () => actions.onGenerate?.());
    if (slider) slider.addEventListener('input', (e) => actions.onSeek?.(parseInt((e.target as HTMLInputElement).value, 10) || 0));
    if (selectSpeed) selectSpeed.addEventListener('change', (e) => actions.onSpeedChange?.(parseInt((e.target as HTMLSelectElement).value, 10) || 900));

    // 2. 代码字号缩放
    const btnFontDec = document.getElementById('btn-code-font-dec');
    const btnFontInc = document.getElementById('btn-code-font-inc');
    if (btnFontDec) btnFontDec.addEventListener('click', () => actions.onFontScale?.(-0.5));
    if (btnFontInc) btnFontInc.addEventListener('click', () => actions.onFontScale?.(0.5));

    // 3. Stage 3 子视图切换
    const btnSubMatrix = document.getElementById('btn-subview-matrix');
    const btnSubTree = document.getElementById('btn-subview-tree');
    if (btnSubMatrix) btnSubMatrix.addEventListener('click', () => actions.onStage3SubView?.('matrix'));
    if (btnSubTree) btnSubTree.addEventListener('click', () => actions.onStage3SubView?.('tree'));

    // 4. 3D 透视切换与相机复位
    const btnToggle3D = document.getElementById('btn-toggle-3d');
    const btnReset3DCam = document.getElementById('btn-reset-3d-cam');
    if (btnToggle3D) btnToggle3D.addEventListener('click', () => actions.onToggle3D?.());
    if (btnReset3DCam) btnReset3DCam.addEventListener('click', () => actions.onReset3DCam?.());

    // 5. 尺寸预设按钮
    if (typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const m = parseInt(btn.getAttribute('data-m') || '3', 10);
          const n = parseInt(btn.getAttribute('data-n') || '4', 10);
          actions.onApplyPreset?.(m, n);
        });
      });
    }

    // 6. 视图模式切换 (Full <-> Lite)
    const btnSwitchFull = document.getElementById('btn-switch-full');
    const btnSwitchLite = document.getElementById('btn-switch-lite');
    if (btnSwitchFull) btnSwitchFull.addEventListener('click', () => actions.onSwitchView?.('full'));
    if (btnSwitchLite) btnSwitchLite.addEventListener('click', () => actions.onSwitchView?.('lite'));

    // 7. 常见问题快捷滚动
    const btnFaq = document.getElementById('btn-quick-faq');
    if (btnFaq) {
      btnFaq.addEventListener('click', () => {
        if (actions.onQuickFaq) {
          actions.onQuickFaq();
        } else {
          const faqEl = document.querySelector('footer') || document.body;
          faqEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // 8. 右侧多看板选项卡
    const btnTabCode = document.getElementById('btn-tab-code');
    const btnTabProblem = document.getElementById('btn-tab-problem');
    const btnTabAnalysis = document.getElementById('btn-tab-analysis');
    if (btnTabCode) btnTabCode.addEventListener('click', () => actions.onSwitchRightTab?.('code'));
    if (btnTabProblem) btnTabProblem.addEventListener('click', () => actions.onSwitchRightTab?.('problem'));
    if (btnTabAnalysis) btnTabAnalysis.addEventListener('click', () => actions.onSwitchRightTab?.('analysis'));

    // 9. 题目弹窗控制
    const btnOpenProblemModal = document.getElementById('btn-open-problem-modal') || document.getElementById('btn-problem-meta-badge');
    const btnCloseProblemModal = document.getElementById('btn-close-problem-modal');
    const modalProblem = document.getElementById('modal-problem');

    if (btnOpenProblemModal) btnOpenProblemModal.addEventListener('click', () => actions.onOpenProblemModal?.());
    if (btnCloseProblemModal) btnCloseProblemModal.addEventListener('click', () => actions.onCloseProblemModal?.());
    if (modalProblem) {
      modalProblem.addEventListener('click', (e) => {
        if (e.target === modalProblem) actions.onCloseProblemModal?.();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalProblem && !modalProblem.classList.contains('hidden')) {
        actions.onCloseProblemModal?.();
      }
    });
  }
}
