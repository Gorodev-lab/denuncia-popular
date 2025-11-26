# Manual Address Input Feature - Detailed Explanation

## 🌟 Why This Feature is Important

**Problem**: Geocoding APIs (both Google and OpenStreetMap) return formal, structured addresses like:
```
"Av. Paseo de la Reforma 222, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX, Mexico"
```

**But real people describe locations like**:
```
"En frente de la farmacia del Dr. Simi, al lado del Oxxo"
"Dos cuadras después del semáforo, junto a la tortillería"
"Detrás de la escuela primaria, casa azul"
```

**The manual input feature** allows users to keep accurate GPS coordinates while using human-friendly descriptions that locals will understand.

---

## 🎯 How It Works

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: User Selects Location on Map                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User clicks on map or uses GPS                            │
│        ↓                                                    │
│   Coordinates: 19.4326, -99.1332                            │
│        ↓                                                    │
│   Google Geocoding API called                               │
│        ↓                                                    │
│   Address detected:                                         │
│   "Av. 5 de Mayo 1, Centro... [long formal address]"       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  DISPLAY: Address Panel                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📍 DIRECCIÓN DETECTADA                         [✏️ Edit]   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Av. 5 de Mayo 1, Centro Histórico, Cuauhtémoc,       │ │
│  │ 06000 Ciudad de México, CDMX, Mexico                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ⬅️ VOLVER                     CONFIRMAR UBICACIÓN ➡️       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    User clicks Edit ✏️
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  MANUAL EDIT MODE                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📍 EDITAR DIRECCIÓN MANUALMENTE                  [✓ Save]  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [User typing...]                                      │ │
│  │ En frente de la farmacia del Dr. Simi,               │ │
│  │ al lado del Oxxo de la esquina                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  ↑ TEXTAREA - User can type anything                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    User clicks Save ✓
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  SAVED: Custom Address                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📍 DIRECCIÓN DETECTADA                         [✏️ Edit]   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ En frente de la farmacia del Dr. Simi,               │ │
│  │ al lado del Oxxo de la esquina                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Coordinates: 19.4326, -99.1332 ✅ (UNCHANGED)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Code Walkthrough

### State Variables

```typescript
// In StepLocation component:

// Whether user is in manual edit mode
const [isManualMode, setIsManualMode] = useState(false);

// The manually typed address (separate from auto-detected)
const [manualAddress, setManualAddress] = useState('');

// The address displayed to user (can be auto or manual)
const [addressDisplay, setAddressDisplay] = useState('');
```

### The Toggle Function

```typescript
const toggleManualMode = () => {
  if (isManualMode) {
    // SAVING: User clicked Check icon
    
    // Update the displayed address
    setAddressDisplay(manualAddress);
    
    // Update the draft in parent component
    updateDraft({
      location: {
        ...draft.location!,  // Keep existing lat/lng
        address: manualAddress  // Use manual address
      }
    });
    
    // Exit manual mode
    setIsManualMode(false);
    
  } else {
    // EDITING: User clicked Edit icon
    
    // Copy current address to manual field
    setManualAddress(addressDisplay);
    
    // Enter manual mode
    setIsManualMode(true);
  }
};
```

### The UI Rendering

```tsx
{/* Address Display Panel */}
<div className="bg-zinc-900 p-3 md:p-4 rounded-xl border border-zinc-800">
  
  {/* Header with Edit/Save button */}
  <div className="flex justify-between items-center mb-1">
    <p className="text-xs text-zinc-500">
      {isManualMode ? 'EDITAR DIRECCIÓN MANUALMENTE' : 'DIRECCIÓN DETECTADA'}
    </p>
    
    {/* Toggle button */}
    <button onClick={toggleManualMode}>
      {isManualMode ? <Check size={14} /> : <Edit2 size={14} />}
    </button>
  </div>

  {/* Conditional rendering: textarea or text */}
  {isManualMode ? (
    // EDIT MODE: Textarea
    <textarea
      value={manualAddress}
      onChange={(e) => setManualAddress(e.target.value)}
      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2"
      rows={2}
      placeholder="Escribe la dirección exacta aquí..."
      autoFocus
    />
  ) : (
    // VIEW MODE: Text display
    <p className="text-sm text-zinc-200">
      {addressDisplay}
    </p>
  )}
</div>
```

---

## 🔄 Complete Data Flow

