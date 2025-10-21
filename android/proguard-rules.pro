-keep class com.google.android.gms.** { *; }
-keep interface com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-dontnote com.google.android.gms.**

-keep class * implements android.os.Parcelable { *; }

-keepclassmembers class **$Companion {
    public *;
}

-keep class com.google.maps.android.** { *; }
-keep interface com.google.maps.android.** { *; }
-dontwarn com.google.maps.android.**

-keep @androidx.annotation.Keep class * { *; }
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

-keep class com.caverock.androidsvg.** { *; }
-dontwarn com.caverock.androidsvg.**

-keepclassmembers class com.caverock.androidsvg.** {
    public *;
    protected *;
}

-keep class com.rngooglemapsplus.** { *; }
