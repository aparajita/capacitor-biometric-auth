package com.aparajita.capacitor.biometricauth;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import androidx.activity.result.ActivityResult;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.HashMap;

@SuppressLint("RestrictedApi")
@CapacitorPlugin(name = "BiometricAuthNative")
public class BiometricAuthNative extends Plugin {

  public static final String RESULT_TYPE = "type";
  public static final String RESULT_ERROR_CODE = "errorCode";
  public static final String RESULT_ERROR_MESSAGE = "errorMessage";
  public static final String TITLE = "androidTitle";
  public static final String SUBTITLE = "androidSubtitle";
  public static final String REASON = "reason";
  public static final String CANCEL_TITLE = "cancelTitle";
  public static final String BIOMETRIC_STRENGTH = "biometricStrength";
  public static final String DEVICE_CREDENTIAL = "allowDeviceCredential";
  public static final String CONFIRMATION_REQUIRED =
    "androidConfirmationRequired";
  // Error code when biometry is not recognized
  public static final String BIOMETRIC_FAILURE = "authenticationFailed";
  // Maps biometry error numbers to string error codes
  private static final HashMap<Integer, String> biometryErrorCodeMap;
  private static final HashMap<BiometryType, String> biometryNameMap;
  private static final String INVALID_CONTEXT_ERROR = "invalidContext";
  public static String RESULT_EXTRA_PREFIX;

