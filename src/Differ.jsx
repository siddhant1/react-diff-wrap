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
import { Conversation, useConversations } from "./comments";
import { useBoolean } from "./comments";
import "./differ.css";

function HrDiffWrap(props) {
  const [diff, setDiff] = React.useState("");
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
    { initConversation, addComment, deleteComment, editComment }
  ] = useConversations();

  console.log(conversations)

  const widgets = mapValues(conversations, ({ comments }, changeKey) => {
    return (
      <Conversation
        changeKey={changeKey}
        comments={comments}
        onSubmitComment={addComment}
        deleteComment={deleteComment}
        editComment={editComment}
      />
    );
  });

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

  const renderFile = ({ oldRevision, newRevision, type, hunks }) => {
    return (
      <Diff
        key={oldRevision + "-" + newRevision}
        viewType="split"
        diffType={type}
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
