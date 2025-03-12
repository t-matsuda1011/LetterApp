import { useState, useEffect } from "react";
import "./App.css";
import { where, getDocs, collection, addDoc, query, orderBy, serverTimestamp, onSnapshot, DocumentSnapshot, DocumentData, doc, deleteDoc } from "firebase/firestore";
import { database } from "./firebaseApp";
import CommentItem from "./CommentItem";

const COLLECTION_NAME = "comments";  // コレクション名

// Firestore に格納されるデータの型定義
export type Comment = {
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

export async function deleteComment(commentId: string) {
  const commentDocRef = doc(database, "comments", commentId);

  // まず親コメントを削除
  await deleteDoc(commentDocRef);

  // 子コメントを取得
  const repliesQuery = query(
    collection(database, "comments"),
    where("parentId", "==", commentId)
  );

  const replySnapshots = await getDocs(repliesQuery);

  // 子コメントも削除
  const deletePromises = replySnapshots.docs.map((docSnapshot) =>
    deleteDoc(doc(database, "comments", docSnapshot.id))
  );

  await Promise.all(deletePromises);
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
        <div key={reply.id}>
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
        </div>
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
            <li key={comment.id} className="comment_wrapper">
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

export default App;