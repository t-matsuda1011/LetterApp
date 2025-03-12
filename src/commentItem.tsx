import React from "react";
import { Comment, deleteComment } from "./App";

type CommentItemProps = {
  comment: Comment;
  comments: Comment[];
  setReplyTo: (id: string | null) => void;
  replyTo: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleOnSendComment: (parentId: string | null) => void;
};

function CommentItem({
  comment,
  comments,
  setReplyTo,
  replyTo,
  replyText,
  setReplyText,
  handleOnSendComment,
}: CommentItemProps) {
  const parentComment = comment.parentId
    ? comments.find((c) => c.id === comment.parentId)
    : null;

  const truncateText = (text: string, length: number = 30) => {
    return text.length > length ? `${text.slice(0, length)}...` : text;
  };

  const handleDelete = async () => {
    if (window.confirm("本当に削除しますか？")) {
      await deleteComment(comment.id);  // Firestore から削除
    }
  };

  return (
    <div className={`comment_item ${comment.parentId ? "reply_comment" : ""}`}>
      {parentComment && (
        <span className="reply_label">
          ↳ Reply to {" "}
          <span className="reply_to_text">
            「 {truncateText(parentComment.text, 30)} 」
          </span>
        </span>
      )}
      <p className="comment_item__text">{comment.text}</p>
      <div className="sub_text__box">
        <small className="comment_item__time">
          {comment.createdAt.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
        </small>
        <button className="reply_btn" onClick={() => setReplyTo(comment.id)}>
          Reply
        </button>
        <button className="delete_btn" onClick={handleDelete}>
          Delete
        </button>
      </div>

      {replyTo === comment.id && (
        <div className="reply_box">
          <textarea
            className="reply_area"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="reply_btn_box">
            <button
                className="reply_submit_btn"
                onClick={() => handleOnSendComment(comment.id)}
            >
                Post
            </button>
            <button className="cancel_btn" onClick={() => setReplyTo(null)}>
                Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentItem;
