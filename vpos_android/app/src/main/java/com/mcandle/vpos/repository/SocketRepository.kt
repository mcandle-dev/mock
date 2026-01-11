package com.mcandle.vpos.repository

import android.util.Log
import com.mcandle.vpos.model.Customer
import com.mcandle.vpos.model.Product
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.net.URISyntaxException

class SocketRepository private constructor() {
    companion object {
        @Volatile
        private var instance: SocketRepository? = null

        fun getInstance(): SocketRepository {
            return instance ?: synchronized(this) {
                instance ?: SocketRepository().also { instance = it }
            }
        }
    }

    // 에뮬레이터용: 10.0.2.2 (localhost를 에뮬레이터에서 접근)
    // 실제 디바이스용: PC의 실제 IP 주소 사용
    private val serverUrl = "http://10.0.2.2:4000"
    private val socket: Socket

    init {
        try {
            Log.d("SocketRepository", "Initializing socket for $serverUrl")
            socket = IO.socket(serverUrl)
            
            socket.on(Socket.EVENT_CONNECT) {
                Log.d("SocketRepository", "Connected to server")
            }
            
            socket.on(Socket.EVENT_DISCONNECT) {
                Log.d("SocketRepository", "Disconnected from server")
            }
            
            socket.on(Socket.EVENT_CONNECT_ERROR) { args ->
                Log.e("SocketRepository", "Connection Error: ${args[0]}")
            }

            // 디버깅: 서버에서 보낼 수 있는 다양한 이벤트 이름들을 감시
            val debugEvents = listOf(
                "customer-info", "user-info", "selection-result", 
                "vpos-selection-success", "vpos-customer-selected", "customer-details"
            )
            debugEvents.forEach { eventName ->
                socket.on(eventName) { args ->
                    Log.d("SocketRepository", "DEBUG: Received $eventName -> ${args.getOrNull(0)}")
                }
            }
        } catch (e: URISyntaxException) {
            Log.e("SocketRepository", "URISyntaxException: ${e.message}")
            throw RuntimeException(e)
        }
    }

    fun connect() {
        Log.d("SocketRepository", "Connecting...")
        socket.connect()
    }

    fun disconnect() {
        socket.disconnect()
    }

    fun onProductInfo(callback: (Product) -> Unit) {
        Log.d("SocketRepository", "Registering listener for product-info")
        socket.on("product-info") { args ->
            Log.d("SocketRepository", "Received product-info: ${args[0]}")
            try {
                val data = args[0] as JSONObject
                val product = Product(
                    id = data.getString("id"),
                    name = data.getString("name"),
                    size = data.getString("size"),
                    color = data.getString("color"),
                    style = data.getString("style"),
                    price = data.getInt("price"),
                    stock = data.getInt("stock")
                )
                callback(product)
            } catch (e: Exception) {
                Log.e("SocketRepository", "Error parsing product-info: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    fun onPendingCustomersUpdate(callback: (List<Customer>) -> Unit) {
        Log.d("SocketRepository", "Registering listener for pending-customers-update")
        socket.on("pending-customers-update") { args ->
            Log.d("SocketRepository", "Received pending-customers-update: ${args.getOrNull(0)}")
            try {
                val array = args[0] as JSONArray
                val customers = mutableListOf<Customer>()

                for (i in 0 until array.length()) {
                    val json = array.getJSONObject(i)
                    customers.add(
                        Customer(
                            id = json.getString("id"),
                            name = json.getString("name"),
                            level = json.getString("level"),
                            points = json.getInt("points"),
                            socketId = json.optString("socketId", "")
                        )
                    )
                }
                callback(customers)
            } catch (e: Exception) {
                Log.e("SocketRepository", "Error parsing pending-customers: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    fun onBleConnectionSuccess(callback: (Customer) -> Unit) {
        Log.d("SocketRepository", "Registering listener for ble-connection-success")
        socket.on("ble-connection-success") { args ->
            Log.d("SocketRepository", "Received ble-connection-success: ${args.getOrNull(0)}")
            try {
                val data = args[0] as JSONObject
                val userJson = data.getJSONObject("user")
                val customer = Customer(
                    id = userJson.getString("id"),
                    name = userJson.getString("name"),
                    level = userJson.getString("level"),
                    points = userJson.getInt("points"),
                    socketId = ""
                )
                callback(customer)
            } catch (e: Exception) {
                Log.e("SocketRepository", "Error parsing ble-connection-success: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    fun scanProduct(barcode: String) {
        val isConnected = socket.connected()
        Log.d("SocketRepository", "Emitting vpos-scan: $barcode (Connected: $isConnected)")
        socket.emit("vpos-scan", barcode)
    }

    fun selectCustomer(userId: String) {
        Log.d("SocketRepository", "Emitting vpos-select-customer: $userId")
        socket.emit("vpos-select-customer", userId)
    }

    fun requestAppPayment(orderId: String, product: Product, customer: Customer) {
        val productJson = JSONObject().apply {
            put("id", product.id)
            put("name", product.name)
            put("price", product.price)
            put("size", product.size)
            put("color", product.color)
            put("style", product.style)
        }
        val customerJson = JSONObject().apply {
            put("id", customer.id)
            put("name", customer.name)
            put("level", customer.level)
            put("points", customer.points)
        }
        val data = JSONObject().apply {
            put("orderId", orderId)
            put("product", productJson)
            put("customer", customerJson)
        }
        Log.d("SocketRepository", "Emitting vpos-request-app-payment: $data")
        socket.emit("vpos-request-app-payment", data)
    }

    fun completeOfflinePayment(receipt: JSONObject) {
        Log.d("SocketRepository", "Emitting vpos-offline-payment-complete: $receipt")
        socket.emit("vpos-offline-payment-complete", receipt)
    }

    fun onPaymentStatusUpdate(callback: (String) -> Unit) {
        socket.on("payment-status-update") { args ->
            try {
                val data = args[0] as JSONObject
                val status = data.getString("status")
                callback(status)
            } catch (e: Exception) {
                Log.e("SocketRepository", "Error parsing payment-status-update: ${e.message}")
            }
        }
    }
}
