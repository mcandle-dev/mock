package com.mcandle.vpos

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.mcandle.vpos.databinding.ActivitySuccessBinding
import com.mcandle.vpos.viewmodel.MainViewModel
import java.text.NumberFormat
import java.util.Locale

class SuccessActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySuccessBinding
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySuccessBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val productName = intent.getStringExtra("EXTRA_PRODUCT_NAME") ?: ""
        val amount = intent.getIntExtra("EXTRA_AMOUNT", 0)

        binding.tvSuccessProductName.text = productName
        binding.tvSuccessAmount.text = "${formatNumber(amount)}원"

        binding.btnNextTransaction.setOnClickListener {
            viewModel.resetTransaction()
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
            finish()
        }
    }

    private fun formatNumber(number: Int): String {
        return NumberFormat.getNumberInstance(Locale.KOREA).format(number)
    }
}
