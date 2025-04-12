let totalCalories = 0;
let mealList = [];
const STORAGE_KEY = "foodDB";
const MEAL_KEY = "mealList";

// 初期化
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
  savedMeals.forEach(({ food, cal }) => addMealDirect(food, cal, false));

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
    recommendedCalories.textContent = `推奨摂取カロリー: 約 ${Math.round(tdee)} kcal / 日`;
  }

  // サジェスト表示
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
        foodInput.value = item.name;
        calInput.value = item.calories;
        suggestList.innerHTML = "";
      });
      suggestList.appendChild(li);
    });
  });

  // サジェスト非表示処理
  document.addEventListener("click", (e) => {
    if (!suggestList.contains(e.target) && e.target !== foodInput) {
      suggestList.innerHTML = "";
    }
  });

  // 食事追加
  addBtn.addEventListener("click", () => {
    const food = foodInput.value.trim();
    const cal = parseFloat(calInput.value);

    if (!food || isNaN(cal) || cal <= 0) {
      alert("有効なメニュー名とカロリーを入力してください");
      return;
    }

    addMealDirect(food, cal, true);
  });

  function addMealDirect(food, cal, save = true) {
    mealList.push({ food, cal });
    totalCalories += cal;

    const li = document.createElement("li");
    li.textContent = `${food}：${cal} kcal`;
    mealListEl.appendChild(li);
    totalEl.textContent = `合計: ${totalCalories} kcal`;

    if (!foodDB.find(item => item.name === food)) {
      foodDB.push({ name: food, calories: cal });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foodDB));
    }

    if (save) {
      localStorage.setItem(MEAL_KEY, JSON.stringify(mealList));
    }

    foodInput.value = "";
    calInput.value = "";
    suggestList.innerHTML = "";
  }

  // ログアウト処理
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
});
