import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, MapPin, Crosshair, Loader2, Search, X, Edit2, Check } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Props {
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// CRITICAL FIX: Component to force map resize calculation on mount
const MapRealigner = () => {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 100); // Small delay to ensure container has dimensions
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
};

// Subcomponent to handle click events on the map (Logic)
const MapClickHandler: React.FC<{
  setPosition: (pos: L.LatLng) => void
}> = ({ setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom() < 16 ? 16 : map.getZoom(), { duration: 1.0 });
    },
  });
  return null;
};

// Subcomponent to handle click feedback visuals (Ripple Effect)
const ClickFeedbackLayer = () => {
  const [ripples, setRipples] = useState<{ id: number, pos: L.LatLng }[]>([]);

  useMapEvents({
    click(e) {
      const id = Date.now();
      setRipples(prev => [...prev, { id, pos: e.latlng }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 800); // Match animation duration
    }
  });

  const rippleIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="absolute inset-0 rounded-full border-2 border-pink-500 shadow-[0_0_15px_#ec4899] animate-ripple box-border"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <>
      {ripples.map(r => (
        <Marker
          key={r.id}
          position={r.pos}
          icon={rippleIcon}
          zIndexOffset={-10} // Keep below the main pin
          interactive={false}
        />
      ))}
    </>
  );
};


