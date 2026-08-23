import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'mt-',
  title: '最大二叉树',
  subtitle: 'LeetCode 654',
  accentA: 'rgb(203,166,247)',
  accentB: 'rgb(137,180,250)',
  tip: '💡 找出数组中的最大值作为根，递归构建左右子树',
  icon: '🌲',
  exampleButtons: '<button class="mt-ex-btn" data-id="1">[3,2,1,6,0,5]</button><button class="mt-ex-btn" data-id="2">[1,2,3]</button><button class="mt-ex-btn" data-id="3">[1,2,3,4,5,6,7]</button>',
});
