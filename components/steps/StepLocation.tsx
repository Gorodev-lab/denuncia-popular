import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, MapPin, Crosshair, Loader2, Search, X, Edit2, Check } from 'lucide-react';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

interface Props {
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
  onNext: () => void;
  onBack?: () => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: 19.4326,
  lng: -99.1332,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#242f3e" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }, { lightness: -80 }]
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }]
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ lightness: -20 }]
    }
  ]
};

export const StepLocation: React.FC<Props> = ({ draft, updateDraft, onNext, onBack }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    draft.location ? { lat: draft.location.lat, lng: draft.location.lng } : null
  );
  const [addressDisplay, setAddressDisplay] = useState<string>(draft.location?.address || '');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Sync manual address with display address when not in manual mode
  useEffect(() => {
    if (!isManualMode) {
      setManualAddress(addressDisplay);
    }
  }, [addressDisplay, isManualMode]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    if (position) {
      map.panTo(position);
      map.setZoom(16);
    } else {
      // If no position, try to locate user or default
      handleLocateUser(map);
    }
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleLocateUser = (mapInstance: google.maps.Map | null = map) => {
    setLoadingGPS(true);
    setGpsError(null);
    setIsManualMode(false);

    if (!navigator.geolocation) {
      setGpsError("Tu navegador no soporta geolocalización.");
      setLoadingGPS(false);
      return;
    }

    const successCallback = (pos: GeolocationPosition) => {
      const newPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setPosition(newPos);
      if (mapInstance) {
        mapInstance.panTo(newPos);
        mapInstance.setZoom(16);
      }
      setLoadingGPS(false);
    };

    const errorCallback = (err: GeolocationPositionError) => {
      console.error("GPS Error:", err);
      let errorMessage = "Error al obtener ubicación.";

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = "Permiso denegado. Habilita la ubicación en tu navegador.";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = "Ubicación no disponible.";
          break;
        case err.TIMEOUT:
          // Try again with low accuracy
          console.log("Timeout with high accuracy, retrying with low accuracy...");
          navigator.geolocation.getCurrentPosition(
            successCallback,
            (retryErr) => {
              console.error("Retry GPS Error:", retryErr);
              setLoadingGPS(false);
              setGpsError("No se pudo obtener la ubicación. Intenta buscar manualmente.");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
          );
          return; // Don't set error yet, wait for retry
        default:
          errorMessage = "Error desconocido de GPS.";
      }

      setLoadingGPS(false);
      setGpsError(errorMessage);

      // Fallback to default center if we don't have a position yet
      if (!position && mapInstance) {
        mapInstance.panTo(defaultCenter);
        mapInstance.setZoom(13);
      }
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const geocodePosition = async (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;

    setLoadingAddress(true);
    // Temporary update
    updateDraft({
      location: {
        lat,
        lng,
        address: 'Consultando dirección...'
      }
    });

    const geocoder = new window.google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results[0]) {
        const address = response.results[0].formatted_address;
        setAddressDisplay(address);
        updateDraft({
          location: {
            lat,
            lng,
            address: address
          }
        });
      } else {
        setAddressDisplay("Dirección desconocida");
        updateDraft({
          location: {
            lat,
            lng,
            address: `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
          }
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddressDisplay("Error al obtener la dirección.");
      updateDraft({
        location: {
          lat,
          lng,
          address: `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  // Effect to geocode when position changes (and not in manual mode)
  useEffect(() => {
    if (position && !isManualMode) {
      geocodePosition(position.lat, position.lng);
    } else if (position && isManualMode) {
      // Just update coords
      updateDraft({
        location: {
          lat: position.lat,
          lng: position.lng,
          address: manualAddress
        }
      });
    }
  }, [position]); // Removed isManualMode to avoid loops

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setPosition({ lat, lng });
      setIsManualMode(false); // Reset manual mode on map click
    }
  }, []);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setPosition({ lat, lng });
      setIsManualMode(false);
    }
  }, []);

  const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setPosition({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
        setAddressDisplay(place.formatted_address || '');
        setIsManualMode(false);
      } else {
        console.log("No details available for input: '" + place.name + "'");
      }
    }
  };

  const toggleManualMode = () => {
    if (isManualMode) {
      // Saving
      setAddressDisplay(manualAddress);
      if (position) {
        updateDraft({
          location: {
            lat: position.lat,
            lng: position.lng,
            address: manualAddress
          }
        });
      }
      setIsManualMode(false);
    } else {
      // Editing
      setManualAddress(addressDisplay);
      setIsManualMode(true);
    }
  };

  if (loadError) {
    return <div className="text-red-500 p-4">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={48} />
        <p className="text-zinc-400 mt-4">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">

      {/* Search Bar & Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[10] flex flex-col gap-2 pointer-events-none">

        {/* Header Title */}
        <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border border-zinc-800 shadow-2xl flex justify-between items-center mb-2">
          <h2 className="text-md md:text-lg font-bold text-white flex items-center gap-2">
            <MapPin size={18} className="text-pink-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              Paso 1: Ubicación
            </span>
          </h2>
          <button
            onClick={() => handleLocateUser()}
            disabled={loadingGPS}
            className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-pink-900/20 hover:border-pink-500/50 text-zinc-300 hover:text-pink-400 transition-all disabled:opacity-50"
            title="Usar mi ubicación actual"
          >
            {loadingGPS ? <Loader2 size={18} className="animate-spin text-pink-500" /> : <Crosshair size={18} />}
          </button>
        </div>

        {/* GPS Error Message */}
        {gpsError && (
          <div className="pointer-events-auto bg-red-900/90 backdrop-blur-md p-3 rounded-xl border border-red-700 shadow-xl flex justify-between items-center mb-2 animate-in fade-in slide-in-from-top-2">
            <span className="text-white text-xs flex items-center gap-2">
              <X size={14} className="text-red-300" />
              {gpsError}
            </span>
            <button onClick={() => setGpsError(null)} className="text-red-300 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="pointer-events-auto relative flex items-center shadow-xl">
          <div className="absolute left-3 text-zinc-400 z-10">
            <Search size={16} />
          </div>
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            className="w-full"
          >
            <input
              type="text"
              placeholder="Buscar calle, colonia o ciudad..."
              className="w-full bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white text-sm rounded-xl py-3 pl-10 pr-10 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-500"
            />
          </Autocomplete>
        </div>
      </div>

      <div className="flex-1 w-full h-full z-0 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position || defaultCenter}
          zoom={13}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
        >
          {position && (
            <Marker
              position={position}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              animation={window.google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
        {/* Vignette Effect */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-[5]"></div>
      </div>

      {/* Bottom Panel */}
      <div className="p-4 md:p-6 bg-zinc-950 border-t border-zinc-900 z-[10]" aria-live="polite">
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