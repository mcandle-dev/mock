package com.mcandle.vpos.model

import java.io.Serializable

data class Product(
    val id: String,
    val name: String,
    val size: String,
    val color: String,
    val style: String,
    val price: Int,
    val stock: Int
) : Serializable
