import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import roomClientMount from "./js/roomClientMount";
import "@/style/index.scss";
const app = createApp(App);
app.config.globalProperties.$f_data = { ...roomClientMount, roomClient: null };

app.use(store).use(router).mount("#app");
