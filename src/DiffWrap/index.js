import { mapValues } from "lodash";
import React from "react";
import {
  Decoration,
  Diff,
  getChangeKey,
  Hunk,
  parseDiff
} from "react-diff-view";
import "react-diff-view/style/index.css";
import { ChevronRight } from "react-feather";
import { useConversations } from "./hooks.js/useConversation";
import { Conversation } from "./Conversation";
import "./index.css";

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
    element.innerHTML=""
    const css = document.createElement("style");
    css.innerHTML = "";
    css.appendChild(document.createTextNode(newEl));
    element.appendChild(css)
    // element && element.appendChild(newEl);
  }, [props.type]);

  React.useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/siddhant1/test_hosting/master/my.diff"
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

  const widgets = mapValues(
    conversations,
    ({ comments, editMode }, changeKey) => {
      return (
        <Conversation
          editMode={editMode}
          changeKey={changeKey}
          comments={comments}
          onSubmitComment={addComment}
          deleteComment={deleteComment}
          editComment={editComment}
          cancelAction={cancelAction}
        />
      );
    }
  );

  const gutterEvents = {
    onClick({ change }) {
      const key = getChangeKey(change);
      if (!conversations[key]) {
        initConversation(key);
      } else {
        editComment(key);
      }
    }
  };

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

  const renderFile = ({ oldRevision, newRevision, type: difftype, hunks }) => {
    return (
      <Diff
        key={oldRevision + "-" + newRevision}
        viewType={props.type}
        diffType={difftype}
        hunks={hunks}
        renderGutter={renderGutter}
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
                  gutterEvents={gutterEvents}
                  widgets={widgets}
                />
              </>
            );
          })
        }
      </Diff>
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

export default HrDiffWrap;
