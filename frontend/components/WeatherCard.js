function WeatherCard({ data }) {
    if (!data || !data.raw) return null;
    const { current_weather } = data.raw;

    return (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div>
                <div className="text-5xl font-bold text-white">
                    {Math.round(current_weather.temperature)}°C
                </div>
                <div className="text-gray-100 text-sm">
                    {data.city} · wind {current_weather.windspeed} km/h
                </div>
            </div>
            <div className="text-right text-gray-100 text-sm">
                <div>Code: {current_weather.weathercode}</div>
                <div>{new Date().toLocaleString()}</div>
            </div>
        </div>
    );
}