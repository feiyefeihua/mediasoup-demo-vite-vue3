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

  ADD_PRODUCER(state, { payload }) {
    const { producer } = payload;

    // state[producer.id] = Object.assign({}, producer);
    state[producer.id] = producer;
  },

  REMOVE_PRODUCER(state, { payload }) {
    const { producerId } = payload;
    delete state[producerId];
  },

  SET_PRODUCER_PAUSED(state, { payload }) {
    const { producerId } = payload;
    if (state[producerId]) state[producerId].paused = true;
  },

  SET_PRODUCER_RESUMED(state, { payload }) {
    const { producerId } = payload;
    if (state[producerId]) state[producerId].paused = false;
  },

  SET_PRODUCER_TRACK(state, { payload }) {
    const { producerId, track } = payload;
    if (state[producerId]) state[producerId].track = track;
  },

  SET_PRODUCER_SCORE(state, { payload }) {
    const { producerId, score } = payload;
    const producer = state[producerId];

    if (!producer) return;
    state[producerId].score = score;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
