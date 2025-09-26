import pytest
import respx
from httpx import Response
from app.services.weather_service import weather_service

# Mock API responses
mock_geo_response = [{"lat": 30.0444, "lon": 31.2357}]
mock_weather_response = {
    "lat": 30.04, "lon": 31.24,
    "current": {
        "dt": 1664096000, "temp": 25.0, "humidity": 60, "wind_speed": 3.0,
        "weather": [{"description": "clear sky", "icon": "01d"}]
    },
    "daily": [
        {}, # Today, we skip this
        {"dt": 1664182400, "temp": {"min": 20.0, "max": 30.0}, "weather": [{"description": "few clouds", "icon": "02d"}]},
        # ... more daily forecasts
    ] * 8 # Simulate 8 days
}

@pytest.mark.asyncio
@respx.mock
async def test_get_weather_by_city_cache_miss(monkeypatch):
    # Mock Redis to simulate cache miss
    monkeypatch.setattr("app.services.weather_service.redis_client.get", lambda name: None)
    monkeypatch.setattr("app.services.weather_service.redis_client.set", lambda name, value, ex: None)
    
    # Mock HTTP requests
    geo_route = respx.get("http://api.openweathermap.org/geo/1.0/direct").mock(return_value=Response(200, json=mock_geo_response))
    weather_route = respx.get("https://api.openweathermap.org/data/3.0/onecall").mock(return_value=Response(200, json=mock_weather_response))

    # Call the service
    weather_data = await weather_service.get_weather(city="Cairo")

    # Assertions
    assert weather_data.location == "Cairo" # Simplified for test
    assert weather_data.current.temperature == 25.0
    assert len(weather_data.forecast) == 7
    assert geo_route.called
    assert weather_route.called