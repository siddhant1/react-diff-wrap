import { Button } from "antd";
import React, { useCallback } from "react";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import Comment from "./Comment";
import converter from "./utils";

export const Conversation = ({
  changeKey,
  comments,
  onSubmitComment,
  deleteComment,
  editComment,
  closeEditor
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
        comments.map((comment, i) => (
          <Comment
            changeKey={changeKey}
            deleteComment={deleteComment}
            editComment={editComment}
            key={i}
            content={comment}
          />
        ))}

      {comments.length === 0 && (
        <div className="container">
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
            onClick={() => submitComment(value)}
          >
            Add Comment
          </Button>
          <Button
            className="submit"
            type="primary"
            onClick={() => closeEditor(changeKey, value)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
