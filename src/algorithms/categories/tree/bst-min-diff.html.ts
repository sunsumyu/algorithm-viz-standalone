import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bmd-',
  title: 'BST 最小绝对差',
  subtitle: 'LeetCode 530',
  accentA: 'rgb(148,226,213)',
  accentB: 'rgb(137,220,235)',
  tip: '💡 中序遍历有序序列中相邻元素的差值最小',
  icon: '📏',
  exampleButtons: '<button class="bmd-ex-btn" data-id="1">[4,2,6,1,3]</button><button class="bmd-ex-btn" data-id="2">[1,0,48,null,null,12,49]</button><button class="bmd-ex-btn" data-id="3">[1,2,3,4,5]</button>',
});
