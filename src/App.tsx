import { useState, useEffect } from "react";
import "./App.css";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { database } from "./firebaseApp";

const COLLECTION_NAME = "title";  // コレクション名
const UNIQUE_DATA_ID = "unique";  // ドキュメントID

// Firestore に格納されるデータの型定義
type Data = {
  title: string;
};

// Firestore 上のタイトルデータを更新する
function updateData(newTitle: string) {
  const dataDoc = doc(database, COLLECTION_NAME, UNIQUE_DATA_ID);
  const data: Data = {
    title: newTitle,
  };
  setDoc(dataDoc, data);
}

function App() {
  const [title, setTitle] = useState("Firebase、マジ神");
  const [userTitle, setUserTitle] = useState("");

  // ドキュメントリスナーの生成
  useEffect(() => {
    const dataDoc = doc(database, COLLECTION_NAME, UNIQUE_DATA_ID);
    const unsubscribe = onSnapshot(dataDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Data;
        setTitle(data.title);
      }
      return () => unsubscribe();
    });
  }, []);

  // ユーザー入力のハンドリング
  function handleOnChangeUserTitle(newTitle: string) {
    setUserTitle(newTitle);
  }

  // タイトルの変更
  function handleOnSendTitle() {
    updateData(userTitle);
    setUserTitle("");
  }

  return (
    <>
      <div>
        タイトル争奪戦
        <h1>{title}</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            type="text"
            id="new-title"
            name="new-title"
            value={userTitle}
            onChange={(e) => handleOnChangeUserTitle(e.target.value)}
          />
          <input
            type="button"
            id="change-title"
            name="change-title"
            value="書き換える"
            minLength={50}
            onClick={() => handleOnSendTitle()}
          />
        </div>
      </div>
    </>
  );
}

export default App;