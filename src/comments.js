import React, { useState, useCallback } from "react";
import { Button, Input } from "antd";
import { useImmer } from "./hooks";
import { Edit, Delete } from "react-feather";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMde from "react-mde";
import {PrimaryButton} from 'ui-kit/lib'

export const useConversations = () => {
  const [conversations, dispatch] = useImmer((state, action) => {
    switch (action.type) {
      case "INIT":
        state[action.payload.key] = { comments: [] };
        break;
      case "COMMENT": {
        console.log(action.payload);
        const { key, content } = action.payload;
        const conversation = state[key];
        conversation.comments.push(content);
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
  return [conversations, { initConversation, addComment }];
};

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

const Comment = ({ content }) => (
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
          <Edit size="15" />
          <Delete size="15" />
        </div>
      </div>
      <div 
        style={{
            marginTop:'-19px'
        }}
        dangerouslySetInnerHTML={{
          __html: converter.makeHtml(content)
        }}
      ></div>
    </div>
  </div>
);

const Editor = ({ onSubmit }) => {
  const [value, setValue] = useState("");
  const updateValue = useCallback(e => setValue(e.target.value), []);
  const submitDraft = useCallback(() => {
    onSubmit(value);
    setValue("");
  }, [value, onSubmit]);

  return (
    <div id="editor">
      <Input.TextArea rows={4} value={value} onChange={updateValue} />

      <Button className="submit" type="primary" onClick={submitDraft}>
        Add Comment
      </Button>
    </div>
  );
};

export const Conversation = ({ changeKey, comments, onSubmitComment }) => {
  const [value, setValue] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("write");
  const submitComment = useCallback(
    content => onSubmitComment(changeKey, content),
    [changeKey, onSubmitComment]
  );
  return (
    <div className="conversation">
      {comments.length >= 1 &&
        comments.map((comment, i) => <Comment key={i} content={comment} />)}

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
        </div>
      )}
    </div>
  );
};
