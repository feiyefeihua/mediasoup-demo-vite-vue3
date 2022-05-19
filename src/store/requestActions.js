import randomString from "random-string";
import * as stateActions from "./stateActions";
import store from "@/store";
// This returns a redux-thunk action (a function).
export const notify = ({ type = "info", text, title, timeout }) => {
  if (!timeout) {
    switch (type) {
      case "info":
        timeout = 3000;
        break;
      case "error":
        timeout = 5000;
        break;
    }
  }

  const notification = {
    id: randomString({ length: 12 }).toLowerCase(),
    type,
    title,
    text,
    timeout,
  };
  store.commit(stateActions.addNotification(notification));

  setTimeout(() => {
    store.commit(stateActions.removeNotification(notification.id));
  }, timeout);
};
