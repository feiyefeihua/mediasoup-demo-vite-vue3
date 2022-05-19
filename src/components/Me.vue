<script setup>
import classnames from "classnames";
import * as cookiesManager from "../js/cookiesManager";
import * as stateActions from "../store/stateActions";
import PeerView from "./PeerView.vue";

import { reactive, ref, toRefs, onMounted, onUpdated, onUnmounted, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
const store = useStore();
const { proxy } = getCurrentInstance();
const roomClient = proxy.$f_data.roomClient;

const _rootNode = ref(null);
const state = reactive({
  _mounted: false,
  connected: computed(() => store.state.room.state === "connected"),
  me: computed(() => store.state.me),
  producersArray: computed(() => Object.values(store.state.producers)),
  faceDetection: computed(() => store.state.room.faceDetection),
  audioProducer: computed(() => Object.values(store.state.producers).find((producer) => producer.track.kind === "audio")),
  videoProducer: computed(() => Object.values(store.state.producers).find((producer) => producer.track.kind === "video")),
  videoVisible: computed(() => {
    const videoProducer = Object.values(store.state.producers).find((producer) => producer.track.kind === "video");
    const videoVisible = Boolean(videoProducer) && !videoProducer.paused;
    return videoVisible;
  }),

  tip: computed(() => (store.state.me.displayNameSet ? "" : "Click on your name to change it")),
  shareState: computed(() =>
    Boolean(Object.values(store.state.producers).find((producer) => producer.track.kind === "video")) &&
    Object.values(store.state.producers).find((producer) => producer.track.kind === "video").type === "share"
      ? "on"
      : "off"
  ),
  changeWebcamState: computed(() =>
    Boolean(Object.values(store.state.producers).find((producer) => producer.track.kind === "video")) &&
    Object.values(store.state.producers).find((producer) => producer.track.kind === "video").type !== "share" &&
    store.state.me.canChangeWebcam
      ? "on"
      : "unsupported"
  ),
  webcamState: computed(() => {
    let webcamState = "";
    if (!store.state.me.canSendWebcam) webcamState = "unsupported";
    else if (
      Object.values(store.state.producers).find((producer) => producer.track.kind === "video") &&
      Object.values(store.state.producers).find((producer) => producer.track.kind === "video").type !== "share"
    )
      webcamState = "on";
    else webcamState = "off";
    return webcamState;
  }),
  micState: computed(() => {
    let micState = "";
    if (!store.state.me.canSendMic) micState = "unsupported";
    else if (!state.audioProducer) micState = "unsupported";
    else if (!state.audioProducer.paused) micState = "on";
    else micState = "off";
    return micState;
  }),
});

const onSetStatsPeerId = (peerId) => store.commit(stateActions.setRoomStatsPeerId(peerId));
const changeWebcam = () => roomClient.changeWebcam();
const toggleMuteMic = () => {
  state.micState === "on" ? roomClient.muteMic() : roomClient.unmuteMic();
};

const enableWebcam = () => {
  if (state.webcamState === "on") {
    cookiesManager.setDevices({ webcamEnabled: false });
    roomClient.disableWebcam();
  } else {
    cookiesManager.setDevices({ webcamEnabled: true });
    roomClient.enableWebcam();
  }
};
const enableShare = () => {
  if (state.shareState === "on") roomClient.disableShare();
  else roomClient.enableShare();
};
const onChangeMaxSendingSpatialLayer = (spatialLayer) => {
  roomClient.setMaxSendingSpatialLayer(spatialLayer);
};
const onChangeDisplayName = (displayName) => {
  roomClient.changeDisplayName(displayName);
};
onMounted(() => {
  state._mounted = true;

  setTimeout(() => {
    if (!state._mounted || state.me.displayNameSet) return;

    // ReactTooltip.show(this._rootNode);
  }, 4000);
});
onUpdated(() => {
  // if (!prevProps.me.displayNameSet && state.me.displayNameSet) {
  // ReactTooltip.hide(this._rootNode);
  // }
});
onUnmounted(() => {
  state._mounted = false;
});
</script>

<template>
  <div data-component="Me" ref="_rootNode" :data-tip="state.tip" :data-tip-disable="!state.tip">
    <template v-if="state.connected">
      <div class="controls">
        <div :class="classnames('button', 'mic', state.micState)" @click="toggleMuteMic" />

        <div
          :class="
            classnames('button', 'webcam', state.webcamState, {
              disabled: state.me.webcamInProgress || state.me.shareInProgress,
            })
          "
          @click="enableWebcam"
        />

        <div
          :class="
            classnames('button', 'change-webcam', state.changeWebcamState, {
              disabled: state.me.webcamInProgress || state.me.shareInProgress,
            })
          "
          @click="changeWebcam"
        />

        <div
          :class="
            classnames('button', 'share', state.shareState, {
              disabled: state.me.shareInProgress || state.me.webcamInProgress,
            })
          "
          @click="enableShare"
        />
      </div>
    </template>

    <PeerView
      :isMe="true"
      :peer="state.me"
      :audioProducerId="state.audioProducer ? state.audioProducer.id : null"
      :videoProducerId="state.videoProducer ? state.videoProducer.id : null"
      :audioRtpParameters="state.audioProducer ? state.audioProducer.rtpParameters : null"
      :videoRtpParameters="state.videoProducer ? state.videoProducer.rtpParameters : null"
      :audioTrack="state.audioProducer ? state.audioProducer.track : null"
      :videoTrack="state.videoProducer ? state.videoProducer.track : null"
      :videoVisible="state.videoVisible"
      :audioCodec="state.audioProducer ? state.audioProducer.codec : null"
      :videoCodec="state.videoProducer ? state.videoProducer.codec : null"
      :audioScore="state.audioProducer ? state.audioProducer.score : null"
      :videoScore="state.videoProducer ? state.videoProducer.score : null"
      :faceDetection="state.faceDetection"
      @onChangeDisplayName="onChangeDisplayName"
      @onChangeMaxSendingSpatialLayer="onChangeMaxSendingSpatialLayer"
      @onStatsClick="onSetStatsPeerId"
    />
  </div>
</template>

<style></style>
