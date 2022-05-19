<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { reactive, toRefs, onMounted, computed, useContext, defineProps, defineEmits } from "vue";

import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { div } from "@tensorflow/tfjs-core";
// this.$router $this.store 路由和状态使用
const router = useRouter();
const store = useStore();

//某回调方法
const onFinish = () => {
  store.commit("doit");
  router.push("");
};

// defineProps 接收父组件传来的值  defineEmits用来声明触发的事件 useContext 获取组件上下文context
// 父组件 @child-click="childCtx" 绑定的事件
const emit = defineEmits(["child-click"]);
// 组件上下文context
const ctx = useContext();
// 父组件 :msg= 绑定的值
const props = defineProps({
  msg: String,
  connected: {
    type: String,
    required: true,
  },
  chatDataProducer: Object,
});

// const childCtx = (ctx) => {
//   console.log(ctx);
// }
const handleClick = () => {
  // 把组件上下文传给父组件
  emit("child-click", ctx);
};

let testData = 1;
//创建响应式数据 reactive({some: 'data'}) 传入普通对象 返回响应式
const state = reactive({
  id: 0,
  test: "hello",
  // 计算属性
  ids: computed(() => state.id * 2),
  testComputed: computed(() => testData * 2),
  // 为了访问 state 和 getter，需要创建 computed 引用以保留响应性，这与在选项式 API 中创建计算属性等效
  // 访问 state
  count: computed(() => store.state.count),
  // 访问 getter
  double: computed(() => store.getters.double),
  // 使用 mutation
  increment: () => store.commit("increment"),

  // 使用 action
  asyncIncrement: () => store.dispatch("asyncIncrement"),
});

// 定义方法
const change = () => {
  console.log(state.test);
  state.id += 1;
  console.log(testData);
};
const changeTest = () => {
  testData += 1;
  console.log(testData);
};

//ref 获取dom 可以是组件或元素  子组件必须 defineExpose 暴露方法或参数
defineExpose({
  getMapEvent: () => {},
  text: 1,
});
// div    <span ref="mapBox"></span> onMounted 过后使用
const mapBox = ref(null);

// 生命周期使用方式
onMounted(() => {
  console.log("onMounted");
  console.log(mapBox.value.text);
});
</script>

<template>
  <div id="container">
    <span ref="span"></span>
    <!-- 路由出口 路由匹配的组件在次渲染 -->
    <!-- <router-view /> -->
    <p @click="change">{{ "计算属性依赖的data响应变量，click*2：" }}{{ state.ids }}</p>
    <p @click="changeTest">{{ "计算属性依赖的未响应变量,click*2：" }}{{ state.testComputed }}</p>
    <p>依赖的变量未添加响应式，就不能跟着改变</p>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
