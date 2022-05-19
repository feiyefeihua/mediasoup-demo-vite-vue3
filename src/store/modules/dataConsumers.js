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

  ADD_DATA_CONSUMER(state, { payload }) {
    const { dataConsumer } = payload;

    state[dataConsumer.id] = dataConsumer;
  },

  REMOVE_DATA_CONSUMER(state, { payload }) {
    const { dataConsumerId } = payload;

    delete state[dataConsumerId];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
