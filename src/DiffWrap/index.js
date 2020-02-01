import { mapValues } from "lodash";
import React from "react";
import { Decoration, Diff, Hunk, parseDiff, tokenize } from "react-diff-view";
import "react-diff-view/style/index.css";
import { ChevronRight, ChevronDown } from "react-feather";
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

function HrDiffWrap({
  type,
  patch: diff,
  enableComment,
  onComment,
  onCommentDelete,
  comments,
  enableSettings
}) {
  const [closedFiles, setClosedFiles] = React.useState({});
  const [commentEditMode, setCommentEditMode] = React.useState({});

  const setEditOff = changeKey => {
    const dup = {
      ...commentEditMode,
      [changeKey]: false
    };
    setCommentEditMode(dup);
  };

  React.useEffect(() => {
    const element = document.querySelector("#style-root");
    const newEl = `
    .diff-line td:first-child i::before {
      opacity: ${type === "unified" ? "0" : "1"};
    }    
    `;
    element.innerHTML = "";
    const css = document.createElement("style");
    css.innerHTML = "";
    css.appendChild(document.createTextNode(newEl));
    element.appendChild(css);
    setClosedFiles({});
  }, [type]);

  const closeFile = filePath => {
    const duplicateClosedFiles = { ...closedFiles };
    duplicateClosedFiles[filePath] = 1;
    setClosedFiles(duplicateClosedFiles);
  };

  const openFile = filePath => {
    const duplicateClosedFiles = { ...closedFiles };
    duplicateClosedFiles[filePath] = 0;
    setClosedFiles(duplicateClosedFiles);
  };

  const initConversation = changeKey => {
    const duplicate = {
      ...commentEditMode,
      [changeKey]: true
    };
    setCommentEditMode(duplicate);
  };

  const widgets = file => {
    var widgetsObj = {};
    for (let key in comments) {
      const [newKey, fileName] = key.split("+");
      if (fileName !== file) {
        continue;
      }
      widgetsObj[newKey] = (
        <Conversation
          enableComment={enableComment}
          file={fileName}
          setEditOff={setEditOff}
          editMode={commentEditMode[key]}
          changeKey={key}
          comments={comments[key] || []}
          onComment={onComment}
          onCommentDelete={onCommentDelete}
          initConversation={initConversation}
        />
      );
    }

    for (let key in commentEditMode) {
      const [newKey, fileName] = key.split("+");
      if (fileName !== file) {
        continue;
      }
      widgetsObj[newKey] = (
        <Conversation
          enableComment={enableComment}
          file={fileName}
          editMode={commentEditMode[key]}
          changeKey={key}
          setEditOff={setEditOff}
          comments={comments[key] || []}
          onComment={onComment}
          onCommentDelete={onCommentDelete}
          initConversation={initConversation}
        />
      );
    }
    return widgetsObj;
  };

  // do this inside useMemo
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
        viewType={type}
        renderGutter={renderGutter}
        conversations={comments}
        widgets={widgets}
        initConversation={initConversation}
      />
    );
  };
  return (
    <div>
      {files.map(file => {
        return (
          <div className="file">
            <div className="file_name">
              {!closedFiles[file.newPath] ? (
                <ChevronDown
                  onClick={() => closeFile(file.newPath)}
                  size={"20"}
                />
              ) : (
                <ChevronRight
                  onClick={() => openFile(file.newPath)}
                  size={"20"}
                />
              )}
              {file.newPath}
            </div>
            {!closedFiles[file.newPath] && renderFile(file)}
          </div>
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
      initConversation={initConversation}
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