  static {
    biometryErrorCodeMap = new HashMap<>();
    biometryErrorCodeMap.put(BiometricManager.BIOMETRIC_SUCCESS, "");
    biometryErrorCodeMap.put(BiometricPrompt.ERROR_CANCELED, "systemCancel");
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_HW_NOT_PRESENT,
      "biometryNotAvailable"
    );
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_HW_UNAVAILABLE,
      "biometryNotAvailable"
    );
    biometryErrorCodeMap.put(BiometricPrompt.ERROR_LOCKOUT, "biometryLockout");
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_LOCKOUT_PERMANENT,
      "biometryLockout"
    );
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_NEGATIVE_BUTTON,
      "userCancel"
    );
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_NO_BIOMETRICS,
      "biometryNotEnrolled"
    );
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL,
      "noDeviceCredential"
    );
    biometryErrorCodeMap.put(BiometricPrompt.ERROR_NO_SPACE, "systemCancel");
    biometryErrorCodeMap.put(BiometricPrompt.ERROR_TIMEOUT, "systemCancel");
    biometryErrorCodeMap.put(
      BiometricPrompt.ERROR_UNABLE_TO_PROCESS,
      "systemCancel"
    );
    biometryErrorCodeMap.put(BiometricPrompt.ERROR_USER_CANCELED, "userCancel");
    biometryErrorCodeMap.put(BiometricPrompt.ERROR_VENDOR, "systemCancel");
  }

  static {
    biometryNameMap = new HashMap<>();
    biometryNameMap.put(BiometryType.NONE, "No Authentication");
    biometryNameMap.put(BiometryType.FINGERPRINT, "Fingerprint Authentication");
    biometryNameMap.put(BiometryType.FACE, "Face Authentication");
    biometryNameMap.put(BiometryType.IRIS, "Iris Authentication");
  }

  private ArrayList<BiometryType> biometryTypes;

  private int getAuthenticatorFromCall(PluginCall call) {
    int authenticator = BiometricManager.Authenticators.BIOMETRIC_WEAK;

    Integer value = call.getInt(
      "androidBiometryStrength",
      BiometryStrength.WEAK.ordinal()
    );

    if (value != null && value == BiometryStrength.STRONG.ordinal()) {
      authenticator = BiometricManager.Authenticators.BIOMETRIC_STRONG;
    }

    return authenticator;
  }

  /**
   * Check the device's availability and type of biometric authentication.
   */
  @PluginMethod
  public void checkBiometry(PluginCall call) {
    call.resolve(checkBiometry());
  }

  private JSObject checkBiometry() {
    JSObject result = new JSObject();
    BiometricManager manager = BiometricManager.from(getContext());

    // First check for weak biometry or better.
    int weakBiometryResult = manager.canAuthenticate(
      BiometricManager.Authenticators.BIOMETRIC_WEAK
    );

    setReasonAndCode(weakBiometryResult, false, result);

    result.put(
      "isAvailable",
      weakBiometryResult == BiometricManager.BIOMETRIC_SUCCESS
    );

    // Now check for strong biometry.
    int strongBiometryResult = manager.canAuthenticate(
      BiometricManager.Authenticators.BIOMETRIC_STRONG
    );

    setReasonAndCode(strongBiometryResult, true, result);

    result.put(
      "strongBiometryIsAvailable",
      strongBiometryResult == BiometricManager.BIOMETRIC_SUCCESS
    );

    biometryTypes = getDeviceBiometryTypes();
    result.put("biometryType", biometryTypes.get(0).getType());

    JSArray returnTypes = new JSArray();

    for (BiometryType type : biometryTypes) {
      if (type != BiometryType.NONE) {
        returnTypes.put(type.getType());
      }
    }

    result.put("biometryTypes", returnTypes);

    KeyguardManager keyguardManager =
      (KeyguardManager) this.getContext().getSystemService(
        Context.KEYGUARD_SERVICE
      );

    if (keyguardManager != null) {
      result.put("deviceIsSecure", keyguardManager.isKeyguardSecure());
    } else {
      result.put("deviceIsSecure", false);
    }

    return result;
  }

  private static void setReasonAndCode(
    int canAuthenticateResult,
    boolean strong,
    JSObject result
  ) {
    String reason = "";

    switch (canAuthenticateResult) {
      case BiometricManager.BIOMETRIC_SUCCESS:
        break;
      case BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE:
        reason = "Biometry hardware is present, but currently unavailable.";
        break;
      case BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED:
        reason = "The user does not have any biometrics enrolled.";
        break;
      case BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE:
        reason = "There is no biometric hardware on this device.";
        break;
      case BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED:
        reason =
          "The user can’t authenticate because a security vulnerability has been discovered with one or more hardware sensors.";
        break;
      case BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED:
        reason =
          "The user can’t authenticate because the specified options are incompatible with the current Android version.";
        break;
      case BiometricManager.BIOMETRIC_STATUS_UNKNOWN:
        reason = "Unable to determine whether the user can authenticate.";
        break;
    }

    String errorCode = biometryErrorCodeMap.get(canAuthenticateResult);

    if (errorCode == null) {
      errorCode = "biometryNotAvailable";
    }

    result.put(strong ? "strongReason" : "reason", reason);
    result.put(strong ? "strongCode" : "code", errorCode);
  }

  @NonNull
  private ArrayList<BiometryType> getDeviceBiometryTypes() {
    ArrayList<BiometryType> types = new ArrayList<>();
    PackageManager manager = getContext().getPackageManager();

    if (manager.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)) {
      types.add(BiometryType.FINGERPRINT);
    }

    if (manager.hasSystemFeature(PackageManager.FEATURE_FACE)) {
      types.add(BiometryType.FACE);
    }

    if (manager.hasSystemFeature(PackageManager.FEATURE_IRIS)) {
      types.add(BiometryType.IRIS);
    }

    if (types.isEmpty()) {
      types.add(BiometryType.NONE);
    }

    return types;
  }

  /**
   * Prompt the user for biometric authentication.
   */
  @PluginMethod
  public void internalAuthenticate(final PluginCall call) {
    // If the user has not called checkBiometry() first, we need to get the list
    // of supported biometry.
    if (biometryTypes == null) {
      biometryTypes = getDeviceBiometryTypes();
    }

    // The result of an intent is supposed to have the package name as a prefix.
    RESULT_EXTRA_PREFIX = getContext().getPackageName() + ".";

    Intent intent = new Intent(getContext(), AuthActivity.class);

    // Pass the options to the activity.
    String title = "";

    // If no biometry is available, biometryTypes will be an empty list.
    if (!biometryTypes.isEmpty()) {
      title = biometryNameMap.get(biometryTypes.get(0));
    }

    intent.putExtra(TITLE, call.getString(TITLE, title));
    intent.putExtra(SUBTITLE, call.getString(SUBTITLE));
    intent.putExtra(REASON, call.getString(REASON));
    intent.putExtra(CANCEL_TITLE, call.getString(CANCEL_TITLE));
    intent.putExtra(
      DEVICE_CREDENTIAL,
      call.getBoolean(DEVICE_CREDENTIAL, false)
    );
    intent.putExtra(BIOMETRIC_STRENGTH, getAuthenticatorFromCall(call));

    if (call.getBoolean(CONFIRMATION_REQUIRED, true) != null) {
      intent.putExtra(
        CONFIRMATION_REQUIRED,
        call.getBoolean(CONFIRMATION_REQUIRED, true)
      );
    }

    startActivityForResult(call, intent, "authenticateResult");
  }

  @ActivityCallback
  protected void authenticateResult(PluginCall call, ActivityResult result) {
    int resultCode = result.getResultCode();

    // If the system canceled the activity, we might get RESULT_CANCELED in resultCode.
    // In that case return that immediately, because there won't be any data.
    if (resultCode == Activity.RESULT_CANCELED) {
      call.reject(
        "The system canceled authentication",
        biometryErrorCodeMap.get(BiometricPrompt.ERROR_CANCELED)
      );
      return;
    }

    // Convert the string result type to an enum.
    Intent data = result.getData();
    String resultTypeName = null;

    if (data != null) {
      resultTypeName = data.getStringExtra(
        RESULT_EXTRA_PREFIX + BiometricAuthNative.RESULT_TYPE
      );
    }

    if (resultTypeName == null) {
      call.reject(
        "Missing data in the result of the activity",
        INVALID_CONTEXT_ERROR
      );
      return;
    }

    BiometryResultType resultType;

    try {
      resultType = BiometryResultType.valueOf(resultTypeName);
    } catch (IllegalArgumentException e) {
      call.reject(
        "Invalid data in the result of the activity",
        INVALID_CONTEXT_ERROR
      );
      return;
    }

    int errorCode = data.getIntExtra(
      RESULT_EXTRA_PREFIX + BiometricAuthNative.RESULT_ERROR_CODE,
      0
    );
    String errorMessage = data.getStringExtra(
      RESULT_EXTRA_PREFIX + BiometricAuthNative.RESULT_ERROR_MESSAGE
    );

    switch (resultType) {
      case SUCCESS -> call.resolve();
      // Biometry was successfully presented but was not recognized.
      case FAILURE -> call.reject(errorMessage, BIOMETRIC_FAILURE);
      // The user cancelled, the system cancelled, or some error occurred.
      // If the user cancelled, errorMessage is the text of the "negative" button,
      // which is not especially descriptive.
      case ERROR -> {
        if (errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON) {
          errorMessage = "Cancel button was pressed";
        }

        String mappedCode = biometryErrorCodeMap.get(errorCode);

        if (mappedCode == null) {
          mappedCode = "systemCancel";
        }

        call.reject(errorMessage, mappedCode);
      }
    }
  }

  enum BiometryType {
    NONE(0),
    FINGERPRINT(3),
    FACE(4),
    IRIS(5);

    private final int type;

    BiometryType(int type) {
      this.type = type;
    }

    public int getType() {
      return this.type;
    }
  }
}
