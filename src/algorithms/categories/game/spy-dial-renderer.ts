/**
 * 密码谍报·电话拨号树状解密 (Spy Cipher: Phone Dial Letter Combinations)
 * 经典多分支回溯算法、全息搜索树与双音频电话拨号
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  SpyDialVisualizer,
  SPY_DIAL_TEMPLATE,
  TreeNode,
} from './spy-dial-visualizer';

export {
  SpyDialVisualizer,
  SPY_DIAL_TEMPLATE,
  type TreeNode,
};

registerAlgorithm({
  id: 'spy-dial',
  name: '密码谍报·电话拨号树状解密',
  viewId: 'algo-spy-dial-view',
  category: 'game',
  description: '多分支回溯算法游戏：特工拨号盘、DTMF 双音频声效、全息搜索树与明文密码破解',
  icon: '📞',
  template: SPY_DIAL_TEMPLATE,
  Visualizer: SpyDialVisualizer,
  difficulty: 2,
  levelOrder: 14,
  learningGoal: '掌握多分支搜索树在组合枚举中的回溯机制，理解树的深度与宽度的物理对应关系',
});
