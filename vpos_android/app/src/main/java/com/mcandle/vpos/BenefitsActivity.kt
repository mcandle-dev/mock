package com.mcandle.vpos

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.mcandle.vpos.databinding.ActivityBenefitsBinding
import java.text.NumberFormat
import java.util.Locale

class BenefitsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBenefitsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("BenefitsActivity", "onCreate started")
        try {
            binding = ActivityBenefitsBinding.inflate(layoutInflater)
            setContentView(binding.root)
            setupUI()
            Log.d("BenefitsActivity", "UI Setup completed successfully")
        } catch (e: Exception) {
            Log.e("BenefitsActivity", "CRITICAL ERROR during inflation/setup: ${e.message}")
            e.printStackTrace()
            Toast.makeText(this, "화면 로딩 중 에러가 발생했습니다.", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun setupUI() {
        // Intent에서 데이터 수신
        val customer = intent.getSerializableExtra("EXTRA_CUSTOMER") as? com.mcandle.vpos.model.Customer
        val product = intent.getSerializableExtra("EXTRA_PRODUCT") as? com.mcandle.vpos.model.Product

        if (customer == null || product == null) {
            finish()
            return
        }

        // 텍스트 설정 (김준호 고객님 ✔)
        binding.tvCustomerNameLabel.text = "${customer.name} 고객님 ✔"
        binding.tvCustomerDetailLabel.text = "${customer.level} | ${customer.id}"
        binding.tvCustomerPointsValue.text = "${formatNumber(customer.points)}P"

        // 금액 계산 (10% 할인 예시)
        val originalPrice = product.price
        val discountRate = 0.1
        val discountAmount = (originalPrice * discountRate).toInt()
        val finalPrice = originalPrice - discountAmount

        binding.tvOriginalPrice.text = "${formatNumber(originalPrice)}원"
        binding.tvDiscountAmount.text = "-${formatNumber(discountAmount)}원"
        binding.tvFinalPrice.text = "${formatNumber(finalPrice)}원"

        // 이전 버튼
        binding.btnBack.setOnClickListener {
            finish()
        }

        // 카드 결제 진행
        binding.btnCardPayment.setOnClickListener {
            val intent = Intent(this, PaymentActivity::class.java).apply {
                putExtra("EXTRA_MODE", "OFFLINE")
                putExtra("EXTRA_AMOUNT", finalPrice)
                putExtra("EXTRA_CUSTOMER", customer)
                putExtra("EXTRA_PRODUCT", product)
            }
            startActivity(intent)
        }

        // 앱 결제 요청
        binding.btnAppPayment.setOnClickListener {
            val intent = Intent(this, PaymentActivity::class.java).apply {
                putExtra("EXTRA_MODE", "APP")
                putExtra("EXTRA_AMOUNT", originalPrice)
                putExtra("EXTRA_CUSTOMER", customer)
                putExtra("EXTRA_PRODUCT", product)
            }
            startActivity(intent)
        }
    }

    private fun formatNumber(number: Int): String {
        return NumberFormat.getNumberInstance(Locale.KOREA).format(number)
    }
}
