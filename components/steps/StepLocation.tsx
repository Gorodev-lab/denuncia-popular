import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, MapPin, Crosshair, Loader2, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import { getAddressFromCoordinates } from '../../services/geminiService';

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
    const [ripples, setRipples] = useState<{id: number, pos: L.LatLng}[]>([]);
    
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
  const [mapUri, setMapUri] = useState<string | undefined>();
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  
  // Default center (Mexico City Zocalo) - Acts as fallback
  const defaultCenter = useMemo(() => ({ lat: 19.4326, lng: -99.1332 }), []);

  // Auto-locate on mount if no location set
  useEffect(() => {
    if (!draft.location) {
        handleLocateUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (position) {
      // Validate coordinates (Simple Bounding Box for Mexico)
      const isValid = 
        position.lat >= 14.5 && position.lat <= 32.7 && 
        position.lng >= -118.4 && position.lng <= -86.7;

      if (!isValid) {
        alert("La ubicación seleccionada parece estar fuera de México. Por favor verifica.");
        return; 
      }

      const fetchAddress = async () => {
        setLoadingAddress(true);
        setMapUri(undefined);
        // Set a temporary "loading" message in the draft
        updateDraft({
            location: {
              lat: position.lat,
              lng: position.lng,
              address: 'Consultando servicio de mapas...'
            }
        });

        const result = await getAddressFromCoordinates(position.lat, position.lng);
        
        setAddressDisplay(result.address);
        setMapUri(result.uri);
        setLoadingAddress(false);
        
        // Update draft with the final, accurate address
        updateDraft({
          location: {
            lat: position.lat,
            lng: position.lng,
            address: result.address
          }
        });
      };

      fetchAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

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
      
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto bg-zinc-900/90 backdrop-blur-md p-3 md:p-4 rounded-xl border border-zinc-800 shadow-2xl">
          <div>
            <h2 className="text-md md:text-lg font-bold text-white flex items-center gap-2">
               <MapPin size={18} className="text-pink-500" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                 Paso 1: Ubicación
               </span>
            </h2>
            <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-wider hidden md:block">Toca el mapa para afinar la posición</p>
          </div>
          <button 
            onClick={handleLocateUser}
            disabled={loadingGPS}
            className="group p-2 md:p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-pink-900/20 hover:border-pink-500/50 text-zinc-300 hover:text-pink-400 shadow-sm transition-all disabled:opacity-50"
            title="Usar mi ubicación actual"
          >
            {loadingGPS ? <Loader2 size={20} className="animate-spin text-pink-500" /> : <Crosshair size={20} className="group-hover:rotate-90 transition-transform duration-500" />}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full z-0 relative">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={13} 
          scrollWheelZoom={true}
          className="h-full w-full bg-zinc-950 outline-none"
        >
          <MapRealigner />
          <MapUpdater center={position} zoom={16} />
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickFeedbackLayer />
          {position && <Marker position={position} icon={tacticalIcon} />}
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
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Dirección Detectada</p>
                    <p className={`text-xs md:text-sm ${loadingAddress ? 'text-zinc-600 italic' : 'text-zinc-200 line-clamp-2'}`}>
                        {loadingAddress ? 'Analizando satélite...' : addressDisplay}
                    </p>
                    {!loadingAddress && mapUri && (
                        <a 
                          href={mapUri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-pink-400 hover:text-pink-300 hover:underline mt-1 inline-flex items-center gap-1 transition-colors"
                        >
                            Ver en Google Maps <ExternalLink size={10} />
                        </a>
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
              disabled={!position || loadingAddress}
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