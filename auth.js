const USER_STORAGE_KEY = "myfittrack-users";

// DOM取得簡略化関数
const $ = (id) => document.getElementById(id);

// パスワードのSHA-256ハッシュ化
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ローカルストレージからユーザーデータを取得
function getStoredUsers() {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};
}

// ストレージに保存
function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

// 登録処理
$("registerBtn").addEventListener("click", async () => {
  const username = $("registerUsername").value.trim();
  const password = $("registerPassword").value;

  if (!username || !password) {
    alert("ユーザー名とパスワードを入力してください。");
    return;
  }

  if (username.length < 3 || password.length < 6) {
    alert("ユーザー名は3文字以上、パスワードは6文字以上で入力してください。");
    return;
  }

  const users = getStoredUsers();

  if (users[username]) {
    alert("このユーザー名はすでに使われています。");
    return;
  }

  const hashed = await hashPassword(password);
  users[username] = hashed;
  saveUsers(users);

  alert("登録が完了しました！");
  $("registerUsername").value = "";
  $("registerPassword").value = "";
});

// ログイン処理
$("loginBtn").addEventListener("click", async () => {
  const username = $("loginUsername").value.trim();
  const password = $("loginPassword").value;

  if (!username || !password) {
    alert("ユーザー名とパスワードを入力してください。");
    return;
  }

  const users = getStoredUsers();

  if (!users[username]) {
    alert("ユーザー名が存在しません。");
    return;
  }

  const hashed = await hashPassword(password);
  if (users[username] === hashed) {
    localStorage.setItem("currentUser", username);
    alert("ログイン成功！");
    window.location.href = "index.html";
  } else {
    alert("パスワードが間違っています。");
  }
});
