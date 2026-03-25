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