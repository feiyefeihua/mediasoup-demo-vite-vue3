const initialState = [];

const state = () => ({
  notification: [...initialState],
});

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  ADD_NOTIFICATION(state, { payload }) {
    const { notification } = payload;
    state.notification.push(notification);
  },

  REMOVE_NOTIFICATION(state, { payload }) {
    const { notificationId } = payload;

    state.notification = state.notification.filter((notification) => notification.id !== notificationId);
  },

  REMOVE_ALL_NOTIFICATIONS(state, { payload }) {
    state.notification.splice(0, state.notification.length);
    // state.notification = [];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
