import React, { useState, useCallback } from "react";
import { useImmer } from "./useImmer";

export const useConversations = () => {
  const [conversations, dispatch] = useImmer((state, action) => {
    switch (action.type) {
      case "INIT":
        console.log(action.payload.key)
        state[action.payload.key] = { comments: [], editMode: true };
        break;
      case "COMMENT": {
        const { key, content } = action.payload;
        const conversation = state[key];
        conversation.comments = [];
        conversation.comments.push(content);
        conversation.editMode = false;
        break;
      }
      case "DELETE": {
        const { key } = action.payload;
        delete state[key];
        break;
      }
      case "EDIT": {
        const { key } = action.payload;
        state[key] = { ...state[key], editMode: true };
        break;
      }
      case "CANCEL": {
        const { key } = action.payload;
        state[key] = { ...state[key], editMode: false };
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

  const cancelAction = useCallback(
    key => dispatch({ type: "CANCEL", payload: { key } }),
    [dispatch]
  );
  return [
    conversations,
    { initConversation, addComment, deleteComment, editComment, cancelAction }
  ];
};
