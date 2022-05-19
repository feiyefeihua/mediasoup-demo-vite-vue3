<script setup>
import { reactive, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
const store = useStore();
const { proxy } = getCurrentInstance();
const roomClient = proxy.$f_data.roomClient;

const state = reactive({
  text: "",
  connected: computed(() => store.state.room.state === "connected"),
  chatDataProducer: computed(() => Object.values(store.state.dataProducers).find((dataProducer) => dataProducer.label === "chat")),
  botDataProducer: computed(() => Object.values(store.state.dataProducers).find((dataProducer) => dataProducer.label === "bot")),
  textDisabled: computed(
    () =>
      !store.state.room.state === "connected" ||
      (!Object.values(store.state.dataProducers).find((dataProducer) => dataProducer.label === "chat") &&
        !Object.values(store.state.dataProducers).find((dataProducer) => dataProducer.label === "bot"))
  ),
});
const BotMessageRegex = new RegExp("^@bot (.*)");
const handleChange = (event) => {
  const text = event.target.value;

  state.text = text;
};

const handleKeyPress = (event) => {
  // If Shift + Enter do nothing.
  if (event.key !== "Enter" || event.shiftKey || event.ctrlKey) return;

  // Don't add the sending Enter into the value.
  event.preventDefault();

  let text = state.text.trim();

  state.text = "";

  if (text) {
    const match = BotMessageRegex.exec(text);

    // Chat message.
    if (!match) {
      text = text.trim();

      roomClient.sendChatMessage(text);
    }
    // Message to the bot.
    else {
      text = match[1].trim();

      roomClient.sendBotMessage(text);
    }
  }
};
</script>

<template>
  <div data-component="ChatInput">
    <textarea
      :placeholder="state.textDisabled ? 'Chat unavailable' : 'Write here...'"
      dir="auto"
      autoComplete="off"
      :disabled="state.textDisabled"
      :value="state.text"
      @input="handleChange"
      @change="handleChange($event)"
      @keydown="handleKeyPress($event)"
    />
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
