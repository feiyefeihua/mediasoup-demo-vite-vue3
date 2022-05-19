<script setup>
import classnames from "classnames";
import Appear from "./transitions.vue";
import Peer from "./Peer.vue";

import { reactive, computed } from "vue";
import { useStore } from "vuex";
const store = useStore();

const state = reactive({
  peers: computed(() => Object.values(store.state.peers)),
  activeSpeakerId: computed(() => store.state.room.activeSpeakerId),
});
</script>

<template>
  <div data-component="Peers">
    <template v-for="peer in state.peers" :key="peer.id">
      <Appear>
        <div
          :class="
            classnames('peer-container', {
              'active-speaker': peer.id === state.activeSpeakerId,
            })
          "
        >
          <Peer :id="peer.id" />
        </div>
      </Appear>
    </template>
  </div>
</template>

<style></style>
