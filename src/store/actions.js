export default {
  SET_ROOM_STATE({ state, commit }, payload) {
    commit("consumers/SET_ROOM_STATE", payload);
    commit("dataConsumers/SET_ROOM_STATE", payload);
    commit("dataProducers/SET_ROOM_STATE", payload);
    commit("me/SET_ROOM_STATE", payload);
    commit("peers/SET_ROOM_STATE", payload);
    commit("producers/SET_ROOM_STATE", payload);
    commit("room/SET_ROOM_STATE", payload);
  },
  ADD_CONSUMER({ state, commit }, payload) {
    commit("consumers/ADD_CONSUMER", payload);
    commit("peers/ADD_CONSUMER", payload);
  },
  REMOVE_CONSUMER({ state, commit }, payload) {
    commit("consumers/REMOVE_CONSUMER", payload);
    commit("peers/REMOVE_CONSUMER", payload);
  },
  ADD_DATA_CONSUMER({ state, commit }, payload) {
    commit("dataConsumers/ADD_DATA_CONSUMER", payload);
    commit("peers/ADD_DATA_CONSUMER", payload);
  },
  REMOVE_DATA_CONSUMER({ state, commit }, payload) {
    commit("dataConsumers/REMOVE_DATA_CONSUMER", payload);
    commit("peers/REMOVE_DATA_CONSUMER", payload);
  },
  REMOVE_PEER({ state, commit }, payload) {
    commit("room/REMOVE_PEER", payload);
    commit("peers/REMOVE_PEER", payload);
  },
};
