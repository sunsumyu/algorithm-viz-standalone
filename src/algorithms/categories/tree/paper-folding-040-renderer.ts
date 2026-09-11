/**
 * 左程云算法通关课 Class 040: 折纸问题 (Paper Folding)
 * 核心机制:
 *  对折 N 次展开后从上到下的折痕凹凸规律
 *  规律：以“凹”为根的一棵满二叉树，左子节点必为“凹”，右子节点必为“凸”
 *  折痕自上而下的出现顺序，恰为该二叉树的【中序遍历】(In-order Traversal)
 *  递归直接输出，不需物理建树，空间复杂度 O(N)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface PaperFoldStep extends StepBase {
  currentLevel: number;
  maxLevels: number;
  currentType: 'down' | 'up' | 'root';
  action: 'enter' | 'left_done' | 'print' | 'right_done' | 'finish';
  creaseList: Array<{ id: number; type: 'down' | 'up'; text: string; level: number }>;
  message: string;
  log: string;
  codeLine: number;
}

export const PAPER_FOLDING_CODES = {
  java: `public class PaperFolding {
    public static void printAllFolds(int n) {
        // 从根节点开始中序遍历 (1层, down=true表示凹折痕)
        process(1, n, true);
    }

    // i 是当前节点的层数，n 是总层数，down == true 为凹，down == false 为凸
    private static void process(int i, int n, boolean down) {
        if (i > n) return;
        // 中序遍历：左子树全为凹 (true)
        process(i + 1, n, true);
        // 打印当前节点折痕
        System.out.println(down ? "凹" : "凸");
        // 中序遍历：右子树全为凸 (false)
        process(i + 1, n, false);
    }
}`,
  cpp: `class PaperFolding {
public:
    static void printAllFolds(int n) {
        process(1, n, true);
    }
private:
    static void process(int i, int n, bool down) {
        if (i > n) return;
        process(i + 1, n, true);
        cout << (down ? "凹" : "凸") << endl;
        process(i + 1, n, false);
    }
};`,
  python: `class PaperFolding:
    @staticmethod
    def print_all_folds(n: int) -> list[str]:
        res = []
        def process(i: int, down: bool):
            if i > n:
                return
            process(i + 1, True)
            res.append("凹" if down else "凸")
            process(i + 1, False)
        process(1, True)
        return res`,
};

export function buildPaperFoldingSteps(n: number = 3): PaperFoldStep[] {
  const steps: PaperFoldStep[] = [];
  const creaseList: Array<{ id: number; type: 'down' | 'up'; text: string; level: number }> = [];
  let foldCounter = 0;

  // Step 0: Entry
  steps.push({
    currentLevel: 1,
    maxLevels: n,
    currentType: 'root',
    action: 'enter',
    creaseList: [],
    message: `算法启动：模拟纸条对折 ${n} 次。整个折痕体系等价于一棵深度为 ${n} 的满二叉树，根为凹，左凹右凸。准备启动中序遍历输出。`,
    log: `折纸算法启动: 折叠次数 N = ${n}, 总折痕数 = 2^${n} - 1 = ${Math.pow(2, n) - 1}`,
    codeLine: 3,
  });

  function process(i: number, down: boolean) {
    if (i > n) return;

    // Enter node
    steps.push({
      currentLevel: i,
      maxLevels: n,
      currentType: down ? 'down' : 'up',
      action: 'enter',
      creaseList: [...creaseList],
      message: `进入第 ${i} 层递归节点：折痕方向 [${down ? '凹 (Down)' : '凸 (Up)'}]。优先递归深入左子树（左子必为凹）...`,
      log: `深入第 ${i} 层节点 (${down ? '凹' : '凸'}), 探查左子树`,
      codeLine: 10,
    });

    process(i + 1, true);

    // Print node
    foldCounter++;
    const currentCrease = {
      id: foldCounter,
      type: down ? ('down' as const) : ('up' as const),
      text: down ? '凹' : '凸',
      level: i,
    };
    creaseList.push(currentCrease);

    steps.push({
      currentLevel: i,
      maxLevels: n,
      currentType: down ? 'down' : 'up',
      action: 'print',
      creaseList: [...creaseList],
      message: `【中序打印】折痕 #${foldCounter}: 第 ${i} 层产生【${down ? '凹折痕' : '凸折痕'}】。当前从上到下序列新增折痕 [${down ? '凹' : '凸'}]。`,
      log: `输出折痕 #${foldCounter}: 层数=${i}, 方向=${down ? '凹' : '凸'}`,
      codeLine: 12,
    });

    process(i + 1, false);

    steps.push({
      currentLevel: i,
      maxLevels: n,
      currentType: down ? 'down' : 'up',
      action: 'right_done',
      creaseList: [...creaseList],
      message: `第 ${i} 层节点 [${down ? '凹' : '凸'}] 的左右子树中序遍历均已完成，回溯至上一层递归。`,
      log: `第 ${i} 层节点回溯完成`,
      codeLine: 14,
    });
  }

  process(1, true);

  // Finish
  steps.push({
    currentLevel: n,
    maxLevels: n,
    currentType: 'root',
    action: 'finish',
    creaseList: [...creaseList],
    message: `🎉 对折 ${n} 次展开完成！纸条自上而下共 ${creaseList.length} 条折痕：[ ${creaseList.map((c) => c.text).join(' , ')} ]。中序遍历完美映射折痕几何！`,
    log: `折纸遍历终结: 总输出折痕 = ${creaseList.map((c) => c.text).join('')}`,
    codeLine: 4,
  });

  return steps;
}

export function renderPaperFoldingCanvas(container: HTMLElement, step: PaperFoldStep) {
  const creasesHtml = step.creaseList
    .map((c, idx) => {
      const isDown = c.type === 'down';
      return `
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: ${isDown ? 'rgba(14, 165, 233, 0.15)' : 'rgba(244, 63, 94, 0.15)'};
        border: 1px solid ${isDown ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 113, 133, 0.4)'};
        border-radius: 6px;
        min-width: 80px;
      ">
        <span style="font-size: 11px; color: #94a3b8; font-mono">#${idx + 1}</span>
        <span style="font-size: 14px; font-weight: bold; color: ${isDown ? '#38bdf8' : '#fb7185'};">${c.text}</span>
        <span style="font-size: 10px; color: #64748b;">(第${c.level}折)</span>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">纸条折痕空间展开与中序二叉树映射</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            折叠层数 N = ${step.maxLevels}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #94a3b8;">
            当前折痕总数: <span style="color: #38bdf8; font-weight: bold; font-family: monospace;">${step.creaseList.length}</span> / ${Math.pow(2, step.maxLevels) - 1}
          </span>
        </div>
      </div>

      <!-- 纸条物理展开带可视化 -->
      <div style="padding: 16px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.15);">
        <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>展开后的纸条（从上至下视角）</span>
          <span style="font-size: 11px; color: #64748b;">Top ➔ Bottom</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; max-height: 140px; overflow-y: auto; padding: 6px;">
          ${creasesHtml || '<div style="font-size: 12px; color: #64748b; font-style: italic;">尚未产生折痕，开始递归...</div>'}
        </div>
      </div>

      <!-- 几何规律指示卡 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">二叉树几何同构</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">根节点为【凹】，所有节点的左孩子必为【凹】，右孩子必为【凸】。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fb7185;">中序遍历严格等价</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">先递归左（凹），再打印当前，最后递归右（凸），顺序与物理纸条 100% 吻合。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">O(N) 空间极致优化</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">无需建出 2^N 节点树，仅靠递归函数调用栈单路直达，空间复杂度仅为 O(N)。</div>
        </div>
      </div>
    </div>
  `;
}

export const paperFolding040Visualizer = registerDeclarativeAlgorithm<PaperFoldStep>({
  id: 'paper-folding-040',
  name: '折纸问题 (Class 040)',
  category: 'tree',
  icon: '📄',
  difficulty: 2,
  levelOrder: 40,
  learningGoal: '理解折纸物理展开与满二叉树中序遍历的数学同构关系，掌握不建树利用递归栈完成 O(N) 空间求解的技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 040)</h3>
      <p>请把一段纸条竖着放在桌子上，然后从圆弧朝下、对折向上的方向对折 N 次，展开后从上到下打印所有折痕的朝向（凹或凸）：</p>
      <ul>
        <li><strong>折叠 1 次</strong>：只有 1 条折痕：凹。</li>
        <li><strong>折叠 2 次</strong>：从上到下：凹、凹、凸。</li>
        <li><strong>折叠 3 次</strong>：从上到下：凹、凹、凸、凹、凹、凸、凸。</li>
        <li><strong>数学本质</strong>：每一次对折，都是在上一层每条折痕的上方压出一条“凹”，下方压出一条“凸”。这完全是一棵<strong>根为凹、左凹右凸</strong>的满二叉树的<strong>中序遍历</strong>！</li>
      </ul>
    </div>
  `,
  codeLanguages: PAPER_FOLDING_CODES,
  inputs: [
    {
      id: 'folds',
      label: '对折次数 (N)',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '对折 2 次 (3 条折痕)', value: '2' },
        { label: '对折 3 次 (7 条折痕)', value: '3' },
        { label: '对折 4 次 (15 条折痕)', value: '4' },
      ],
    },
  ],
  generateSteps: (input) => {
    const n = parseInt(input?.folds || '3', 10);
    return buildPaperFoldingSteps(n);
  },
  renderCanvas: (container, step) => {
    renderPaperFoldingCanvas(container, step);
  },
});
