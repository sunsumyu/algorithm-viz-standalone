import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bt2-',
  title: '从中序与后序遍历构造二叉树',
  subtitle: 'LeetCode 106',
  accentA: 'rgb(137,220,235)',
  accentB: 'rgb(203,166,247)',
  tip: '💡 后序最后一个元素是根，在中序中找到位置划分左右',
  icon: '🔨',
  exampleButtons: '<button class="bt2-ex-btn" data-id="1">pre=[9,3,15,20,7], post=[9,15,7,20,3]</button><button class="bt2-ex-btn" data-id="2">[1,2,3]</button><button class="bt2-ex-btn" data-id="3">[1,2,3,4,5,6,7]</button>',
});
