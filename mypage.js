const STORAGE_KEY = "foodDB";
const PROFILE_KEY = "profileData";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  const ageInput = document.getElementById("age");
  const heightInput = document.getElementById("height");
  const currentWeightInput = document.getElementById("currentWeight");
  const targetWeightInput = document.getElementById("targetWeight");
  const genderInputs = document.getElementsByName("gender");

  const saveBtn = document.getElementById("saveProfile");
  const weightInfo = document.getElementById("weightInfo");
  const bmrInfo = document.getElementById("bmrInfo");

  const foodInput = document.getElementById("foodName");
  const calInput = document.getElementById("calories");
  const addBtn = document.getElementById("addMeal");
  const mealListEl = document.getElementById("mealList");
  const totalEl = document.getElementById("totalCalories");
  const suggestList = document.getElementById("suggestList");

  let totalCalories = 0;
  let mealList = [];

  let foodDB = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { name: "ご飯", calories: 168 },
    { name: "味噌汁", calories: 40 },
    { name: "カレーライス", calories: 600 },
    { name: "焼き魚", calories: 180 },
    { name: "チキン南蛮", calories: 720 }
  ];

  // 初期表示：プロフィール読み込み
  const profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
  if (profile) {
    ageInput.value = profile.age;
    heightInput.value = profile.height;
    currentWeightInput.value = profile.current;
    targetWeightInput.value = profile.target;
    [...genderInputs].forEach(r => {
      if (r.value === profile.gender) r.checked = true;
    });
    updateWeightInfo(profile);
  }

  saveBtn.addEventListener("click", () => {
    const age = parseInt(ageInput.value);
    const height = parseFloat(heightInput.value);
    const current = parseFloat(currentWeightInput.value);
    const target = parseFloat(targetWeightInput.value);
    const gender = [...genderInputs].find(r => r.checked)?.value;

    if (!isNaN(age) && !isNaN(height) && !isNaN(current) && !isNaN(target)) {
      const profileData = { age, height, current, target, gender };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
      updateWeightInfo(profileData);
    }
  });

  function updateWeightInfo({ age, height, current, target, gender }) {
    const diff = current - target;
    weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;

    // BMR計算：ハリス・ベネディクト式
    let bmr = gender === "female"
      ? 655 + 9.6 * current + 1.8 * height - 4.7 * age
      : 66 + 13.7 * current + 5.0 * height - 6.8 * age;

    const daily = bmr * 1.55;
    bmrInfo.textContent = `推奨摂取カロリー：約 ${Math.round(daily)} kcal / 日`;
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

  logoutBtn.addEventListener("click", () => {
    window.location.href = "index.html"; // ログイン画面に戻る
  });
});
