package com.mcandle.vpos.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.mcandle.vpos.model.Customer
import com.mcandle.vpos.model.Product
import com.mcandle.vpos.repository.SocketRepository

import org.json.JSONObject

class MainViewModel : ViewModel() {

    private val socketRepository = SocketRepository.getInstance()

    private val _product = MutableLiveData<Product?>()
    val product: LiveData<Product?> = _product

    private val _customer = MutableLiveData<Customer?>()
    val customer: LiveData<Customer?> = _customer

    private val _pendingCustomers = MutableLiveData<List<Customer>>(emptyList())
    val pendingCustomers: LiveData<List<Customer>> = _pendingCustomers

    private val _storeTitle = MutableLiveData("HYUNDAI VPOS")
    val storeTitle: LiveData<String> = _storeTitle

    private val _storeLocation = MutableLiveData("6F 나이키")
    val storeLocation: LiveData<String> = _storeLocation

    private val _storeSalesperson = MutableLiveData("한아름 (224456)")
    val storeSalesperson: LiveData<String> = _storeSalesperson

    private val _paymentStatus = MutableLiveData<String?>()
    val paymentStatus: LiveData<String?> = _paymentStatus

    init {
        setupSocketListeners()
    }

    private fun setupSocketListeners() {
        socketRepository.onProductInfo { product ->
            _product.postValue(product)
        }

        socketRepository.onPendingCustomersUpdate { customers ->
            _pendingCustomers.postValue(customers)
        }

        socketRepository.onBleConnectionSuccess { customer ->
            _customer.postValue(customer)
        }

        socketRepository.onPaymentStatusUpdate { status ->
            _paymentStatus.postValue(status)
        }
    }

    fun requestAppPayment(orderId: String, product: Product, customer: Customer) {
        socketRepository.requestAppPayment(orderId, product, customer)
    }

    fun completeOfflinePayment(receipt: JSONObject) {
        socketRepository.completeOfflinePayment(receipt)
    }

    fun resetPaymentStatus() {
        _paymentStatus.value = null
    }

    fun connectSocket() {
        socketRepository.connect()
    }

    fun disconnectSocket() {
        socketRepository.disconnect()
    }

    fun scanProduct(barcode: String) {
        socketRepository.scanProduct(barcode)
    }

    fun selectCustomer(userId: String) {
        socketRepository.selectCustomer(userId)
    }

    fun resetTransaction() {
        _product.value = null
        _customer.value = null
        _paymentStatus.value = null
    }

    fun updateStoreInfo(title: String, location: String, salesperson: String) {
        _storeTitle.value = title
        _storeLocation.value = location
        _storeSalesperson.value = salesperson
    }

    override fun onCleared() {
        super.onCleared()
        disconnectSocket()
    }
}
