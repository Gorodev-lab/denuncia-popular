import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, MapPin, Crosshair, Loader2, Search, X, Edit2, Check } from 'lucide-react';

/**
 * STEP-BY-STEP EXPLANATION:
 * 
 * 1. GOOGLE MAPS LIBRARIES
 *    - We're using @react-google-maps/api which provides React components for Google Maps
 *    - We load "places" library for location search autocomplete
 *    - We load "geocoding" library for converting coordinates to addresses
 * 
 * 2. COMPONENT ARCHITECTURE
 *    - Main component: StepLocation handles all state and logic
 *    - Google Maps handles the map rendering
 *    - We keep the same UI/UX as before but with Google's map tiles
 * 
 * 3. KEY FEATURES PRESERVED:
 *    - Click on map to select location
 *    - GPS button to use current location
 *    - Search bar for address lookup
 *    - Manual address input/editing
 *    - Dark mode premium aesthetics
 */

interface Props {
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// Define which Google Maps libraries we need
const libraries: ("places" | "geocoding")[] = ["places", "geocoding"];

// Map container styling - full height and width
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Custom dark mode map styles (Google Maps styling)
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#09090b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#09090b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#71717a" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a1a1aa" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#71717a" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#18181b" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#52525b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#27272a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#18181b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3f3f46" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#27272a" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d1d5db" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#18181b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#71717a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3f3f46" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#000000" }],
  },
];

