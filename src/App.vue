<script setup>
//在对应的组件中使用 全局对象 关键代码
import { getCurrentInstance } from "vue";
import domready from "domready";
import Logger from "./js/Logger";
import * as utils from "./js/utils";

const logger = new Logger();
const { proxy } = getCurrentInstance(); //关键代码
const globalMethods = proxy.$f_data; //关键代码

domready(async () => {
  logger.debug("DOM ready");

  await utils.initialize();

  globalMethods.roomClient = await globalMethods.run();
  // globalMethods.debugger();
});
</script>

<template>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
