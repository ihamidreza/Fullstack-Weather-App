function SearchBar({ city, setCity, onSearch, loading }) {
    return (
        <div className="flex gap-2 mb-6">
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={onSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
                {loading ? "Loading..." : "Get Weather"}
            </button>
        </div>
    );
}