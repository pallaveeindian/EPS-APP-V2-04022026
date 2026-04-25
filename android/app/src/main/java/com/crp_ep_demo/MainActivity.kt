package com.crp_ep_demo

import android.os.Bundle
import android.os.Build
import android.util.Log
import android.view.WindowManager
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // ROOT DETECTION
    if (isDeviceRooted()) {
      terminateApp()
      return
    }

    // ⚠️ DEBUG me black screen avoid karne ke liye
    if (!BuildConfig.DEBUG) {
      window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }

    window.decorView.filterTouchesWhenObscured = true
    enableStrictViewProtection(window.decorView)
  }

  override fun onResume() {
    super.onResume()

    if (!BuildConfig.DEBUG) {
      window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }

    window.decorView.filterTouchesWhenObscured = true
    enableStrictViewProtection(window.decorView)
  }

  /**
   *  (UNCHANGED STRUCTURE) — but SAFE
   */
  private fun setupUltraStrictOverlayDetection() {
    window.decorView.viewTreeObserver.addOnWindowFocusChangeListener(
      object : ViewTreeObserver.OnWindowFocusChangeListener {
        override fun onWindowFocusChanged(hasFocus: Boolean) {
          if (!hasFocus) {
            // ❌ DO NOT KILL (keyboard bhi yahi trigger karta hai)
            Log.w("SECURITY", "Focus lost - ignored")
          }
        }
      }
    )

    window.decorView.viewTreeObserver.addOnGlobalFocusChangeListener { _, _ ->
      // ❌ ignore
    }
  }

  /**
   * ✅ ONLY REAL OVERLAY TOUCH = KILL
   */
  override fun dispatchTouchEvent(ev: MotionEvent): Boolean {

    val isObscured =
      (ev.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0

    val isPartiallyObscured =
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
      (ev.flags and MotionEvent.FLAG_WINDOW_IS_PARTIALLY_OBSCURED) != 0

    if (isObscured || isPartiallyObscured) {
      Log.e("SECURITY", "🚨 REAL OVERLAY DETECTED → EXIT")
      terminateApp()
      return false
    }

    return super.dispatchTouchEvent(ev)
  }

  /**
   * ✅ View level protection (same logic)
   */
  private fun enableStrictViewProtection(view: View) {
    view.filterTouchesWhenObscured = true

    view.setOnTouchListener { _, event ->

      val isObscured =
        (event.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0

      val isPartiallyObscured =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
        (event.flags and MotionEvent.FLAG_WINDOW_IS_PARTIALLY_OBSCURED) != 0

      if (isObscured || isPartiallyObscured) {
        Log.e("SECURITY", "🚨 OVERLAY DETECTED (View) → EXIT")
        terminateApp()
        return@setOnTouchListener true
      }

      false
    }

    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        enableStrictViewProtection(view.getChildAt(i))
      }
    }
  }

  /**
   * ❗ FIXED: focus loss ignore
   */
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)

    if (!hasFocus) {
      Log.w("SECURITY", "Focus lost (keyboard/dialog) - ignored")
      return
    }

    window.decorView.filterTouchesWhenObscured = true
    enableStrictViewProtection(window.decorView)
  }

  private fun terminateApp() {
    Log.e("SECURITY", "CRITICAL SECURITY VIOLATION → TERMINATING")

    try {
      finishAffinity()
      moveTaskToBack(true)
      android.os.Process.killProcess(android.os.Process.myPid())
      System.exit(1)
    } catch (e: Exception) {
      System.exit(1)
    }
  }

  override fun getMainComponentName(): String = "CRP_EP_DEMO"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  private fun isDeviceRooted(): Boolean {
    val paths = arrayOf(
      "/system/app/Superuser.apk",
      "/sbin/su",
      "/system/bin/su",
      "/system/xbin/su",
      "/data/local/xbin/su",
      "/data/local/bin/su",
      "/system/sd/xbin/su",
      "/system/bin/failsafe/su",
      "/data/local/su"
    )

    return paths.any { java.io.File(it).exists() }
  }
}