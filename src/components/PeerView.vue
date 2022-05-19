<script setup>
import classnames from "classnames";
import clipboardCopy from "clipboard-copy";
import hark from "hark";
import * as faceapi from "face-api.js";
import Logger from "../js/Logger";
import EditableInput from "./EditableInput.vue";

import { reactive, ref, onMounted, onBeforeUnmount, onBeforeUpdate, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
const store = useStore();
const { proxy } = getCurrentInstance();
const roomClient = proxy.$f_data.roomClient;

const logger = new Logger("PeerView");

const tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 160,
  scoreThreshold: 0.5,
});

const props = defineProps({
  isMe: {
    type: Boolean,
    default: true,
  },
  peer: {
    type: Object,
    isRequired: true,
  },
  audioProducerId: String,
  videoProducerId: String,
  audioConsumerId: String,
  videoConsumerId: String,
  audioRtpParameters: Object,
  videoRtpParameters: Object,
  consumerSpatialLayers: Number,
  consumerTemporalLayers: Number,
  consumerCurrentSpatialLayer: Number,
  consumerCurrentTemporalLayer: Number,
  consumerPreferredSpatialLayer: Number,
  consumerPreferredTemporalLayer: Number,
  consumerPriority: Number,
  audioTrack: null,
  videoTrack: null,
  audioMuted: Boolean,
  videoVisible: {
    type: Boolean,
    isRequired: true,
  },
  videoMultiLayer: Boolean,
  audioCodec: String,
  videoCodec: String,
  audioScore: null,
  videoScore: null,
  faceDetection: {
    type: Boolean,
    isRequired: true,
  },
  // onChangeDisplayName: Function,
  // onChangeMaxSendingSpatialLayer: Function,
  // onChangeVideoPreferredLayers: Function,
  // onChangeVideoPriority: Function,
  // onRequestKeyFrame: Function,
  // onStatsClick: {
  //   type: Function,
  //   isRequired: true,
  // },
});
const emits = defineEmits([
  "onChangeDisplayName",
  "onChangeMaxSendingSpatialLayer",
  "onChangeVideoPreferredLayers",
  "onChangeVideoPriority",
  "onRequestKeyFrame",
  "onStatsClick",
]);
const state = reactive({
  audioVolume: 0, // Integer from 0 to 10.,
  showInfo: window.SHOW_INFO || false,
  videoResolutionWidth: null,
  videoResolutionHeight: null,
  videoCanPlay: false,
  videoElemPaused: false,
  maxSpatialLayer: null,
  audioProducerScore: computed(() => {
    const a = Array.isArray(props.audioScore) ? props.audioScore : [props.audioScore];
    return a.sort((a, b) => {
      if (a.rid) return a.rid > b.rid ? 1 : -1;
      else return a.ssrc > b.ssrc ? 1 : -1;
    });
  }),
  videoProducerScore: computed(() => {
    const a = Array.isArray(props.videoScore) ? props.videoScore : [props.videoScore];
    return a.sort((a, b) => {
      if (a.rid) return a.rid > b.rid ? 1 : -1;
      else return a.ssrc > b.ssrc ? 1 : -1;
    });
  }),
});
const videoElem = ref(null);
const audioElem = ref(null);
const canvas = ref(null);
// Latest received video track.
// @type {MediaStreamTrack}
let _audioTrack = null;

// Latest received video track.
// @type {MediaStreamTrack}
let _videoTrack = null;

// Hark instance.
// @type {Object}
let _hark = null;

// Periodic timer for reading video resolution.
let _videoResolutionPeriodicTimer = null;

// requestAnimationFrame for face detection.
let _faceDetectionRequestAnimationFrame = null;

