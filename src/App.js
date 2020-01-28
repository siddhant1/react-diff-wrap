import React from "react";
import HrDiffWrap from "./DiffWrap";

function App() {
  const [state, setState] = React.useState("split");
  return (
    <div>
      <button
        onClick={() => {
          if (state === "split") {
            setState("unified");
          } else {
            setState("split");
          }
        }}
      >
        Change view type
      </button>
      <HrDiffWrap key={state} type={state} />
    </div>
  );
}

export default App;
