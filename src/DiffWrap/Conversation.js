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
  cancelAction
}) => {
  const [value, setValue] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("write");
  const submitComment = useCallback(
    content => onSubmitComment(changeKey, content),
    [changeKey, onSubmitComment]
  );

  return (
    <div className="conversation">
      {comments.length >= 1 &&
        !editMode &&
        comments.map((comment, i) => (
          <Comment
            changeKey={changeKey}
            deleteComment={deleteComment}
            editComment={editComment}
            key={i}
            content={comment}
          />
        ))}

      {editMode && (
        <div className="container mde-container">
          <ReactMde
            value={value}
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
              if (value.trim() === "") {
                deleteComment(changeKey);
              } else {
                submitComment(value);
              }
            }}
          >
            Add Comment
          </Button>
          <Button
            className="submit"
            type="primary"
            onClick={() => {
              if (comments[0].trim() === "") {
                deleteComment(changeKey);
              } else {
                cancelAction(changeKey);
              }
              setValue(comments[0]);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
