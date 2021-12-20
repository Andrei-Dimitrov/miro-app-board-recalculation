import ReactDOM from "react-dom";
import { App } from "./App";
import { mockMiroApi } from "./miroHelpers/development-mock";

if (process.env.NODE_ENV === "development") {
  mockMiroApi();
}

miro.onReady(async () => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
