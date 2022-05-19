<script setup>
import * as stateActions from "../store/stateActions";
import PeerView from "./PeerView.vue";

import { reactive, toRefs, onMounted, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
const store = useStore();
const { proxy } = getCurrentInstance();
const roomClient = proxy.$f_data.roomClient;

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const state = reactive({
  peer: computed(() => store.state.peers[props.id]), //  state.peers[props.id] props.peer
  audioMuted: computed(() => store.state.me.audioMuted),
  faceDetection: computed(() => store.state.room.faceDetection),
  consumersArray: computed(() => store.state.peers[props.id].consumers.map((consumerId) => store.state.consumers[consumerId])),
  audioConsumer: computed(() =>
    store.state.peers[props.id].consumers.map((consumerId) => store.state.consumers[consumerId]).find((consumer) => consumer.track.kind === "audio")
  ),
  videoConsumer: computed(() =>
    store.state.peers[props.id].consumers.map((consumerId) => store.state.consumers[consumerId]).find((consumer) => consumer.track.kind === "video")
  ),
});

const audioEnabled = computed(() => Boolean(state.audioConsumer) && !state.audioConsumer.locallyPaused && !state.audioConsumer.remotelyPaused);
const videoVisible = computed(() => Boolean(state.videoConsumer) && !state.videoConsumer.locallyPaused && !state.videoConsumer.remotelyPaused);

const onSetStatsPeerId = (peerId) => store.commit(stateActions.setRoomStatsPeerId(peerId));
const onChangeVideoPreferredLayers = (spatialLayer, temporalLayer) => {
  roomClient.setConsumerPreferredLayers(state.videoConsumer.id, spatialLayer, temporalLayer);
};
const onChangeVideoPriority = (priority) => {
  roomClient.setConsumerPriority(state.videoConsumer.id, priority);
};
const onRequestKeyFrame = () => {
  roomClient.requestConsumerKeyFrame(state.videoConsumer.id);
};
onMounted(() => {});
</script>

<template>
  <div data-component="Peer">
    <div class="indicators">
      <template v-if="!audioEnabled">
        <div class="icon mic-off" />
      </template>

      <template v-if="!state.videoConsumer">
        <div class="icon webcam-off" />
      </template>
    </div>

    <PeerView
      :isMe="false"
      :peer="state.peer"
      :audioConsumerId="state.audioConsumer ? state.audioConsumer.id : null"
      :videoConsumerId="state.videoConsumer ? state.videoConsumer.id : null"
      :audioRtpParameters="state.audioConsumer ? state.audioConsumer.rtpParameters : null"
      :videoRtpParameters="state.videoConsumer ? state.videoConsumer.rtpParameters : null"
      :consumerSpatialLayers="state.videoConsumer ? state.videoConsumer.spatialLayers : null"
      :consumerTemporalLayers="state.videoConsumer ? state.videoConsumer.temporalLayers : null"
      :consumerCurrentSpatialLayer="state.videoConsumer ? state.videoConsumer.currentSpatialLayer : null"
      :consumerCurrentTemporalLayer="state.videoConsumer ? state.videoConsumer.currentTemporalLayer : null"
      :consumerPreferredSpatialLayer="state.videoConsumer ? state.videoConsumer.preferredSpatialLayer : null"
      :consumerPreferredTemporalLayer="state.videoConsumer ? state.videoConsumer.preferredTemporalLayer : null"
      :consumerPriority="state.videoConsumer ? state.videoConsumer.priority : null"
      :audioTrack="state.audioConsumer ? state.audioConsumer.track : null"
      :videoTrack="state.videoConsumer ? state.videoConsumer.track : null"
      :audioMuted="state.audioMuted"
      :videoVisible="videoVisible"
      :videoMultiLayer="state.videoConsumer && state.videoConsumer.type !== 'simple'"
      :audioCodec="state.audioConsumer ? state.audioConsumer.codec : null"
      :videoCodec="state.videoConsumer ? state.videoConsumer.codec : null"
      :audioScore="state.audioConsumer ? state.audioConsumer.score : null"
      :videoScore="state.videoConsumer ? state.videoConsumer.score : null"
      :faceDetection="state.faceDetection"
      @onChangeVideoPreferredLayers="onChangeVideoPreferredLayers"
      @onChangeVideoPriority="onChangeVideoPriority"
      @onRequestKeyFrame="onRequestKeyFrame"
      @onStatsClick="onSetStatsPeerId"
    />
  </div>
</template>

<style></style>
