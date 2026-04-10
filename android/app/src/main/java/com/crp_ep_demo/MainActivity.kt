package com.crp_ep_demo

import android.os.Bundle
import android.os.Build
import android.util.Log
import android.widget.Toast
import android.view.WindowManager
import android.view.MotionEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /** VUN-7
   * Block screenshots & recent apps preview
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

  // Root Detection Check (called during Activity lifecycle)
if (isDeviceRooted()) {

  /**
   * If the device is detected as rooted:
   *
   * - The application immediately terminates the current Activity using finish().
   * - This prevents the app from running in a compromised environment.
   *
   * Security Rationale:
   * - Rooted devices can bypass sandboxing and security controls.
   * - Sensitive operations should not be allowed in such environments.
   */
  finish()
}
    // Apply security flag
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
  }

  /**
   * Re-apply when app comes to foreground (important)
   */
  override fun onResume() {
    super.onResume()
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
  }

 /** VUN-14
 * Tapjacking Protection
 *
 * This implementation provides protection against tapjacking (overlay attacks)
 * by intercepting all touch events at the Activity level and validating whether
 * the application window is obscured by another application.
 */

override fun dispatchTouchEvent(ev: MotionEvent): Boolean {

  /**
   * Detects whether the application window is fully obscured by another window.
   *
   * - MotionEvent.flags contains system-provided metadata about the touch event.
   * - FLAG_WINDOW_IS_OBSCURED is set by the Android OS when another application
   *   (malicious or legitimate) is drawing over the current window.
   * - A bitwise AND operation is used to check if this flag is present.
   *
   * If true → indicates a potential tapjacking attempt via full overlay.
   */
  val isObscured =
    (ev.flags and MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0


  /**
   * Detects whether the application window is partially obscured (Android 10+).
   *
   * - First condition ensures compatibility:
   *   FLAG_WINDOW_IS_PARTIALLY_OBSCURED is available only on API level 29+.
   *
   * - Second condition checks if the touch event occurred in an area partially
   *   covered by another window (e.g., overlays).
   *
   * If true → indicates a partial overlay scenario, which may also be exploited
   * for tapjacking attacks.
   */
  val isPartiallyObscured =
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
    (ev.flags and MotionEvent.FLAG_WINDOW_IS_PARTIALLY_OBSCURED) != 0


  /**
   * Security enforcement condition:
   *
   * - If either full or partial obscuring is detected, the application treats
   *   the interaction as potentially unsafe.
   * - Logical OR ensures comprehensive protection against all overlay scenarios.
   */
  if (isObscured || isPartiallyObscured) {

    /**
     * Logs a warning message for security monitoring and audit traceability.
     * This helps in identifying potential tapjacking attempts during testing
     * or runtime analysis.
     */
    Log.w("SECURITY", "Tapjacking attempt detected!")


    /**
     * Optional user notification:
     *
     * - Informs the user that an overlay has been detected.
     * - Advises disabling screen overlays to continue interaction.
     * - Can be disabled in production if not required for UX.
     */
    Toast.makeText(
      this,
      "Screen overlay detected. Please disable it.",
      Toast.LENGTH_SHORT
    ).show()


    /**
     * Core protection mechanism:
     *
     * - Returning false prevents the touch event from being dispatched
     *   to underlying UI components.
     * - This ensures that no unintended or malicious interaction is processed.
     *
     * Result:
     * - Tapjacking attempts are effectively neutralized.
     */
    return false
  }


  /**
   * Default behavior :
   *
   * - If no overlay is detected, the touch event is passed to the standard
   *   Android event handling system.
   * - Ensures normal application functionality without affecting user experience.
   */
  return super.dispatchTouchEvent(ev)
}

  //  SURGICAL FIX: We deleted the invalid onFilterTouchEventForSecurity block from here!

  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "CRP_EP_DEMO"

  /**
   * React delegate (UNCHANGED)
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  //  SURGICAL FIX: Moved this INSIDE the MainActivity class so it is properly scoped
  

  /** 
 * Root Detection Function
 *
 * This method checks for the existence of commonly known root-related file paths.
 * Presence of any of these files strongly indicates that the device has been rooted.
 */
private fun isDeviceRooted(): Boolean {

  /**
   * List of known root-related file paths:
   *
   * These paths are commonly associated with:
   * - Superuser binaries (su)
   * - Root management applications
   * - Modified system binaries
   *
   * Attackers or rooted environments typically install binaries in these locations.
   */
  val paths = arrayOf(
    "/system/app/Superuser.apk",     // Superuser app (root management)
    "/sbin/su",                     // su binary (system binary path)
    "/system/bin/su",               // su binary (standard system location)
    "/system/xbin/su",              // su binary (extended system binaries)
    "/data/local/xbin/su",          // su binary (user-installed location)
    "/data/local/bin/su",           // su binary (alternate location)
    "/system/sd/xbin/su",           // su binary (less common path)
    "/system/bin/failsafe/su",      // failsafe su binary
    "/data/local/su"                // su binary (local storage)
  )


  /**
   * Iterates through each known path and checks if the file exists.
   *
   * - java.io.File(path).exists() returns true if the file is present.
   * - Presence of any such file indicates root access is likely enabled.
   */
  for (path in paths) {
    if (java.io.File(path).exists()) {

      /**
       * Root indicator found:
       *
       * - Immediately returns true.
       * - No further checks are required once a match is found.
       */
      return true
    }
  }


  /**
   * If none of the known root indicators are found:
   *
   * - The device is assumed to be non-rooted (based on this basic check).
   * - Returns false, allowing normal application execution.
   */
  return false
}
}