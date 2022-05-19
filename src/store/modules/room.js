const initialState = {
  url: null,
  state: "new", // new/connecting/connected/disconnected/closed,
  activeSpeakerId: null,
  statsPeerId: null,
  faceDetection: false,
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
  SET_ROOM_URL(state, { payload }) {
    const { url } = payload;
    // Object.assign(state, {payload});
    state.url = url;
  },

  SET_ROOM_STATE(state, { payload }) {
    const roomState = payload.state;

    if (roomState === "connected") state.state = roomState;
    else Object.assign(state, { state: roomState, activeSpeakerId: null, statsPeerId: null });
  },

  SET_ROOM_ACTIVE_SPEAKER(state, { payload }) {
    const { peerId } = payload;
    state.activeSpeakerId = peerId;
  },

  SET_ROOM_STATS_PEER_ID(state, { payload }) {
    const { peerId } = payload;

    if (state.statsPeerId === peerId) state.activeSpeakerId = null;
    else state.statsPeerId = peerId;
  },

  SET_FACE_DETECTION(state, { payload }) {
    const flag = payload;

    state.faceDetection = flag;
  },

  REMOVE_PEER(state, { payload }) {
    const { peerId } = payload;

    if (peerId && peerId === state.activeSpeakerId) state.activeSpeakerId = null;

    if (peerId && peerId === state.statsPeerId) state.statsPeerId = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
