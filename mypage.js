let totalCalories = 0;
let mealList = [];
let calorieChart;
const STORAGE_KEY = "foodDB";
const MEAL_KEY = "mealList";

// 🌟 グラフシャドウ
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

document.addEventListener("DOMContentLoaded", () => {
  const foodInput = document.getElementById("foodName");
  const calInput = document.getElementById("calories");
  const addBtn = document.getElementById("addMeal");
  const mealListEl = document.getElementById("mealList");
  const totalEl = document.getElementById("totalCalories");
  const suggestList = document.getElementById("suggestList");
  const recommendedCalories = document.getElementById("recommendedCalories");

  const ageInput = document.getElementById("age");
  const heightInput = document.getElementById("height");
  const currentWeightInput = document.getElementById("currentWeight");
  const targetWeightInput = document.getElementById("targetWeight");
  const weightInfo = document.getElementById("weightInfo");
  const saveBtn = document.getElementById("saveWeight");

  let foodDB = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { name: "ご飯", calories: 168 },
    { name: "味噌汁", calories: 40 },
    { name: "焼き魚", calories: 180 }
  ];

  // 🌟 プロフィール復元
  const profile = JSON.parse(localStorage.getItem("profileData"));
  if (profile) {
    ageInput.value = profile.age;
    heightInput.value = profile.height;
    currentWeightInput.value = profile.current;
    targetWeightInput.value = profile.target;
    document.querySelector(`input[name="gender"][value="${profile.gender}"]`).checked = true;
    updateGoal(profile.current, profile.target);
    calculateBMR(profile);
  }

  // 🌟 履歴復元
  mealList = JSON.parse(localStorage.getItem(MEAL_KEY)) || [];
  renderMealList();

  // 🌟 プロフィール保存
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
    updateGoal(current, target);
    calculateBMR(profile);
  });

  // 🌟 推奨カロリー計算
  function calculateBMR({ age, gender, height, current }) {
    const bmr = gender === "male"
      ? 10 * current + 6.25 * height - 5 * age + 5
      : 10 * current + 6.25 * height - 5 * age - 161;

    const tdee = Math.round(bmr * 1.5);
    recommendedCalories.textContent = `約 ${tdee} kcal / 日`;
    updateCalorieChart(tdee, totalCalories);
  }

  function updateGoal(current, target) {
    const diff = current - target;
    weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;
  }

  // 🌟 サジェスト
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
        foodInput.value = "";
        calInput.value = "";
        suggestList.innerHTML = "";
      });
      suggestList.appendChild(li);
    });
  });

  // 🌟 手動追加
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

  // 🌟 リスト描画
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

  // 🌟 グラフ描画
  function updateCalorieChart(recommended, actual) {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    const grad1 = ctx.createLinearGradient(0, 0, 300, 0);
    grad1.addColorStop(0, "#004d40");
    grad1.addColorStop(1, "#26a69a");

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

  // 🌟 ログアウト
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
});
