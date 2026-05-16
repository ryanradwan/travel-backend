
const CURRENCIES = [
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
];

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return data.rates ?? {};
  } catch {
    return {};
  }
}

export default async function CurrencyRates() {
  const rates = await fetchRates();
  const hasRates = Object.keys(rates).length > 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-navy">Live Exchange Rates</h3>
          <p className="text-xs text-gray-400 mt-0.5">1 USD equals · Updated hourly</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Live</span>
      </div>

      {!hasRates ? (
        <p className="text-xs text-gray-400 py-2">Rates temporarily unavailable</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CURRENCIES.map(({ code, name, flag }) => {
            const rate = rates[code];
            if (!rate) return null;

            const display = code === "JPY" || code === "THB" || code === "ZAR" || code === "MXN"
              ? rate.toFixed(1)
              : rate.toFixed(4);

            return (
              <div key={code} className="bg-gray-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base leading-none">{flag}</span>
                  <span className="text-xs font-bold text-navy">{code}</span>
                </div>
                <p className="text-sm font-semibold text-navy">{display}</p>
                <p className="text-xs text-gray-400 truncate">{name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
