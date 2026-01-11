const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Mock Data
const products = {
    "ALPHAF03": {
        id: "ALPHAF03",
        name: "나이키 알파플라이 3",
        size: "265",
        color: "블랙",
        style: "IM8066-999",
        price: 349000,
        stock: 1
    }
};

const users = {
    "HD2023091234": {
        id: "HD2023091234",
        name: "김준호",
        level: "VIP ⭐",
        points: 125000
    },
    "HD2023091235": {
        id: "HD2023091235",
        name: "이영희",
        level: "GOLD ⭐",
        points: 85000
    },
    "HD2023091236": {
        id: "HD2023091236",
        name: "박철수",
        level: "Friends",
        points: 12000
    },
    "HD2023091237": {
        id: "HD2023091237",
        name: "최지은",
        level: "VIP ⭐",
        points: 98000
    },
    "HD2023091238": {
        id: "HD2023091238",
        name: "정수민",
        level: "GOLD ⭐",
        points: 67000
    }
};

let pendingCustomers = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // VPOS scans a product
    socket.on('vpos-scan', (barcode) => {
        console.log('VPOS Scanned:', barcode);
        const product = products[barcode] || products["ALPHAF03"]; // Default for demo
        io.emit('product-info', product);
    });

    // Customer enters "Card" tab (starts BLE scan simulation)
    socket.on('customer-scan', (userIds) => {
        console.log('Customer Scanning:', userIds);

        // Handle both single userId (string) and multiple userIds (array)
        const idsArray = Array.isArray(userIds) ? userIds : [userIds];

        idsArray.forEach(userId => {
            const user = users[userId] || users["HD2023091234"];

            // Add to pending if not already there
            if (!pendingCustomers.find(c => c.id === user.id)) {
                pendingCustomers.push({ ...user, socketId: socket.id });
            }
        });

        // Notify VPOS of the updated pending list
        io.emit('pending-customers-update', pendingCustomers);

        // Auto-select if only 1 customer is pending
        if (pendingCustomers.length === 1) {
            const customer = pendingCustomers[0];
            const data = {
                user: customer,
                store: {
                    name: "현대백화점 압구정점",
                    location: "6F 스포츠관 나이키",
                    staff: "한아름 (224456)"
                }
            };

            // Notify the specific customer
            io.to(customer.socketId).emit('ble-connection-success', data);

            // Notify VPOS with auto-select flag
            io.emit('vpos-auto-select', data);
        }
    });

    // VPOS selects a specific customer
    socket.on('vpos-select-customer', (userId) => {
        console.log('VPOS Selected Customer:', userId);
        const customer = pendingCustomers.find(c => c.id === userId);

        if (customer) {
            const data = {
                user: customer,
                store: {
                    name: "현대백화점 압구정점",
                    location: "6F 스포츠관 나이키",
                    staff: "한아름 (224456)"
                }
            };

            // Notify the specific customer
            io.to(customer.socketId).emit('ble-connection-success', data);

            // Notify VPOS
            socket.emit('ble-connection-success', data);

            // Removed: immediate filtering from pendingCustomers to allow "Back" navigation
            // pendingCustomers = pendingCustomers.filter(c => c.id !== userId);
            // io.emit('pending-customers-update', pendingCustomers);
        }
    });

    // VPOS sends payment options/benefits
    socket.on('vpos-benefits', (data) => {
        console.log('Sending benefits:', data);
        io.emit('benefit-info', data);
    });

    // VPOS starts App Payment
    socket.on('vpos-request-app-payment', (orderData) => {
        console.log('Requesting App Payment:', orderData);
        io.emit('receive-order', orderData);
    });

    // Customer completes App Payment
    socket.on('customer-payment-complete', (receiptData) => {
        console.log('Payment Complete:', receiptData);
        // Remove from pending on completion
        pendingCustomers = pendingCustomers.filter(c => c.socketId !== socket.id);
        io.emit('pending-customers-update', pendingCustomers);
        io.emit('payment-status-update', { status: 'COMPLETE', receipt: receiptData });
    });

    // VPOS completes Offline Payment
    socket.on('vpos-offline-payment-complete', (receiptData) => {
        console.log('Offline Payment Complete:', receiptData);
        // Clean up from pending list
        if (receiptData.userId) {
            pendingCustomers = pendingCustomers.filter(c => c.id !== receiptData.userId);
            io.emit('pending-customers-update', pendingCustomers);
        }
        io.emit('offline-payment-notification', receiptData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const removed = pendingCustomers.find(c => c.socketId === socket.id);
        if (removed) {
            pendingCustomers = pendingCustomers.filter(c => c.socketId !== socket.id);
            io.emit('pending-customers-update', pendingCustomers);
        }
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Simulation Server running on http://localhost:${PORT}`);
});
