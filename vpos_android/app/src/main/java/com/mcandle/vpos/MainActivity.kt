package com.mcandle.vpos

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.mcandle.vpos.adapter.BleDeviceAdapter
import com.mcandle.vpos.databinding.ActivityMainBinding
import com.mcandle.vpos.databinding.DialogSettingsBinding
import com.mcandle.vpos.viewmodel.MainViewModel
import java.text.NumberFormat
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()
    private lateinit var customerAdapter: BleDeviceAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        setupObservers()
        setupClickListeners()

        // Socket 연결
        viewModel.connectSocket()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        binding.toolbar.title = viewModel.storeTitle.value
    }

    private fun setupRecyclerView() {
        customerAdapter = BleDeviceAdapter { customer ->
            viewModel.selectCustomer(customer.id)
        }

        binding.rvCustomers.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = customerAdapter
        }
    }

    private fun setupObservers() {
        // Product 상태
        viewModel.product.observe(this) { product ->
            if (product != null) {
                binding.layoutBeforeScan.visibility = View.GONE
                binding.layoutAfterScan.visibility = View.VISIBLE
                binding.tvProductName.text = product.name
                binding.tvProductDetails.text = "${product.size} / ${product.color}"
                binding.tvProductPrice.text = formatPrice(product.price)
                binding.tvProductStyle.text = product.style
            } else {
                binding.layoutBeforeScan.visibility = View.VISIBLE
                binding.layoutAfterScan.visibility = View.GONE
            }
        }

        // Pending Customers
        viewModel.pendingCustomers.observe(this) { customers ->
            binding.tvCustomerCount.text = getString(R.string.pending_customers, customers.size)

            if (customers.isEmpty()) {
                binding.layoutEmptyState.visibility = View.VISIBLE
                binding.rvCustomers.visibility = View.GONE
            } else {
                binding.layoutEmptyState.visibility = View.GONE
                binding.rvCustomers.visibility = View.VISIBLE
                customerAdapter.submitList(customers)
            }
        }

        // Customer Selection
        viewModel.customer.observe(this) { customer ->
            if (customer != null) {
                try {
                    Log.d("MainActivity", "Selection Loop - Step 1: Customer data received: ${customer.name}")
                    
                    val intent = Intent(this, BenefitsActivity::class.java).apply {
                        putExtra("EXTRA_CUSTOMER", customer)
                        putExtra("EXTRA_PRODUCT", viewModel.product.value)
                    }
                    
                    Log.d("MainActivity", "Selection Loop - Step 2: Calling startActivity...")
                    Toast.makeText(this, "혜택 조회 화면으로 이동합니다...", Toast.LENGTH_SHORT).show()
                    startActivity(intent)
                    
                    // UI가 화면 전환을 처리할 시간을 주기 위해 약간의 지연 후 리셋
                    binding.root.postDelayed({
                        viewModel.resetTransaction()
                        Log.d("MainActivity", "Selection Loop - Step 3: ViewModel data reset.")
                    }, 500)
                    
                } catch (e: Exception) {
                    Log.e("MainActivity", "Selection Loop - ERROR: ${e.message}")
                    e.printStackTrace()
                }
            }
        }

        // Store Info
        viewModel.storeTitle.observe(this) { title ->
            binding.toolbar.title = title
        }

        viewModel.storeLocation.observe(this) { location ->
            binding.tvShopLocation.text = location
        }

        viewModel.storeSalesperson.observe(this) { salesperson ->
            binding.tvSalesperson.text = salesperson
        }
    }

    private fun setupClickListeners() {
        binding.btnScanSimulation.setOnClickListener {
            viewModel.scanProduct("ALPHAF03")
        }

        binding.btnCancel.setOnClickListener {
            viewModel.resetTransaction()
        }

        binding.btnSettings.setOnClickListener {
            showSettingsDialog()
        }
    }

    private fun showSettingsDialog() {
        val dialogBinding = DialogSettingsBinding.inflate(layoutInflater)

        // 현재 값 설정
        dialogBinding.etTitle.setText(viewModel.storeTitle.value)
        dialogBinding.etShop.setText(viewModel.storeLocation.value)
        dialogBinding.etSalesperson.setText(viewModel.storeSalesperson.value)

        val dialog = MaterialAlertDialogBuilder(this)
            .setView(dialogBinding.root)
            .create()

        dialogBinding.btnCancel.setOnClickListener {
            dialog.dismiss()
        }

        dialogBinding.btnSave.setOnClickListener {
            viewModel.updateStoreInfo(
                title = dialogBinding.etTitle.text.toString(),
                location = dialogBinding.etShop.text.toString(),
                salesperson = dialogBinding.etSalesperson.text.toString()
            )
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun formatPrice(price: Int): String {
        val formatter = NumberFormat.getNumberInstance(Locale.KOREA)
        return "${formatter.format(price)}원"
    }

    override fun onDestroy() {
        super.onDestroy()
        viewModel.disconnectSocket()
    }
}