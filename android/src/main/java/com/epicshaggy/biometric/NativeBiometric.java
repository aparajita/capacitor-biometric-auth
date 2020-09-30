package com.epicshaggy.biometric;

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

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.UnrecoverableEntryException;
import java.security.cert.CertificateException;
import java.util.ArrayList;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;


@NativePlugin(requestCodes = {NativeBiometric.AUTH_CODE})
public class NativeBiometric extends Plugin {

    private BiometricManager biometricManager;
    protected final static int AUTH_CODE = 0102;

    private static final int NONE = 0;
    private static final int FINGERPRINT = 3;
    private static final int FACE_AUTHENTICATION = 4;
    private static final int IRIS_AUTHENTICATION = 5;

    private KeyStore keyStore;
    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String RSA_MODE =  "RSA/ECB/PKCS1Padding";
    private static final String AES_MODE = "AES/ECB/PKCS7Padding";
    private static final byte[] FIXED_IV = new byte[12];
    private static final String ENCRYPTED_KEY = "NativeBiometricKey";
    private static final String NATIVE_BIOMETRIC_SHARED_PREFERENCES = "NativeBiometricSharedPreferences";

    private SharedPreferences encryptedSharedPreferences;

    private int getAvailableFeature() {
        if (getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)) {
            return FINGERPRINT;
        } else if (getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_FACE)) {
            return FACE_AUTHENTICATION;
        } else if (getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_IRIS)) {
            return IRIS_AUTHENTICATION;

        } else {
            return NONE;
        }
    }

    @PluginMethod()
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();

        biometricManager = BiometricManager.from(getContext());

        switch (biometricManager.canAuthenticate()) {
            case BiometricManager.BIOMETRIC_SUCCESS:
                ret.put("isAvailable", true);
                break;
            default:
                ret.put("isAvailable", false);
                break;
        }


        ret.put("biometryType", getAvailableFeature());
        call.resolve(ret);
    }

    @PluginMethod()
    public void verifyIdentity(final PluginCall call) {
        Intent intent = new Intent(getContext(), AuthAcitivy.class);

        intent.putExtra("title", call.getString("title", "Authenticate"));

        if(call.hasOption("subtitle"))
            intent.putExtra("subtitle", call.getString("subtitle"));

        if(call.hasOption("description"))
            intent.putExtra("description", call.getString("description"));

        saveCall(call);
        startActivityForResult(call, intent, AUTH_CODE);
    }

    @PluginMethod()
    public void setCredentials(final PluginCall call){
        String username = call.getString("username", null);
        String password = call.getString("password", null);
        String KEY_ALIAS = call.getString("server", null);

        if(username != null && password != null && KEY_ALIAS != null){
            try {
                SharedPreferences.Editor editor = getContext().getSharedPreferences(NATIVE_BIOMETRIC_SHARED_PREFERENCES, Context.MODE_PRIVATE).edit();
                editor.putString("username", encryptString(username, KEY_ALIAS));
                editor.putString("password", encryptString(password, KEY_ALIAS));
                editor.apply();
                call.resolve();
            } catch (GeneralSecurityException e) {
                call.reject("Failed to save credentials", e);
                e.printStackTrace();
            } catch (IOException e) {
                call.reject("Failed to save credentials", e);
                e.printStackTrace();
            }
        }else{
            call.reject("Missing properties");
        }
    }

    @PluginMethod()
    public void getCredentials(final PluginCall call) {
        String KEY_ALIAS = call.getString("server", null);

        SharedPreferences sharedPreferences = getContext().getSharedPreferences(NATIVE_BIOMETRIC_SHARED_PREFERENCES, Context.MODE_PRIVATE);
        String username = sharedPreferences.getString("username", null);
        String password = sharedPreferences.getString("password", null);
        if (KEY_ALIAS != null) {
            if (username != null && password != null) {
                try {
                    JSObject jsObject = new JSObject();
                    jsObject.put("username", decryptString(username, KEY_ALIAS));
                    jsObject.put("password", decryptString(password, KEY_ALIAS));
                    call.resolve(jsObject);
                } catch (GeneralSecurityException e) {
                    call.reject("Failed to get credentials", e);
                } catch (IOException e) {
                    call.reject("Failed to get credentials", e);
                }
            } else {
                call.reject("No credentials found");
            }
        } else {
            call.reject("No server name was provided");
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        PluginCall call = getSavedCall();
        if(requestCode == AUTH_CODE){
            if(resultCode == Activity.RESULT_OK){
                if(data.hasExtra("result")){
                    switch (data.getStringExtra("result")){
                        case "success":
                            call.resolve();
                            break;
                        default:
                            call.reject("Failed to authenticate");
                            break;
                        /*case "failed":
                            call.reject("Failed to authenticate");
                            break;
                        case "error":
                            call.error("");
                            break;*/
                    }
                }
            }
        }
    }

    @PluginMethod()
    public void deleteCredentials(final PluginCall call){
        String KEY_ALIAS = call.getString("server", null);

        if(KEY_ALIAS != null){
            try {
                getKeyStore().deleteEntry(KEY_ALIAS);
                SharedPreferences.Editor editor = getContext().getSharedPreferences(NATIVE_BIOMETRIC_SHARED_PREFERENCES, Context.MODE_PRIVATE).edit();
                editor.clear();
                editor.apply();
                call.resolve();
            } catch (KeyStoreException e) {
                call.reject("Failed to delete", e);
            } catch (CertificateException e) {
                call.reject("Failed to delete", e);
            } catch (NoSuchAlgorithmException e) {
                call.reject("Failed to delete", e);
            } catch (IOException e) {
                call.reject("Failed to delete", e);
            }
        }else{
            call.reject("No server name was provided");
        }
    }

    private String encryptString(String stringToEncrypt, String KEY_ALIAS) throws GeneralSecurityException, IOException {
        Cipher cipher;
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, getKey(KEY_ALIAS), new GCMParameterSpec(128, FIXED_IV));
        }else{
            cipher = Cipher.getInstance(AES_MODE, "BC");
            cipher.init(Cipher.ENCRYPT_MODE, getKey(KEY_ALIAS));
        }
        byte[] encodedBytes = cipher.doFinal(stringToEncrypt.getBytes("UTF-8"));
        return Base64.encodeToString(encodedBytes, Base64.DEFAULT);
    }

    private String decryptString(String stringToDecrypt, String KEY_ALIAS) throws GeneralSecurityException, IOException {
        byte[] encryptedData = Base64.decode(stringToDecrypt, Base64.DEFAULT);

        Cipher cipher;
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, getKey(KEY_ALIAS), new GCMParameterSpec(128, FIXED_IV));
        }else{
            cipher = Cipher.getInstance(AES_MODE, "BC");
            cipher.init(Cipher.DECRYPT_MODE, getKey(KEY_ALIAS));
        }
        byte[] decryptedData = cipher.doFinal(encryptedData);
        return new String(decryptedData, "UTF-8");
    }


    private Key getKey(String KEY_ALIAS) throws GeneralSecurityException, IOException {
        KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) getKeyStore().getEntry(KEY_ALIAS, null);
        if (secretKeyEntry != null) {
            return secretKeyEntry.getSecretKey();
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEY_STORE);
            generator.init(new KeyGenParameterSpec.Builder(
                    KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setRandomizedEncryptionRequired(false)
                    .build()
            );
            return generator.generateKey();
        } else {
            return getAESKey(KEY_ALIAS);
        }
    }

    private KeyStore getKeyStore() throws KeyStoreException, CertificateException, NoSuchAlgorithmException, IOException {
        if (keyStore != null) {
            return keyStore;
        } else {
            keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
            keyStore.load(null);
            return keyStore;
        }
    }

    private Key getAESKey(String KEY_ALIAS) throws CertificateException, NoSuchPaddingException, InvalidKeyException, NoSuchAlgorithmException, KeyStoreException, NoSuchProviderException, UnrecoverableEntryException, IOException, InvalidAlgorithmParameterException {
        SharedPreferences sharedPreferences = getContext().getSharedPreferences("", Context.MODE_PRIVATE);
        String encryptedKeyB64 = sharedPreferences.getString(ENCRYPTED_KEY, null);
        if(encryptedKeyB64 == null){
            byte[] key = new byte[16];
            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(key);
            byte[] encryptedKey = rsaEncrypt(key, KEY_ALIAS);
            encryptedKeyB64 = Base64.encodeToString(encryptedKey, Base64.DEFAULT);
            SharedPreferences.Editor edit = sharedPreferences.edit();
            edit.putString(ENCRYPTED_KEY, encryptedKeyB64);
            edit.apply();
            return new SecretKeySpec(key, "AES");
        }else{
            byte[] encryptedKey = Base64.decode(encryptedKeyB64, Base64.DEFAULT);
            byte[] key = rsaDecrypt(encryptedKey, KEY_ALIAS);
            return new SecretKeySpec(key, "AES");
        }
    }

    private KeyStore.PrivateKeyEntry getPrivateKeyEntry(String KEY_ALIAS) throws NoSuchProviderException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, CertificateException, KeyStoreException, IOException, UnrecoverableEntryException {
        KeyStore.PrivateKeyEntry privateKeyEntry = (KeyStore.PrivateKeyEntry) getKeyStore().getEntry(KEY_ALIAS, null);

        if(privateKeyEntry == null){
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, ANDROID_KEY_STORE);
            keyPairGenerator.initialize(new KeyPairGeneratorSpec.Builder(getContext())
                    .setAlias(KEY_ALIAS)
                    .build());
            keyPairGenerator.generateKeyPair();
        }

        return privateKeyEntry;
    }

    private byte[] rsaEncrypt(byte[] secret, String KEY_ALIAS) throws CertificateException, NoSuchAlgorithmException, KeyStoreException, IOException, UnrecoverableEntryException, NoSuchProviderException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException {
        KeyStore.PrivateKeyEntry privateKeyEntry = getPrivateKeyEntry(KEY_ALIAS);
        // Encrypt the text
        Cipher inputCipher = Cipher.getInstance(RSA_MODE, "AndroidOpenSSL");
        inputCipher.init(Cipher.ENCRYPT_MODE, privateKeyEntry.getCertificate().getPublicKey());

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        CipherOutputStream cipherOutputStream = new CipherOutputStream(outputStream, inputCipher);
        cipherOutputStream.write(secret);
        cipherOutputStream.close();

        byte[] vals = outputStream.toByteArray();
        return vals;
    }

    private  byte[]  rsaDecrypt(byte[] encrypted, String KEY_ALIAS) throws UnrecoverableEntryException, NoSuchAlgorithmException, KeyStoreException, NoSuchProviderException, NoSuchPaddingException, InvalidKeyException, IOException, CertificateException, InvalidAlgorithmParameterException {
        KeyStore.PrivateKeyEntry privateKeyEntry = getPrivateKeyEntry(KEY_ALIAS);
        Cipher output = Cipher.getInstance(RSA_MODE, "AndroidOpenSSL");
        output.init(Cipher.DECRYPT_MODE, privateKeyEntry.getPrivateKey());
        CipherInputStream cipherInputStream = new CipherInputStream(
                new ByteArrayInputStream(encrypted), output);
        ArrayList<Byte> values = new ArrayList<>();
        int nextByte;
        while ((nextByte = cipherInputStream.read()) != -1) {
            values.add((byte)nextByte);
        }

        byte[] bytes = new byte[values.size()];
        for(int i = 0; i < bytes.length; i++) {
            bytes[i] = values.get(i).byteValue();
        }
        return bytes;
    }

}
