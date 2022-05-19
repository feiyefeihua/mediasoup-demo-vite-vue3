<template>
  <div class="user">
    <span>姓名：{{ name }} 年龄：{{ age }} 性别：{{ sex }}</span>
    <button @click="changeName">改名</button>
  </div>
</template>
<script>
export default {
  name: "home",
};
</script>
<script setup>
import { useState } from "@/utils/useState";
import { useActions } from "@/utils/useAction";
const storeState = useState("user", ["name", "age", "sex"]);
const storeActions = useActions("user", ["setName"]);
const changeName = () => {
  storeActions.setName("李四");
};
</script>
