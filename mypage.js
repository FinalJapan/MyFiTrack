let totalCalories = 0;
let mealList = [];
let calorieChart;

document.addEventListener("DOMContentLoaded", () => {
  // ✅ ログインチェック
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || !currentUser.username) {
    window.location.href = "login.html";
    return;
  }

  const USERNAME = currentUser.username;
  const STORAGE_KEY = `foodDB-${USERNAME}`;
  const MEAL_KEY = `mealList-${USERNAME}`;

  console.log("ログイン中ユーザー：", USERNAME);

  // DOM取得
  const $ = (id) => document.getElementById(id);
  const foodInput = $("foodName");
  const calInput = $("calories");
  const addBtn = $("addMeal");
  const mealListEl = $("mealList");
  const totalEl = $("totalCalories");
  const suggestList = $("suggestList");
  const recommendedCalories = $("recommendedCalories");

  const ageInput = $("age");
  const heightInput = $("height");
  const currentWeightInput = $("currentWeight");
  const targetWeightInput = $("targetWeight");
  const weightInfo = $("weightInfo");
  const saveBtn = $("saveWeight");

  // 🌟 グラフシャドウプラグイン
  const shadowPlugin = {
    id: 'barShadow',
    afterDatasetDraw(chart, args) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[args.index];
      ctx.save();
      args.meta.data.forEach((bar, i) => {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = dataset.backgroundColor[i];
        ctx.fillRect(bar.x - bar.width / 2, bar.y - bar.height / 2, bar.width, bar.height);
      });
      ctx.restore();
    }
  };

  // 📥 foodDBの読み込み（なければ初期化）
  let foodDB = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!foodDB || !Array.isArray(foodDB)) {
    foodDB = [
      { name: "ご飯", calories: 168 },
      { name: "味噌汁", calories: 40 },
      { name: "焼き魚", calories: 180 },
      { name: "カレーライス", calories: 600 }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foodDB));
  }

  // 📥 プロフィール読み込み
  const profile = JSON.parse(localStorage.getItem(`profileData-${USERNAME}`));
  if (profile) {
    ageInput.value = profile.age;
    heightInput.value = profile.height;
    currentWeightInput.value = profile.current;
    targetWeightInput.value = profile.target;
    document.querySelector(`input[name="gender"][value="${profile.gender}"]`).checked = true;
    updateGoal(profile.current, profile.target);
    calculateBMR(profile);
  }

  // 📥 mealList読み込み
  mealList = JSON.parse(localStorage.getItem(MEAL_KEY)) || [];
  renderMealList();

  // 💾 プロフィール保存
  saveBtn.addEventListener("click", () => {
    const age = parseInt(ageInput.value);
    const gender = document.querySelector("input[name='gender']:checked").value;
    const height = parseFloat(heightInput.value);
    const current = parseFloat(currentWeightInput.value);
    const target = parseFloat(targetWeightInput.value);

    if ([age, height, current, target].some(v => isNaN(v) || v <= 0)) {
      alert("年齢・身長・体重は正の数で入力してください");
      return;
    }

    const profile = { age, gender, height, current, target };
    localStorage.setItem(`profileData-${USERNAME}`, JSON.stringify(profile));
    updateGoal(current, target);
    calculateBMR(profile);
  });

  // 🔢 BMR計算
  function calculateBMR({ age, gender, height, current }) {
    const bmr = gender === "male"
      ? 10 * current + 6.25 * height - 5 * age + 5
      : 10 * current + 6.25 * height - 5 * age - 161;
    const tdee = Math.round(bmr * 1.5);
    recommendedCalories.textContent = `約 ${tdee} kcal / 日`;
    updateCalorieChart(tdee, totalCalories);
  }

  // 🎯 目標体重差を表示
  function updateGoal(current, target) {
    const diff = current - target;
    weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;
  }

  // 🔍 サジェスト機能
  foodInput.addEventListener("input", () => {
    const input = foodInput.value.trim().toLowerCase();
    calInput.value = "";
    suggestList.innerHTML = "";
    if (input === "") return;

    const matched = foodDB.filter(item => item.name.toLowerCase().includes(input));
    if (matched.length === 0) {
      const noResult = document.createElement("li");
      noResult.textContent = "該当するメニューがありません";
      noResult.className = "px-3 py-2 text-gray-500";
      suggestList.appendChild(noResult);
      return;
    }

    matched.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name}（${item.calories}kcal）`;
      li.className = "cursor-pointer hover:bg-green-100 px-3 py-2 transition";
      li.addEventListener("click", () => {
        mealList.push({ food: item.name, cal: item.calories });
        localStorage.setItem(MEAL_KEY, JSON.stringify(mealList));
        renderMealList();
        foodInput.value = "";
        calInput.value = "";
        suggestList.innerHTML = "";
      });
      suggestList.appendChild(li);
    });
  });

  // 📤 サジェスト外クリック時に閉じる
  document.addEventListener("click", (e) => {
    if (!suggestList.contains(e.target) && e.target !== foodInput) {
      suggestList.innerHTML = "";
    }
  });

  // ➕ 食事追加（手動入力）
  addBtn.addEventListener("click", () => {
    const food = foodInput.value.trim();
    const cal = parseFloat(calInput.value);
    if (!food || isNaN(cal) || cal <= 0) {
      alert("有効なメニュー名とカロリーを入力してください");
      return;
    }

    // 🌟 mealListに追加
    mealList.push({ food, cal });
    localStorage.setItem(MEAL_KEY, JSON.stringify(mealList));

    // 🌟 foodDBに登録（未登録のときのみ）
    if (!foodDB.some(item => item.name === food)) {
      foodDB.push({ name: food, calories: cal });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foodDB));
    }

    renderMealList();
    foodInput.value = "";
    calInput.value = "";
    suggestList.innerHTML = "";
  });

  // 📋 食事リスト描画
  function renderMealList() {
    mealListEl.innerHTML = "";
    totalCalories = 0;
    mealList.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center";
      const text = document.createElement("span");
      text.textContent = `${item.food}：${item.cal} kcal`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.className = "text-red-600 ml-2 hover:text-red-800";
      delBtn.onclick = () => {
        mealList.splice(index, 1);
        localStorage.setItem(MEAL_KEY, JSON.stringify(mealList));
        renderMealList();
      };

      li.appendChild(text);
      li.appendChild(delBtn);
      mealListEl.appendChild(li);
      totalCalories += item.cal;
    });

    totalEl.textContent = `合計: ${totalCalories} kcal`;
    updateCalorieChart(getRecommendedValue(), totalCalories);
  }

  // 🔢 推奨カロリー数値だけ取得
  function getRecommendedValue() {
    const match = recommendedCalories.textContent.match(/([0-9]+)/);
    return match ? parseInt(match[1]) : 2000;
  }

  // 📊 グラフ更新
  function updateCalorieChart(recommended, actual) {
    const ctx = document.getElementById('calorieChart').getContext('2d');

    const grad1 = ctx.createLinearGradient(0, 0, 300, 0);
    grad1.addColorStop(0, "#1d4ed8");
    grad1.addColorStop(1, "#60a5fa");

    const grad2 = ctx.createLinearGradient(0, 0, 300, 0);
    grad2.addColorStop(0, "#f59e0b");
    grad2.addColorStop(1, "#fcd34d");

    if (calorieChart) {
      calorieChart.data.datasets[0].data = [recommended, actual];
      calorieChart.data.datasets[0].backgroundColor = [grad1, grad2];
      calorieChart.update();
    } else {
      calorieChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['推奨', '実際'],
          datasets: [{
            data: [recommended, actual],
            backgroundColor: [grad1, grad2]
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
              anchor: 'center',
              align: 'center',
              color: '#fff',
              font: { weight: 'bold', size: 12 },
              formatter: (value) => `${value} kcal`
            }
          },
          scales: {
            x: { beginAtZero: true, display: false }
          }
        },
        plugins: [ChartDataLabels, shadowPlugin]
      });
    }
  }

  // 🔒 ログアウト処理
  $("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
});
