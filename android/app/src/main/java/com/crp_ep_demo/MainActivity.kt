package com.crp_ep_demo

import android.os.Bundle
import android.view.WindowManager
import android.view.MotionEvent   //  import
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /** VUN-7
   *  Block screenshots & recent apps preview
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

 // Root Detection 
    if (isDeviceRooted()) {
      finish()
    }

    // Apply security flag
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
  }

  /**
   *  Re-apply when app comes to foreground (important)
   */
  override fun onResume() {
    super.onResume()
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
  }

  /** VUN-14
   *  Tapjacking Protection (ONLY NEW ADDITION)
   */
  override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
    if ((ev.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0) {
      return false
    }
    return super.dispatchTouchEvent(ev)
  }

   
  override fun onFilterTouchEventForSecurity(event: MotionEvent): Boolean {
    if ((event.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0) {
      return false
    }
    return super.onFilterTouchEventForSecurity(event)
  }


  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "CRP_EP_DEMO"

  /**
   * React delegate (UNCHANGED)
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

/**  Root Detection Function */
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
