import React from "react";
import HrDiffWrap from "./DiffWrap";

function App() {
  const [state, setState] = React.useState("unified");
  return (
    <div>
      <HrDiffWrap key={state} type={state} />
    </div>
  );
}

export default App;