const _setTracks = (audioTrack, videoTrack) => {
  const { faceDetection } = props;

  if (_audioTrack === audioTrack && _videoTrack === videoTrack) return;

  _audioTrack = audioTrack;
  _videoTrack = videoTrack;

  if (_hark) _hark.stop();

  _stopVideoResolution();

  if (faceDetection) _stopFaceDetection();
  if (audioTrack) {
    const stream = new MediaStream();

    stream.addTrack(audioTrack);
    audioElem.value.srcObject = stream;

    audioElem.value.play().catch((error) => logger.warn("audioElem.value.play() failed:%o", error));

    _runHark(stream);
  } else {
    audioElem.value.srcObject = null;
  }

  if (videoTrack) {
    const stream = new MediaStream();

    stream.addTrack(videoTrack);
    videoElem.value.srcObject = stream;

    videoElem.value.oncanplay = () => (state.videoCanPlay = true);

    videoElem.value.onplay = () => {
      state.videoElemPaused = false;

      audioElem.value.play().catch((error) => logger.warn("audioElem.play() failed:%o", error));
    };

    videoElem.value.onpause = () => (state.videoElemPaused = true);

    videoElem.value.play().catch((error) => logger.warn("videoElem.value.play() failed:%o", error));

    _startVideoResolution();

    if (faceDetection) _startFaceDetection();
  } else {
    videoElem.value.srcObject = null;
  }
};

const _runHark = (stream) => {
  if (!stream.getAudioTracks()[0]) throw new Error("_runHark() | given stream has no audio track");

  _hark = hark(stream, { play: false });

  // eslint-disable-next-line no-unused-vars
  _hark.on("volume_change", (dBs, threshold) => {
    // The exact formula to convert from dBs (-100..0) to linear (0..1) is:
    //   Math.pow(10, dBs / 20)
    // However it does not produce a visually useful output, so let exagerate
    // it a bit. Also, let convert it from 0..1 to 0..10 and avoid value 1 to
    // minimize component renderings.
    let audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);

    if (audioVolume === 1) audioVolume = 0;

    if (audioVolume !== state.audioVolume) state.audioVolume = audioVolume;
  });
};

const _startVideoResolution = () => {
  _videoResolutionPeriodicTimer = setInterval(() => {
    if (videoElem.value.videoWidth !== state.videoResolutionWidth || videoElem.value.videoHeight !== state.videoResolutionHeight) {
      (state.videoResolutionWidth = videoElem.value.videoWidth), (state.videoResolutionHeight = videoElem.value.videoHeight);
    }
  }, 500);
};

const _stopVideoResolution = () => {
  clearInterval(_videoResolutionPeriodicTimer);

  (state.videoResolutionWidth = null), (state.videoResolutionHeight = null);
};

const _startFaceDetection = () => {
  const step = async () => {
    // NOTE: Somehow this is critical. Otherwise the Promise returned by
    // faceapi.detectSingleFace() never resolves or rejects.
    if (!_videoTrack || videoElem.value.readyState < 2) {
      _faceDetectionRequestAnimationFrame = requestAnimationFrame(step);

      return;
    }

    const detection = await faceapi.detectSingleFace(videoElem.value, tinyFaceDetectorOptions);

    if (detection) {
      const width = videoElem.value.offsetWidth;
      const height = videoElem.value.offsetHeight;

      canvas.value.width = width;
      canvas.value.height = height;

      // const resizedDetection = detection.forSize(width, height);
      const resizedDetections = faceapi.resizeResults(detection, { width, height });

      faceapi.draw.drawDetections(canvas.value, resizedDetections);
    } else {
      // Trick to hide the canvas rectangle.
      canvas.value.width = 0;
      canvas.value.height = 0;
    }

    _faceDetectionRequestAnimationFrame = requestAnimationFrame(() => setTimeout(step, 100));
  };

  step();
};

const _stopFaceDetection = () => {
  cancelAnimationFrame(_faceDetectionRequestAnimationFrame);

  canvas.value.width = 0;
  canvas.value.height = 0;
};

