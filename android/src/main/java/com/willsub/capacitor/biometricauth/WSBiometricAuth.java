package com.willsub.capacitor.biometricauth;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.security.KeyPairGeneratorSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.HashMap;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.getcapacitor.*;

@NativePlugin(requestCodes = { WSBiometricAuth.REQUEST_CODE })
public class WSBiometricAuth extends Plugin {

    public static final String RESULT_TYPE = "type";
    public static final String RESULT_ERROR_CODE = "errorCode";
    public static final String RESULT_ERROR_MESSAGE = "errorMessage";
    public static final String TITLE = "androidTitle";
    public static final String SUBTITLE = "androidSubtitle";
    public static final String REASON = "reason";
    public static final String CANCEL_TITLE = "cancelTitle";
    public static final String DEVICE_CREDENTIAL = "androidAllowDeviceCredential";
    public static final String MAX_ATTEMPTS = "androidMaxAttemps";
    public static final int DEFAULT_MAX_ATTEMPTS = 3;
    public static final String BIOMETRIC_FAILURE = "authenticationFailed";
    protected static final int REQUEST_CODE = 1931;
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";
    private static final String DOMAIN = "domain";
    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";
    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String RSA_MODE = "RSA/ECB/PKCS1Padding";
    private static final String AES_MODE = "AES/ECB/PKCS7Padding";
    private static final String ENCRYPTED_KEY = "WSBiometricAuthKey";
    private static final String SHARED_PREFERENCES = "WSBiometricAuthSharedPreferences";
    // Maps biometry error numbers to string error codes
    private static final HashMap<Integer, String> biometryErrorCodeMap;
    private static final HashMap<BiometryType, String> biometryNameMap;
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

    private static final String INVALID_CONTEXT_ERROR = "invalidContext";

    private final byte[] FIXED_IV = new byte[12];
    private KeyStore keyStore;
    private BiometryType biometryType;

    /**
     * Check the device's availability and type of biometric authentication.
     */
    @PluginMethod
    public void checkBiometry(PluginCall call) {
        BiometricManager manager = BiometricManager.from(getContext());

        JSObject ret = new JSObject();
        ret.put("isAvailable", manager.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS);
        biometryType = getDeviceBiometryType();
        ret.put("biometryType", biometryType.getType());

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
     * Prompt the user for biometric authorization.
     */
    @PluginMethod
    public void verifyIdentity(final PluginCall call) {
        // The result of an intent is supposed to have the package name as a prefix
        RESULT_EXTRA_PREFIX = getContext().getPackageName() + ".";

        Intent intent = new Intent(getContext(), AuthActivity.class);

        // Pass the options to the activity
        intent.putExtra(TITLE, call.getString(TITLE, biometryNameMap.get(biometryType)));
        intent.putExtra(SUBTITLE, call.getString(SUBTITLE));
        intent.putExtra(REASON, call.getString(REASON));
        intent.putExtra(CANCEL_TITLE, call.getString(CANCEL_TITLE));
        intent.putExtra(DEVICE_CREDENTIAL, call.getBoolean(DEVICE_CREDENTIAL, false));
        intent.putExtra(MAX_ATTEMPTS, call.getInt(MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS));

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
        String username = call.getString(USERNAME, null);
        String password = call.getString(PASSWORD, null);
        String domain = call.getString(DOMAIN, null);

        if (username != null && password != null && domain != null) {
            try {
                SharedPreferences.Editor editor = getContext().getSharedPreferences(SHARED_PREFERENCES, Context.MODE_PRIVATE).edit();
                editor.putString(USERNAME, encryptString(username, domain));
                editor.putString(PASSWORD, encryptString(password, domain));
                editor.apply();
                call.resolve();
            } catch (GeneralSecurityException | IOException e) {
                call.reject("Failed to save credentials", e);
                e.printStackTrace();
            }
        } else {
            call.reject("Missing properties");
        }
    }

    @PluginMethod
    public void getCredentials(final PluginCall call) {
        String domain = call.getString(DOMAIN, null);

        SharedPreferences sharedPreferences = getContext().getSharedPreferences(SHARED_PREFERENCES, Context.MODE_PRIVATE);
        String username = sharedPreferences.getString(USERNAME, null);
        String password = sharedPreferences.getString(PASSWORD, null);
        if (domain != null) {
            if (username != null && password != null) {
                try {
                    JSObject jsObject = new JSObject();
                    jsObject.put(USERNAME, decryptString(username, domain));
                    jsObject.put(PASSWORD, decryptString(password, domain));
                    call.resolve(jsObject);
                } catch (GeneralSecurityException | IOException e) {
                    call.reject("Failed to get credentials", e);
                }
            } else {
                call.reject("No credentials found");
            }
        } else {
            call.reject("No server name was provided");
        }
    }

    @PluginMethod
    public void deleteCredentials(final PluginCall call) {
        String domain = call.getString("server", null);

        if (domain != null) {
            try {
                getKeyStore().deleteEntry(domain);
                SharedPreferences.Editor editor = getContext().getSharedPreferences(SHARED_PREFERENCES, Context.MODE_PRIVATE).edit();
                editor.clear();
                editor.apply();
                call.resolve();
            } catch (KeyStoreException | CertificateException | NoSuchAlgorithmException | IOException e) {
                call.reject("Failed to delete", e);
            }
        } else {
            call.reject("No server name was provided");
        }
    }

    private String encryptString(String stringToEncrypt, String domain) throws GeneralSecurityException, IOException {
        Cipher cipher;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, getKey(domain), new GCMParameterSpec(128, FIXED_IV));
        } else {
            cipher = Cipher.getInstance(AES_MODE, "BC");
            cipher.init(Cipher.ENCRYPT_MODE, getKey(domain));
        }

