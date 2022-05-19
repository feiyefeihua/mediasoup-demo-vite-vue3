export default {
  SET_ROOM_CLIENT(state, payload) {
    const { roomClient } = payload;

    state.roomClient = roomClient;
  },
  ROOM_CLIENT_JOIN(state, payload) {
    state.roomClient.join();
  },
};
