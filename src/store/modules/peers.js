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

  ADD_PEER(state, { payload }) {
    const { peer } = payload;
    state[peer.id] = peer;
  },

  REMOVE_PEER(state, { payload }) {
    const { peerId } = payload;
    delete state[peerId];
  },

  SET_PEER_DISPLAY_NAME(state, { payload }) {
    const { displayName, peerId } = payload;
    if (!state[peerId]) throw new Error("no Peer found");

    state[peerId].displayName = displayName;
  },

  ADD_CONSUMER(state, { payload }) {
    const { consumer, peerId } = payload;
    if (!state[peerId]) throw new Error("no Peer found for new Consumer");
    state[peerId].consumers.push(consumer.id);
  },

  REMOVE_CONSUMER(state, { payload }) {
    const { consumerId, peerId } = payload;

    // NOTE: This means that the Peer was closed before, so it's ok.
    if (!state[peerId]) return;

    const idx = state[peerId].consumers.indexOf(consumerId);

    if (idx === -1) throw new Error("Consumer not found");
    state[peerId].consumers.splice(idx, 1);
  },

  ADD_DATA_CONSUMER(state, { payload }) {
    const { dataConsumer, peerId } = payload;

    // special ,or bot DataConsume(state, {payload})
    if (!peerId) return;

    if (!state[peerId]) throw new Error("no Peer found for new DataConsumer");

    state[peerId].dataConsumers.push(dataConsumer.id);
  },

  REMOVE_DATA_CONSUMER(state, { payload }) {
    const { dataConsumerId, peerId } = payload;

    // special ,or bot DataConsume(state, {payload})
    if (!peerId) return;

    // NOTE: This means that the Peer was closed before, so it's ok.
    if (!state[peerId]) return;

    const idx = state[peerId].dataConsumers.indexOf(dataConsumerId);

    if (idx === -1) throw new Error("DataConsumer not found");

    state[peerId].dataConsumers.splice(idx, 1);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
