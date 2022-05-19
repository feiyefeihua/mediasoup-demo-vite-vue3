import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// gzip压缩
import viteCompression from "vite-plugin-compression";
// 按需加载 AntDesignVue 组件
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    vue(),
    viteCompression(),
  ],
  define: {
    "process.env": {},
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        //生产环境时移除console.log()
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    // 配置路径别名
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // alias: [
    //   {
    //     find: "@",
    //     replacement: path.resolve(__dirname, "src"),
    //   },
    //   {
    //     find: "components",
    //     replacement: path.resolve(__dirname, "src/components"),
    //   },
    // ],
  },
});
