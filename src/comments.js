import React, { useState, useCallback } from "react";
import { Button, Input } from "antd";
import { useImmer } from "./hooks";
import { Edit, Delete } from "react-feather";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMde from "react-mde";

export const useConversations = () => {
  const [conversations, dispatch] = useImmer((state, action) => {
    switch (action.type) {
      case "INIT":
        state[action.payload.key] = { comments: [] };
        break;
      case "COMMENT": {
        const { key, content } = action.payload;
        const conversation = state[key];
        conversation.comments.push(content);
        break;
      }
      case "DELETE": {
        const { key } = action.payload;
        delete state[key];
        break;
      }
      case "EDIT": {
        const { key } = action.payload;
        state[key] = { comments: [] };
        break;
      }
      default:
        break;
    }
  }, {});
  const initConversation = useCallback(
    key => dispatch({ type: "INIT", payload: { key } }),
    [dispatch]
  );
  const addComment = useCallback(
    (key, content) => dispatch({ type: "COMMENT", payload: { key, content } }),
    [dispatch]
  );

  const deleteComment = useCallback(
    key => dispatch({ type: "DELETE", payload: { key } }),
    [dispatch]
  );
  const editComment = useCallback(
    key => dispatch({ type: "EDIT", payload: { key } }),
    [dispatch]
  );
  return [
    conversations,
    { initConversation, addComment, deleteComment, editComment }
  ];
};

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

const Comment = ({ content, deleteComment, changeKey, editComment }) => (
  <div className="comment">
    <div className="author_box">
      <img
        className="image_author"
        src="https://user-images.githubusercontent.com/30566406/72879544-1b561f00-3d23-11ea-8f5a-275171924155.png"
        alt="author"
      ></img>
    </div>
    <div className="author_name">
      <div className="author_container">
        <p>Daniel</p>
        <div className="icons_box">
          <Edit onClick={() => editComment(changeKey)} size="15" />
          <Delete onClick={() => deleteComment(changeKey)} size="15" />
        </div>
      </div>
      <div
        style={{
          marginTop: "-19px"
        }}
        dangerouslySetInnerHTML={{
          __html: converter.makeHtml(content)
        }}
      ></div>
    </div>
  </div>
);

export const Conversation = ({
  changeKey,
  comments,
  onSubmitComment,
  deleteComment,
  editComment
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
            textAreaProps={{
              "font-size": "14px"
            }}
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
            onClick={() => deleteComment(changeKey)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
