package com.aparajita.capacitor.biometricauth;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import java.util.HashMap;

@NativePlugin(requestCodes = { WSBiometricAuth.REQUEST_CODE })
public class WSBiometricAuth extends Plugin {

    public static final String RESULT_TYPE = "type";
    public static final String RESULT_ERROR_CODE = "errorCode";
    public static final String RESULT_ERROR_MESSAGE = "errorMessage";
    public static final String TITLE = "androidTitle";
    public static final String SUBTITLE = "androidSubtitle";
    public static final String REASON = "reason";
    public static final String CANCEL_TITLE = "cancelTitle";
    public static final String DEVICE_CREDENTIAL = "allowDeviceCredential";
    public static final String MAX_ATTEMPTS = "androidMaxAttempts";
    public static final int DEFAULT_MAX_ATTEMPTS = 3;
    // Error code when biometry is not recognized
    public static final String BIOMETRIC_FAILURE = "authenticationFailed";
    // Biometry prompt
    protected static final int REQUEST_CODE = 1931;
    // Maps biometry error numbers to string error codes
    private static final HashMap<Integer, String> biometryErrorCodeMap;
    private static final HashMap<BiometryType, String> biometryNameMap;
    private static final String INVALID_CONTEXT_ERROR = "invalidContext";
    public static String RESULT_EXTRA_PREFIX;

    static {
        biometryErrorCodeMap = new HashMap<>();
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_CANCELED, "systemCancel");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_HW_NOT_PRESENT, "biometryNotAvailable");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_HW_UNAVAILABLE, "biometryNotAvailable");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_LOCKOUT, "biometryLockout");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_LOCKOUT_PERMANENT, "biometryLockout");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_NEGATIVE_BUTTON, "userCancel");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_NO_BIOMETRICS, "biometryNotEnrolled");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL, "noDeviceCredential");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_NO_SPACE, "systemCancel");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_TIMEOUT, "systemCancel");
        biometryErrorCodeMap.put(BiometricPrompt.ERROR_UNABLE_TO_PROCESS, "systemCancel");
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

    private BiometryType biometryType;

    /**
     * Check the device's availability and type of biometric authentication.
     */
    @PluginMethod
    public void checkBiometry(PluginCall call) {
        BiometricManager manager = BiometricManager.from(getContext());

        int result = manager.canAuthenticate();

        JSObject ret = new JSObject();
        ret.put("isAvailable", result == BiometricManager.BIOMETRIC_SUCCESS);
        biometryType = getDeviceBiometryType();
        ret.put("biometryType", biometryType.getType());

        String reason = "";

        switch (result) {
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
        }

        ret.put("reason", reason);
        call.resolve(ret);
    }

    private BiometryType getDeviceBiometryType() {
        PackageManager manager = getContext().getPackageManager();

        if (manager.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)) {
            return BiometryType.FINGERPRINT;
        }

        if (manager.hasSystemFeature(PackageManager.FEATURE_FACE)) {
            return BiometryType.FACE;
        }

        if (manager.hasSystemFeature(PackageManager.FEATURE_IRIS)) {
            return BiometryType.IRIS;
        }

        return BiometryType.NONE;
    }

    /**
     * Prompt the user for biometric authentication.
     */
    @PluginMethod
    public void authenticate(final PluginCall call) {
        // The result of an intent is supposed to have the package name as a prefix
        RESULT_EXTRA_PREFIX = getContext().getPackageName() + ".";

        Intent intent = new Intent(getContext(), AuthActivity.class);

        // Pass the options to the activity
        intent.putExtra(TITLE, call.getString(TITLE, biometryNameMap.get(biometryType)));
        intent.putExtra(SUBTITLE, call.getString(SUBTITLE));
        intent.putExtra(REASON, call.getString(REASON));
        intent.putExtra(CANCEL_TITLE, call.getString(CANCEL_TITLE));
        intent.putExtra(DEVICE_CREDENTIAL, call.getBoolean(DEVICE_CREDENTIAL, false));

        // Just in case the developer does something dumb like using a number < 1...
        int maxAttempts = Math.max(call.getInt(MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS), 1);
        intent.putExtra(MAX_ATTEMPTS, maxAttempts);

        saveCall(call);
        startActivityForResult(call, intent, REQUEST_CODE);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        PluginCall call = getSavedCall();

        // Make sure this the auth activity we started and it returned some data
        if (requestCode != REQUEST_CODE) {
            return;
        }

        // If the system canceled the activity, we might get RESULT_CANCELED in resultCode.
        // In that case return that immediately, because there won't be any data.
        if (resultCode == Activity.RESULT_CANCELED) {
            call.reject("The system canceled authentication", biometryErrorCodeMap.get(BiometricPrompt.ERROR_CANCELED));
            return;
        }

        // Convert the string result type to an enum
        String resultTypeName = data.getStringExtra(RESULT_EXTRA_PREFIX + WSBiometricAuth.RESULT_TYPE);

        if (resultTypeName == null) {
            call.reject("Missing data in the result of the activity", INVALID_CONTEXT_ERROR);
            return;
        }

        BiometryResultType resultType;

        try {
            resultType = BiometryResultType.valueOf(resultTypeName);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid data in the result of the activity", INVALID_CONTEXT_ERROR);
            return;
        }

        int errorCode = data.getIntExtra(RESULT_EXTRA_PREFIX + WSBiometricAuth.RESULT_ERROR_CODE, 0);
        String errorMessage = data.getStringExtra(RESULT_EXTRA_PREFIX + WSBiometricAuth.RESULT_ERROR_MESSAGE);

        switch (resultType) {
            case SUCCESS:
                call.resolve();
                break;
            case FAILURE:
                // Biometry was successfully presented but was not recognized
                call.reject(errorMessage, BIOMETRIC_FAILURE);
                break;
            case ERROR:
                // The user cancelled, the system cancelled, or some error occurred.
                // If the user cancelled, errorMessage is the text of the "negative" button,
                // which is not especially descriptive.
                if (errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON) {
                    errorMessage = "Cancel button was pressed";
                }

                call.reject(errorMessage, biometryErrorCodeMap.get(errorCode));
                break;
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
