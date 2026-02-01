/**
 * Global Header Component
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