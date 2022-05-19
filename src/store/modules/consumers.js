const initialState = {};

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
      Object.keys(state).forEach((key) => {
        Reflect.deleteProperty(state, key);
      });
  },

  ADD_CONSUMER(state, { payload }) {
    const { consumer } = payload;
    state[consumer.id] = consumer;
    // state[consumer.id] = Object.assign({}, consumer);
  },

  REMOVE_CONSUMER(state, { payload }) {
    const { consumerId } = payload;

    delete state[consumerId];
  },

  SET_CONSUMER_PAUSED(state, { payload }) {
    const { consumerId, originator } = payload;

    if (originator === "local") state[consumerId].locallyPaused = true;
    else state[consumerId].remotelyPaused = true;
  },

  SET_CONSUMER_RESUMED(state, { payload }) {
    const { consumerId, originator } = payload;
    if (originator === "local") state[consumerId].locallyPaused = false;
    else state[consumerId].remotelyPaused = false;
  },

  SET_CONSUMER_CURRENT_LAYERS(state, { payload }) {
    const { consumerId, spatialLayer, temporalLayer } = payload;

    state[consumerId].currentSpatialLayer = spatialLayer;
    state[consumerId].currentTemporalLayer = temporalLayer;
  },

  SET_CONSUMER_PREFERRED_LAYERS(state, { payload }) {
    const { consumerId, spatialLayer, temporalLayer } = payload;

    state[consumerId].preferredSpatialLayer = spatialLayer;
    state[consumerId].preferredTemporalLayer = temporalLayer;
  },

  SET_CONSUMER_PRIORITY(state, { payload }) {
    const { consumerId, priority } = payload;

    state[consumerId].priority = priority;
  },

  SET_CONSUMER_TRACK(state, { payload }) {
    const { consumerId, track } = payload;
    console.log("SET_CONSUMER_TRACK", payload);
    state[consumerId].track = track;
  },

  SET_CONSUMER_SCORE(state, { payload }) {
    const { consumerId, score } = payload;
    const consumer = state[consumerId];

    if (!consumer) return;

    state[consumerId].score = score;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
