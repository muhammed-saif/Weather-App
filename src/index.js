// ---------- Light / Dark mode ----------
const lightDarkBtn = document.getElementById("light-dark-btn");
const htmlTag = document.documentElement;

if (localStorage.getItem("theme") === "dark") {
    htmlTag.classList.add("dark");
}

lightDarkBtn.addEventListener("click", function () {
    htmlTag.classList.toggle("dark");
    if (htmlTag.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

// ---------- Elements ----------
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");

const cityName = document.getElementById("cityName");
const todayDate = document.getElementById("todayDate");
const weatherIcon = document.getElementById("weatherIcon");
const temp = document.getElementById("temp");
const weatherText = document.getElementById("weatherText");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const highLow = document.getElementById("highLow");

const forecastDays = document.querySelectorAll(".forecast-day");
const forecastIcons = document.querySelectorAll(".forecast-icon");
const forecastTemps = document.querySelectorAll(".forecast-temp");

// ---------- Weather code -> text + icon ----------
function getWeatherInfo(code) {
    if (code === 0) return ["Clear sky", "☀️"];
    if (code <= 2) return ["Partly cloudy", "⛅"];
    if (code === 3) return ["Cloudy", "☁️"];
    if (code <= 48) return ["Foggy", "🌫️"];
    if (code <= 57) return ["Drizzle", "🌦️"];
    if (code <= 67) return ["Rain", "🌧️"];
    if (code <= 77) return ["Snow", "❄️"];
    if (code <= 82) return ["Rain showers", "🌧️"];
    if (code <= 86) return ["Snow showers", "🌨️"];
    return ["Thunderstorm", "⛈️"];
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
}

// ---------- Get the weather ----------
async function getWeather(city) {
    errorMsg.classList.add("hidden");

    try {
        // 1. find the city (latitude and longitude)
        const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1");
        const geoData = await geoRes.json();

        if (!geoData.results) {
            showError("City not found. Check the spelling and try again.");
            return;
        }
        const place = geoData.results[0];

        // 2. get the weather for that place
        const url = "https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude + "&longitude=" + place.longitude
            + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code"
            + "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto";
        const res = await fetch(url);
        const data = await res.json();

        showWeather(place, data);
        localStorage.setItem("lastCity", place.name);
    } catch (error) {
        showError("Could not load the weather. Check your internet and try again.");
    }
}

// ---------- Show the data on the page ----------
function showWeather(place, data) {
    const now = data.current;
    const daily = data.daily;
    const info = getWeatherInfo(now.weather_code);

    cityName.textContent = place.name + ", " + place.country;
    todayDate.textContent = new Date(daily.time[0]).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
    weatherIcon.textContent = info[1];
    temp.textContent = Math.round(now.temperature_2m) + "°C";
    weatherText.textContent = info[0];

    feelsLike.textContent = Math.round(now.apparent_temperature) + "°C";
    humidity.textContent = now.relative_humidity_2m + "%";
    wind.textContent = Math.round(now.wind_speed_10m) + " km/h";
    highLow.textContent = Math.round(daily.temperature_2m_max[0]) + "° / " + Math.round(daily.temperature_2m_min[0]) + "°";

    // forecast cards: day 1 to day 5 (day 0 is today)
    for (let i = 0; i < 5; i++) {
        const dayInfo = getWeatherInfo(daily.weather_code[i + 1]);
        forecastDays[i].textContent = new Date(daily.time[i + 1]).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
        forecastIcons[i].textContent = dayInfo[1];
        forecastTemps[i].textContent = Math.round(daily.temperature_2m_max[i + 1]) + "° / " + Math.round(daily.temperature_2m_min[i + 1]) + "°";
    }
}

// ---------- Search ----------
searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please type a city name.");
        return;
    }
    getWeather(city);
});

cityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// ---------- First load ----------
getWeather(localStorage.getItem("lastCity") || "London");
