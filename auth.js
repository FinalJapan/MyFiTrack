const USER_STORAGE_KEY = "myfittrack-users";

// 📝 登録処理
document.getElementById("registerBtn").addEventListener("click", () => {
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;

  if (!username || !password) {
    alert("ユーザー名とパスワードを入力してください。");
    return;
  }

  const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};

  if (users[username]) {
    alert("このユーザー名はすでに使われています。");
    return;
  }

  users[username] = password;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  alert("登録が完了しました！");
});

// 🔐 ログイン処理
document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};

  if (users[username] && users[username] === password) {
    localStorage.setItem("currentUser", username);
    alert("ログイン成功！");
    window.location.href = "mypage.html"; // マイページへ遷移
  } else {
    alert("ユーザー名またはパスワードが間違っています。");
  }
});
