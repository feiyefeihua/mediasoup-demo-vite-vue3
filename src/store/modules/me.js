const initialState = {
  id: null,
  displayName: null,
  displayNameSet: false,
  device: null,
  canSendMic: false,
  canSendWebcam: false,
  canChangeWebcam: false,
  webcamInProgress: false,
  shareInProgress: false,
  audioOnly: false,
  audioOnlyInProgress: false,
  audioMuted: false,
  restartIceInProgress: false,
};

const state = () => ({
  ...initialState,
});

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  SET_ROOM_STATE(state, { payload }) {
    const roomState = payload.state;

    if (roomState === "closed")
      Object.assign(state, {
        webcamInProgress: false,
        shareInProgress: false,
        audioOnly: false,
        audioOnlyInProgress: false,
        audioMuted: false,
        restartIceInProgress: false,
      });
  },

  SET_ME(state, { payload }) {
    const { peerId, displayName, displayNameSet, device } = payload;
    Object.assign(state, {
      id: peerId,
      displayName,
      displayNameSet,
      device,
    });
  },

  SET_MEDIA_CAPABILITIES(state, { payload }) {
    const { canSendMic, canSendWebcam } = payload;
    Object.assign(state, {
      canSendMic,
      canSendWebcam,
    });
  },

  SET_CAN_CHANGE_WEBCAM(state, { payload }) {
    const canChangeWebcam = payload;

    state.canChangeWebcam = canChangeWebcam;
  },

  SET_WEBCAM_IN_PROGRESS(state, { payload }) {
    const { flag } = payload;

    state.webcamInProgress = flag;
  },

  SET_SHARE_IN_PROGRESS(state, { payload }) {
    const { flag } = payload;
    state.shareInProgress = flag;
  },

  SET_DISPLAY_NAME(state, { payload }) {
    let { displayName } = payload;

    // Be ready for undefined displayName (so keep previous one).
    if (!displayName) displayName = state.displayName;
    state.displayName = displayName;
    state.displayNameSet = true;
  },

  SET_AUDIO_ONLY_STATE(state, { payload }) {
    const { enabled } = payload;

    state.audioOnly = enabled;
  },

  SET_AUDIO_ONLY_IN_PROGRESS(state, { payload }) {
    const { flag } = payload;
    state.audioOnlyInProgress = flag;
  },

  SET_AUDIO_MUTED_STATE(state, { payload }) {
    const { enabled } = payload;
    state.audioMuted = enabled;
  },

  SET_RESTART_ICE_IN_PROGRESS(state, { payload }) {
    const { flag } = payload;
    state.restartIceInProgress = flag;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