        byte[] encodedBytes = cipher.doFinal(stringToEncrypt.getBytes("UTF-8"));
        return Base64.encodeToString(encodedBytes, Base64.DEFAULT);
    }

    private String decryptString(String stringToDecrypt, String domain) throws GeneralSecurityException, IOException {
        byte[] encryptedData = Base64.decode(stringToDecrypt, Base64.DEFAULT);
        Cipher cipher;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, getKey(domain), new GCMParameterSpec(128, FIXED_IV));
        } else {
            cipher = Cipher.getInstance(AES_MODE, "BC");
            cipher.init(Cipher.DECRYPT_MODE, getKey(domain));
        }

        byte[] decryptedData = cipher.doFinal(encryptedData);
        return new String(decryptedData, "UTF-8");
    }

    private Key getKey(String KEY_ALIAS) throws GeneralSecurityException, IOException {
        KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) getKeyStore().getEntry(KEY_ALIAS, null);
        if (secretKeyEntry != null) {
            return secretKeyEntry.getSecretKey();
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEY_STORE);
            generator.init(
                new KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setRandomizedEncryptionRequired(false)
                    .build()
            );
            return generator.generateKey();
        }

        return getAESKey(KEY_ALIAS);
    }

    private KeyStore getKeyStore() throws KeyStoreException, CertificateException, NoSuchAlgorithmException, IOException {
        if (keyStore == null) {
            keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
            keyStore.load(null);
        }

        return keyStore;
    }

    private Key getAESKey(String KEY_ALIAS)
        throws CertificateException, NoSuchPaddingException, InvalidKeyException, NoSuchAlgorithmException, KeyStoreException, NoSuchProviderException, UnrecoverableEntryException, IOException, InvalidAlgorithmParameterException {
        SharedPreferences sharedPreferences = getContext().getSharedPreferences("", Context.MODE_PRIVATE);
        String encryptedKeyB64 = sharedPreferences.getString(ENCRYPTED_KEY, null);

        if (encryptedKeyB64 == null) {
            byte[] key = new byte[16];
            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(key);
            byte[] encryptedKey = rsaEncrypt(key, KEY_ALIAS);
            encryptedKeyB64 = Base64.encodeToString(encryptedKey, Base64.DEFAULT);
            SharedPreferences.Editor edit = sharedPreferences.edit();
            edit.putString(ENCRYPTED_KEY, encryptedKeyB64);
            edit.apply();
            return new SecretKeySpec(key, "AES");
        }

        byte[] encryptedKey = Base64.decode(encryptedKeyB64, Base64.DEFAULT);
        byte[] key = rsaDecrypt(encryptedKey, KEY_ALIAS);
        return new SecretKeySpec(key, "AES");
    }

    private KeyStore.PrivateKeyEntry getPrivateKeyEntry(String KEY_ALIAS)
        throws NoSuchProviderException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, CertificateException, KeyStoreException, IOException, UnrecoverableEntryException {
        KeyStore.PrivateKeyEntry privateKeyEntry = (KeyStore.PrivateKeyEntry) getKeyStore().getEntry(KEY_ALIAS, null);

        if (privateKeyEntry == null) {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, ANDROID_KEY_STORE);
            keyPairGenerator.initialize(new KeyPairGeneratorSpec.Builder(getContext()).setAlias(KEY_ALIAS).build());
            keyPairGenerator.generateKeyPair();
        }

        return privateKeyEntry;
    }

    private byte[] rsaEncrypt(byte[] secret, String KEY_ALIAS)
        throws CertificateException, NoSuchAlgorithmException, KeyStoreException, IOException, UnrecoverableEntryException, NoSuchProviderException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException {
        KeyStore.PrivateKeyEntry privateKeyEntry = getPrivateKeyEntry(KEY_ALIAS);
        // Encrypt the text
        Cipher inputCipher = Cipher.getInstance(RSA_MODE, "AndroidOpenSSL");
        inputCipher.init(Cipher.ENCRYPT_MODE, privateKeyEntry.getCertificate().getPublicKey());

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        CipherOutputStream cipherOutputStream = new CipherOutputStream(outputStream, inputCipher);
        cipherOutputStream.write(secret);
        cipherOutputStream.close();

        return outputStream.toByteArray();
    }

    private byte[] rsaDecrypt(byte[] encrypted, String KEY_ALIAS)
        throws UnrecoverableEntryException, NoSuchAlgorithmException, KeyStoreException, NoSuchProviderException, NoSuchPaddingException, InvalidKeyException, IOException, CertificateException, InvalidAlgorithmParameterException {
        KeyStore.PrivateKeyEntry privateKeyEntry = getPrivateKeyEntry(KEY_ALIAS);
        Cipher output = Cipher.getInstance(RSA_MODE, "AndroidOpenSSL");
        output.init(Cipher.DECRYPT_MODE, privateKeyEntry.getPrivateKey());
        CipherInputStream cipherInputStream = new CipherInputStream(new ByteArrayInputStream(encrypted), output);
        ArrayList<Byte> values = new ArrayList<>();
        int nextByte;

        while ((nextByte = cipherInputStream.read()) != -1) {
            values.add((byte) nextByte);
        }

        byte[] bytes = new byte[values.size()];

        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = values.get(i);
        }

        return bytes;
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
