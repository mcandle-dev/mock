# Android VPOS 개발 가이드

> React 기반 VPOS를 Android Kotlin + Layout XML로 변환하는 완벽 가이드

---

## 📋 목차

1. [프로젝트 생성](#1-프로젝트-생성)
2. [의존성 설정](#2-의존성-설정)
3. [리소스 파일 생성](#3-리소스-파일-생성)
4. [Drawable 리소스 생성](#4-drawable-리소스-생성)
5. [Layout XML 생성](#5-layout-xml-생성)
6. [Data Model 생성](#6-data-model-생성)
7. [Adapter 생성](#7-adapter-생성)
8. [Repository 생성](#8-repository-생성)
9. [ViewModel 생성](#9-viewmodel-생성)
10. [MainActivity 생성](#10-mainactivity-생성)
11. [AndroidManifest 설정](#11-androidmanifest-설정)
12. [실행 및 테스트](#12-실행-및-테스트)

---

## 1. 프로젝트 생성

### 1-1. Android Studio 실행
1. Android Studio 실행
2. **New Project** 클릭

### 1-2. 프로젝트 템플릿 선택
1. **Phone and Tablet** 탭 선택
2. **Empty Views Activity** 선택
3. **Next** 클릭

### 1-3. 프로젝트 설정
```
Name: HYUNDAI VPOS
Package name: com.hyundai.vpos
Save location: 원하는 경로
Language: Kotlin
Minimum SDK: API 24 (Android 7.0)
Build configuration language: Gradle (Kotlin DSL) 또는 Groovy
```

4. **Finish** 클릭

### 1-4. 프로젝트 구조 확인
프로젝트가 생성되면 다음 구조를 확인:
```
app/
├── src/main/
│   ├── java/com/hyundai/vpos/
│   │   └── MainActivity.kt
│   ├── res/
│   │   ├── layout/
│   │   │   └── activity_main.xml
│   │   ├── values/
│   │   │   ├── colors.xml
│   │   │   ├── strings.xml
│   │   │   └── themes.xml
│   │   └── drawable/
│   └── AndroidManifest.xml
└── build.gradle
```

---

## 2. 의존성 설정

### 2-1. build.gradle (Project level)
`build.gradle.kts` (또는 `build.gradle`) 파일이 최신 버전인지 확인

### 2-2. build.gradle (Module: app)
`app/build.gradle.kts` (또는 `app/build.gradle`) 파일 수정:

**Kotlin DSL (build.gradle.kts):**
```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.hyundai.vpos"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.hyundai.vpos"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // AndroidX Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.recyclerview:recyclerview:1.3.2")

    // Material Design 3
    implementation("com.google.android.material:material:1.11.0")

    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    implementation("androidx.activity:activity-ktx:1.8.2")

    // Socket.io
    implementation("io.socket:socket.io-client:2.1.0") {
        exclude(group = "org.json", module = "json")
    }

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

**Groovy (build.gradle):**
```groovy
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.hyundai.vpos'
    compileSdk 34

    defaultConfig {
        applicationId "com.hyundai.vpos"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    buildFeatures {
        viewBinding true
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    implementation 'androidx.activity:activity-ktx:1.8.2'
    implementation ('io.socket:socket.io-client:2.1.0') {
        exclude group: 'org.json', module: 'json'
    }
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}
```

### 2-3. Sync Gradle
1. 파일 수정 후 상단에 나타나는 **Sync Now** 클릭
2. 또는 메뉴: **File → Sync Project with Gradle Files**

---

## 3. 리소스 파일 생성

### 3-1. colors.xml
경로: `app/src/main/res/values/colors.xml`

기존 내용을 아래로 교체:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Material Design 3 Colors -->
    <color name="md_primary">#1976D2</color>
    <color name="md_primary_dark">#1565C0</color>
    <color name="md_primary_light">#42A5F5</color>
    <color name="md_accent">#FF9800</color>
    <color name="md_success">#4CAF50</color>
    <color name="md_warning">#FFC107</color>
    <color name="md_error">#F44336</color>

    <!-- Background & Surface -->
    <color name="md_background">#FAFAFA</color>
    <color name="md_surface">#FFFFFF</color>
    <color name="md_surface_variant">#F5F5F5</color>

    <!-- Text Colors -->
    <color name="md_text_primary">#DE000000</color>
    <color name="md_text_secondary">#99000000</color>
    <color name="md_text_disabled">#61000000</color>

    <!-- Divider -->
    <color name="md_divider">#1F000000</color>
</resources>
```

### 3-2. dimens.xml
경로: `app/src/main/res/values/dimens.xml`

**파일 생성 방법:**
1. `res/values` 우클릭
2. **New → Values Resource File**
3. File name: `dimens`
4. **OK** 클릭

**내용:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 8dp Grid System -->
    <dimen name="spacing_tiny">4dp</dimen>
    <dimen name="spacing_small">8dp</dimen>
    <dimen name="spacing_medium">16dp</dimen>
    <dimen name="spacing_large">24dp</dimen>
    <dimen name="spacing_xlarge">32dp</dimen>

    <!-- Material Design Specs -->
    <dimen name="card_radius">12dp</dimen>
    <dimen name="dialog_radius">28dp</dimen>
    <dimen name="touch_target">48dp</dimen>
    <dimen name="toolbar_height">56dp</dimen>
    <dimen name="card_elevation">3dp</dimen>

    <!-- Text Sizes -->
    <dimen name="text_large">16sp</dimen>
    <dimen name="text_medium">14sp</dimen>
    <dimen name="text_small">12sp</dimen>
    <dimen name="text_tiny">11sp</dimen>
</resources>
```

### 3-3. strings.xml
경로: `app/src/main/res/values/strings.xml`

기존 내용에 추가:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">HYUNDAI VPOS</string>

    <!-- Main Screen -->
    <string name="product_info">상품 정보</string>
    <string name="scan_simulation">스캔 시뮬레이션</string>
    <string name="waiting">대기중</string>
    <string name="received">수신됨</string>
    <string name="no_product">상품 정보 없음</string>
    <string name="scan_barcode">바코드를 스캔하세요</string>
    <string name="cancel">취소</string>

    <!-- Customer List -->
    <string name="pending_customers">결제 대기 고객 (%d)</string>
    <string name="waiting_for_customer">고객 정보 대기 중…</string>
    <string name="select_card_tab">앱의 카드 탭을 선택해주세요</string>

    <!-- BLE Status -->
    <string name="ble_active">BLE 활성화됨</string>
    <string name="connected">Connected</string>

    <!-- Settings -->
    <string name="settings">설정</string>
    <string name="title">Title</string>
    <string name="shop">Shop</string>
    <string name="salesperson">Salesperson</string>
    <string name="save">저장</string>

    <!-- Default Values -->
    <string name="default_title">HYUNDAI VPOS</string>
    <string name="default_shop">6F 나이키</string>
    <string name="default_salesperson">한아름 (224456)</string>
</resources>
```

---

## 4. Drawable 리소스 생성

### 4-1. ic_package.xml
경로: `app/src/main/res/drawable/ic_package.xml`

**생성 방법:**
1. `res/drawable` 우클릭
2. **New → Drawable Resource File**
3. File name: `ic_package`
4. Root element: `vector`
5. **OK** 클릭

**내용:**
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#000000"
        android:pathData="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z"/>
</vector>
```

### 4-2. ic_user.xml
경로: `app/src/main/res/drawable/ic_user.xml`

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#000000"
        android:pathData="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
</vector>
```

### 4-3. ic_settings.xml
경로: `app/src/main/res/drawable/ic_settings.xml`

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#000000"
        android:pathData="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
</vector>
```

### 4-4. ic_check_circle.xml
경로: `app/src/main/res/drawable/ic_check_circle.xml`

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#1976D2"
        android:pathData="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
</vector>
```

### 4-5. circle_green.xml
경로: `app/src/main/res/drawable/circle_green.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="@color/md_success" />
    <size
        android:width="10dp"
        android:height="10dp" />
</shape>
```

### 4-6. circle_green_glow.xml
경로: `app/src/main/res/drawable/circle_green_glow.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Glow effect -->
    <item>
        <shape android:shape="oval">
            <solid android:color="#804CAF50" />
            <size
                android:width="16dp"
                android:height="16dp" />
        </shape>
    </item>
    <!-- Main circle -->
    <item
        android:left="3dp"
        android:top="3dp"
        android:right="3dp"
        android:bottom="3dp">
        <shape android:shape="oval">
            <solid android:color="@color/md_success" />
            <size
                android:width="10dp"
                android:height="10dp" />
        </shape>
    </item>
</layer-list>
```

### 4-7. dialog_background.xml
경로: `app/src/main/res/drawable/dialog_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="@color/md_surface" />
    <corners android:radius="@dimen/dialog_radius" />
</shape>
```

---

## 5. Layout XML 생성

### 5-1. activity_main.xml
경로: `app/src/main/res/layout/activity_main.xml`

기존 내용을 아래로 교체:

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/md_background"
    tools:context=".MainActivity">

    <!-- AppBar -->
    <com.google.android.material.appbar.AppBarLayout
        android:id="@+id/appBarLayout"
        android:layout_width="match_parent"
        android:layout_height="@dimen/toolbar_height"
        app:layout_constraintTop_toTopOf="parent">

        <androidx.appcompat.widget.Toolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="@dimen/toolbar_height"
            android:background="@color/md_primary"
            app:title="@string/default_title"
            app:titleTextColor="@android:color/white">

            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="end"
                android:layout_marginEnd="@dimen/spacing_medium"
                android:orientation="vertical">

                <TextView
                    android:id="@+id/tvShopLocation"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/default_shop"
                    android:textColor="@android:color/white"
                    android:textSize="@dimen/text_small"
                    android:textStyle="bold" />

                <TextView
                    android:id="@+id/tvSalesperson"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/default_salesperson"
                    android:textColor="#B3FFFFFF"
                    android:textSize="@dimen/text_tiny" />
            </LinearLayout>
        </androidx.appcompat.widget.Toolbar>
    </com.google.android.material.appbar.AppBarLayout>

    <!-- 상품 정보 카드 -->
    <com.google.android.material.card.MaterialCardView
        android:id="@+id/cardProductInfo"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_margin="@dimen/spacing_medium"
        app:cardCornerRadius="@dimen/card_radius"
        app:cardElevation="@dimen/card_elevation"
        app:layout_constraintTop_toBottomOf="@id/appBarLayout">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="@dimen/spacing_medium">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:drawablePadding="6dp"
                android:text="@string/product_info"
                android:textSize="@dimen/text_medium"
                android:textStyle="bold"
                app:drawableStartCompat="@drawable/ic_package" />

            <!-- 스캔 전 상태 -->
            <LinearLayout
                android:id="@+id/layoutBeforeScan"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="@dimen/spacing_small"
                android:orientation="vertical"
                android:visibility="visible">

                <com.google.android.material.chip.Chip
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/waiting"
                    android:textSize="10sp"
                    app:chipBackgroundColor="@color/md_primary_light" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="6dp"
                    android:text="@string/no_product"
                    android:textColor="@color/md_text_disabled"
                    android:textSize="15sp" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/scan_barcode"
                    android:textColor="@color/md_text_secondary"
                    android:textSize="@dimen/text_small" />

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnScanSimulation"
                    android:layout_width="match_parent"
                    android:layout_height="@dimen/touch_target"
                    android:layout_marginTop="6dp"
                    android:text="@string/scan_simulation"
                    android:textSize="@dimen/text_small" />
            </LinearLayout>

            <!-- 스캔 후 상태 -->
            <LinearLayout
                android:id="@+id/layoutAfterScan"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="@dimen/spacing_small"
                android:orientation="vertical"
                android:visibility="gone"
                tools:visibility="visible">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal">

                    <com.google.android.material.chip.Chip
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/received"
                        android:textSize="10sp"
                        app:chipBackgroundColor="@color/md_primary_light" />

                    <Space
                        android:layout_width="0dp"
                        android:layout_height="0dp"
                        android:layout_weight="1" />

                    <TextView
                        android:id="@+id/tvProductStyle"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_gravity="center_vertical"
                        android:textColor="@color/md_text_secondary"
                        android:textSize="@dimen/text_tiny"
                        tools:text="IM8066-999" />
                </LinearLayout>

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="6dp"
                    android:orientation="horizontal">

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:orientation="vertical">

                        <TextView
                            android:id="@+id/tvProductName"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:textSize="15sp"
                            android:textStyle="bold"
                            tools:text="나이키 알파플라이 3" />

                        <TextView
                            android:id="@+id/tvProductDetails"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:textColor="@color/md_text_secondary"
                            android:textSize="@dimen/text_small"
                            tools:text="265 / 블랙" />
                    </LinearLayout>

                    <TextView
                        android:id="@+id/tvProductPrice"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_gravity="center_vertical"
                        android:textColor="@color/md_primary"
                        android:textSize="18sp"
                        android:textStyle="bold"
                        tools:text="349,000원" />
                </LinearLayout>

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnCancel"
                    style="@style/Widget.Material3.Button.OutlinedButton"
                    android:layout_width="match_parent"
                    android:layout_height="@dimen/touch_target"
                    android:layout_marginTop="6dp"
                    android:text="@string/cancel"
                    android:textSize="@dimen/text_small" />
            </LinearLayout>
        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

    <!-- 결제 대기 고객 카드 -->
    <com.google.android.material.card.MaterialCardView
        android:id="@+id/cardCustomerList"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_margin="@dimen/spacing_medium"
        app:cardCornerRadius="@dimen/card_radius"
        app:cardElevation="@dimen/card_elevation"
        app:layout_constraintBottom_toTopOf="@id/layoutBleStatus"
        app:layout_constraintTop_toBottomOf="@id/cardProductInfo">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:orientation="vertical"
            android:padding="@dimen/spacing_medium">

            <TextView
                android:id="@+id/tvCustomerCount"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:drawablePadding="6dp"
                android:text="@string/pending_customers"
                android:textSize="@dimen/text_medium"
                android:textStyle="bold"
                app:drawableStartCompat="@drawable/ic_user"
                tools:text="결제 대기 고객 (0)" />

            <!-- Empty State -->
            <LinearLayout
                android:id="@+id/layoutEmptyState"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:gravity="center"
                android:orientation="vertical"
                android:visibility="visible"
                tools:visibility="gone">

                <ImageView
                    android:layout_width="28dp"
                    android:layout_height="28dp"
                    android:alpha="0.38"
                    android:src="@drawable/ic_user"
                    android:contentDescription="@string/waiting_for_customer" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="@dimen/spacing_small"
                    android:text="@string/waiting_for_customer"
                    android:textSize="13sp" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="@string/select_card_tab"
                    android:textColor="@color/md_text_secondary"
                    android:textSize="@dimen/text_tiny" />
            </LinearLayout>

            <!-- RecyclerView -->
            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/rvCustomers"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:layout_marginTop="@dimen/spacing_small"
                android:visibility="gone"
                app:layoutManager="androidx.recyclerview.widget.LinearLayoutManager"
                tools:itemCount="2"
                tools:listitem="@layout/item_ble_device"
                tools:visibility="visible" />
        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

    <!-- BLE 상태 -->
    <LinearLayout
        android:id="@+id/layoutBleStatus"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="@dimen/spacing_medium"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        app:layout_constraintBottom_toTopOf="@id/bottomAppBar"
        app:layout_constraintStart_toStartOf="parent">

        <View
            android:layout_width="10dp"
            android:layout_height="10dp"
            android:background="@drawable/circle_green" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginStart="@dimen/spacing_small"
            android:text="@string/ble_active"
            android:textColor="@color/md_success"
            android:textSize="@dimen/text_tiny" />
    </LinearLayout>

    <!-- Bottom AppBar -->
    <com.google.android.material.bottomappbar.BottomAppBar
        android:id="@+id/bottomAppBar"
        android:layout_width="match_parent"
        android:layout_height="@dimen/toolbar_height"
        app:layout_constraintBottom_toBottomOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:gravity="center_vertical"
            android:orientation="horizontal">

            <!-- Connected 상태 -->
            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:gravity="center_vertical"
                android:orientation="horizontal">

                <View
                    android:layout_width="10dp"
                    android:layout_height="10dp"
                    android:background="@drawable/circle_green_glow" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/spacing_small"
                    android:text="@string/connected"
                    android:textColor="@color/md_success"
                    android:textSize="@dimen/text_tiny"
                    android:textStyle="bold" />
            </LinearLayout>

            <!-- 설정 버튼 -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnSettings"
                style="@style/Widget.Material3.Button.OutlinedButton.Icon"
                android:layout_width="@dimen/touch_target"
                android:layout_height="@dimen/touch_target"
                android:insetLeft="0dp"
                android:insetTop="0dp"
                android:insetRight="0dp"
                android:insetBottom="0dp"
                android:contentDescription="@string/settings"
                app:icon="@drawable/ic_settings"
                app:iconGravity="textStart"
                app:iconPadding="0dp" />
        </LinearLayout>
    </com.google.android.material.bottomappbar.BottomAppBar>
</androidx.constraintlayout.widget.ConstraintLayout>
```

### 5-2. item_ble_device.xml
경로: `app/src/main/res/layout/item_ble_device.xml`

**생성 방법:**
1. `res/layout` 우클릭
2. **New → Layout Resource File**
3. File name: `item_ble_device`
4. Root element: `com.google.android.material.card.MaterialCardView`
5. **OK** 클릭

**내용:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginBottom="@dimen/spacing_small"
    app:cardCornerRadius="@dimen/card_radius"
    app:cardElevation="2dp"
    app:strokeColor="@color/md_primary_light"
    app:strokeWidth="1dp">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="@dimen/spacing_medium">

        <LinearLayout
            android:id="@+id/layoutCustomerInfo"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintEnd_toStartOf="@id/ivCheckIcon"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="parent">

            <TextView
                android:id="@+id/tvCustomerName"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textColor="@color/md_text_primary"
                android:textSize="@dimen/text_medium"
                android:textStyle="bold"
                tools:text="김준호" />

            <TextView
                android:id="@+id/tvCustomerDetails"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textColor="@color/md_text_secondary"
                android:textSize="@dimen/text_tiny"
                tools:text="VIP ⭐ | HD2023091234" />
        </LinearLayout>

        <ImageView
            android:id="@+id/ivCheckIcon"
            android:layout_width="18dp"
            android:layout_height="18dp"
            android:contentDescription="@string/connected"
            android:src="@drawable/ic_check_circle"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintTop_toTopOf="parent"
            app:tint="@color/md_primary" />
    </androidx.constraintlayout.widget.ConstraintLayout>
</com.google.android.material.card.MaterialCardView>
```

### 5-3. dialog_settings.xml
경로: `app/src/main/res/layout/dialog_settings.xml`

**생성 방법:**
1. `res/layout` 우클릭
2. **New → Layout Resource File**
3. File name: `dialog_settings`
4. Root element: `LinearLayout`
5. **OK** 클릭

**내용:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="320dp"
    android:layout_height="wrap_content"
    android:background="@drawable/dialog_background"
    android:orientation="vertical"
    android:padding="@dimen/spacing_large">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="@dimen/spacing_large"
        android:text="@string/settings"
        android:textColor="@color/md_primary"
        android:textSize="24sp" />

    <!-- Title TextField -->
    <com.google.android.material.textfield.TextInputLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="@dimen/spacing_medium"
        android:hint="@string/title"
        style="@style/Widget.Material3.TextInputLayout.OutlinedBox">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etTitle"
            android:layout_width="match_parent"
            android:layout_height="56dp"
            android:inputType="text" />
    </com.google.android.material.textfield.TextInputLayout>

    <!-- Shop TextField -->
    <com.google.android.material.textfield.TextInputLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="@dimen/spacing_medium"
        android:hint="@string/shop"
        style="@style/Widget.Material3.TextInputLayout.OutlinedBox">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etShop"
            android:layout_width="match_parent"
            android:layout_height="56dp"
            android:inputType="text" />
    </com.google.android.material.textfield.TextInputLayout>

    <!-- Salesperson TextField -->
    <com.google.android.material.textfield.TextInputLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="@dimen/spacing_large"
        android:hint="@string/salesperson"
        style="@style/Widget.Material3.TextInputLayout.OutlinedBox">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etSalesperson"
            android:layout_width="match_parent"
            android:layout_height="56dp"
            android:inputType="text" />
    </com.google.android.material.textfield.TextInputLayout>

    <!-- Buttons -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="end"
        android:orientation="horizontal">

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnCancel"
            style="@style/Widget.Material3.Button.OutlinedButton"
            android:layout_width="wrap_content"
            android:layout_height="@dimen/touch_target"
            android:layout_marginEnd="@dimen/spacing_medium"
            android:text="@string/cancel" />

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnSave"
            android:layout_width="wrap_content"
            android:layout_height="@dimen/touch_target"
            android:text="@string/save" />
    </LinearLayout>
</LinearLayout>
```

---

## 6. Data Model 생성

### 6-1. 패키지 생성
1. `java/com/hyundai/vpos` 우클릭
2. **New → Package**
3. 이름: `model`
4. **OK** 클릭

### 6-2. Product.kt
경로: `app/src/main/java/com/hyundai/vpos/model/Product.kt`

1. `model` 패키지 우클릭
2. **New → Kotlin Class/File**
3. Name: `Product`
4. **OK** 클릭

**내용:**
```kotlin
package com.hyundai.vpos.model

data class Product(
    val id: String,
    val name: String,
    val size: String,
    val color: String,
    val style: String,
    val price: Int,
    val stock: Int
)
```

### 6-3. Customer.kt
경로: `app/src/main/java/com/hyundai/vpos/model/Customer.kt`

```kotlin
package com.hyundai.vpos.model

data class Customer(
    val id: String,
    val name: String,
    val level: String,
    val points: Int,
    val socketId: String = ""
)
```

### 6-4. Store.kt
경로: `app/src/main/java/com/hyundai/vpos/model/Store.kt`

```kotlin
package com.hyundai.vpos.model

data class Store(
    val title: String,
    val name: String,
    val location: String,
    val staff: String
)
```

---

## 7. Adapter 생성

### 7-1. 패키지 생성
1. `java/com/hyundai/vpos` 우클릭
2. **New → Package**
3. 이름: `adapter`
4. **OK** 클릭

### 7-2. BleDeviceAdapter.kt
경로: `app/src/main/java/com/hyundai/vpos/adapter/BleDeviceAdapter.kt`

**내용:**
```kotlin
package com.hyundai.vpos.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.hyundai.vpos.databinding.ItemBleDeviceBinding
import com.hyundai.vpos.model.Customer

class BleDeviceAdapter(
    private val onItemClick: (Customer) -> Unit
) : ListAdapter<Customer, BleDeviceAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemBleDeviceBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding, onItemClick)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(
        private val binding: ItemBleDeviceBinding,
        private val onItemClick: (Customer) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(customer: Customer) {
            binding.tvCustomerName.text = customer.name
            binding.tvCustomerDetails.text = "${customer.level} | ${customer.id}"

            binding.root.setOnClickListener {
                onItemClick(customer)
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<Customer>() {
        override fun areItemsTheSame(oldItem: Customer, newItem: Customer): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Customer, newItem: Customer): Boolean {
            return oldItem == newItem
        }
    }
}
```

---

## 8. Repository 생성

### 8-1. 패키지 생성
1. `java/com/hyundai/vpos` 우클릭
2. **New → Package**
3. 이름: `repository`
4. **OK** 클릭

### 8-2. SocketRepository.kt
경로: `app/src/main/java/com/hyundai/vpos/repository/SocketRepository.kt`

**내용:**
```kotlin
package com.hyundai.vpos.repository

import com.hyundai.vpos.model.Customer
import com.hyundai.vpos.model.Product
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.net.URISyntaxException

class SocketRepository {

    private var socket: Socket? = null

    // TODO: EC2 IP로 변경 필요
    private val serverUrl = "http://localhost:4000"  // 또는 "http://YOUR-EC2-IP:4000"

    fun connect() {
        try {
            socket = IO.socket(serverUrl)
            socket?.connect()
        } catch (e: URISyntaxException) {
            e.printStackTrace()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
    }

    fun onProductInfo(callback: (Product) -> Unit) {
        socket?.on("product-info") { args ->
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
                e.printStackTrace()
            }
        }
    }

    fun onPendingCustomersUpdate(callback: (List<Customer>) -> Unit) {
        socket?.on("pending-customers-update") { args ->
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
                e.printStackTrace()
            }
        }
    }

    fun onBleConnectionSuccess(callback: (Customer) -> Unit) {
        socket?.on("ble-connection-success") { args ->
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
                e.printStackTrace()
            }
        }
    }

    fun scanProduct(barcode: String) {
        socket?.emit("vpos-scan", barcode)
    }

    fun selectCustomer(userId: String) {
        socket?.emit("vpos-select-customer", userId)
    }
}
```

---

## 9. ViewModel 생성

### 9-1. 패키지 생성
1. `java/com/hyundai/vpos` 우클릭
2. **New → Package**
3. 이름: `viewmodel`
4. **OK** 클릭

### 9-2. MainViewModel.kt
경로: `app/src/main/java/com/hyundai/vpos/viewmodel/MainViewModel.kt`

**내용:**
```kotlin
package com.hyundai.vpos.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.hyundai.vpos.model.Customer
import com.hyundai.vpos.model.Product
import com.hyundai.vpos.repository.SocketRepository

class MainViewModel : ViewModel() {

    private val socketRepository = SocketRepository()

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
            // TODO: Navigate to Benefits Activity
            // 나중에 BenefitsActivity 생성 후 Intent로 화면 전환
        }
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
```

---

## 10. MainActivity 생성

### 10-1. MainActivity.kt
경로: `app/src/main/java/com/hyundai/vpos/MainActivity.kt`

기존 MainActivity.kt 파일을 아래 내용으로 교체:

```kotlin
package com.hyundai.vpos

import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.hyundai.vpos.adapter.BleDeviceAdapter
import com.hyundai.vpos.databinding.ActivityMainBinding
import com.hyundai.vpos.databinding.DialogSettingsBinding
import com.hyundai.vpos.viewmodel.MainViewModel
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
```

---

## 11. AndroidManifest 설정

### 11-1. AndroidManifest.xml
경로: `app/src/main/AndroidManifest.xml`

기존 파일에서 `<application>` 태그 위에 인터넷 권한 추가:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- 인터넷 권한 추가 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HYUNDAIVPOS"
        android:usesCleartextTraffic="true"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

**주요 추가 사항:**
- `<uses-permission android:name="android.permission.INTERNET" />`: 인터넷 사용 권한
- `android:usesCleartextTraffic="true"`: HTTP 통신 허용 (Socket.io 사용)

---

## 12. 실행 및 테스트

### 12-1. 서버 실행
먼저 Node.js 서버를 실행해야 합니다:

```bash
cd D:\aitest\aitest\server
node index.js
```

서버가 실행되면:
```
Simulation Server running on http://localhost:4000
```

### 12-2. Android 에뮬레이터 설정
1. Android Studio 상단 **Device Manager** 클릭
2. **Create Device** 클릭
3. **Phone → Pixel 5** 선택 → **Next**
4. **System Image: API 34 (UpsideDownCake)** 선택 → **Next**
5. AVD Name: `Pixel_5_API_34` → **Finish**

### 12-3. 서버 URL 수정 (중요!)
에뮬레이터에서 localhost로 접속할 수 없으므로 IP 변경 필요:

**SocketRepository.kt 수정:**
```kotlin
// localhost를 10.0.2.2로 변경 (에뮬레이터용)
private val serverUrl = "http://10.0.2.2:4000"

// 또는 실제 PC IP 사용 (PC와 에뮬레이터가 같은 네트워크일 때)
// private val serverUrl = "http://192.168.x.x:4000"
```

**PC IP 확인 방법:**
```bash
# Windows
ipconfig

# 이더넷 어댑터 또는 Wi-Fi 어댑터의 IPv4 주소 확인
```

### 12-4. 빌드 및 실행
1. 상단 **Run** 버튼 (녹색 재생 버튼) 클릭
2. 또는 **Shift + F10**
3. Device 선택: `Pixel_5_API_34`
4. **OK** 클릭

### 12-5. 테스트 시나리오

**시나리오 1: 상품 스캔**
1. 앱 실행 → "스캔 시뮬레이션" 버튼 클릭
2. 상품 정보가 표시되는지 확인
3. "취소" 버튼 클릭 → 원래 상태로 돌아가는지 확인

**시나리오 2: 고객 연결**
1. Customer 앱(React)을 브라우저에서 실행: `http://localhost:5174`
2. "카드" 탭 클릭
3. VPOS 앱에서 "결제 대기 고객" 목록에 고객이 나타나는지 확인
4. 고객 항목 클릭 → 혜택 안내 화면으로 이동 (TODO: 아직 구현 안됨)

**시나리오 3: 설정 변경**
1. 하단 설정 아이콘 클릭
2. Title, Shop, Salesperson 변경
3. "저장" 클릭
4. Toolbar의 정보가 변경되었는지 확인

### 12-6. 디버깅

**Logcat 확인:**
1. Android Studio 하단 **Logcat** 탭 클릭
2. Filter: `com.hyundai.vpos`
3. Socket 연결 로그 확인

**Socket 연결 문제 해결:**
```kotlin
// SocketRepository.kt에 로그 추가
fun connect() {
    try {
        socket = IO.socket(serverUrl)
        socket?.on(Socket.EVENT_CONNECT) {
            println("✅ Socket connected!")
        }
        socket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
            println("❌ Socket error: ${args[0]}")
        }
        socket?.connect()
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
```

---

## 13. 다음 단계

### 13-1. BenefitsActivity 구현
- `activity_benefits.xml` 생성
- `BenefitsActivity.kt` 생성
- 고객 정보 + 추천 혜택 표시

### 13-2. PaymentActivity 구현
- 카드 결제 화면
- 앱 결제 화면

### 13-3. EC2 배포 연동
- `SocketRepository.kt`의 서버 URL을 EC2 IP로 변경
- APK 빌드 및 실제 디바이스 테스트

---

## 📌 체크리스트

개발 완료 후 아래 항목을 확인하세요:

- [ ] Gradle Sync 성공
- [ ] 모든 리소스 파일(colors, dimens, strings, drawables) 생성
- [ ] 모든 Layout XML 생성 (activity_main, item_ble_device, dialog_settings)
- [ ] 모든 Model 클래스 생성 (Product, Customer, Store)
- [ ] BleDeviceAdapter 생성
- [ ] SocketRepository 생성
- [ ] MainViewModel 생성
- [ ] MainActivity 코드 작성
- [ ] AndroidManifest 권한 설정
- [ ] 서버 실행 확인
- [ ] 에뮬레이터 또는 실제 디바이스에서 실행
- [ ] 상품 스캔 기능 테스트
- [ ] 고객 목록 표시 테스트
- [ ] 설정 변경 기능 테스트

---

## 🎯 완성!

이 가이드를 따라하면 React VPOS의 Main 화면을 Android Kotlin으로 완벽하게 구현할 수 있습니다.

추가로 Benefits, Payment, Complete 화면이 필요하면 이 문서를 확장하여 단계별로 추가 개발하세요!
