import { Button } from "antd";
import React, { useCallback } from "react";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import Comment from "./Comment";
import converter from "./utils";

export const Conversation = ({
  changeKey,
  comments,
  editMode,
  onSubmitComment,
  deleteComment,
  editComment,
  cancelAction,
  file,
  enableComment,
  onCommentDelete,
  onComment,
  setEditOff,
  initConversation
}) => {
  const [value, setValue] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("write");
  const submitComment = useCallback(
    content => onComment(undefined, changeKey, content),
    [changeKey, onComment]
  );
  const getValue = () => {
    if (value && value.trim() !== "") {
      return value;
    } else if (
      comments &&
      comments.comments &&
      comments.comments[0].trim() !== ""
    ) {
      return comments.comments[0];
    } else {
      return value;
    }
  };

  console.log({ value, comments, ge: getValue() });
  return (
    <div className="conversation">
      {!editMode &&
        comments &&
        comments.comments &&
        comments.comments.map((comment, i) => {
          return (
            <Comment
              enableComment={enableComment}
              changeKey={changeKey}
              deleteComment={onCommentDelete}
              editComment={onComment}
              key={i}
              content={comment}
              initConversation={initConversation}
            />
          );
        })}

      {editMode && enableComment && (
        <div className="container mde-container">
          <ReactMde
            value={getValue()}
            onChange={setValue}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            minEditorHeight={100}
            minPreviewHeight={100}
            generateMarkdownPreview={markdown =>
              Promise.resolve(converter.makeHtml(markdown))
            }
          />
          <Button
            className="submit"
            type="primary"
            onClick={() => {
              console.log(value);
              if (value.trim() === "") {
                onCommentDelete(changeKey);
              } else {
                submitComment(value).then(res => {
                  setEditOff(changeKey);
                });
              }
            }}
          >
            Add Comment
          </Button>
          <Button
            className="submit"
            type="primary"
            onClick={() => {
              if (comments[0] && comments[0].trim() === "") {
                onCommentDelete(changeKey);
              } else {
                setEditOff(changeKey);
              }

              setValue(comments && comments.comments && comments.comments[0]);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
