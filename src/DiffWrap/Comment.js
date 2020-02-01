import React from "react";
import { Edit, Delete } from "react-feather";
import converter from "./utils";

const Comment = ({
  content,
  deleteComment,
  changeKey,
  editComment,
  enableComment,
  initConversation
}) => (
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
        {enableComment && (
          <div className="icons_box">
            <Edit onClick={() => initConversation(changeKey)} size="15" />
            <Delete
              onClick={() => deleteComment(undefined, changeKey)}
              size="15"
            />
          </div>
        )}
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

export default Comment;
