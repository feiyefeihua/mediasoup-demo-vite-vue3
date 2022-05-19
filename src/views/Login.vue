<script setup>
import { onMounted, h } from "vue";
import "ant-design-vue/es/modal/style/css";
import { Modal } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();
function toRoom() {
  router.push({
    name: "Room",
  });
}
const info = () => {
  Modal.info({
    title: "This is a notification message",
    content: h("div", {}, [h("p", { style: { "margin-top": "1em" } }, "需要摄像头和话筒设备并授权限"), h("p", "默认进入生成随机房间和名称")]),
    onOk() {
      toRoom();
    },
  });
};
// 生命周期使用方式
onMounted(() => {
  info();
});
</script>

<template></template>

<style scoped>
a {
  color: #42b983;
}
</style>