export const StepLocation: React.FC<Props> = ({ draft, updateDraft, onNext, onBack }) => {
  /**
   * STATE MANAGEMENT EXPLANATION:
   * 
   * - position: Current lat/lng coordinates selected on the map
   * - addressDisplay: The address shown to the user (from Google Geocoding)
   * - loadingAddress: Shows loading state while fetching address from coordinates
   * - loadingGPS: Shows loading state while getting user's GPS location
   * - searchQuery: User's search input
   * - isManualMode: Whether user is manually editing the address
   * - manualAddress: The manually typed address (when in manual mode)
   * - map: Reference to the Google Map instance
   */

  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    draft.location ? { lat: draft.location.lat, lng: draft.location.lng } : null
  );
  const [addressDisplay, setAddressDisplay] = useState<string>(draft.location?.address || '');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Search input ref for autocomplete
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Default center (Mexico City Zócalo)
  const defaultCenter = { lat: 19.4326, lng: -99.1332 };

  /**
   * GOOGLE MAPS API LOADING EXPLANATION:
   * 
   * useJsApiLoader is a hook from @react-google-maps/api that:
   * 1. Loads the Google Maps JavaScript API asynchronously
   * 2. Loads the specified libraries (places, geocoding)
   * 3. Only loads once and caches the result
   * 4. Returns isLoaded when ready to use
   */
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  /**
   * REVERSE GEOCODING EXPLANATION:
   * 
   * Reverse geocoding = converting coordinates (lat, lng) to a human-readable address
   * 
   * Process:
   * 1. Create a Geocoder instance
   * 2. Call geocode() with the coordinates
   * 3. Google returns an array of possible addresses (most specific first)
   * 4. We take the formatted_address from the first result
   */
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
    if (!window.google) return;

    setLoadingAddress(true);

    // Temporarily update with loading message
    updateDraft({
      location: {
        lat,
        lng,
        address: 'Consultando dirección...'
      }
    });

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results && response.results.length > 0) {
        const address = response.results[0].formatted_address;
        setAddressDisplay(address);
        setLoadingAddress(false);

        // Update draft with the actual address
        updateDraft({
          location: {
            lat,
            lng,
            address
          }
        });
      } else {
        throw new Error('No address found');
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      const fallbackAddress = `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddressDisplay(fallbackAddress);
      setLoadingAddress(false);

      updateDraft({
        location: {
          lat,
          lng,
          address: fallbackAddress
        }
      });
    }
  }, [updateDraft]);

  /**
   * GPS LOCATION EXPLANATION:
   * 
   * Uses the browser's Geolocation API:
   * 1. Call navigator.geolocation.getCurrentPosition()
   * 2. Browser asks user for permission
   * 3. If granted, returns current coordinates
   * 4. We then reverse geocode to get the address
   * 5. If denied or unavailable, fallback to Mexico City center
   */
  const handleLocateUser = () => {
    setLoadingGPS(true);
    setIsManualMode(false); // Exit manual mode when locating

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setPosition(newPos);
          getAddressFromCoordinates(newPos.lat, newPos.lng);
          setLoadingGPS(false);

          // Zoom and center map
          if (map) {
            map.panTo(newPos);
            map.setZoom(16);
          }
        },
        (err) => {
          console.error(err);
          setLoadingGPS(false);

          // Fallback to default if denied
          if (!position) {
            setPosition(defaultCenter);
            getAddressFromCoordinates(defaultCenter.lat, defaultCenter.lng);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLoadingGPS(false);
      if (!position) {
        setPosition(defaultCenter);
        getAddressFromCoordinates(defaultCenter.lat, defaultCenter.lng);
      }
    }
  };

  /**
   * MAP CLICK HANDLER EXPLANATION:
   * 
   * When user clicks anywhere on the map:
   * 1. Google Maps provides the clicked lat/lng in the event
   * 2. We update our position state
   * 3. We reverse geocode to get the address
   * 4. Map smoothly animates to the new position with panTo()
   */
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setPosition(newPos);

      // Only fetch address if NOT in manual mode
      if (!isManualMode) {
        getAddressFromCoordinates(newPos.lat, newPos.lng);
      } else {
        // In manual mode, just update coordinates but keep manual address
        updateDraft({
          location: {
            lat: newPos.lat,
            lng: newPos.lng,
            address: manualAddress
          }
        });
      }

      // Smoothly pan to clicked location
      if (map) {
        map.panTo(newPos);
        if (map.getZoom()! < 16) {
          map.setZoom(16);
        }
      }
    }
  }, [map, isManualMode, manualAddress, getAddressFromCoordinates, updateDraft]);

  /**
   * PLACES AUTOCOMPLETE EXPLANATION:
   * 
   * Google Places Autocomplete provides search suggestions as user types:
   * 1. Attach an Autocomplete instance to the search input
   * 2. Restrict results to Mexico (componentRestrictions: { country: 'mx' })
   * 3. When user selects a place, get its geometry (coordinates)
   * 4. Update map position and fetch the address
   */
  useEffect(() => {
    if (isLoaded && searchInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'mx' }, // Restrict to Mexico
        fields: ['geometry', 'formatted_address', 'name'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (place?.geometry?.location) {
          const newPos = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          setPosition(newPos);
          setSearchQuery('');
          setIsManualMode(false);

          // Use the place's formatted address
          const address = place.formatted_address || place.name || '';
          setAddressDisplay(address);

          updateDraft({
            location: {
              lat: newPos.lat,
              lng: newPos.lng,
              address
            }
          });

          // Pan and zoom map
          if (map) {
            map.panTo(newPos);
            map.setZoom(16);
          }
        }
      });
    }
  }, [isLoaded, map, updateDraft]);

  /**
   * MANUAL ADDRESS MODE EXPLANATION:
   * 
   * Allows users to manually type/edit the address:
   * 1. Click edit button → enters manual mode
   * 2. User types in textarea
   * 3. Click check button → saves manual address
   * 4. Coordinates stay the same, only address text changes
   */
  const toggleManualMode = () => {
    if (isManualMode) {
      // Saving manual address
      setAddressDisplay(manualAddress);
      updateDraft({
        location: {
          ...draft.location!,
          address: manualAddress
        }
      });
      setIsManualMode(false);
    } else {
      // Entering edit mode
      setManualAddress(addressDisplay);
      setIsManualMode(true);
    }
  };

  // Sync manual address with display when not editing
  useEffect(() => {
    if (!isManualMode) {
      setManualAddress(addressDisplay);
    }
  }, [addressDisplay, isManualMode]);

  // Auto-locate on mount if no location set
  useEffect(() => {
    if (!draft.location && isLoaded) {
      handleLocateUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  /**
   * LOADING AND ERROR STATES
   */
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)] min-h-[500px] bg-zinc-950 rounded-2xl border border-zinc-800">
        <div className="text-center p-8">
          <p className="text-red-500 text-lg font-bold mb-2">Error al cargar Google Maps</p>
          <p className="text-zinc-400 text-sm">Por favor verifica tu API key en el archivo .env.local</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)] min-h-[500px] bg-zinc-950 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-zinc-300 text-sm">Cargando Google Maps...</p>
        </div>
      </div>
    );
  }

  /**
   * MAIN RENDER
   */
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Custom Styles */}
      <style>
        {`
          @keyframes ripple-expand {
            0% { transform: scale(0.1); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          .animate-ripple {
            animation: ripple-expand 0.8s ease-out forwards;
          }
          /* Hide Google Maps default controls for cleaner look */
          .gm-style .gm-style-iw-c {
            background-color: #18181b !important;
            border: 1px solid #27272a !important;
          }
          .gm-style .gm-style-iw-t::after {
            background: #18181b !important;
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
        <div className="pointer-events-auto relative flex items-center shadow-xl">
          <div className="absolute left-3 text-zinc-400 z-10">
            <Search size={16} />
          </div>
          <input
            ref={searchInputRef}
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
              className="absolute right-3 text-zinc-500 hover:text-white z-10"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Google Map */}
      <div className="flex-1 w-full h-full z-0 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position || defaultCenter}
          zoom={position ? 16 : 13}
          onClick={handleMapClick}
          onLoad={(mapInstance) => setMap(mapInstance)}
          options={{
            styles: darkMapStyles,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          }}
        >
          {/* Custom Marker */}
          {position && (
            <Marker
              position={position}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

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