### Scenario: User Corrects Auto-Detected Address

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Initial State (Auto-Detected)                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ position = { lat: 19.4326, lng: -99.1332 }                  │
│ addressDisplay = "Av. 5 de Mayo 1, Centro..." (from Google) │
│ isManualMode = false                                         │
│ manualAddress = ""                                           │
│                                                              │
│ draft.location = {                                           │
│   lat: 19.4326,                                              │
│   lng: -99.1332,                                             │
│   address: "Av. 5 de Mayo 1, Centro..."                     │
│ }                                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    User clicks Edit ✏️
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Entering Manual Mode                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ toggleManualMode() called                                    │
│   → manualAddress = addressDisplay (copy current)           │
│   → isManualMode = true                                      │
│                                                              │
│ UI Changes:                                                  │
│   - Label changes to "EDITAR DIRECCIÓN MANUALMENTE"         │
│   - Text becomes <textarea>                                 │
│   - Edit icon ✏️ changes to Check icon ✓                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                     User types in textarea
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. User Typing                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ onChange handler fires on every keystroke                    │
│   → setManualAddress(e.target.value)                        │
│                                                              │
│ manualAddress updates in real-time:                          │
│   "E"                                                        │
│   "En"                                                       │
│   "En f"                                                     │
│   "En fren"                                                  │
│   "En frente de la farmacia..."                             │
│                                                              │
│ Note: draft.location NOT updated yet (only on save)         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    User clicks Save ✓
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Saving Manual Address                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ toggleManualMode() called again                              │
│   → addressDisplay = manualAddress (update display)         │
│   → updateDraft({ location: { ...location, address } })     │
│   → isManualMode = false (exit edit mode)                   │
│                                                              │
│ Final State:                                                 │
│ position = { lat: 19.4326, lng: -99.1332 } ✅ UNCHANGED     │
│ addressDisplay = "En frente de la farmacia..." ✅ UPDATED    │
│ isManualMode = false                                         │
│                                                              │
│ draft.location = {                                           │
│   lat: 19.4326,          ← Same coordinates                 │
│   lng: -99.1332,         ← Same coordinates                 │
│   address: "En frente de la farmacia..." ← NEW!             │
│ }                                                            │
│                                                              │
│ UI Changes:                                                  │
│   - Textarea becomes text display                           │
│   - Check icon ✓ becomes Edit icon ✏️                       │
│   - Shows custom address                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI States Comparison

### View Mode (Normal)
```
┌────────────────────────────────────────────────────┐
│ 📍 DIRECCIÓN DETECTADA               [✏️ Edit]     │
├────────────────────────────────────────────────────┤
│                                                    │
│ Av. 5 de Mayo 1, Centro Histórico,                │
│ Cuauhtémoc, 06000 Ciudad de México, CDMX          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Edit Mode (Manual)
```
┌────────────────────────────────────────────────────┐
│ 📍 EDITAR DIRECCIÓN MANUALMENTE      [✓ Save]     │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │ En frente de la farmacia del Dr. Simi,       │ │
│ │ al lado del Oxxo de la esquina_              │ │
│ └────────────────────────────────────────────────┘ │
│  ↑ User can type and edit                         │
└────────────────────────────────────────────────────┘
```

---

## 💡 Use Cases

### Case 1: Generic Address → Specific Description

**Auto-detected**:
```
"Calle Morelos 123, Centro, Guadalajara, Jalisco"
```

**User edits to**:
```
"Casa azul con portón café, en frente de la tienda de Don Pedro"
```

**Why**: Local authorities or inspectors will find it easier with local landmarks.

---

### Case 2: Wrong Building Number

**Auto-detected**:
```
"Av. Insurgentes Sur 1453, Del Valle"
```

**User edits to**:
```
"Av. Insurgentes Sur 1455, Del Valle (edificio rojo, planta baja)"
```

**Why**: Geocoding might pick the closest approximate number; user knows exact location.

---

### Case 3: Missing Apartment/Unit Info

**Auto-detected**:
```
"Torre Latinoamericana, Eje Central Lázaro Cárdenas"
```

**User edits to**:
```
"Torre Latinoamericana, Piso 15, Oficina 1502"
```

**Why**: Pin shows correct building, but manual address adds crucial details.

---

## 🔒 Data Integrity

### What's Preserved
- ✅ **Latitude** (exact coordinate)
- ✅ **Longitude** (exact coordinate)
- ✅ **Map marker position** (visual location)

### What Changes
- ✏️ **Address string** (text description only)

### Why This Matters
```javascript
// Example: Data sent to backend

