from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.models.weather import WeatherData
from app.services.weather_service import weather_service

router = APIRouter()

@router.get(
    "/weather",
    response_model=WeatherData,
    summary="Get Current and Forecast Weather",
    description="Fetches weather data by city or GPS coordinates. Caches results for 15 minutes."
)
async def get_weather_endpoint(
    city: Optional[str] = Query(None, description="City name, e.g., 'Cairo'"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    try:
        data = await weather_service.get_weather(city=city, lat=lat, lon=lon)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Generic error for unexpected issues (e.g., external API down)
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")