<script setup>
import classnames from "classnames";
import clipboardCopy from "clipboard-copy";
import * as requestActions from "@/store/requestActions";
import Appear from "./transitions.vue";
import Me from "./Me.vue";
import ChatInput from "./ChatInput.vue";
import Peers from "./Peers.vue";
import Stats from "./Stats.vue";
import Notifications from "./Notifications.vue";
import NetworkThrottle from "./NetworkThrottle.vue";

import { reactive, toRefs, onMounted, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
const store = useStore();
const { proxy } = getCurrentInstance();
const roomClient = proxy.$f_data.roomClient;

const state = reactive({
  me: computed(() => store.state.me),
  room: computed(() => store.state.room),
  amActiveSpeaker: computed(() => store.state.me.id === store.state.room.activeSpeakerId),
});
const NETWORK_THROTTLE_SECRET = window.NETWORK_THROTTLE_SECRET;

const onRoomLinkCopy = () => {
  requestActions.notify({
    text: "Room link copied to the clipboard",
  });
};
const invitationLink = (event) => {
  // If this is a 'Open in new window/tab' don't prevent
  // click default action.
  if (
    event.ctrlKey ||
    event.shiftKey ||
    event.metaKey ||
    // Middle click (IE > 9 and everyone else).
    (event.button && event.button === 1)
  ) {
    return;
  }
  event.preventDefault();
  clipboardCopy(state.room.url).then(onRoomLinkCopy);
};
const toggleVideo = () => {
  state.me.audioOnly ? roomClient.disableAudioOnly() : roomClient.enableAudioOnly();
};
const toggleAudio = () => {
  state.me.audioMuted ? roomClient.unmuteAudio() : roomClient.muteAudio();
};
const restartIce = () => roomClient.restartIce();

// 生命周期使用方式
onMounted(() => {
  roomClient.join();
});
</script>

<template>
  <Appear>
    <div data-component="Room">
      <Notifications />

      <div class="state">
        <div :class="classnames('icon', state.room.state)" />
        <p :class="classnames('text', state.room.state)">{{ state.room.state }}</p>
      </div>

      <div class="room-link-wrapper">
        <div class="room-link">
          <a class="link" :href="state.room.url" target="_blank" rel="noopener noreferrer" @click="invitationLink($event)"> invitation link </a>
        </div>
      </div>

      <Peers />

      <div
        :class="
          classnames('me-container', {
            'active-speaker': state.amActiveSpeaker,
          })
        "
      >
        <Me />
      </div>

      <div class="chat-input-container">
        <ChatInput />
      </div>

      <div class="sidebar">
        <div
          :class="
            classnames('button', 'hide-videos', {
              on: state.me.audioOnly,
              disabled: state.me.audioOnlyInProgress,
            })
          "
          data-tip="'Mute/unmute participants\' video'"
          @click="toggleVideo"
        />

        <div
          :class="
            classnames('button', 'mute-audio', {
              on: state.me.audioMuted,
            })
          "
          data-tip="'Mute/unmute participants\' audio'"
          @click="toggleAudio"
        />

        <div
          :class="
            classnames('button', 'restart-ice', {
              disabled: state.me.restartIceInProgress,
            })
          "
          data-tip="Restart ICE"
          @click="restartIce"
        />
      </div>

      <Stats />

      <template v-if="NETWORK_THROTTLE_SECRET">
        <NetworkThrottle :secret="NETWORK_THROTTLE_SECRET" />
      </template>
    </div>
  </Appear>
</template>

<style></style>
