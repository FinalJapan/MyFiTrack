let totalCalories = 0;
let mealList = [];
const STORAGE_KEY = "foodDB";

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

  let foodDB = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { name: "ご飯", calories: 168 },
    { name: "味噌汁", calories: 40 },
    { name: "カレーライス", calories: 600 },
    { name: "焼き魚", calories: 180 },
    { name: "チキン南蛮", calories: 720 }
  ];

  saveBtn.addEventListener("click", () => {
    const age = parseInt(ageInput.value);
    const gender = document.querySelector("input[name='gender']:checked").value;
    const height = parseFloat(heightInput.value);
    const current = parseFloat(currentWeightInput.value);
    const target = parseFloat(targetWeightInput.value);

    if (!isNaN(current) && !isNaN(target)) {
      calculateGoal(current, target);
    }

    if (!isNaN(age) && !isNaN(height) && !isNaN(current)) {
      const profile = { age, gender, height, current, target };
      localStorage.setItem("profileData", JSON.stringify(profile));
      calculateBMR(profile);
    }
  });

  function calculateGoal(current, target) {
    const diff = current - target;
    weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;
  }

  function calculateBMR(profile) {
    const { age, gender, height, current } = profile;
    let bmr;

    if (gender === "male") {
      bmr = 10 * current + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * current + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * 1.5; // 軽い運動レベル
    recommendedCalories.textContent = `推奨摂取カロリー: 約 ${Math.round(tdee)} kcal / 日`;
  }

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
        addMealDirect(item.name, item.calories);
      });
      suggestList.appendChild(li);
    });
  });

  document.addEventListener("click", (e) => {
    if (!suggestList.contains(e.target) && e.target !== foodInput) {
      suggestList.innerHTML = "";
    }
  });

  addBtn.addEventListener("click", () => {
    const food = foodInput.value.trim();
    const cal = parseFloat(calInput.value);
    if (food && !isNaN(cal)) {
      addMealDirect(food, cal);
    }
  });

  function addMealDirect(food, cal) {
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

    foodInput.value = "";
    calInput.value = "";
    suggestList.innerHTML = "";
  }

  // ログアウト処理
  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
