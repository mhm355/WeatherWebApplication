import React, { useState, useEffect } from 'react';
import { fetchWeather } from './api/weatherApi';

// Basic styling - in a real app, this would be in a CSS file
const styles = {
    container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: 'auto' },
    header: { textAlign: 'center', marginBottom: '20px' },
    searchBar: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
    input: { padding: '10px', fontSize: '16px' },
    button: { padding: '10px', fontSize: '16px' },
    weatherContainer: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px' },
    currentWeather: { textAlign: 'center', marginBottom: '20px' },
    forecast: { display: 'flex', justifyContent: 'space-between', textAlign: 'center' },
    forecastDay: { border: '1px solid #eee', borderRadius: '4px', padding: '10px' },
    loading: { textAlign: 'center', fontSize: '20px' },
    error: { textAlign: 'center', fontSize: '20px', color: 'red' }
};

function App() {
    const [city, setCity] = useState('Cairo');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
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

    // Initial load for default city
    useEffect(() => {
        loadWeather({ city: 'Cairo' });
    }, []);

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

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>EgyptWeather</h1>
            <div style={styles.searchBar}>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name"
                    style={styles.input}
                />
                <button onClick={handleSearch} style={styles.button}>Search</button>
                <button onClick={handleGeoLocation} style={styles.button}>Use My Location</button>
            </div>
            
            {loading && <p style={styles.loading}>Loading...</p>}
            {error && <p style={styles.error}>{error}</p>}

            {weatherData && (
                <div style={styles.weatherContainer}>
                    <div style={styles.currentWeather}>
                        <h2>Current Weather in {weatherData.location}</h2>
                        <img src={`http://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`} alt={weatherData.current.condition} />
                        <h3>{weatherData.current.temperature}°C - {weatherData.current.condition}</h3>
                        <p>Humidity: {weatherData.current.humidity}% | Wind: {weatherData.current.wind_speed.toFixed(1)} km/h</p>
                         {weatherData.alert && <p style={{color: 'orange', fontWeight: 'bold'}}>Alert: {weatherData.alert}</p>}
                    </div>
                    <hr/>
                    <h3>7-Day Forecast</h3>
                    <div style={styles.forecast}>
                        {weatherData.forecast.map(day => (
                            <div key={day.date} style={styles.forecastDay}>
                                <p><strong>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</strong></p>
                                <img src={`http://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} />
                                <p>{day.temp_max.toFixed(0)}° / {day.temp_min.toFixed(0)}°</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;