onMounted(() => {
  _setTracks(props.audioTrack, props.videoTrack);
});
onBeforeUpdate(() => {
  const { isMe, audioTrack, videoTrack, videoRtpParameters } = props;

  if (isMe && videoRtpParameters && state.maxSpatialLayer === null) {
    state.maxSpatialLayer = videoRtpParameters.encodings.length - 1;
  } else if (isMe && !videoRtpParameters && state.maxSpatialLayer !== null) {
    state.maxSpatialLayer = null;
  }
  _setTracks(audioTrack, videoTrack);
});
onBeforeUnmount(() => {
  if (_hark) _hark.stop();

  clearInterval(_videoResolutionPeriodicTimer);
  cancelAnimationFrame(_faceDetectionRequestAnimationFrame);

  if (videoElem.value) {
    videoElem.value.oncanplay = null;
    videoElem.value.onplay = null;
    videoElem.value.onpause = null;
  }
});
const toggleShowInfo = () => (state.showInfo = !state.showInfo);
const statsClick = (id) => {
  emits("onStatsClick", id);
};
const copyAudioProducer = () => clipboardCopy(`"${props.audioProducerId}"`);
const copyVideoProducer = () => clipboardCopy(`"${props.videoProducerId}"`);
const copyAudioConsumer = () => clipboardCopy(`"${props.audioConsumerId}"`);
const copyVideoConsumer = () => clipboardCopy(`"${props.videoConsumerId}"`);
const newMaxSpatialLayerAdd = (event) => {
  event.stopPropagation();

  const newMaxSpatialLayer = state.maxSpatialLayer - 1;
  emits("onChangeMaxSendingSpatialLayer", newMaxSpatialLayer);
  state.maxSpatialLayer = newMaxSpatialLayer;
};
const newMaxSpatialLayerMinus = (event) => {
  event.stopPropagation();

  const newMaxSpatialLayer = state.maxSpatialLayer + 1;
  emits("onChangeMaxSendingSpatialLayer", newMaxSpatialLayer);
  state.maxSpatialLayer = newMaxSpatialLayer;
};
const editableInputChange = ({ displayName }) => emits("onChangeDisplayName", displayName);
const onRequestKeyFrame = (event) => {
  event.stopPropagation();
  try {
    emits("onChangeDisplayName");
  } catch (error) {
    console.error(error);
  }
  // if (!onRequestKeyFrame)
  // 	return;

  // onRequestKeyFrame();
};
const onChangeVideoPreferredLayersDown = (event) => {
  event.stopPropagation();

  let newPreferredSpatialLayer = props.consumerPreferredSpatialLayer;
  let newPreferredTemporalLayer;

  if (props.consumerPreferredTemporalLayer > 0) {
    newPreferredTemporalLayer = props.consumerPreferredTemporalLayer - 1;
  } else {
    if (props.consumerPreferredSpatialLayer > 0) newPreferredSpatialLayer = props.consumerPreferredSpatialLayer - 1;
    else newPreferredSpatialLayer = consumerSpatialLayers - 1;

    newPreferredTemporalLayer = consumerTemporalLayers - 1;
  }
  emits("onChangeVideoPreferredLayers", newPreferredSpatialLayer, newPreferredTemporalLayer);
  // onChangeVideoPreferredLayers(
  // newPreferredSpatialLayer, newPreferredTemporalLayer);
};
const onChangeVideoPreferredLayersUp = (event) => {
  event.stopPropagation();

  let newPreferredSpatialLayer = props.consumerPreferredSpatialLayer;
  let newPreferredTemporalLayer;

  if (props.consumerPreferredTemporalLayer < consumerTemporalLayers - 1) {
    newPreferredTemporalLayer = props.consumerPreferredTemporalLayer + 1;
  } else {
    if (props.consumerPreferredSpatialLayer < consumerSpatialLayers - 1) newPreferredSpatialLayer = props.consumerPreferredSpatialLayer + 1;
    else newPreferredSpatialLayer = 0;

    newPreferredTemporalLayer = 0;
  }

  onChangeVideoPreferredLayers(newPreferredSpatialLayer, newPreferredTemporalLayer);
};
const onChangeVideoPriorityDown = (event) => {
  event.stopPropagation();
  emits("onChangeVideoPriority", consumerPriority - 1);
};
const onChangeVideoPriorityUp = (event) => {
  event.stopPropagation();

  emits("onChangeVideoPriority", consumerPriority + 1);
};
</script>

