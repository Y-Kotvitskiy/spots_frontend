import { useState, useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

function CustomSearchBox() {
  const map = useMap();
  const places = useMapsLibrary("places");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);

  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ініціалізація сесійного токена
  useEffect(() => {
    if (!places) return;
    sessionToken.current = new places.AutocompleteSessionToken();
  }, [places]);

  // Закриття списку підказок при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Дебаунс для запитів підказок
  useEffect(() => {
    if (!places || !input.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: sessionToken.current!,
            // includedRegionCodes: ["ua"], // За потреби обмежити країну
          });
        setSuggestions(results);
      } catch (error) {
        console.error("Помилка завантаження підказок:", error);
      }
    }, 300); // Затримка 300 мс

    return () => clearTimeout(timer);
  }, [input, places]);

  const handleSelect = async (
    suggestion: google.maps.places.AutocompleteSuggestion,
  ) => {
    if (!suggestion.placePrediction || !map || !places) return;

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      if (place.location) {
        map.setCenter(place.location);
        map.setZoom(15);
      }

      setInput(place.displayName || place.formattedAddress || "");
      setSuggestions([]);

      // Оновлюємо сесійний токен після успішного вибору місця
      sessionToken.current = new places.AutocompleteSessionToken();
    } catch (error) {
      console.error("Помилка вибору місця:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ margin: "10px", width: "300px", position: "relative" }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Пошук місць..."
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: "40px",
          padding: "0 12px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
          fontSize: "14px",
          outline: "none",
          backgroundColor: "#fff",
        }}
      />

      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginTop: "4px",
            padding: 0,
            listStyle: "none",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                fontSize: "13px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {s.placePrediction?.text.toString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomSearchBox;
