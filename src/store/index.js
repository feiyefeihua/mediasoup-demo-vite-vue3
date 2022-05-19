import { createStore, createLogger } from "vuex";
import mutations from "./mutations";
import actions from "./actions";
import * as getters from "./getters";

import room from "./modules/room";
import me from "./modules/me";
import producers from "./modules/producers";
import dataProducers from "./modules/dataProducers";
import peers from "./modules/peers";
import consumers from "./modules/consumers";
import dataConsumers from "./modules/dataConsumers";
import notifications from "./modules/notifications";

const debug = process.env.NODE_ENV !== "production";

export default createStore({
  state() {
    return {
      roomClient: null,
    };
  },
  mutations,
  actions,
  getters,
  modules: { room, me, producers, dataProducers, peers, consumers, dataConsumers, notifications },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