<template>
  <div data-component="PeerView">
    <div class="info">
      <div class="icons">
        <div :class="classnames('icon', 'info', { on: state.showInfo })" @click="toggleShowInfo" />

        <div :class="classnames('icon', 'stats')" @click="statsClick(peer.id)" />
      </div>

      <div :class="classnames('box', { visible: state.showInfo })">
        <template v-if="props.audioProducerId || props.audioConsumerId">
          <h1>audio</h1>

          <template v-if="props.audioProducerId">
            <p>
              'id: '
              <span class="copiable" data-tip="Copy audio producer id to clipboard" @click="copyAudioProducer">
                {{ props.audioProducerId }}
              </span>
            </p>
          </template>

          <template v-if="props.audioConsumerId">
            <p>
              {'id: '}
              <span class="copiable" data-tip="Copy video producer id to clipboard" @click="copyAudioConsumer">
                {{ props.audioConsumerId }}
              </span>
            </p>
          </template>

          <template v-if="props.audioCodec">
            <p>codec: {{ props.audioCodec }}</p>
          </template>

          <template v-if="props.audioProducerId && props.audioScore">
            <p>streams:</p>
            <template v-for="({ ssrc, rid, score }, idx) in state.audioProducerScore" :key="idx">
              <p class="indent">
                <span v-if="rid !== undefined">{{ `rid:${rid}, ssrc:${ssrc}, score:${score}` }}</span>
                <span v-else>{{ `ssrc:${ssrc}, score:${score}` }}</span>
              </p>
            </template>
          </template>

          <template v-if="props.audioConsumerId && props.audioScore">
            <p :key="props.audioConsumerId">
              {{
                `score:${props.audioScore.score}, producerScore:${props.audioScore.producerScore}, producerScores:[${props.audioScore.producerScores}]`
              }}
            </p>
          </template>
        </template>

        <template v-if="props.videoProducerId || props.videoConsumerId">
          <h1>video</h1>

          <template v-if="props.videoProducerId">
            <p>
              {'id: '}
              <span class="copiable" data-tip="Copy video producer id to clipboard" @click="copyVideoProducer">
                {{ props.videoProducerId }}
              </span>
            </p>
          </template>

          <template v-if="props.videoConsumerId">
            <p>
              {'id: '}
              <span class="copiable" data-tip="Copy video consumer id to clipboard" @click="copyVideoConsumer">
                {{ props.videoConsumerId }}
              </span>
            </p>
          </template>

          <template v-if="props.videoCodec">
            <p>codec: {{ props.videoCodec }}</p>
          </template>

          <template v-if="props.videoVisible && state.videoResolutionWidth !== null">
            <p>resolution: {{ state.videoResolutionWidth }}x{{ state.videoResolutionHeight }}</p>
          </template>

          <template v-if="props.videoVisible && props.videoProducerId && props.videoRtpParameters.encodings.length > 1">
            <p>
              max spatial layer: {{ state.maxSpatialLayer > -1 ? state.maxSpatialLayer : "none" }}
              <span>{' '}</span>
              <span
                :class="
                  classnames({
                    clickable: state.maxSpatialLayer > -1,
                  })
                "
                @click="newMaxSpatialLayerAdd($event)"
              >
                {'[ down ]'}
              </span>
              <span>{' '}</span>
              <span
                :class="
                  classnames({
                    clickable: state.maxSpatialLayer < props.videoRtpParameters.encodings.length - 1,
                  })
                "
                @click="newMaxSpatialLayerMinus($event)"
              >
                {'[ up ]'}
              </span>
            </p>
          </template>

          <template v-if="!props.isMe && props.videoMultiLayer">
            <p>
              {{ `current spatial-temporal layers: ${props.consumerCurrentSpatialLayer} ${props.consumerCurrentTemporalLayer}` }}
            </p>
            <p>
              {{ `preferred spatial-temporal layers: ${props.consumerPreferredSpatialLayer} ${props.consumerPreferredTemporalLayer}` }}
              <span>{' '}</span>
              <span class="clickable" @click="onChangeVideoPreferredLayersDown($event)"> {'[ down ]'} </span>
              <span>{' '}</span>
              <span class="clickable" @click="onChangeVideoPreferredLayersUp($event)"> {'[ up ]'} </span>
            </p>
          </template>

          <template v-if="!props.isMe && props.videoCodec && props.consumerPriority > 0">
            <p>
              {{ `priority: ${props.consumerPriority}` }}
              <span>{' '}</span>
              <span
                :class="
                  classnames({
                    clickable: props.consumerPriority > 1,
                  })
                "
                @click="onChangeVideoPriorityDown($event)"
              >
                {'[ down ]'}
              </span>
              <span>{' '}</span>
              <span
                :class="
                  classnames({
                    clickable: props.consumerPriority < 255,
                  })
                "
                @click="onChangeVideoPriorityUp($event)"
              >
                {'[ up ]'}
              </span>
            </p>
          </template>

          <template v-if="!props.isMe && props.videoCodec">
            <p>
              <span class="clickable" @click="onRequestKeyFrame($envent)"> {'[ request keyframe ]'} </span>
            </p>
          </template>

          <template v-if="props.videoProducerId && props.videoScore">
            <p>streams:</p>
            <template v-for="({ ssrc, rid, score }, idx) in state.videoProducerScore" :key="idx">
              <p class="indent">
                <span v-if="rid !== undefined">{{ `rid:${rid}, ssrc:${ssrc}, score:${score}` }}</span>
                <span v-else>{{ `ssrc:${ssrc}, score:${score}` }}</span>
              </p>
            </template>
          </template>

          <template v-if="props.videoConsumerId && props.videoScore">
            <p :key="props.videoConsumerId">
              {{
                `score:${props.videoScore.score}, producerScore:${props.videoScore.producerScore}, producerScores:[${props.videoScore.producerScores}]`
              }}
            </p>
          </template>
        </template>
      </div>

      <div :class="classnames('peer', { 'is-me': props.isMe })">
        <template v-if="{ isMe }">
          <EditableInput
            :value="props.peer.displayName"
            propName="displayName"
            class="display-name editable"
            classLoading="loading"
            classInvalid="invalid"
            shouldBlockWhileLoading
            :editProps="{
              maxLength: 20,
              autoCorrect: 'false',
              spellCheck: 'false',
            }"
            @onChange="editableInputChange"
          />
        </template>

        <template v-else>
          <span class="display-name">
            {{ props.peer.displayName }}
          </span>
        </template>

        <div class="row">
          <span :class="classnames('device-icon', props.peer.device.flag)" />
          <span class="device-version"> {{ props.peer.device.name }} {{ props.peer.device.version || null }} </span>
        </div>
      </div>
    </div>

    <video
      ref="videoElem"
      :class="
        classnames({
          'is-me': props.isMe,
          hidden: !props.videoVisible || !state.videoCanPlay,
          'network-error': props.videoVisible && props.videoMultiLayer && props.consumerCurrentSpatialLayer === null,
        })
      "
      autoPlay
      playsInline
      muted
      :controls="false"
    />

    <audio ref="audioElem" autoPlay playsInline :muted="props.isMe || props.audioMuted" controls="false" />

    <canvas ref="canvas" :class="classnames('face-detection', { 'is-me': props.isMe })" />

    <div class="volume-container">
      <div :class="classnames('bar', `level${state.audioVolume}`)" />
    </div>

    <template v-if="props.videoVisible && props.videoScore < 5">
      <div class="spinner-container"></div>
    </template>

    <template v-if="state.videoElemPaused">
      <div class="video-elem-paused" />
    </template>
  </div>
</template>

<style></style>
