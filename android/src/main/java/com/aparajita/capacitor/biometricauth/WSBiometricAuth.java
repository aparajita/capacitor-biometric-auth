package com.aparajita.capacitor.biometricauth;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.security.KeyPairGeneratorSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.util.Pair;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.spec.AlgorithmParameterSpec;
import java.util.Calendar;
import java.util.HashMap;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.security.auth.x500.X500Principal;

interface StorageOp {
    void run() throws CredentialsException;
}

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
    // Field names
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";
    private static final String DOMAIN = "domain";

    // KeyStore-related stuff
    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";
    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String SHARED_PREFERENCES = "WSBiometricAuthSharedPreferences";
    private static final String KEYSTORE_CREDENTIALS_PREFIX = "credentials_";
    private static final Character DATA_IV_SEPARATOR = '\u0010';
    private static final int BASE64_FLAGS = Base64.NO_PADDING + Base64.NO_WRAP;

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

    private KeyStore keyStore;
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
        if (requestCode != REQUEST_CODE || resultCode != Activity.RESULT_OK) {
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

    @PluginMethod
    public void setCredentials(final PluginCall call) {
        String domain = getDomainParam(call);

        if (domain == null) {
            return;
        }

        CredentialsException exception = null;
        HashMap<String, String> params = new HashMap<>();

        for (String param : new String[] { USERNAME, PASSWORD }) {
            String value = call.getString(param);

            if (value == null) {
                exception = new CredentialsException(CredentialsException.ErrorKind.missingParameter, param);
                break;
            }

            params.put(param, value);
        }

        if (exception != null) {
            exception.rejectCall(call);
            return;
        }

        tryStorageOp(
            call,
            () -> {
                storeCredentials(params.get(USERNAME), params.get(PASSWORD), domain);
                call.resolve();
            }
        );
    }

    @PluginMethod
    public void getCredentials(final PluginCall call) {
        String domain = getDomainParam(call);

        if (domain == null) {
            return;
        }

        tryStorageOp(
            call,
            () -> {
                Pair<String, String> credentials = retrieveCredentials(domain);

                JSObject result = new JSObject();
                result.put(USERNAME, credentials.first);
                result.put(PASSWORD, credentials.second);

                call.resolve(result);
            }
        );
    }

    @PluginMethod
    public void deleteCredentials(final PluginCall call) {
        String domain = getDomainParam(call);

        if (domain == null) {
            return;
        }

        tryStorageOp(
            call,
            () -> {
                removeCredentials(domain);
                call.resolve();
            }
        );
    }

    private SharedPreferences getPrefs() {
        return getContext().getSharedPreferences(SHARED_PREFERENCES, Context.MODE_PRIVATE);
    }

    private void storeCredentials(String username, String password, String domain) throws CredentialsException {
        // When we get here, we know that the values are not null
        try {
            getPrefs()
                .edit()
                .putString(USERNAME, encryptString(username, domain))
                .putString(PASSWORD, encryptString(password, domain))
                .apply();
        } catch (GeneralSecurityException | IOException e) {
            throw new CredentialsException(CredentialsException.ErrorKind.osError, e);
        }
    }

    private Pair<String, String> retrieveCredentials(String domain) throws CredentialsException {
        SharedPreferences sharedPreferences = getPrefs();
        String username;
        String password;

        try {
            username = sharedPreferences.getString(USERNAME, null);
            password = sharedPreferences.getString(PASSWORD, null);
        } catch (ClassCastException e) {
            throw new CredentialsException(CredentialsException.ErrorKind.invalidData);
        }

        if (username != null && password != null) {
            try {
                username = decryptString(username, domain);
                password = decryptString(password, domain);
                return new Pair<>(username, password);
            } catch (GeneralSecurityException | IOException e) {
                throw new CredentialsException(CredentialsException.ErrorKind.osError, e);
            }
        } else {
            throw new CredentialsException(CredentialsException.ErrorKind.notFound, domain);
        }
    }

    private void removeCredentials(String domain) throws CredentialsException {
        try {
            getKeyStore().deleteEntry(domain);
            getPrefs().edit().clear().apply();
        } catch (GeneralSecurityException | IOException e) {
            throw new CredentialsException(CredentialsException.ErrorKind.osError, e);
        }
    }

    private void tryStorageOp(PluginCall call, StorageOp op) {
        CredentialsException exception;

        try {
            op.run();
            return;
        } catch (CredentialsException e) {
            exception = e;
        } catch (Exception e) {
            exception = new CredentialsException(CredentialsException.ErrorKind.unknownError);
        }

        exception.rejectCall(call);
    }

    private String getDomainParam(PluginCall call) {
        String domain = call.getString(DOMAIN);

        if (domain == null) {
            // If the domain was not given by the caller, use the appId
            try {
                PackageInfo pinfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
                return pinfo.packageName;
            } catch (Exception e) {
                // Fall through
            }

            CredentialsException ex = new CredentialsException(CredentialsException.ErrorKind.missingParameter, DOMAIN);
            ex.rejectCall(call);
            return null;
        }

        return domain;
    }

    private String encryptString(String str, String domain) throws GeneralSecurityException, IOException {
        // Code taken from https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b
        Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(domain));

        byte[] iv = cipher.getIV();
        byte[] plaintext = str.getBytes(StandardCharsets.UTF_8);

        byte[] encryptedBytes = cipher.doFinal(plaintext);
        String encryptedStr = Base64.encodeToString(encryptedBytes, BASE64_FLAGS);

        // Append the IV
        String ivStr = Base64.encodeToString(iv, BASE64_FLAGS);
        return encryptedStr + DATA_IV_SEPARATOR + ivStr;
    }

    private String decryptString(String ciphertext, String domain) throws GeneralSecurityException, IOException, CredentialsException {
        // Code taken from https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b

        // Split the ciphertext into data + IV
        String[] parts = ciphertext.split(DATA_IV_SEPARATOR.toString());

        // There must be 2 parts
        if (parts.length != 2) {
            throw new CredentialsException(CredentialsException.ErrorKind.invalidData);
        }

        // The first part is the actual data, the second is the IV
        byte[] encryptedData = Base64.decode(parts[0], BASE64_FLAGS);
        byte[] iv = Base64.decode(parts[1], BASE64_FLAGS);

        String alias = getAlias(domain);
        KeyStore keyStore = getKeyStore();
        KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keyStore.getEntry(alias, null);

        // Make sure there is an entry in the KeyStore for the given domain
        if (secretKeyEntry == null) {
            throw new CredentialsException(CredentialsException.ErrorKind.notFound, domain);
        }

        SecretKey secretKey = secretKeyEntry.getSecretKey();
        Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

        byte[] decryptedData = cipher.doFinal(encryptedData);
        return new String(decryptedData, StandardCharsets.UTF_8);
    }

    private SecretKey getSecretKey(String domain) throws GeneralSecurityException, IOException {
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES", ANDROID_KEY_STORE);
        String alias = getAlias(domain);

        KeyStore keyStore = getKeyStore();
        KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) keyStore.getEntry(alias, null);
        SecretKey secretKey;

        if (entry == null) {
            AlgorithmParameterSpec spec;

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                KeyGenParameterSpec.Builder builder = new KeyGenParameterSpec.Builder(
                    alias,
                    KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
                );
                spec =
                    builder
                        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                        .build();
            } else {
                // Let the key pair last for 1 year
                Calendar start = Calendar.getInstance();
                Calendar end = Calendar.getInstance();
                end.add(Calendar.YEAR, 1);

                KeyPairGeneratorSpec.Builder builder = new KeyPairGeneratorSpec.Builder(getContext());
                spec =
                    builder
                        .setAlias(alias)
                        .setSubject(new X500Principal("CN=" + domain))
                        .setSerialNumber(BigInteger.ONE)
                        .setStartDate(start.getTime())
                        .setEndDate(end.getTime())
                        .build();
            }

            keyGenerator.init(spec);
            secretKey = keyGenerator.generateKey();
        } else {
            secretKey = entry.getSecretKey();
        }

        return secretKey;
    }

    private String getAlias(String domain) {
        return KEYSTORE_CREDENTIALS_PREFIX + domain;
    }

    private KeyStore getKeyStore() throws GeneralSecurityException, IOException {
        if (keyStore == null) {
            keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
            keyStore.load(null);
        }

        return keyStore;
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
