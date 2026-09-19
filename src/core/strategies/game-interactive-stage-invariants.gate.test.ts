/**
 * 互动游戏化算法综合门禁矩阵 (Game Interactive Stage Invariants Gatekeeper)
 *
 * 覆盖全部 19 大互动演练与小游戏引擎算法：
 *  1. 穿云神箭 (arrow-balloon)
 *  2. 深海声呐 (binary-sonar)
 *  3. 糖果王国 (candy-kingdom)
 *  4. 算法大乱斗 (clash-of-algorithms)
 *  5. 饼干工厂 (cookie-feeder)
 *  6. 加油站拉力赛 (gas-station-rally)
 *  7. 侠盗神偷 (heist-robber)
 *  8. 时空跃迁 (interval-warp)
 *  9. 跳跃勇者 (jump-quest)
 * 10. 地牢背包客 (knapsack-dungeon)
 * 11. 熔岩跑酷 (lava-parkour)
 * 12. 柠檬水大亨 (lemonade-tycoon)
 * 13. 迷宫塔防 (maze-defense)
 * 14. 皇后对决 (nqueen-battle)
 * 15. 回文忍者 (palindrome-ninja)
 * 16. 贪吃贪心蛇 (sliding-snake)
 * 17. 间谍破译拨盘 (spy-dial)
 * 18. 极速操盘手 (stock-trader)
 * 19. 数独密码战 (sudoku-cipher)
 *
 * 机械不变量门禁红线：
 * 1. 注册元数据完备性不变量：所有算法在 Manifest 中挂载成功，分类严格属于 'game'
 * 2. 多语言代码模板完备性不变量：必须包含 C++ / Java / Python / JS 等核心语言且代码行数 > 5
 * 3. 视觉引擎生命周期不变量：Visualizer 实例必须能在 mock DOM 容器上完整 init 并 clean destroy
 */

import { describe, it, expect } from 'vitest';
import { getManifest } from '../registry';

// 导入 19 大互动小游戏渲染器以触发副作用注册与 Visualizer 类绑定
import { ArrowBalloonVisualizer } from '../../algorithms/categories/game/arrow-balloon-renderer';
import { BinarySonarVisualizer } from '../../algorithms/categories/game/binary-sonar-renderer';
import { CandyKingdomVisualizer } from '../../algorithms/categories/game/candy-kingdom-renderer';
import { ClashOfAlgorithmsGameVisualizer } from '../../algorithms/categories/game/clash-of-algorithms-renderer';
import { CookieFeederVisualizer } from '../../algorithms/categories/game/cookie-feeder-renderer';
import { GasStationVisualizer } from '../../algorithms/categories/game/gas-station-renderer';
import { HeistRobberVisualizer } from '../../algorithms/categories/game/heist-robber-renderer';
import { IntervalWarpVisualizer } from '../../algorithms/categories/game/interval-warp-renderer';
import { JumpQuestVisualizer } from '../../algorithms/categories/game/jump-quest-renderer';
import { KnapsackDungeonVisualizer } from '../../algorithms/categories/game/knapsack-dungeon-renderer';
import { LavaParkourVisualizer } from '../../algorithms/categories/game/lava-parkour-renderer';
import { LemonadeTycoonVisualizer } from '../../algorithms/categories/game/lemonade-tycoon-renderer';
import { MazeDefenseVisualizer } from '../../algorithms/categories/game/maze-defense-renderer';
import { NQueenBattleVisualizer } from '../../algorithms/categories/game/nqueen-battle-renderer';
import { PalindromeNinjaVisualizer } from '../../algorithms/categories/game/palindrome-ninja-renderer';
import { SlidingSnakeVisualizer } from '../../algorithms/categories/game/sliding-snake-renderer';
import { SpyDialVisualizer } from '../../algorithms/categories/game/spy-dial-renderer';
import { StockTraderVisualizer } from '../../algorithms/categories/game/stock-trader-renderer';
import { SudokuCipherVisualizer } from '../../algorithms/categories/game/sudoku-cipher-renderer';

