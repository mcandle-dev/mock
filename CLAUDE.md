# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a BLE-based payment system simulation for a department store (현대백화점). The system demonstrates minimal staff intervention during checkout by using real-time Socket.io communication between main components:

1. **VPOS** (Virtual Point of Sale) - Staff terminal
   - Web version (React)
   - Android native version (Kotlin)
2. **Customer App** - Customer mobile application (React web app)
3. **Server** - WebSocket server coordinating communication

## Architecture

The system uses a **Socket.io event-driven architecture** where all three applications connect to a central server that manages state and broadcasts events:

- **Server** (port 4000): Express.js + Socket.io server that maintains mock product/user data and manages the pending customer queue
- **VPOS** (port 5173): React app simulating staff terminal that scans products and initiates BLE connections
- **Customer** (port 5174): React app simulating customer mobile app that receives orders and completes payments

### Key Socket.io Events Flow

**Product Scanning Flow:**
- VPOS emits `vpos-scan` → Server broadcasts `product-info` to all clients

**Customer Connection Flow:**
- Customer emits `customer-scan` → Server adds to `pendingCustomers` and broadcasts `pending-customers-update`
- VPOS emits `vpos-select-customer` → Server emits `ble-connection-success` to both VPOS and specific customer

**Payment Flow:**
- **App Payment**: VPOS emits `vpos-request-app-payment` → Server broadcasts `receive-order` → Customer completes payment and emits `customer-payment-complete` → Server broadcasts `payment-status-update`
- **Offline Payment**: VPOS emits `vpos-offline-payment-complete` → Server broadcasts `offline-payment-notification`

### State Management

- Server maintains `pendingCustomers` array tracking customers in BLE scan range
- Each customer socket is tracked by `socketId` for targeted event delivery
- Customers are removed from pending list on payment completion or disconnect

## Development Commands

### Initial Setup
```bash
# Install all dependencies (run in each directory)
cd server && npm install
cd customer && npm install
cd vpos && npm install

# For Android VPOS (optional)
# Open vpos_android/ in Android Studio
# Sync Gradle dependencies automatically
```

### Running the Application

**Web Version:**
**Start in this order:**
1. `cd server && node index.js` - Start WebSocket server on port 4000
2. `cd vpos && npm run dev` - Start VPOS terminal on http://localhost:5173
3. `cd customer && npm run dev` - Start customer app on http://localhost:5174

**Android VPOS Version:**
1. Start server: `cd server && node index.js`
2. Open `vpos_android/` in Android Studio
3. Update server IP address in `SocketRepository.kt` if testing on physical device
4. Run on emulator or physical device
5. Open Customer app (http://localhost:5174) in a browser

### Development
- `npm run dev` - Start Vite dev server (customer & vpos)
- `npm run build` - Build for production (customer & vpos)
- `npm run lint` - Run ESLint (customer & vpos)
- `npm run preview` - Preview production build (customer & vpos)

### Testing the Flow
1. Open VPOS (localhost:5173) and click "바코드 스캔 시뮬레이션"
2. Open Customer app (localhost:5174) and navigate to "카드" tab
3. Wait 3 seconds for BLE scan simulation to complete
4. Select customer from pending list in VPOS
5. Choose payment method (App Payment or Offline Payment)

## Code Structure

### Server (server/index.js)
- Single file CommonJS Express server
- Mock data: `products` object (product info by barcode), `users` object (customer info by ID)
- Socket.io event handlers manage the entire transaction flow
- No database - all state is in-memory

### VPOS (vpos/src/App.jsx)
- Single-file React component with multiple screen states
- Screen flow: `MAIN` → `SCANNED` → `MEMBERSHIP` → `BENEFITS` → `PAYMENT_A/PAYMENT_B` → `DONE`
- Uses Framer Motion for animations and Lucide React for icons
- Hardcoded store info: 현대백화점 압구정점, 6F 나이키

### Customer (customer/src/App.jsx)
- Single-file React component with tab-based navigation
- Tab states: `HOME`, `CARD`, `BENEFITS`, `MY`
- Screen states within CARD tab: `IDLE` → `SCANNING` → `CONNECTED` → `ORDER` → `KAKAOPAY` → `DONE`
- Simulates 3-second BLE scan delay and 2-second fingerprint authentication
- Hardcoded user: 김준호 (HD2023091234, VIP member with 125,000 points)

### VPOS Android (vpos_android/)
- Native Android application built with Kotlin
- MVVM architecture using ViewModel and LiveData
- Activities: `MainActivity`, `BenefitsActivity`, `PaymentActivity`, `SuccessActivity`
- SocketRepository pattern for Socket.io communication
- RecyclerView with custom adapter for BLE device list
- Material Design components with custom theming
- Same Socket.io event flow as web VPOS
- Simulates BLE scanning with mock device discovery

**Key Components:**
- `MainActivity.kt`: Main screen with product scanning and customer selection
- `SocketRepository.kt`: Centralized Socket.io connection management
- `MainViewModel.kt`: Business logic and state management
- `BleDeviceAdapter.kt`: RecyclerView adapter for pending customers
- Model classes: `Customer`, `Product`, `Store`

**Dependencies:**
- Socket.io client (io.socket:socket.io-client)
- Material Design Components
- Android Jetpack (ViewModel, LiveData)
- Kotlin Coroutines

### Styling
- Both React apps use custom CSS with CSS variables for theming
- Dark theme with gold accents for premium feel
- Glass morphism effects (`.glass-card`, `.glass-panel`)
- Responsive design with mobile-first approach

## Important Technical Details

### Socket.io Connection
- Both React apps connect to `http://localhost:4000` on mount
- Connection is persistent during session
- Server CORS is configured to accept all origins (`origin: "*"`)

### Vite Configuration
- VPOS uses standard Vite 7.2.4
- Customer uses Rolldown Vite fork (`npm:rolldown-vite@7.2.5`) with package overrides
- Custom ports configured in `vite.config.js`

### React Version
- Both apps use React 19.2.0 (latest)
- No TypeScript - pure JavaScript with JSX

### Mock Data IDs
- Default product: `ALPHAF03` (나이키 알파플라이 3, ₩349,000)
- Default user: `HD2023091234` (김준호, VIP, 125,000P)
- Additional users: `HD2023091235` (이영희, GOLD), `HD2023091236` (박철수, Friends)

## Common Modifications

### Adding New Products
Edit `server/index.js` `products` object with new barcode keys

### Adding New Users
Edit `server/index.js` `users` object with new user IDs

### Changing Ports
- Server: Modify `PORT` constant in `server/index.js` and update socket URLs in both React apps
- VPOS/Customer: Modify `server.port` in respective `vite.config.js` files

### Adding New Socket Events
1. Add event handler in `server/index.js` using `socket.on()`
2. Add event emitter in appropriate React component
3. Add event listener in receiving component's `useEffect`

## Known Limitations

- No persistence - all data is lost on server restart
- No authentication or security measures (simulation only)
- Single hardcoded store location
- No error handling for disconnections or network issues
- Customer removal from pending list only happens on payment completion or disconnect
