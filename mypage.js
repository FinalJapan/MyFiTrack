let totalCalories = 0;
let mealList = [];
const STORAGE_KEY = "foodDB";

document.addEventListener("DOMContentLoaded", () => {
  const ageEl = document.getElementById("age");
  const heightEl = document.getElementById("height");
  const currentEl = document.getElementById("currentWeight");
  const targetEl = document.getElementById("targetWeight");
  const saveBtn = document.getElementById("saveWeight");
  const weightInfo = document.getElementById("weightInfo");
  const bmrInfo = document.getElementById("bmrInfo");

  const foodInput = document.getElementById("foodName");
  const calInput = document.getElementById("calories");
  const addBtn = document.getElementById("addMeal");
  const mealListEl = document.getElementById("mealList");
  const totalEl = document.getElementById("totalCalories");
  const suggestList = document.getElementById("suggestList");

  // DBに保存してある食品候補
  let foodDB = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { name: "ご飯", calories: 168 },
    { name: "味噌汁", calories: 40 },
    { name: "カレーライス", calories: 600 },
    { name: "焼き魚", calories: 180 },
    { name: "チキン南蛮", calories: 720 }
  ];

  // weightData 読み込み
  const stored = JSON.parse(localStorage.getItem("profileData"));
  if (stored) {
    ageEl.value = stored.age;
    heightEl.value = stored.height;
    currentEl.value = stored.current;
    targetEl.value = stored.target;
    document.querySelector(`input[name="gender"][value="${stored.gender}"]`).checked = true;

    const diff = stored.current - stored.target;
    weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;

    const bmr = calculateBMR(stored);
    bmrInfo.textContent = `推奨摂取カロリー：約 ${Math.round(bmr)} kcal / 日`;
  }

  // 保存ボタン
  saveBtn.addEventListener("click", () => {
    const age = parseInt(ageEl.value);
    const height = parseFloat(heightEl.value);
    const current = parseFloat(currentEl.value);
    const target = parseFloat(targetEl.value);
    const gender = document.querySelector('input[name="gender"]:checked').value;

    if (!isNaN(age) && !isNaN(height) && !isNaN(current) && !isNaN(target)) {
      const diff = current - target;
      weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;

      const bmr = calculateBMR({ age, height, current, gender });
      bmrInfo.textContent = `推奨摂取カロリー：約 ${Math.round(bmr)} kcal / 日`;

      localStorage.setItem("profileData", JSON.stringify({ age, height, current, target, gender }));
    }
  });

  // BMR × 活動係数 で推奨摂取カロリー計算
  function calculateBMR({ age, height, current, gender }) {
    if (gender === "male") {
      return (10 * current + 6.25 * height - 5 * age + 5) * 1.55;
    } else {
      return (10 * current + 6.25 * height - 5 * age - 161) * 1.55;
    }
  }

  // サジェスト
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

  // サジェスト消す
  document.addEventListener("click", (e) => {
    if (!suggestList.contains(e.target) && e.target !== foodInput) {
      suggestList.innerHTML = "";
    }
  });

  // 追加ボタン
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
});
