# Migration from OpenStreetMap to Google Maps - Complete Guide

## Overview
This document explains the complete migration from OpenStreetMap/Leaflet to Google Maps API while preserving all functionality including manual location input.

---

## **What Changed?**

### **Before (OpenStreetMap)**
- **Map Library**: Leaflet (react-leaflet)
- **Map Tiles**: OpenStreetMap tiles
- **Geocoding**: Nominatim API (free, no API key needed)
- **Search**: Nominatim search API

### **After (Google Maps)**
- **Map Library**: Google Maps JavaScript API (@react-google-maps/api)
- **Map Tiles**: Google Maps tiles
- **Geocoding**: Google Geocoding API
- **Search**: Google Places Autocomplete API

---

## **Why Google Maps?**

### **Advantages**
1. **Better Data Quality**: More accurate addresses and better coverage
2. **Faster Performance**: Optimized tile loading and caching
3. **Rich Features**: Street View, traffic, terrain layers
4. **Better Search**: Intelligent autocomplete with fuzzy matching
5. **Reliability**: Enterprise-grade infrastructure

### **Trade-offs**
1. **API Key Required**: Need Google Cloud account
2. **Usage Limits**: Free tier has limits (see pricing below)
3. **Billing Required**: Must enable billing (but free tier is generous)

---

## **Step-by-Step Migration Process**

### **1. Install New Dependencies**

```bash
npm install @react-google-maps/api
```

This package provides:
- React hooks for Google Maps
- TypeScript support out of the box
- Optimized performance with memo/callbacks

### **2. Remove Old Dependencies**

```bash
npm uninstall leaflet react-leaflet @types/leaflet
```

This removes all Leaflet-related packages.

### **3. Get Google Maps API Key**

#### **A. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required, but free tier is generous)

#### **B. Enable Required APIs**
In the Google Cloud Console, enable these APIs:
- **Maps JavaScript API** (for map display)
- **Geocoding API** (for address lookups)
- **Places API** (for search autocomplete)

