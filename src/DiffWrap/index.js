import { mapValues } from "lodash";
import React from "react";
import { Decoration, Diff, Hunk, parseDiff, tokenize } from "react-diff-view";
import "react-diff-view/style/index.css";
import { ChevronRight } from "react-feather";
import { useConversations } from "./hooks.js/useConversation";
import { Conversation } from "./Conversation";
import "./index.css";
import * as refractor from "refractor";
import "prism-themes/themes/prism-ghcolors.css";

export function getChangeKey(change, file) {
  if (!change) throw new Error("change is not provided");
  var isNormal = change.isNormal,
    isInsert = change.isInsert,
    lineNumber = change.lineNumber,
    oldLineNumber = change.oldLineNumber;
  return isNormal
    ? "N" + oldLineNumber + "+" + file
    : (isInsert ? "I" : "D") + lineNumber + "+" + file;
}

function HrDiffWrap(props) {
  const [diff, setDiff] = React.useState("");
  const [type, setType] = React.useState("split");

  React.useEffect(() => {
    const element = document.querySelector("#style-root");
    const newEl = `
    .diff-line td:first-child i::before {
      opacity: ${props.type === "unified" ? "0" : "1"};
    }    
    `;
    element.innerHTML = "";
    const css = document.createElement("style");
    css.innerHTML = "";
    css.appendChild(document.createTextNode(newEl));
    element.appendChild(css);
  }, [props.type]);

  React.useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/siddhant1/test_hosting/58fcc99e7731ecac592146b5b80e43cecea469da/my.diff"
    )
      .then(d => d.text())
      .then(res => {
        setDiff(res);
      });
  }, []);

  const [
    conversations,
    { initConversation, addComment, deleteComment, editComment, cancelAction }
  ] = useConversations();

  // const widgets = mapValues(
  //   conversations,
  //   ({ comments, editMode }, changeKey) => {
  //     const [key, fileKey] = changeKey.split("+");
  //     return (
  //       <Conversation
  //         file={fileKey}
  //         editMode={editMode}
  //         changeKey={key}
  //         comments={comments}
  //         onSubmitComment={addComment}
  //         deleteComment={deleteComment}
  //         editComment={editComment}
  //         cancelAction={cancelAction}
  //       />
  //     );
  //   }
  // );

  // console.log(widgets)

  const widgets = file => {
    var widgetsObj = {};
    for (let key in conversations) {
      const [newKey, fileName] = key.split("+");
      if (fileName !== file) {
        continue;
      }
      widgetsObj[newKey] = (
        <Conversation
          file={fileName}
          editMode={conversations[key].editMode}
          changeKey={key}
          comments={conversations[key].comments}
          onSubmitComment={addComment}
          deleteComment={deleteComment}
          editComment={editComment}
          cancelAction={cancelAction}
        />
      );
    }
    return widgetsObj;
  };

  // const gutterEvents = {
  //   onClick({ change }) {
  //     console.log(arguments);
  //     const key = getChangeKey(change);
  //     if (!conversations[key]) {
  //       initConversation(key);
  //     } else {
  //       editComment(key);
  //     }
  //   }
  // };

  const files = parseDiff(diff, { nearbySequences: "zip" });
  const renderGutter = ({
    change,
    side,
    renderDefault,
    wrapInAnchor,
    inHoverState
  }) => {
    if (inHoverState) {
      return (
        <div className="gutter">
          <div className="gutter__line-no">{renderDefault()}</div>
          <i className="comment_add_button fas fa-plus-square"></i>
        </div>
      );
    }

    return <>{wrapInAnchor(renderDefault())}</>;
  };

  const memoCheck = files[1] && files[1].hunks;

  const renderFile = ({
    oldRevision,
    newRevision,
    type: difftype,
    hunks,
    newPath
  }) => {
    return (
      <DiffWrap
        oldRevision={oldRevision}
        newRevision={newRevision}
        diffType={difftype}
        hunks={hunks}
        newPath={newPath}
        viewType={props.type}
        renderGutter={renderGutter}
        conversations={conversations}
        widgets={widgets}
        initConversation={initConversation}
        editComment={editComment}
      />
    );
  };
  return (
    <div>
      {files.map(file => {
        return (
          <>
            <div className="file_name">
              <ChevronRight size={"20"} />
              {file.newPath}
            </div>
            {renderFile(file)}
          </>
        );
      })}
    </div>
  );
}

const DiffWrap = ({
  oldRevision,
  newRevision,
  difftype,
  hunks,
  newPath,
  viewType,
  renderGutter,
  conversations,
  widgets,
  initConversation,
  editComment
}) => {
  const tokens = React.useMemo(() => {
    const options = {
      refractor,
      highlight: true,
      language: "typescript"
    };

    return tokenize(hunks, options);
  }, [hunks]);
  return (
    <Diff
      key={oldRevision + "-" + newRevision}
      viewType={viewType}
      diffType={difftype}
      hunks={hunks}
      renderGutter={renderGutter}
      tokens={tokens}
    >
      {hunks =>
        hunks.map(hunk => {
          return (
            <>
              <Decoration>
                <div>{hunk.content}</div>
              </Decoration>
              <Hunk
                key={"+" + hunk.content}
                hunk={hunk}
                gutterEvents={{
                  onClick({ change }) {
                    const key = getChangeKey(change, newPath);
                    if (!conversations[key]) {
                      initConversation(key);
                    } else {
                      editComment(key);
                    }
                  }
                }}
                widgets={widgets(newPath)}
              />
            </>
          );
        })
      }
    </Diff>
  );
};

export default HrDiffWrap;
