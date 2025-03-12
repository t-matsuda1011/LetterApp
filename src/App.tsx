import { useState, useEffect } from "react";
import "./App.css";
import { collection, addDoc, query, orderBy, serverTimestamp, onSnapshot, DocumentSnapshot, DocumentData } from "firebase/firestore";
import { database } from "./firebaseApp";

const COLLECTION_NAME = "comments";  // コレクション名

// Firestore に格納されるデータの型定義
type Comment = {
  id: string;
  text: string;
  createdAt: any;
  parentId: string | null;
};

// Firestore 上のタイトルデータを更新する
async function addComment(newText: string, parentId: string | null = null) {
  const commentsCollecion = collection(database, COLLECTION_NAME);
  const docRef = await addDoc(commentsCollecion, {
    text: newText,
    createdAt: serverTimestamp(), //firestoreのタイムスタンプ型
    parentId: parentId || null,
  });
  return docRef.id;
}

function App() {
  const [comments, setComments] = useState<Comment[]>([]); //感想一覧
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newPostText, setNewPostText] = useState("");

  // ドキュメントリスナーの生成
  useEffect(() => {
    const commentsCollecion = collection(database, COLLECTION_NAME);
    const q = query(commentsCollecion, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList : Comment[] = snapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        if (!data) {
          return {
            id: doc.id,
            text: "",
            createdAt: new Date(),
            parentId: null,
          };
        }
        return {
          id: doc.id,
          text: data.text || "",
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          parentId: data.parentId || null,
        };
      });

      setComments(commentList);
    });

    return () => unsubscribe();
  }, []);

  // 感想をfirestoreに追加
  async function handleOnSendComment() {
    if (replyText.trim() === "") return;
    await addComment(replyText, replyTo);
    setReplyText("");
    setReplyTo(null);
  }

  async function handleNewPost() {
    if (newPostText.trim() === "") return;
    await addComment(newPostText, null);
    setNewPostText("");
  }

  console.log(comments);

  // 親コメントとそのリプライを表示する関数
  const renderReplies = (parentId: string) => {
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((reply) => (
        <li key={reply.id}>
          <CommentItem
            comment={reply}
            comments={comments}
            setReplyTo={setReplyTo}
            replyTo={replyTo}
            replyText={replyText}
            setReplyText={setReplyText}
            handleOnSendComment={handleOnSendComment}
          />
          {/* さらにそのリプライへのリプライも表示 */}
          {renderReplies(reply.id)}
        </li>
      ));
  };

  return (
    <div>
      <h1 className="title">TimeLine</h1>
      <h3 className="sub_title">Try writing something! 👇</h3>

      <ul className="comment_list">
        {comments
          .filter((comment) => comment.parentId === null) // 親コメントだけ最初に表示
          .map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                comments={comments}
                setReplyTo={setReplyTo}
                replyTo={replyTo}
                replyText={replyText}
                setReplyText={setReplyText}
                handleOnSendComment={handleOnSendComment}
              />
              {/* 親コメントにリプライがあればその下に表示 */}
              {renderReplies(comment.id)}
            </li>
          ))}
      </ul>

      <div className="fixed_post_area">
        <textarea 
          className="new_post_input"
          placeholder="Write something..."
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
        />
        <button className="post_btn" onClick={handleNewPost}>Post</button>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  comments,  // コメントリストを受け取る
  setReplyTo,
  replyTo,
  replyText,
  setReplyText,
  handleOnSendComment,
}: {
  comment: Comment;
  comments: Comment[];  // コメントリストを受け取る
  setReplyTo: (id: string | null) => void;
  replyTo: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleOnSendComment: (parentId: string | null) => void;
}) {
  // 親コメント（リプライ先）のテキストを取得
  const parentComment = comment.parentId
    ? comments.find((c) => c.id === comment.parentId)
    : null;

  // テキストが長すぎる場合、省略する関数
  const truncateText = (text: string, length: number = 30) => {
    return text.length > length ? `${text.slice(0, length)}...` : text;
  };

  return (
    <li className={`comment_item ${comment.parentId ? "reply_comment" : ""}`}>
      {parentComment && (
        <span className="reply_label">
          ↪ Reply to {" "}
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
        <button className="reply_btn" onClick={() => setReplyTo(comment.id)}>Reply</button>
      </div>

      {replyTo === comment.id && (
        <div className="reply_box">
          <textarea
            className="reply_area"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className="reply_submit_btn" onClick={() => handleOnSendComment(comment.id)}>
            Reply
          </button>
          <button className="cancel_btn" onClick={() => setReplyTo(null)}>Cancel</button>
        </div>
      )}
    </li>
  );
}



export default App;