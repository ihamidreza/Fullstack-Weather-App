/**
 * Destructuring Hooks from the React Global Object
 * Since we are using CDNs, we access hooks directly from the 'React' variable.
 */
const { useState } = React;

/**
 * Header Component: Displays the app branding and icon.
 * This separation makes the main App component cleaner and easier to maintain.
 */
const Header = () => (
    <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Weather Insights</h1>
            <p className="text-blue-400 text-sm font-medium">Real-time Meteorological Data</p>
        </div>
    </div>
);

/**
 * SearchBar Component: Manages the city input and search trigger.
 * @param {string} city - Current city name in state
 * @param {function} setCity - Function to update city state
 * @param {function} onSearch - Function to trigger the API call
 * @param {boolean} loading - Loading state to disable the button during fetch
 */
const SearchBar = ({ city, setCity, onSearch, loading }) => (
    <div className="flex gap-2 mb-6">
        <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter city name..."
        />
        <button
            onClick={onSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
            {loading ? <span className="animate-pulse">Loading...</span> : "Get Weather"}
        </button>
    </div>
);

/**
 * WeatherResult Component: Responsible for displaying the fetched weather information.
 * @param {object} data - The weather data object containing city name and API response
 */
const WeatherResult = ({ data }) => {
    if (!data || !data.raw) return null;
    const { current_weather } = data.raw;

    return (
        <div className="animate-fadeIn flex items-center justify-between mb-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
            <div>
                <div className="text-5xl font-bold text-white">
                    {Math.round(current_weather.temperature)}°C
                </div>
                <div className="text-gray-100 text-sm">
                    {data.city} · wind {current_weather.windspeed} km/h
                </div>
            </div>
            <div className="text-right text-gray-400 text-xs">
                <div>Code: {current_weather.weathercode}</div>
                <div>{new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
};

/**
 * Main App Component: The heart of the application.
 * Orchestrates state management and handles the interaction between the UI and Backend API.
 */
function App() {
    const [city, setCity] = useState("New York");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Fetches weather data from our custom Java Backend API.
     */
    const handleFetchWeather = async () => {
        if (!city.trim()) return;

        setLoading(true);
        setError(null);
        try {
            // Sending a GET request to our Java server endpoint
            const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const resultJson = await response.json();
            setData({ city, raw: resultJson });
        } catch (err) {
            console.error("API Fetch Error:", err);
            setError("Could not retrieve weather. Please check the city name.");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
                <Header />

                <SearchBar
                    city={city}
                    setCity={setCity}
                    onSearch={handleFetchWeather}
                    loading={loading}
                />

                {/* Error Messaging */}
                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <WeatherResult data={data} />

                {/* Dynamic Footer with clean styling */}
                <div className="text-center text-gray-500 text-xs mt-8 pt-6 border-t border-gray-800">
                    Built with React & Java · Powered by Open-Meteo API
                </div>
            </div>
        </div>
    );
}

/**
 * Entry Point: Mounting the React application to the DOM element with id 'root'.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);