// 导入 19 大互动小游戏多语言代码模板
import { ARROW_BALLOON_CODE_LANGUAGES } from '../../algorithms/categories/game/arrow-balloon-problem-content';
import { BINARY_SONAR_CODE_LANGUAGES } from '../../algorithms/categories/game/binary-sonar-problem-content';
import { CANDY_KINGDOM_CODE_LANGUAGES } from '../../algorithms/categories/game/candy-kingdom-problem-content';
import { CLASH_ALGORITHMS_CODE_LANGUAGES } from '../../algorithms/categories/game/clash-of-algorithms-problem-content';
import { COOKIE_FEEDER_CODE_LANGUAGES } from '../../algorithms/categories/game/cookie-feeder-problem-content';
import { GAS_STATION_CODE_LANGUAGES } from '../../algorithms/categories/game/gas-station-problem-content';
import { HEIST_ROBBER_CODE_LANGUAGES } from '../../algorithms/categories/game/heist-robber-problem-content';
import { INTERVAL_WARP_CODE_LANGUAGES } from '../../algorithms/categories/game/interval-warp-problem-content';
import { JUMP_QUEST_CODE_LANGUAGES } from '../../algorithms/categories/game/jump-quest-problem-content';
import { KNAPSACK_DUNGEON_CODE_LANGUAGES } from '../../algorithms/categories/game/knapsack-dungeon-problem-content';
import { LAVA_PARKOUR_CODE_LANGUAGES } from '../../algorithms/categories/game/lava-parkour-problem-content';
import { LEMONADE_TYCOON_CODE_LANGUAGES } from '../../algorithms/categories/game/lemonade-tycoon-problem-content';
import { MAZE_DEFENSE_CODE_LANGUAGES } from '../../algorithms/categories/game/maze-defense-problem-content';
import { NQUEEN_BATTLE_CODE_LANGUAGES } from '../../algorithms/categories/game/nqueen-battle-problem-content';
import { PALINDROME_NINJA_CODE_LANGUAGES } from '../../algorithms/categories/game/palindrome-ninja-problem-content';
import { SLIDING_SNAKE_CODE_LANGUAGES } from '../../algorithms/categories/game/sliding-snake-problem-content';
import { SPY_DIAL_CODE_LANGUAGES } from '../../algorithms/categories/game/spy-dial-problem-content';
import { STOCK_TRADER_CODE_LANGUAGES } from '../../algorithms/categories/game/stock-trader-problem-content';
import { SUDOKU_CIPHER_CODE_LANGUAGES } from '../../algorithms/categories/game/sudoku-cipher-problem-content';

interface GameMetadataTestCase {
  id: string;
  name: string;
  VisualizerClass: any;
  codes: Record<string, string[]>;
}

