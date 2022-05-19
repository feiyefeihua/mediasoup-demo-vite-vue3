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

  ADD_DATA_PRODUCER(state, { payload }) {
    const { dataProducer } = payload;

    state[dataProducer.id] = dataProducer;
  },

  REMOVE_DATA_PRODUCER(state, { payload }) {
    const { dataProducerId } = payload;

    delete state[dataProducerId];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
