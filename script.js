let totalCalories = 0;
let mealList = [];
const STORAGE_KEY = "foodDB";

document.addEventListener("DOMContentLoaded", () => {
    const currentWeightInput = document.getElementById("currentWeight");
    const targetWeightInput = document.getElementById("targetWeight");
    const saveBtn = document.getElementById("saveWeight");
    const weightInfo = document.getElementById("weightInfo");

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

    saveBtn.addEventListener("click", () => {
        const current = parseFloat(currentWeightInput.value);
        const target = parseFloat(targetWeightInput.value);
        if (!isNaN(current) && !isNaN(target)) {
            const diff = current - target;
            weightInfo.textContent = `目標まであと ${diff.toFixed(1)}kg`;
            localStorage.setItem("weightData", JSON.stringify({ current, target }));
        }
    });

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
});
