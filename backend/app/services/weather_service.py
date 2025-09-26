import httpx
import json
import redis
from datetime import datetime
from typing import Dict, Any

from app.core.config import settings
from app.models.weather import WeatherData, CurrentWeather, ForecastDay

# Initialize Redis connection
redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0, decode_responses=True)

class WeatherService:
    """
    Service to handle all weather data logic.
    - Fetches data from external API.
    - Manages caching in Redis.
    - Parses raw data into our Pydantic models.
    """
    async def get_weather(self, city: str = None, lat: float = None, lon: float = None) -> WeatherData:
        if not city and not (lat and lon):
            raise ValueError("Either city or latitude/longitude must be provided.")

        cache_key = f"weather:{city}" if city else f"weather:{lat}:{lon}"
        
        # 1. Check cache first
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return WeatherData.model_validate_json(cached_data)

        # 2. If cache miss, fetch from API
        async with httpx.AsyncClient() as client:
            if city:
                # First, geocode city to get lat/lon
                geo_url = "https://api.openweathermap.org/geo/1.0/direct"
                geo_params = {"q": city, "limit": 1, "appid": settings.OPENWEATHERMAP_API_KEY}
                geo_response = await client.get(geo_url, params=geo_params)
                geo_response.raise_for_status() # Raise exception for 4xx/5xx errors
                geo_data = geo_response.json()
                if not geo_data:
                    raise ValueError(f"City '{city}' not found.")
                lat, lon = geo_data[0]['lat'], geo_data[0]['lon']
            
            # Fetch weather data using lat/lon
            weather_url = "https://api.openweathermap.org/data/3.0/onecall"
            weather_params = {
                "lat": lat,
                "lon": lon,
                "appid": settings.OPENWEATHERMAP_API_KEY,
                "units": "metric",  # For Celsius
                "exclude": "minutely,hourly"
            }
            weather_response = await client.get(weather_url, params=weather_params)
            weather_response.raise_for_status()
            raw_data = weather_response.json()

        # 3. Parse and structure data
        parsed_data = self._parse_raw_weather_data(raw_data, city)

        # 4. Store in cache and return
        redis_client.set(cache_key, parsed_data.model_dump_json(), ex=settings.CACHE_TTL)
        
        return parsed_data

    def _parse_raw_weather_data(self, raw_data: Dict[str, Any], city_name: str = None) -> WeatherData:
        """Helper to transform OpenWeatherMap data into our WeatherData model."""
        location = city_name or f"{raw_data.get('lat', '')}, {raw_data.get('lon', '')}"
        if city_name and raw_data.get('sys', {}).get('country'):
             location = f"{city_name.capitalize()}, {raw_data.get('sys').get('country')}"

        current = CurrentWeather(
            temperature=raw_data['current']['temp'],
            humidity=raw_data['current']['humidity'],
            wind_speed=raw_data['current']['wind_speed'] * 3.6,  # m/s to km/h
            condition=raw_data['current']['weather'][0]['description'].capitalize(),
            icon=raw_data['current']['weather'][0]['icon'],
        )
        
        forecast = []
        # Get forecast for the next 7 days (index 1 to 7)
        for day_data in raw_data['daily'][1:8]:
            forecast.append(ForecastDay(
                date=datetime.fromtimestamp(day_data['dt']).strftime('%Y-%m-%d'),
                temp_max=day_data['temp']['max'],
                temp_min=day_data['temp']['min'],
                condition=day_data['weather'][0]['description'].capitalize(),
                icon=day_data['weather'][0]['icon']
            ))

        alert = raw_data.get('alerts', [{}])[0].get('event') if 'alerts' in raw_data else None

        return WeatherData(location=location, current=current, forecast=forecast, alert=alert)

weather_service = WeatherService()