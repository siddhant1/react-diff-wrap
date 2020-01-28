import { useCallback, useReducer } from "react";

export const useConversations = () => {
  const [conversations, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "INIT":
        return { ...state, [action.payload.key]: { comments: [] } };
      case "COMMENT": {
        const { key, content } = action.payload;
        return { ...state, [key]: { comments: [content] } };
      }
      case "DELETE": {
        const dup = { ...state };
        delete dup[action.payload.key];
        return dup;
      }
      case "EDIT": {
        const { key } = action.payload;
        return { ...state, [key]: { comments: [] } };
      }
      case "CLOSE": {
        if (action.payload.content === "") {
          const dup = { ...state };
          delete dup[action.payload.key];
          return dup;
        } else {
          return {
            ...state,
            [action.payload.key]: { comments: [action.payload.content] }
          };
        }
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

  const closeEditor = useCallback(
    (key, content) => dispatch({ type: "CLOSE", payload: { key, content } }),
    [dispatch]
  );
  return [
    conversations,
    { initConversation, addComment, deleteComment, editComment, closeEditor }
  ];
};
