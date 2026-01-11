# BLE Payment System Simulation

A demonstration of a BLE-based payment system for department stores (현대백화점) with minimal staff intervention during checkout.

## 🎯 Overview

This project simulates a modern contactless payment system where customers can complete purchases with minimal interaction with staff. The system uses real-time Socket.io communication to coordinate between staff terminals (VPOS) and customer mobile devices.

## 🏗️ Architecture

The system consists of three main components:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    VPOS     │◄─────►│   Server    │◄─────►│  Customer   │
│  (Staff)    │       │  (Socket.io)│       │    (App)    │
└─────────────┘       └─────────────┘       └─────────────┘
   Web/Android          WebSocket              Web App
```

### Components

1. **Server** (`server/`)
   - Express.js + Socket.io WebSocket server
   - Manages real-time communication between all clients
   - Maintains mock product and user data
   - Port: 4000

2. **VPOS - Virtual Point of Sale** (`vpos/` & `vpos_android/`)
   - Staff terminal for product scanning and payment processing
   - Available in both web (React) and Android (Kotlin) versions
   - Manages customer connection via simulated BLE
   - Port: 5173 (web version)

3. **Customer App** (`customer/`)
   - React-based web app simulating customer mobile device
   - Receives orders and processes payments
   - Simulates fingerprint authentication
   - Port: 5174

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Android Studio (optional, for Android VPOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/mcandle-dev/mock.git
cd mock

# Install dependencies for each component
cd server && npm install && cd ..
cd customer && npm install && cd ..
cd vpos && npm install && cd ..
```

### Running the Application

**Option 1: Web Version (Recommended for testing)**

```bash
# Terminal 1: Start the server
cd server
node index.js

# Terminal 2: Start VPOS (staff terminal)
cd vpos
npm run dev
# Open http://localhost:5173

# Terminal 3: Start Customer app
cd customer
npm run dev
# Open http://localhost:5174
```

**Option 2: Android VPOS + Web Customer**

```bash
# Terminal 1: Start the server
cd server
node index.js

# Terminal 2: Start Customer app
cd customer
npm run dev

# Android Studio: Open vpos_android/
# Update server URL in SocketRepository.kt if needed
# Run on emulator or device
```

## 📱 Testing the Flow

1. **VPOS**: Click "바코드 스캔 시뮬레이션" to scan a product
2. **Customer**: Navigate to "카드" tab and wait for BLE scan (3 seconds)
3. **VPOS**: Select the customer from the pending list
4. **VPOS**: Choose payment method:
   - **App Payment**: Customer receives order on their device
   - **Offline Payment**: Payment processed directly on VPOS
5. **Customer** (if App Payment): Complete payment with fingerprint
6. **VPOS**: Transaction complete!

## 🎨 Features

### Current Features
- Real-time Socket.io communication
- Simulated BLE device discovery
- Product scanning simulation
- Multiple payment methods (app-based and offline)
- Customer membership tier display
- Order summary and receipt
- Fingerprint authentication simulation
- Multiple customer support

### Mock Data
- **Products**: Nike Alphafly 3 (₩349,000)
- **Customers**:
  - 김준호 (VIP, 125,000 points)
  - 이영희 (GOLD)
  - 박철수 (Friends)
- **Store**: 현대백화점 압구정점, 6F 나이키

## 🛠️ Technology Stack

### Server
- Node.js
- Express.js
- Socket.io

### VPOS (Web)
- React 19.2.0
- Vite 7.2.4
- Framer Motion (animations)
- Lucide React (icons)

### VPOS (Android)
- Kotlin
- Android Jetpack (ViewModel, LiveData)
- Socket.io Android Client
- Material Design Components
- MVVM Architecture

### Customer App
- React 19.2.0
- Rolldown Vite 7.2.5
- Socket.io Client

## 📂 Project Structure

```
mock/
├── server/              # WebSocket server
│   ├── index.js        # Main server file with Socket.io handlers
│   └── package.json
├── vpos/               # Web-based VPOS
│   ├── src/
│   │   └── App.jsx    # Main VPOS component
│   └── package.json
├── vpos_android/       # Android VPOS
│   ├── app/
│   │   └── src/main/java/com/mcandle/vpos/
│   │       ├── MainActivity.kt
│   │       ├── repository/SocketRepository.kt
│   │       └── viewmodel/MainViewModel.kt
│   └── build.gradle.kts
├── customer/           # Customer mobile app
│   ├── src/
│   │   └── App.jsx    # Main customer app component
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Changing Server Port

1. Update `PORT` in `server/index.js`
2. Update socket URL in `vpos/src/App.jsx`
3. Update socket URL in `customer/src/App.jsx`
4. Update socket URL in `vpos_android/app/src/main/java/.../SocketRepository.kt`

### Changing Client Ports

Update `server.port` in respective `vite.config.js` files:
- `vpos/vite.config.js` (default: 5173)
- `customer/vite.config.js` (default: 5174)

### Adding Products

Edit the `products` object in `server/index.js`:

```javascript
const products = {
  'YOUR_BARCODE': {
    name: 'Product Name',
    price: 100000,
    brand: 'Brand Name',
    originalPrice: 120000
  }
};
```

### Adding Customers

Edit the `users` object in `server/index.js`:

```javascript
const users = {
  'USER_ID': {
    name: '이름',
    membership: 'VIP', // VIP, GOLD, or Friends
    points: 50000,
    email: 'user@example.com',
    phone: '010-1234-5678'
  }
};
```

## 📡 Socket.io Events

### VPOS Events
- `vpos-scan`: Scan product barcode
- `vpos-select-customer`: Select customer from pending list
- `vpos-request-app-payment`: Request app-based payment
- `vpos-offline-payment-complete`: Complete offline payment

### Customer Events
- `customer-scan`: Initiate BLE scan
- `customer-payment-complete`: Complete payment with fingerprint

### Server Broadcasts
- `product-info`: Product details after scan
- `pending-customers-update`: Updated list of nearby customers
- `ble-connection-success`: BLE connection established
- `receive-order`: Order details sent to customer
- `payment-status-update`: Payment completion status
- `offline-payment-notification`: Offline payment notification

## ⚠️ Known Limitations

- No persistent database (all data in-memory)
- No real BLE implementation (simulated)
- No authentication or security measures
- Single store location hardcoded
- No error handling for network disconnections
- No internationalization (Korean only)

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Detailed technical documentation for developers
- [ANDROID_VPOS_개발가이드.md](./ANDROID_VPOS_개발가이드.md) - Android VPOS development guide
- [Project_Report.md](./Project_Report.md) - Project overview and requirements
- [DEVLOG_2025-12-23.md](./DEVLOG_2025-12-23.md) - Development log

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify for your own use cases.

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🙋‍♂️ Support

For questions or issues, please open an issue on GitHub.

---

**Note**: This is a simulation/prototype and should not be used in production environments without proper security measures, error handling, and real BLE implementation.
