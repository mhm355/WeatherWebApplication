from pydantic import BaseModel, Field
from typing import List, Optional

class CurrentWeather(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: int = Field(..., description="Humidity percentage")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    condition: str = Field(..., description="Text description of weather condition")
    icon: str = Field(..., description="Weather icon code from OpenWeatherMap")

class ForecastDay(BaseModel):
    date: str = Field(..., description="Date for the forecast (YYYY-MM-DD)")
    temp_max: float = Field(..., description="Maximum temperature for the day")
    temp_min: float = Field(..., description="Minimum temperature for the day")
    condition: str = Field(..., description="Text description of weather condition")
    icon: str = Field(..., description="Weather icon code from OpenWeatherMap")

class WeatherData(BaseModel):
    location: str = Field(..., description="Formatted location name, e.g., 'Cairo, EG'")
    current: CurrentWeather
    forecast: List[ForecastDay]
    alert: Optional[str] = Field(None, description="Description of any severe weather alerts")