{
  location: {
    lat: 19.4326,    // ← Used for mapping, distance calculations
    lng: -99.1332,   // ← Precise geographic data
    address: "En frente de la farmacia del Dr. Simi"  // ← Human description
  }
}
```

**Map will still show correct position**, but humans reading the report will have helpful context.

---

## 🧩 Integration with Form Wizard

### In the Complete Workflow

```
STEP 1: Location ← [Manual input happens here]
    ↓
    Draft stored:
    {
      location: {
        lat: 19.4326,
        lng: -99.1332,
        address: "Custom description"
      }
    }
    ↓
STEP 2: Incident Details
    ↓
STEP 3: Evidence Upload
    ↓
STEP 4: Contact Info
    ↓
REVIEW & SUBMIT
    ↓
PDF Generated with:
    - Map showing exact pin at (19.4326, -99.1332)
    - Text showing "Custom description"
```

---

## 🔧 Technical Implementation Details

### React Hooks Used

```typescript
// State for edit mode
const [isManualMode, setIsManualMode] = useState(false);

// State for manual text
const [manualAddress, setManualAddress] = useState('');

// Sync manual address when not editing
useEffect(() => {
  if (!isManualMode) {
    setManualAddress(addressDisplay);
  }
}, [addressDisplay, isManualMode]);
```

### Validation Logic

```typescript
// Disable "Next" button if:
// - No position selected
// - Address still loading
// - In manual mode but field is empty

disabled={
  !position || 
  loadingAddress || 
  (isManualMode && !manualAddress.trim())
}
```

**Why**: Ensures user doesn't proceed without an address.

---

## 🌍 Multilingual Support

The feature works in both English and Spanish (based on your translations system):

```typescript
// Spanish (default)
{
  placeholder: "Escribe la dirección exacta aquí...",
  editLabel: "EDITAR DIRECCIÓN MANUALMENTE",
  detectedLabel: "DIRECCIÓN DETECTADA"
}

// English
{
  placeholder: "Type the exact address here...",
  editLabel: "EDIT ADDRESS MANUALLY",
  detectedLabel: "DETECTED ADDRESS"
}
```

---

## ✅ Benefits Summary

### For Users
1. **Familiar descriptions**: Use local landmarks everyone knows
2. **Correct errors**: Fix wrong or generic geocoding results
3. **Add details**: Include floor, unit, or other specifics
4. **Flexibility**: Not forced to use Google's formal address

### For Recipients (Authorities)
1. **Better location info**: Local context helps find places
2. **Faster response**: No confusion about exact location
3. **Trust**: Shows complainant knows the area well

### Technical
1. **No loss of precision**: Coordinates stay accurate
2. **Simple**: Just a text override, no complex logic
3. **Reversible**: Can edit again anytime before submit
4. **Preserved**: Works exactly the same with Google Maps

---

## 📊 Comparison: With vs Without Manual Input

### WITHOUT Manual Input Feature

```
User: "The address Google detected is generic, but I know the spot"
System: "Sorry, you're stuck with what Google returns"
User: "😞 The inspector might get confused"
```

### WITH Manual Input Feature

```
User: "The address Google detected is generic, but I know the spot"
User: *Clicks edit*
User: *Types: "Behind the yellow school, blue house"*
User: *Clicks save*
System: "Perfect! Coordinates are accurate, description is helpful"
User: "😊 The inspector will find it easily"
```

---

## 🎯 Key Takeaway

**This feature gives users control over the ADDRESS TEXT while keeping the COORDINATES accurate.**

It's the perfect balance between:
- Machine precision (GPS coordinates)
- Human understanding (local descriptions)

**Result**: Better denuncias that are easier to locate! 🎉

---

## 📝 Testing the Feature

### Test Scenario 1: Basic Edit

1. Open the location step
2. Click anywhere on map
3. Wait for address to appear
4. Click Edit icon ✏️
5. Type "Test custom address"
6. Click Save ✓
7. Verify: Custom text shows, marker stays in same place

### Test Scenario 2: Empty Address Validation

1. Enter manual mode
2. Clear all text
3. Try to click "Confirmar Ubicación"
4. Verify: Button is disabled (can't proceed)

### Test Scenario 3: Multiple Edits

1. Set a location
2. Edit address → Save
3. Edit again → Change text → Save
4. Verify: Latest edit is preserved

### Test Scenario 4: Mobile

1. Open on mobile device
2. Enter manual mode
3. Type on mobile keyboard
4. Verify: Textarea is accessible and usable

---

**This feature makes your "denuncia popular" system much more user-friendly! 🚀**