#### **C. Create API Key**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. **Important**: Restrict the key:
   - Application restrictions: HTTP referrers
   - Add your domains (localhost:*, yourdomain.com/*)
   - API restrictions: Select only the 3 APIs above

#### **D. Add to Environment Variables**
```bash
# .env.local
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

---

## **Code Architecture Explained**

### **Component Structure**

```
StepLocation.tsx
├── State Management (position, address, loading states, manual mode)
├── Google Maps API Loader (useJsApiLoader hook)
├── Geocoding Functions (coordinates ↔ address)
├── Event Handlers (map click, GPS, search, manual mode)
├── UI Components
│   ├── Search Bar with Autocomplete
│   ├── GPS Location Button
│   ├── Google Map Component
│   ├── Address Display Panel
│   └── Manual Edit Mode
└── Navigation Buttons
```

### **Key Functions Breakdown**

#### **1. useJsApiLoader**
```typescript
const { isLoaded, loadError } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ["places", "geocoding"],
});
```
**What it does:**
- Loads the Google Maps JavaScript API asynchronously
- Only loads once (cached)
- Loads additional libraries we need (Places for search, Geocoding for addresses)
- Returns `isLoaded` when ready and `loadError` if failed

#### **2. Reverse Geocoding**
```typescript
const getAddressFromCoordinates = async (lat: number, lng: number) => {
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ location: { lat, lng } });
  const address = response.results[0].formatted_address;
  // Update state with address
}
```
**What it does:**
- Takes GPS coordinates (latitude, longitude)
- Calls Google's Geocoding API
- Returns a human-readable address
- Example: `19.4326, -99.1332` → `"Plaza de la Constitución, Centro Histórico, CDMX"`

#### **3. Map Click Handler**
```typescript
const handleMapClick = (e: google.maps.MapMouseEvent) => {
  if (e.latLng) {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setPosition(newPos);
    getAddressFromCoordinates(newPos.lat, newPos.lng);
  }
}
```
**What it does:**
- Fires when user clicks anywhere on the map
- Extracts the clicked coordinates from the event
- Updates the marker position
- Fetches the address for those coordinates
- Smoothly pans the map to the new location

#### **4. GPS Location**
```typescript
const handleLocateUser = () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const newPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      setPosition(newPos);
      getAddressFromCoordinates(newPos.lat, newPos.lng);
    },
    (err) => {
      // Fallback to Mexico City center
    }
  );
}
```
**What it does:**
- Uses browser's Geolocation API
- Asks user for permission to access location
- If granted, gets current GPS coordinates
- Updates map to user's location
- If denied, falls back to default center (Mexico City)

#### **5. Places Autocomplete**
```typescript
autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
  componentRestrictions: { country: 'mx' },
  fields: ['geometry', 'formatted_address', 'name'],
});

autocompleteRef.current.addListener('place_changed', () => {
  const place = autocompleteRef.current?.getPlace();
  // Extract coordinates and address from selected place
});
```
**What it does:**
- Attaches to the search input element
- Shows autocomplete suggestions as user types
- Restricts results to Mexico (`country: 'mx'`)
- When user selects a place, gets its coordinates
- Moves map to selected location

#### **6. Manual Address Mode**
```typescript
const toggleManualMode = () => {
  if (isManualMode) {
    // Save: update draft with manual address
    updateDraft({
      location: {
        ...draft.location!,
        address: manualAddress
      }
    });
  } else {
    // Edit: enter manual mode
    setManualAddress(addressDisplay);
  }
  setIsManualMode(!isManualMode);
}
```
**What it does:**
- Allows user to override the auto-detected address
- Clicking edit icon switches to textarea
- User can type custom address
- Clicking check icon saves the manual address
- Coordinates stay the same, only address text changes

---

## **UI/UX Features Preserved**

### **1. Dark Mode Aesthetic**
- Custom dark Google Maps styles
- Zinc-900/950 backgrounds
- Pink/red accent colors
- Glassmorphism effects with backdrop blur

### **2. Interactive Elements**
- GPS button with loading spinner
- Search bar with autocomplete
- Click anywhere on map to select
- Manual address editing
- Smooth animations and transitions

### **3. Loading States**
- Map loading spinner
- Address fetching indicator
- GPS loading state
- Search processing feedback

### **4. Error Handling**
- API key validation
- Geocoding fallbacks
- GPS permission handling
- Search error messages

---

## **Google Maps Pricing**

### **Free Tier (Monthly)**
- **Map Loads**: 28,000 free
- **Geocoding**: 40,000 free
- **Places Autocomplete**: $0 for first 1,000, then $2.83 per 1,000

### **Typical Usage for This App**
- Each user session = 1 map load
- Each location selection = 1 geocoding request
- Each search = 1-5 autocomplete requests

### **Example Calculation**
For 1,000 users per month:
- Map loads: 1,000 (well under 28,000 limit) = **FREE**
- Geocoding: ~2,000 (under 40,000 limit) = **FREE**
- Autocomplete: ~3,000 (first 1,000 free) = **~$5.66**

**Total: ~$6/month for 1,000 active users**

### **How to Monitor Usage**
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Dashboard"
3. View usage charts for each API
4. Set up billing alerts to avoid surprises

---

## **Environment Variables Reference**

```bash
# .env.local

# Google Maps API Key (required for map functionality)
VITE_GOOGLE_MAPS_API_KEY=AIza...your-key-here

# Supabase (for storing denuncias)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...your-key-here

# Gemini AI (for any AI features)
GEMINI_API_KEY=AIza...your-key-here
```

**Important Notes:**
- All `VITE_*` prefixed variables are exposed to the client
- Never commit `.env.local` to git (it's in .gitignore)
- Use different keys for development and production
- Restrict API keys to specific domains

---

## **Testing Checklist**

### **Before Deployment**
- [ ] Google Maps API key is set in `.env.local`
- [ ] All 3 APIs are enabled (Maps, Geocoding, Places)
- [ ] API key restrictions are configured
- [ ] Map loads without errors
- [ ] GPS button works (asks for permission)
- [ ] Search autocomplete shows suggestions
- [ ] Click on map updates location
- [ ] Manual address edit works
- [ ] Address reverse geocoding works
- [ ] Mobile responsive

### **For Production**
- [ ] Create separate production API key
- [ ] Restrict to production domain only
- [ ] Set up billing alerts
- [ ] Monitor API usage
- [ ] Test on real devices

---

## **Common Issues & Solutions**

### **Issue: Map doesn't load / blank gray box**
**Solutions:**
1. Check if API key is set correctly in `.env.local`
2. Verify Maps JavaScript API is enabled in Google Cloud
3. Check browser console for errors
4. Restart dev server after changing `.env.local`

### **Issue: "This page can't load Google Maps correctly"**
**Solutions:**
1. Billing must be enabled in Google Cloud (even for free tier)
2. Check if API key restrictions are too strict
3. Verify referrer URLs are correct

### **Issue: Search doesn't work**
**Solutions:**
1. Check if Places API is enabled
2. Verify `libraries: ["places"]` is in useJsApiLoader
3. Check console for JavaScript errors

### **Issue: Addresses not showing**
**Solutions:**
1. Check if Geocoding API is enabled
2. Verify API key has permission for Geocoding API
3. Check network tab for failed requests

---

## **Migration Benefits Summary**

### **Technical**
✅ Better type safety with @react-google-maps/api
✅ More reliable geocoding
✅ Faster search with intelligent autocomplete
✅ Better mobile performance

### **User Experience**
✅ More accurate addresses
✅ Better search suggestions
✅ Smoother map interactions
✅ Same manual input capability preserved

### **Maintenance**
✅ Better documentation from Google
✅ Active community support
✅ Regular updates and improvements
✅ Enterprise support available

---

## **Next Steps**

1. **Get your Google Maps API key** (see section 3 above)
2. **Add it to `.env.local`** file
3. **Restart the dev server**: `npm run dev`
4. **Test all features** using the checklist
5. **Deploy to production** with production API key

---

## **Support Resources**

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api Docs](https://react-google-maps-api-docs.netlify.app/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

---

## **Quick Start Commands**

```bash
# Install dependencies (already done)
npm install @react-google-maps/api

# Remove old Leaflet (already done)
npm uninstall leaflet react-leaflet

# Add API key to .env.local
echo "VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE" >> .env.local

# Start dev server
npm run dev

# Build for production
npm run build
```

---

**Date**: November 26, 2025
**Migration Status**: ✅ Complete
**Tested**: Pending API key addition
