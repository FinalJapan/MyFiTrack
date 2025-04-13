let totalCalories = 0;
let mealList = [];
let calorieChart;
const STORAGE_KEY = "foodDB";
const MEAL_KEY = "mealList";

document.addEventListener("DOMContentLoaded", () => {
  const ageInput = document.getElementById("age");
  const heightInput = document.getElementById("height");
  const currentWeightInput = document.getElementById("currentWeight");
  const targetWeightInput = document.getElementById("targetWeight");
  const saveBtn = document.getElementById("saveWeight");
  const weightInfo = document.getElementById("weightInfo");
  const recommendedCalories = document.getElementById("recommendedCalories");

  const foodInput = document.getElementById("foodName");
  const calInput = document.getElementById("calories");
  const addBtn = document.getElementById("addMeal");
  const mealListEl = document.getElementById("mealList");
  const totalEl = document.getElementById("totalCalories");
  const suggestList = document.getElementById("suggestList");

  let foodDB = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { name: "ご飯", calories: 168 },
    { name: "味噌汁", calories: 40 },
    { name: "カレーライス", calories: 600 },
    { name: "焼き魚", calories: 180 },
    { name: "チキン南蛮", calories: 720 }
  ];

  // プロフィール復元
  const profile = JSON.parse(localStorage.getItem("profileData"));
  if (profile) {
    ageInput.value = profile.age;
    heightInput.value = profile.height;
    currentWeightInput.value = profile.current;
    targetWeightInput.value = profile.target;
    document.querySelector(`input[name="gender"][value="${profile.gender}"]`).checked = true;
    calculateGoal(profile.current, profile.target);
    calculateBMR(profile);
  }

  // 食事履歴復元
  const savedMeals = JSON.parse(localStorage.getItem(MEAL_KEY)) || [];
  mealList = savedMeals;
  renderMealList();

  // 保存ボタン
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
    localStorage.setItem("profileData", JSON.stringify(profile));
    calculateGoal(current, target);
    calculateBMR(profile);
  });

  function calculateGoal(current, target) {
    const diff = current - target;
    weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;
  }

  function calculateBMR({ age, gender, height, current }) {
    const bmr = gender === "male"
      ? 10 * current + 6.25 * height - 5 * age + 5
      : 10 * current + 6.25 * height - 5 * age - 161;
    const tdee = bmr * 1.5;
    recommendedCalories.textContent = `約 ${Math.round(tdee)} kcal / 日`;
    updateCalorieChart(getRecommendedValue(), totalCalories);
  }

  // サジェスト候補（クリックで即追加）
  foodInput.addEventListener("input", () => {
    const input = foodInput.value.trim();
    calInput.value = "";
    suggestList.innerHTML = "";
    if (input === "") return;

    const matched = foodDB.filter(item => item.name.includes(input));
    matched.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name}（${item.calories}kcal）`;
      li.addEventListener("click", () => {
        mealList.push({ food: item.name, cal: item.calories });
        localStorage.setItem(MEAL_KEY, JSON.stringify(mealList));
        renderMealList();

        if (!foodDB.find(f => f.name === item.name)) {
          foodDB.push(item);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(foodDB));
        }

        foodInput.value = "";
        calInput.value = "";
        suggestList.innerHTML = "";
      });
      suggestList.appendChild(li);
    });
  });

  // 手動追加ボタン
  addBtn.addEventListener("click", () => {
    const food = foodInput.value.trim();
    const cal = parseFloat(calInput.value);

    if (!food || isNaN(cal) || cal <= 0) {
      alert("有効なメニュー名とカロリーを入力してください");
      return;
    }

    mealList.push({ food, cal });
    localStorage.setItem(MEAL_KEY, JSON.stringify(mealList));
    renderMealList();

    foodInput.value = "";
    calInput.value = "";
    suggestList.innerHTML = "";
  });

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

  function getRecommendedValue() {
    const match = recommendedCalories.textContent.match(/([0-9]+)/);
    return match ? parseInt(match[1]) : 2000;
  }

  function updateCalorieChart(recommended, actual) {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    if (calorieChart) {
      calorieChart.data.datasets[0].data = [recommended, actual];
      calorieChart.update();
    } else {
      calorieChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['推奨', '実際'],
          datasets: [{
            label: 'カロリー (kcal)',
            data: [recommended, actual],
            backgroundColor: ['#00704A', '#f59e0b']
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              suggestedMax: recommended * 1.2
            }
          }
        }
      });
    }
  }

  // ログアウト処理
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
});
