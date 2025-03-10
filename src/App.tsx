import { useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("Firebase、マジ神");
  const [userTitle, setUserTitle] = useState("");

  // ユーザー入力のハンドリング
  function handleOnChangeUserTitle(newTitle: string) {
    setUserTitle(newTitle);
  }

  // タイトルの変更
  function handleOnSendTitle() {
    setTitle(userTitle);
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