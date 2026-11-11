import styles from "./SearchInput.module.scss";

import { useState, useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import cn from "classnames";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";

const SearchInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const map = useMap();
  const places = useMapsLibrary("places");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);

  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Флаг для предотвращения повторного поиска при программном изменении инпута
  const isSelectingRef = useRef(false);

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
    // Если выбор адреса активен — пропускаем запрос и сбрасываем флаг
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

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
      // Устанавливаем флаг, что начался процесс выбора адреса
      isSelectingRef.current = true;

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      if (place.location) {
        map.setCenter(place.location);
        map.setZoom(15);

        const point = {
          lat: place.location.lat(),
          lng: place.location.lng(),
          address: place.formattedAddress || place.displayName || "",
        };

        dispatch(mapActions.setSelectedCoords(point));
      }

      setInput(place.displayName || place.formattedAddress || "");
      setSuggestions([]);

      // Обновляем сессионный токен
      sessionToken.current = new places.AutocompleteSessionToken();
    } catch (error) {
      console.error("Помилка вибору місця:", error);
      isSelectingRef.current = false; // Сбрасываем в случае ошибки
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div ref={containerRef} className={styles.SearchInput}>
      <input
        value={input}
        onChange={(e) => {
          // Если пользователь начал сам вводить текст (а не сработал выбор из списка),
          // сбрасываем флаг на всякий случай
          isSelectingRef.current = false;
          setInput(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search on map ..."
        className={cn(styles.SearchInput__input, {
          [styles.SearchInput__input_hasList]: suggestions.length > 0,
        })}
      />

      {suggestions.length > 0 && (
        <ul className={styles.SearchInput__suggestionsList}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className={styles.SearchInput__suggestionsItem}
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
};

export default SearchInput;
