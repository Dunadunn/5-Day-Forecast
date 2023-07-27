const apiKey = 'da9c0a991d2933627af49773149c22f8';

function fetchWeatherData(cityName) {
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            const lat = data[0].lat;
            const lon = data[0].lon;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

            // Second fetch required to get the weather forecast
            return fetch(forecastUrl);
        })
        .then(response => response.json())
        .then(data => {
            // save search history
            const history = loadSearchHistory();
            if (!history.includes(cityName)) {
                history.push(cityName);
                saveSearchHistory(history);
            }

            displayCurrentWeather(data);
            displayForecast(data);

            // Needed to update the search history display
            displaySearchHistory();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('City not found. Please enter a valid city name.');
        });
}

//Converting the date given from the API into weekdays
function getWeekday(dateString) {
    const date = new Date(dateString);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getDay()];
}

// Fahrenheit is common in the US so we'll convert from Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9/5) + 32;
}

function displayCurrentWeather(data) {
    const currentWeatherSection = document.getElementById('current-weather');
    const temperatureF = kelvinToFahrenheit(data.list[0].main.temp).toFixed(2);  // Convert to Fahrenheit and round to 2 decimal places
    currentWeatherSection.innerHTML = `
        <h3>${data.city.name}, ${data.city.country}</h3>
        <p>${data.list[0].dt_txt}</p>
        <img src="http://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png">
        <p>Temperature: ${temperatureF} °F</p>
        <p>Humidity: ${data.list[0].main.humidity}%</p>
        <p>Wind Speed: ${data.list[0].wind.speed} m/s</p>
    `;
}

function displayForecast(data) {
    const forecastSection = document.getElementById('forecast');
    forecastSection.innerHTML = '';  // used to clear previous forecast

    for (let i = 0; i < data.list.length; i += 8) { 
        const forecast = data.list[i];
        const date = forecast.dt_txt;
        const weekday = getWeekday(date);
        const temperatureF = kelvinToFahrenheit(forecast.main.temp).toFixed(2);  // This should convert to Fahrenheit and round to 2 decimal places
        const forecastElement = document.createElement('div');
        forecastElement.innerHTML = `
            <h4>${weekday}</h4>
            <img src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png">
            <p>Temperature: ${temperatureF} °F</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
            <p>Wind Speed: ${forecast.wind.speed} m/s</p>
        `;
        forecastSection.appendChild(forecastElement);
    }
}



document.getElementById('search-button').addEventListener('click', function() {
    const cityName = document.getElementById('search-input').value;
    fetchWeatherData(cityName);
});

function saveSearchHistory(history) {
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function loadSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
}

function displaySearchHistory() {
    const history = loadSearchHistory();
    const historyDiv = document.getElementById('search-history');
    historyDiv.innerHTML = '';  // Clear previous search history

    for (const city of history) {
        const button = document.createElement('button');
        button.textContent = city;
        button.addEventListener('click', function() {
            fetchWeatherData(city);
        });
        historyDiv.appendChild(button);
    }
}