const GAME_ALGORITHMS: GameMetadataTestCase[] = [
  { id: 'arrow-balloon', name: '穿云神箭', VisualizerClass: ArrowBalloonVisualizer, codes: ARROW_BALLOON_CODE_LANGUAGES },
  { id: 'binary-sonar', name: '深海声呐', VisualizerClass: BinarySonarVisualizer, codes: BINARY_SONAR_CODE_LANGUAGES },
  { id: 'candy-kingdom', name: '糖果王国', VisualizerClass: CandyKingdomVisualizer, codes: CANDY_KINGDOM_CODE_LANGUAGES },
  { id: 'clash-of-algorithms', name: '算法大乱斗', VisualizerClass: ClashOfAlgorithmsGameVisualizer, codes: CLASH_ALGORITHMS_CODE_LANGUAGES },
  { id: 'cookie-feeder', name: '饼干工厂', VisualizerClass: CookieFeederVisualizer, codes: COOKIE_FEEDER_CODE_LANGUAGES },
  { id: 'gas-station-rally', name: '加油站拉力赛', VisualizerClass: GasStationVisualizer, codes: GAS_STATION_CODE_LANGUAGES },
  { id: 'heist-robber', name: '侠盗神偷', VisualizerClass: HeistRobberVisualizer, codes: HEIST_ROBBER_CODE_LANGUAGES },
  { id: 'interval-warp', name: '时空跃迁', VisualizerClass: IntervalWarpVisualizer, codes: INTERVAL_WARP_CODE_LANGUAGES },
  { id: 'jump-quest', name: '跳跃勇者', VisualizerClass: JumpQuestVisualizer, codes: JUMP_QUEST_CODE_LANGUAGES },
  { id: 'knapsack-dungeon', name: '地牢背包客', VisualizerClass: KnapsackDungeonVisualizer, codes: KNAPSACK_DUNGEON_CODE_LANGUAGES },
  { id: 'lava-parkour', name: '熔岩跑酷', VisualizerClass: LavaParkourVisualizer, codes: LAVA_PARKOUR_CODE_LANGUAGES },
  { id: 'lemonade-tycoon', name: '柠檬水大亨', VisualizerClass: LemonadeTycoonVisualizer, codes: LEMONADE_TYCOON_CODE_LANGUAGES },
  { id: 'maze-defense', name: '迷宫塔防', VisualizerClass: MazeDefenseVisualizer, codes: MAZE_DEFENSE_CODE_LANGUAGES },
  { id: 'nqueen-battle', name: '皇后对决', VisualizerClass: NQueenBattleVisualizer, codes: NQUEEN_BATTLE_CODE_LANGUAGES },
  { id: 'palindrome-ninja', name: '回文忍者', VisualizerClass: PalindromeNinjaVisualizer, codes: PALINDROME_NINJA_CODE_LANGUAGES },
  { id: 'sliding-snake', name: '贪吃贪心蛇', VisualizerClass: SlidingSnakeVisualizer, codes: SLIDING_SNAKE_CODE_LANGUAGES },
  { id: 'spy-dial', name: '间谍破译拨盘', VisualizerClass: SpyDialVisualizer, codes: SPY_DIAL_CODE_LANGUAGES },
  { id: 'stock-trader', name: '极速操盘手', VisualizerClass: StockTraderVisualizer, codes: STOCK_TRADER_CODE_LANGUAGES },
  { id: 'sudoku-cipher', name: '数独密码战', VisualizerClass: SudokuCipherVisualizer, codes: SUDOKU_CIPHER_CODE_LANGUAGES },
];

function createMockRoot(): HTMLElement {
  const elements = new Map<string, any>();
  return {
    querySelector: (sel: string) => elements.get(sel) || null,
    querySelectorAll: (_sel: string) => [],
    isConnected: true,
  } as unknown as HTMLElement;
}

describe('Game Interactive Stage Invariants Gatekeeper (互动小游戏算法门禁矩阵)', () => {
  describe('1. 算法清单注册与 Manifest 完备性契约', () => {
    it.each(GAME_ALGORITHMS)('算法 "$name" (id: $id) 必须已在 Manifest 中挂载且分类为 game', ({ id }) => {
      const manifest = getManifest(id);
      expect(manifest, `Manifest for ${id} should exist`).toBeDefined();
      expect(manifest?.category).toBe('game');
      expect(manifest?.name).toBeDefined();
      expect(manifest?.template).toBeDefined();
      expect(manifest?.Visualizer).toBeDefined();
    });
  });

  describe('2. 多语言算法代码模板完备性契约', () => {
    it.each(GAME_ALGORITHMS)('算法 "$name" 必须包含有效的多语言模板且代码行数合理', ({ id, codes }) => {
      expect(codes, `Codes for ${id} should be defined`).toBeDefined();
      const langs = Object.keys(codes);
      expect(langs.length, `${id} should support multiple languages`).toBeGreaterThanOrEqual(2);

      for (const [lang, lines] of Object.entries(codes)) {
        expect(lines.length, `${id} [${lang}] should have more than 5 lines of code`).toBeGreaterThan(5);
      }
    });
  });

  describe('3. Visualizer 生命周期初始化与释放契约', () => {
    it.each(GAME_ALGORITHMS)('算法 "$name" 的 Visualizer 必须能安全初始化与销毁', async ({ id, VisualizerClass }) => {
      const viz = new VisualizerClass();
      expect(viz).toBeDefined();

      const mockRoot = createMockRoot();
      const manifest = getManifest(id);

      await viz.init({
        root: mockRoot,
        algorithmId: id,
        viewId: manifest?.viewId || `algo-${id}-view`,
      });

      expect(viz).toBeDefined();
      viz.destroy();
    });
  });
});
