import { render } from "react-dom";
import React, { useState } from "react";

import based from "@based/client";
import { useClient, useData, Provider, useAuth } from "@based/react";
import { prettyDate } from "@based/pretty-date";

export const client = based({
  env: "production",
  org: "dsm",
  project: "demopt100",
});

const LoggedInApp = () => {
  const client = useClient();
  const { data, loading, error } = useData("humidEvents");
  return (
    <div>
      <button
        style={{
          width: "100%",
          border: "1px solid red",
        }}
        onClick={() => {
          client.call("addEvents");
        }}
      >
        call my fn
      </button>
      {loading ? "loading..." : JSON.stringify(data)}
    </div>
  );
};

const App = () => {
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const client = useClient();

  if (!auth) {
    return (
      <div>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button
          onClick={() => {
            console.log("???", email, password);
            client.login({
              email,
              password,
            });
          }}
        >
          LOGIN!
        </button>
      </div>
    );
  } else {
    return <LoggedInApp />;
  }
};

render(
  <Provider client={client}>
    <App />
  </Provider>,
  document.body
);
