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
  const [loading, setLoading] = React.useState(false);
  const submitComment = useCallback(
    content => onComment(changeKey, content),
    [changeKey, onComment]
  );
  // const getValue = () => {
  //   if (value && value.trim() !== "") {
  //     return value;
  //   } else if (
  //     comments &&
  //     comments.comments &&
  //     comments.comments[0].trim() !== ""
  //   ) {
  //     return comments.comments[0];
  //   } else {
  //     return value;
  //   }
  // };

  React.useEffect(() => {
    setValue(comments && comments.comments && comments.comments[0]);
  }, [comments]);

  return (
    <div className="conversation">
      {!editMode &&
        comments &&
        comments.comments &&
        comments.comments.map((comment, i) => {
          return (
            <Comment
              loading={loading}
              enableComment={enableComment}
              changeKey={changeKey}
              deleteComment={onCommentDelete}
              editComment={onComment}
              key={i}
              content={comment}
              initConversation={initConversation}
              setLoading={setLoading}
            />
          );
        })}

      {editMode && enableComment && (
        <div className="container mde-container">
          <ReactMde
            value={value}
            disabled
            onChange={setValue}
            selectedTab={selectedTab}
            classes={{ textArea: loading ? "isLoading" : "" }}
            onTabChange={setSelectedTab}
            minEditorHeight={100}
            minPreviewHeight={100}
            generateMarkdownPreview={markdown =>
              Promise.resolve(converter.makeHtml(markdown))
            }
          />
          <Button
            disabled={loading}
            className="submit"
            type="primary"
            onClick={() => {
              setLoading(true);
              if (value && value.trim() !== "") {
                submitComment(value)
                  .then(res => {
                    setLoading(false);
                    setEditOff(changeKey);
                  })
                  .catch(e => {
                    setLoading(false);
                  });
              } else {
                onCommentDelete(changeKey)
                  .then(() => {
                    setLoading(false);
                    setEditOff(changeKey);
                  })
                  .catch(e => {
                    initConversation(changeKey);
                    setLoading(false);
                  });
              }
            }}
          >
            Add Comment
          </Button>
          <Button
            disabled={loading}
            className="submit"
            type="primary"
            onClick={() => {
              if (comments[0] && comments[0].trim() === "") {
                setLoading(true);
                onCommentDelete(changeKey).then(res => {
                  setLoading(false);
                });
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
