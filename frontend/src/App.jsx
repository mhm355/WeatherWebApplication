import React, { useState } from 'react';
import { fetchWeather } from './api/weatherApi';
import './App.css';

// Import icons from the 'Weather Icons' set
import {
  WiDaySunny, WiDayCloudy, WiCloud, WiCloudy, WiShowers,
  WiRain, WiThunderstorm, WiSnow, WiFog, WiNightClear,
  WiNightCloudy, WiNightShowers, WiNightRain, WiNightThunderstorm,
  WiNightSnow, WiNightFog, WiThermometer, WiStrongWind, WiHumidity
} from 'react-icons/wi';

// Helper function to map API icon codes to react-icons
const getWeatherIcon = (iconCode) => {
  switch (iconCode) {
    case '01d': return <WiDaySunny />;
    case '01n': return <WiNightClear />;
    case '02d': return <WiDayCloudy />;
    case '02n': return <WiNightCloudy />;
    case '03d': case '03n': return <WiCloud />;
    case '04d': case '04n': return <WiCloudy />;
    case '09d': case '09n': return <WiShowers />;
    case '10d': return <WiRain />;
    case '10n': return <WiNightRain />;
    case '11d': case '11n': return <WiThunderstorm />;
    case '13d': case '13n': return <WiSnow />;
    case '50d': case '50n': return <WiFog />;
    default: return <WiDaySunny />;
  }
};

function App() {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadWeather = async (params) => {
        setLoading(true);
        setError(null);
        setWeatherData(null);
        try {
            const response = await fetchWeather(params);
            setWeatherData(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (city) loadWeather({ city });
    };

    const handleGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                loadWeather({ lat: latitude, lon: longitude });
            }, () => {
                setError('Unable to retrieve your location.');
            });
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    };

    // --- NEW FUNCTION: Handles the key press event ---
    const handleKeyPress = (event) => {
      // Check if the key pressed was "Enter"
      if (event.key === 'Enter') {
        handleSearch();
      }
    };

    return (
        <div className="weather-widget">
            <div className="search-bar">
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyPress} // <-- ADD THIS to the input element
                    placeholder="Enter city name..."
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleGeoLocation}>Use My Location</button>
            </div>

            {loading && <p style={{ textAlign: 'center' }}>Loading weather...</p>}
            {error && <p style={{ color: '#ff8a8a', textAlign: 'center' }}>{error}</p>}

            {weatherData && (
                <div className="weather-display">
                    <div className="current-weather">
                        <h2>{weatherData.location}</h2>
                        <div className="icon-wrapper">{getWeatherIcon(weatherData.current.icon)}</div>
                        <p className="temperature">{weatherData.current.temperature.toFixed(0)}°C</p>
                        <p className="condition">{weatherData.current.condition}</p>
                        <div className="extra-details">
                            <span><WiHumidity /> {weatherData.current.humidity}%</span>
                            <span><WiStrongWind /> {weatherData.current.wind_speed.toFixed(1)} km/h</span>
                        </div>
                    </div>
                    <div className="forecast-panel">
                        <h3>7-Day Forecast</h3>
                        {weatherData.forecast.map(day => (
                            <div key={day.date} className="forecast-day">
                                <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="icon-wrapper-small">{getWeatherIcon(day.icon)}</span>
                                <span>{day.temp_max.toFixed(0)}° / {day.temp_min.toFixed(0)}°</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

