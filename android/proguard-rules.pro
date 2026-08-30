-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }
-dontwarn com.google.android.gms.**
-dontnote com.google.android.gms.**

-keep class com.google.maps.android.** { *; }
-keep interface com.google.maps.android.** { *; }
-dontwarn com.google.maps.android.**

-keep @androidx.annotation.Keep class * { *; }
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

-keep class com.caverock.androidsvg.SVG { *; }
-dontwarn com.caverock.androidsvg.**

-keep class com.rngooglemapsplus.** { *; }
