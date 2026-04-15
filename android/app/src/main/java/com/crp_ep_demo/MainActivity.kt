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

    // Block screenshots & recent apps preview
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)

    // SYSTEM LEVEL PROTECTION
    window.decorView.filterTouchesWhenObscured = true

    // APPLY STRICT TAPJACKING PROTECTION
    enableStrictViewProtection(window.decorView)
    
    //  ULTRA STRICT OVERLAY DETECTION - INSTANT KILL ON ANY OVERLAY
    setupUltraStrictOverlayDetection()
  }

  override fun onResume() {
    super.onResume()

    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)

    window.decorView.filterTouchesWhenObscured = true
    enableStrictViewProtection(window.decorView)
    
    // RE-APPLY ULTRA STRICT PROTECTION
    setupUltraStrictOverlayDetection()
  }

  /**
   *  ULTRA STRICT OVERLAY DETECTION - KILLS ON ANY OVERLAY APPEARANCE
   */
  private fun setupUltraStrictOverlayDetection() {
    window.decorView.viewTreeObserver.addOnWindowFocusChangeListener(object : ViewTreeObserver.OnWindowFocusChangeListener {
      override fun onWindowFocusChanged(hasFocus: Boolean) {
        if (!hasFocus) {
          Log.e("SECURITY", "🚨 OVERLAY DETECTED - Window lost focus → INSTANT KILL")
          terminateApp()
        }
      }
    })

    // Monitor global window focus changes
    window.decorView.viewTreeObserver.addOnGlobalFocusChangeListener { _, newFocus ->
      if (newFocus == null || !window.decorView.isFocused) {
        Log.e("SECURITY", " OVERLAY DETECTED - Global focus lost → INSTANT KILL")
        terminateApp()
      }
    }
  }

  /**
   *  ACTIVITY LEVEL PROTECTION (KILL MODE) - ENHANCED FOR RAPID OVERLAYS
   */
  override fun dispatchTouchEvent(ev: MotionEvent): Boolean {

    val isObscured = (ev.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0
    val isPartiallyObscured = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
        (ev.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0

    if (isObscured || isPartiallyObscured) {
      Log.e("SECURITY", " Tapjacking DETECTED (Activity) → INSTANT EXIT")
      terminateApp()
      return false
    }

    return super.dispatchTouchEvent(ev)
  }

  /**
   *  STRICT GLOBAL PROTECTION (POPUPS / MODALS) - ENHANCED RECURSIVE SCAN
   */
  private fun enableStrictViewProtection(view: View) {
    view.filterTouchesWhenObscured = true

    view.setOnTouchListener { _, event ->
      val isObscured = (event.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0
      val isPartiallyObscured = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
          (event.flags and MotionEvent.FLAG_WINDOW_IS_PARTIALLY_OBSCURED) != 0

      if (isObscured || isPartiallyObscured) {
        Log.e("SECURITY", " Tapjacking DETECTED (View) → INSTANT EXIT")
        terminateApp()
        return@setOnTouchListener true
      }
      false
    }

    //  Apply recursively to ALL child views (INSTANT RECURSION)
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        enableStrictViewProtection(view.getChildAt(i))
      }
    }
  }

  /**
   *  HANDLE RAPID OVERLAY ATTACKS - ENHANCED WITH MULTIPLE CHECKS
   */
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)

    if (!hasFocus) {
      Log.e("SECURITY", " RAPID OVERLAY DETECTED - Focus lost → INSTANT KILL")
      terminateApp()
      return
    }

    // REINFORCE PROTECTION WHEN FOCUS RESTORED
    window.decorView.filterTouchesWhenObscured = true
    enableStrictViewProtection(window.decorView)
    setupUltraStrictOverlayDetection()
  }

  /**
   *  TERMINATE APP (HARD KILL) - ENHANCED FORCE KILL
   */
  private fun terminateApp() {
    Log.e("SECURITY", " CRITICAL SECURITY VIOLATION → FORCE TERMINATING")
    
    try {
      // Multiple kill methods for maximum reliability
      finishAffinity() // Close all activities
      moveTaskToBack(true)
      
      // Force kill process
      android.os.Process.killProcess(android.os.Process.myPid())
      
      // Ultimate fallback
      System.exit(1)
    } catch (e: Exception) {
      Log.e("SECURITY", "Termination error: ${e.message}")
      System.exit(1)
    }
  }

  /**
   * React Native entry - UNCHANGED
   */
  override fun getMainComponentName(): String = "CRP_EP_DEMO"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   *  ROOT DETECTION - UNCHANGED
   */
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

    for (path in paths) {
      if (java.io.File(path).exists()) {
        return true
      }
    }
    return false
  }
}