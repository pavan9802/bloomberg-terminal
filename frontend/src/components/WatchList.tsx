import { useRef, useState } from "react";
import { Autocomplete, Loader } from "@mantine/core";
import RemoveButton from "./RemoveButton";
import { marketApi } from "../api/market";
import { usePriceWidget } from "../context/PriceWidgetContext";
import { useDebounce } from "../hooks/useDebounce";

export default function WatchList() {
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectCount, setSelectCount] = useState(0);
  const skipNextChange = useRef(false);
  const { watchlist, prices, selected, setSelected, addSymbol, removeSymbol } = usePriceWidget();
  
  useDebounce(query, 100, (q) => {
    if (q) {
      marketApi.searchSymbols(q)
        .then(setSearchResults)
        .catch(() => {
          console.error("Error fetching search results");
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  });

  const [addError, setAddError] = useState<string | null>(null);

  const onSelect = (symbol: string): void => {
    skipNextChange.current = true;
    setQuery("");
    setSearchResults([]);
    setSelectCount(c => c + 1);
    setAddError(null);
    addSymbol(symbol).catch(() => setAddError(`Failed to add ${symbol}`));
  };

  const handleChange = (value: string): void => {
    if (skipNextChange.current) {
      skipNextChange.current = false;
      return;
    }
    setQuery(value.replace(/[^a-zA-Z]/g, ""));
  };

  return (
    <div className="watchlist">
      <div className="watchlist-header">WATCHLIST</div>
      <Autocomplete
        key={selectCount}
        placeholder="Search symbols..."
        value={query}
        onChange={handleChange}
        onOptionSubmit={onSelect}
        data={searchResults}
        filter={({ options }) => options}
        size="xs"
        styles={{
          input: {
            background: "#111",
            color: "#ccc",
            border: "1px solid #333",
            fontSize: "11px",
          },
          dropdown: {
            background: "#111",
            border: "1px solid #333",
          },
          option: {
            fontSize: "11px",
            color: "#ccc",
          },
        }}
      />
      {addError && <div className="watchlist-error">{addError}</div>}
      {watchlist.length === 0 && (
        <div className="watchlist-empty">Search for a symbol above to add it to your watchlist.</div>
      )}
      {watchlist.map((symbol: string) => (
        <div
          key={symbol}
          className={`watchlist-item ${selected === symbol ? "active" : ""}`}
          onClick={() => setSelected(symbol)}
        >
          <span className="wl-symbol">{symbol}</span>
          <div className="wl-right">
            <span className="wl-price">
              {prices[symbol] ? `$${prices[symbol].toFixed(2)}` : <Loader size={10} color="gray" />}
            </span>
            <RemoveButton
              onClick={() => removeSymbol(symbol)}
              className="wl-remove"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
