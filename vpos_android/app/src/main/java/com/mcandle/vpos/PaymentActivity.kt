package com.mcandle.vpos

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.mcandle.vpos.databinding.ActivityPaymentBinding
import com.mcandle.vpos.viewmodel.MainViewModel
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale

class PaymentActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPaymentBinding
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val mode = intent.getStringExtra("EXTRA_MODE") ?: "OFFLINE"
        val amount = intent.getIntExtra("EXTRA_AMOUNT", 0)
        val customer = intent.getSerializableExtra("EXTRA_CUSTOMER") as? com.mcandle.vpos.model.Customer
        val product = intent.getSerializableExtra("EXTRA_PRODUCT") as? com.mcandle.vpos.model.Product

        if (customer == null || product == null) {
            finish()
            return
        }

        setupUI(mode, amount)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnCompletePayment.setOnClickListener {
            if (mode == "OFFLINE") {
                val receipt = JSONObject().apply {
                    put("orderId", "ORD-OFF-" + System.currentTimeMillis())
                    put("productId", product.id)
                    put("paymentMethod", "현대백화점 카드")
                    put("amount", amount)
                    put("userId", customer.id)
                }
                viewModel.completeOfflinePayment(receipt)
                navigateToSuccess(product.name, amount)
            }
        }

        if (mode == "APP") {
            viewModel.requestAppPayment("ORD-APP-" + System.currentTimeMillis(), product, customer)
            
            viewModel.paymentStatus.observe(this) { status ->
                if (status == "COMPLETE") {
                    navigateToSuccess(product.name, amount)
                }
            }
        }
    }

    private fun setupUI(mode: String, amount: Int) {
        binding.tvPaymentAmount.text = "${formatNumber(amount)}원"
        
        if (mode == "APP") {
            binding.tvPaymentTitle.text = "앱 결제 대기"
            binding.ivPaymentIcon.setImageResource(R.drawable.ic_smartphone)
            binding.tvPaymentStatusMsg.text = "고객 앱으로 주문 정보가\n전송되었습니다"
            binding.tvPaymentDesc.text = "고객이 앱에서 결제 중입니다..."
            binding.btnCompletePayment.visibility = View.GONE
            binding.pbWaiting.visibility = View.VISIBLE
        } else {
            binding.tvPaymentTitle.text = "카드 결제"
            binding.ivPaymentIcon.setImageResource(R.drawable.ic_card)
            binding.tvPaymentStatusMsg.text = "카드를 단말기에 넣어주세요"
            binding.tvPaymentDesc.text = "현대백화점 카드 전용 혜택 적용됨"
            binding.btnCompletePayment.visibility = View.VISIBLE
            binding.pbWaiting.visibility = View.GONE
        }
    }

    private fun navigateToSuccess(productName: String, amount: Int) {
        val intent = Intent(this, SuccessActivity::class.java).apply {
            putExtra("EXTRA_PRODUCT_NAME", productName)
            putExtra("EXTRA_AMOUNT", amount)
        }
        startActivity(intent)
        finish()
    }

    private fun formatNumber(number: Int): String {
        return NumberFormat.getNumberInstance(Locale.KOREA).format(number)
    }
}
