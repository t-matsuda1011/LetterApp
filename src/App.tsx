import { useState, useEffect } from "react";
import "./App.css";
import { collection, addDoc, query, orderBy, limit, serverTimestamp, onSnapshot } from "firebase/firestore";
import { database } from "./firebaseApp";

const COLLECTION_NAME = "comments";  // コレクション名

// Firestore に格納されるデータの型定義
type Comment = {
  text: string;
  createdAt: any;
};

// Firestore 上のタイトルデータを更新する
async function addComment(newText: string) {
  const commentsCollecion = collection(database, COLLECTION_NAME);
  await addDoc(commentsCollecion, {
    text: newText,
    createdAt: serverTimestamp(), //firestoreのタイムスタンプ型
  });
}

function App() {
  const [comments, setComments] = useState<Comment[]>([]); //感想一覧
  const [userText, setUserText] = useState("");

  // ドキュメントリスナーの生成
  useEffect(() => {
    const commentsCollecion = collection(database, COLLECTION_NAME);
    const q = query(commentsCollecion, orderBy("createdAt", "desc"), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((doc) => {
        const data = doc.data() as Comment;
        return {
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      });
      
      setComments(commentList);
    });

    return () => unsubscribe();
  }, []);

  // ユーザー入力の処理
  function handleOnChangeUserText(newText: string) {
    setUserText(newText);
  }

  // 感想をfirestoreに追加
  async function handleOnSendComment() {
    if (userText.trim() === "") return;
    await addComment(userText);
    setUserText("");
  }

  console.log(comments)
  return (
    <>
      <div>
        <h1 className="title">TimeLine</h1>
        <h3 className="sub_title">Try writing something! 👇</h3>
        <div className="comment_box">
          <textarea
            className="comment_area"
            placeholder="Write here"
            value={userText}
            onChange={(e) => handleOnChangeUserText(e.target.value)}
          />
          <button className="comment_btn" onClick={() => handleOnSendComment()}>Post</button>
        </div>
        <ul className="comment_list">
          {comments.map((comment, index) => (
            <li className="comment_item" key={index}>
              <p className="comment_item__text" style={{ whiteSpace: "pre-wrap" }}>{comment.text}</p>
              <small className="comment_item__time">{comment.createdAt.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</small>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;