/**
 * 火星词典拓扑排序 (Alien Dictionary · LeetCode 269) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：字符偏序依赖建图、非法前缀陷阱检测、Kahn 算法拓扑消元与成环判定
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class AlienDictDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'alien-dict';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'alien-dict' ||
      modelId === 'alien-dictionary-269' ||
      modelId === 'alien-dict-269' ||
      modelId === 'class059-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '火星词典拓扑排序 (Alien Dictionary) · 全景推演树',
      badge: 'LeetCode 269 · 字符偏序依赖建图 · Kahn 拓扑消元 · 非法前缀与环检测',
      descriptionHtml: `
        以经典合法词表为例：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">["wrt", "wrf", "er", "ett", "rftt"]</code>。<br/>
        算法推演三大关键步骤：<br/>
        ① <b>相邻单词比较提取偏序：</b>逐对扫描相邻单词，定位首个不同字符 $u$ 与 $v$，建立有向依赖边 $u \\to v$；若较长单词排在较短前缀前面 (如 "abc" 在 "ab" 前)，立即判定非法前缀异常；<br/>
        ② <b>统计字符入度并入队：</b>为所有出现字符统计入度 $\\text{inDegree}$，将入度为 0 的无前驱字符压入拓扑队列；<br/>
        ③ <b>Kahn 算法拓扑消元与判环：</b>循环出队字符并消除出边，后继入度减至 0 时入队。若最终拓扑序列长度等于字符种类数，成功输出合法字母表；否则判定图中存在环状逻辑矛盾。
      `,
      initialStateText: '初始化 5 个独立字符 {w, e, r, t, f}，准备通过比对相邻单词建立偏序边。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '火星词表输入序列',
        valuesStr: 'words = ["wrt", "wrf", "er", "ett", "rftt"] (共 5 个单词)',
      },
      {
        prefix: '├───',
        label: '提取独立字符集',
        valuesStr: 'chars = [\'e\', \'f\', \'r\', \'t\', \'w\'] (共 5 种字符)',
      },
      {
        prefix: '└───',
        label: '字符入度表初始化',
        valuesStr: 'inDegree = {e: 0, f: 0, r: 0, t: 0, w: 0}',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】比对相邻单词首异字符，构建偏序有向图 (Partial Order Graph)',
        subtitle: '字典序规则：两单词最长公共前缀之后的首个不同字符决定相对先后次序',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '比对 "wrt" 与 "wrf"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">边 t ➔ f</span>',
            detailLines: [
              '│  ① 公共前缀 "wr"，第 3 位字符不同: \'t\' ≠ \'f\'',
              '│  ② 确立偏序: \'t\' 必排在 \'f\' 前面 ➔ 建立边 (t ➔ f)',
              '│  ③ 更新后继入度: inDegree[\'f\']++ (= 1)',
            ],
            fillLine: '└── 获得偏序约束: t < f 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '比对 "wrf" 与 "er"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">边 w ➔ e</span>',
            detailLines: [
              '│  ① 首位字符即不同: \'w\' ≠ \'e\'',
              '│  ② 确立偏序: \'w\' 必排在 \'e\' 前面 ➔ 建立边 (w ➔ e)',
              '│  ③ 更新后继入度: inDegree[\'e\']++ (= 1)',
            ],
            fillLine: '└── 获得偏序约束: w < e 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '比对 "er" 与 "ett"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">边 r ➔ t</span>',
            detailLines: [
              '│  ① 公共前缀 "e"，第 2 位字符不同: \'r\' ≠ \'t\'',
              '│  ② 确立偏序: \'r\' 必排在 \'t\' 前面 ➔ 建立边 (r ➔ t)',
              '│  ③ 更新后继入度: inDegree[\'t\']++ (= 1)',
            ],
            fillLine: '└── 获得偏序约束: r < t 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '比对 "ett" 与 "rftt"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">边 e ➔ r</span>',
            detailLines: [
              '│  ① 首位字符即不同: \'e\' ≠ \'r\'',
              '│  ② 确立偏序: \'e\' 必排在 \'r\' 前面 ➔ 建立边 (e ➔ r)',
              '│  ③ 更新后继入度: inDegree[\'r\']++ (= 1)',
            ],
            fillLine: '└── 获得偏序约束: e < r 🔗',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】0 入度字符入队与 Kahn 算法拓扑消元 (Kahn Topological Sort)',
        subtitle: '偏序链: w ➔ e ➔ r ➔ t ➔ f，依次剥离入度为 0 的字符节点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '搜寻初始 0 入度字符',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">初始入队</span>',
            detailLines: [
              '│  ① 检查入度: inDegree[\'w\']=0, 其余字符均为 1',
              '│  ② 字符 \'w\' 无任何前驱依赖，直接入队: queue = [\'w\']',
            ],
            fillLine: '└── 拓扑起点确立: \'w\' 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '流水线出队与消元推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">链式消元</span>',
            detailLines: [
              '│  ① 出队 \'w\': 削减边 (w➔e), inDegree[\'e\'] 归零 ➔ 入队 \'e\', 序列: "w"',
              '│  ② 出队 \'e\': 削减边 (e➔r), inDegree[\'r\'] 归零 ➔ 入队 \'r\', 序列: "we"',
              '│  ③ 出队 \'r\': 削减边 (r➔t), inDegree[\'t\'] 归零 ➔ 入队 \'t\', 序列: "wer"',
              '│  ④ 出队 \'t\': 削减边 (t➔f), inDegree[\'f\'] 归零 ➔ 入队 \'f\', 序列: "wert"',
              '│  ⑤ 出队 \'f\': 无后继出边，队列为空，最终序列: "wertf"',
            ],
            fillLine: '└── 所有 5 个字符顺利拓扑排序完毕 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】成环校验与火星字母表序列输出 (Validation & Output)',
        subtitle: '核验拓扑序列长度是否覆盖全部独立字符种类',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '拓扑序列完整性判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">成功判定</span>',
            detailLines: [
              '│  ① 拓扑序列长度: 5 == 字符种类总数 5',
              '│  ② 图中不存在有向环矛盾或非法前缀截断',
            ],
            fillLine: '└── return "wertf"; // 成功解析火星字母表顺序 🏆',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
