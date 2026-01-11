package com.mcandle.vpos.model

import java.io.Serializable

data class Customer(
    val id: String,
    val name: String,
    val level: String,
    val points: Int,
    val socketId: String = ""
) : Serializable