// Helper to control Map center from external state
const MapUpdater: React.FC<{ center: L.LatLng | null, zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export const StepLocation: React.FC<Props> = ({ draft, updateDraft, onNext, onBack }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    draft.location ? new L.LatLng(draft.location.lat, draft.location.lng) : null
  );
  const [addressDisplay, setAddressDisplay] = useState<string>(draft.location?.address || '');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=mx&limit=5`,
            { headers: { 'User-Agent': 'DenunciaPopularApp/1.0' } }
          );
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Autocomplete error:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectSuggestion = (result: any) => {
    const newPos = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
    setPosition(newPos);
    setAddressDisplay(result.display_name);
    // Optional: Update search query to match selection or keep it as is
    // setSearchQuery(result.display_name); 
    setShowSuggestions(false);
    setIsManualMode(false);
  };

  // Manual address editing state
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  // Default center (Mexico City Zocalo) - Acts as fallback
  const defaultCenter = useMemo(() => ({ lat: 19.4326, lng: -99.1332 }), []);

  // Auto-locate on mount if no location set
  useEffect(() => {
    if (!draft.location) {
      handleLocateUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync manual address with display address when not in manual mode
  useEffect(() => {
    if (!isManualMode) {
      setManualAddress(addressDisplay);
    }
  }, [addressDisplay, isManualMode]);

  useEffect(() => {
    if (position) {
      // Validate coordinates (Simple Bounding Box for Mexico)
      const isValid =
        position.lat >= 14.5 && position.lat <= 32.7 &&
        position.lng >= -118.4 && position.lng <= -86.7;

      if (!isValid) {
        // Optional: Warn user but don't block, as bounding boxes can be tricky
        // alert("La ubicación seleccionada parece estar fuera de México. Por favor verifica.");
      }

      // Only fetch address if NOT in manual mode to avoid overwriting user input immediately
      // However, usually if user moves map, they expect address update. 
      // We will allow update, but if they are actively typing (isManualMode), we might want to pause?
      // For now, let's assume map movement overrides everything unless we are strictly in manual mode.
      if (!isManualMode) {
        const fetchAddress = async () => {
          setLoadingAddress(true);
          // Set a temporary "loading" message in the draft
          updateDraft({
            location: {
              lat: position.lat,
              lng: position.lng,
              address: 'Consultando dirección...'
            }
          });

          try {
            // Use Nominatim for Reverse Geocoding (Free, Open Source)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'DenunciaPopularApp/1.0' } }
            );
            const data = await response.json();

            const address = data.display_name || "Dirección desconocida";

            setAddressDisplay(address);
            setLoadingAddress(false);

            // Update draft with the final, accurate address
            updateDraft({
              location: {
                lat: position.lat,
                lng: position.lng,
                address: address
              }
            });
          } catch (error) {
            console.error("Error fetching address:", error);
            setAddressDisplay("Error al obtener la dirección. Puedes continuar con las coordenadas.");
            setLoadingAddress(false);
            // Still update with coordinates
            updateDraft({
              location: {
                lat: position.lat,
                lng: position.lng,
                address: `Coordenadas: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              }
            });
          }
        };

        fetchAddress();
      } else {
        // If in manual mode, just update coordinates in draft, keep manual address
        updateDraft({
          location: {
            lat: position.lat,
            lng: position.lng,
            address: manualAddress
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]); // Removed isManualMode from deps to avoid loop, but we need to be careful

  const handleLocateUser = () => {
    setLoadingGPS(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(newPos);
          setLoadingGPS(false);
        },
        (err) => {
          console.error(err);
          setLoadingGPS(false);
          // Fallback to default center if denied but stop loading
          if (!position) {
            setPosition(new L.LatLng(defaultCenter.lat, defaultCenter.lng));
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLoadingGPS(false);
      if (!position) {
        setPosition(new L.LatLng(defaultCenter.lat, defaultCenter.lng));
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Use Nominatim for Search (Free, Open Source)
      // Limit to Mexico (countrycodes=mx)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=mx&limit=1`,
        { headers: { 'User-Agent': 'DenunciaPopularApp/1.0' } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newPos = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
        setPosition(newPos);
        setAddressDisplay(result.display_name);
      } else {
        alert("No se encontraron resultados. Intenta ser más específico.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error al buscar. Intenta de nuevo.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleManualMode = () => {
    if (isManualMode) {
      // Saving
      setAddressDisplay(manualAddress);
      updateDraft({
        location: {
          ...draft.location!,
          address: manualAddress
        }
      });
      setIsManualMode(false);
    } else {
      // Editing
      setManualAddress(addressDisplay);
      setIsManualMode(true);
    }
  };

  // Memoize the icon to prevent re-creation on every render, which causes Leaflet errors
  const tacticalIcon = useMemo(() => new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="relative flex items-center justify-center w-10 h-10">
              <div class="absolute w-full h-full rounded-full bg-red-500/30 animate-ping"></div>
              <div class="relative w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg shadow-red-500/50"></div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  }), []);

  const markerRef = React.useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Inject Leaflet CSS directly to ensure it loads */}
      <style>
        {`
          .leaflet-container {
            height: 100%;
            width: 100%;
            background-color: #09090b !important;
            font-family: 'Inter', sans-serif;
            border-radius: 1rem;
          }
          .leaflet-control-attribution {
            background: rgba(0,0,0,0.8) !important;
            color: #71717a !important;
            font-size: 10px !important;
            display: none; /* Hide attribution for cleaner UI if permitted, or style it better */
          }
          .leaflet-bar a {
            background-color: #18181b !important;
            color: #e4e4e7 !important;
            border-bottom: 1px solid #27272a !important;
          }
          .leaflet-bar a:hover {
            background-color: #27272a !important;
            color: #fff !important;
          }
          @keyframes ripple-expand {
            0% { transform: scale(0.1); opacity: 1; border-width: 4px; }
            100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
          }
          .animate-ripple {
            animation: ripple-expand 0.8s ease-out forwards;
          }
        `}
      </style>

      {/* Search Bar & Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-col gap-2 pointer-events-none">

        {/* Header Title */}
        <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border border-zinc-800 shadow-2xl flex justify-between items-center mb-2">
          <h2 className="text-md md:text-lg font-bold text-white flex items-center gap-2">
            <MapPin size={18} className="text-pink-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              Paso 1: Ubicación
            </span>
          </h2>
          <button
            onClick={handleLocateUser}
            disabled={loadingGPS}
            className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-pink-900/20 hover:border-pink-500/50 text-zinc-300 hover:text-pink-400 transition-all disabled:opacity-50"
            title="Usar mi ubicación actual"
          >
            {loadingGPS ? <Loader2 size={18} className="animate-spin text-pink-500" /> : <Crosshair size={18} />}
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="pointer-events-auto relative flex items-center shadow-xl">
          <div className="absolute left-3 text-zinc-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar calle, colonia o ciudad..."
            className="w-full bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white text-sm rounded-xl py-3 pl-10 pr-10 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-10">
              <Loader2 size={16} className="animate-spin text-pink-500" />
            </div>
          )}
        </form>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="pointer-events-auto bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl overflow-hidden mt-1 max-h-60 overflow-y-auto">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white border-b border-zinc-800 last:border-0 transition-colors flex items-start gap-2"
              >
                <MapPin size={14} className="mt-1 text-pink-500 shrink-0" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 w-full h-full z-0 relative">
        <MapContainer
          center={position || defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          zoomControl={false}
          className="h-full w-full bg-zinc-950 outline-none"
        >
          <ZoomControl position="bottomleft" />
          <MapRealigner />
          <MapUpdater center={position} zoom={16} />
          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="Calle (OpenStreetMap)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Topografía (OpenTopoMap)">
              <TileLayer
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                maxZoom={17}
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satélite (Esri World Imagery)">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relieve (Esri World Shaded Relief)">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}"
                maxZoom={13}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <ClickFeedbackLayer />
          <MarkerClusterGroup chunkedLoading>
            {position && (
              <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={position}
                ref={markerRef}
                icon={tacticalIcon}
              />
            )}
          </MarkerClusterGroup>
          <MapClickHandler setPosition={setPosition} />
        </MapContainer>

        {/* Vignette Effect */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-[400]"></div>
      </div>

      {/* Bottom Panel */}
      <div className="p-4 md:p-6 bg-zinc-950 border-t border-zinc-900 z-[500]" aria-live="polite">
        {position && (
          <div className="mb-4 md:mb-6 bg-zinc-900 p-3 md:p-4 rounded-xl border border-zinc-800 flex items-start gap-4 animate-fade-in">
            <div className={`mt-1 p-2 rounded-lg ${loadingAddress ? 'bg-zinc-800 text-zinc-500' : 'bg-pink-900/20 text-pink-500'}`}>
              {loadingAddress ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  {isManualMode ? 'Editar Dirección Manualmente' : 'Dirección Detectada'}
                </p>
                {!loadingAddress && (
                  <button
                    onClick={toggleManualMode}
                    className="text-zinc-500 hover:text-pink-500 transition-colors p-1"
                    title={isManualMode ? "Guardar dirección" : "Editar dirección manualmente"}
                  >
                    {isManualMode ? <Check size={14} /> : <Edit2 size={14} />}
                  </button>
                )}
              </div>

              {isManualMode ? (
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-200 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                  rows={2}
                  placeholder="Escribe la dirección exacta aquí..."
                  autoFocus
                />
              ) : (
                <p className={`text-xs md:text-sm ${loadingAddress ? 'text-zinc-600 italic' : 'text-zinc-200 line-clamp-2'}`}>
                  {loadingAddress ? 'Obteniendo dirección...' : addressDisplay}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="text-zinc-500 hover:text-white font-medium flex items-center gap-2 px-4 py-2 transition-colors uppercase text-xs tracking-widest"
            >
              <ChevronLeft size={14} />
              Volver
            </button>
          )}
          <div className={onBack ? '' : 'w-full flex justify-end'}>
            <button
              onClick={onNext}
              disabled={!position || loadingAddress || (isManualMode && !manualAddress.trim())}
              className="
                group relative px-6 py-3 rounded-full font-bold text-white overflow-hidden text-xs md:text-sm
                disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-900/20
              "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
              <span className="relative flex items-center gap-2">
                {loadingAddress ? 'Procesando...' : 'Confirmar Ubicación'}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};