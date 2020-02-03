import React from "react";
import HrDiffWrap from "./DiffWrap";

function App() {
  const [state, setState] = React.useState("split");
  const [comments, setComments] = React.useState({});
  const [patch, setPatch] = React.useState("");

  React.useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/siddhant1/test_hosting/58fcc99e7731ecac592146b5b80e43cecea469da/my.diff "
    )
      .then(res => {
        return res.text();
      })
      .then(res => setPatch(res));
  });

  const onComment = (success = true, key, comment) => {
    // mocking an API request
    const commentAddPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve({ success: true });
        } else {
          reject({ message: "Error" });
        }
      }, 1000);
    });

    // parse the key
    // change the key structure from
    // -> I9+package.json to
    // {
    //  mode:Insert,
    //  lineNumber:9,
    //  fileName:package,json
    // }

    // store it inside the component's state or a global state(optimistically)
    // or store the result when the API suceeds
    commentAddPromise.then(res => {
      const dup = {
        ...comments
      };

      if (!dup[key]) {
        dup[key] = { comments: [] };
      }

      const dupComments = dup[key].comments;

      if (!dupComments) {
        dup[key].comments = [comment];
      } else {
        dupComments.push(comment);
      }
      setComments(dup);
    });

    // return the promise to the component to render the state
    return commentAddPromise;
  };

  const onCommentDelete = (success = true, key) => {
    // do the similar functionalities except adding the comment
    const deletePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve({ success: true });
        } else {
          reject({ message: "Error" });
        }
      }, 1000);
    });

    deletePromise.then(res => {
      const dup = {
        ...comments
      };

      delete dup[key];

      setComments(dup);
    });

    return deletePromise
  };

  return (
    <div className="diff-root-container">
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
      <HrDiffWrap
        defaultViewType={"split"}
        patch={patch}
        enableComment={true}
        onComment={onComment}
        onCommentDelete={onCommentDelete}
        comments={comments}
        enableSettings={false}
        type={state}
      />
    </div>
  );
}

export default App;
