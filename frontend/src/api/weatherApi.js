import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetchWeather = ({ city, lat, lon }) => {
    const params = {};
    if (city) params.city = city;
    if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
    }
    return apiClient.get('weather', { params });
};