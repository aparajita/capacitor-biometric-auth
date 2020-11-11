package com.aparajita.capacitor.biometricauth;

import android.annotation.SuppressLint;
import android.app.KeyguardManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricPrompt;
import java.util.concurrent.Executor;

public class AuthActivity extends AppCompatActivity {

    static int attemptCount;
    static boolean allowDeviceCredential;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth_activity);

        Executor executor;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            executor = this.getMainExecutor();
        } else {
            executor = command -> new Handler().post(command);
        }

        BiometricPrompt.PromptInfo.Builder builder = new BiometricPrompt.PromptInfo.Builder();
        Intent intent = getIntent();
        String title = intent.getStringExtra(WSBiometricAuth.TITLE);
        String subtitle = intent.getStringExtra(WSBiometricAuth.SUBTITLE);
        String description = intent.getStringExtra(WSBiometricAuth.REASON);
        final int maxAttempts = intent.getIntExtra(WSBiometricAuth.MAX_ATTEMPTS, WSBiometricAuth.DEFAULT_MAX_ATTEMPTS);
        allowDeviceCredential = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Android docs say we should check if the device is secure before enabling device credential fallback
            KeyguardManager manager = (KeyguardManager) getSystemService(KEYGUARD_SERVICE);

            if (manager.isDeviceSecure()) {
                allowDeviceCredential = intent.getBooleanExtra(WSBiometricAuth.DEVICE_CREDENTIAL, false);
            }
        }

        // The title must be non-null and non-empty
        if (title == null || title.isEmpty()) {
            title = "Authenticate";
        }

        builder.setTitle(title);
        builder.setSubtitle(subtitle);
        builder.setDescription(description);
        builder.setDeviceCredentialAllowed(allowDeviceCredential);

        // Android docs say that negative button text should not be set if device credential is allowed
        if (!allowDeviceCredential) {
            String negativeButtonText = intent.getStringExtra(WSBiometricAuth.CANCEL_TITLE);
            builder.setNegativeButtonText(negativeButtonText == null || negativeButtonText.isEmpty() ? "Cancel" : negativeButtonText);
        }

        BiometricPrompt.PromptInfo promptInfo = builder.build();
        attemptCount = 0;

        BiometricPrompt biometricPrompt = new BiometricPrompt(
            this,
            executor,
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errorMessage) {
                    super.onAuthenticationError(errorCode, errorMessage);
                    finishActivity(BiometryResultType.ERROR, errorCode, (String) errorMessage);
                }

                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                    super.onAuthenticationSucceeded(result);
                    finishActivity(BiometryResultType.SUCCESS);
                }

                @SuppressLint("DefaultLocale")
                @Override
                public void onAuthenticationFailed() {
                    super.onAuthenticationFailed();
                    attemptCount += 1;

                    // When allowDeviceCredential is true, I can't seem to force the prompt
                    // to go away, so skip attempt counting.
                    if (!allowDeviceCredential && attemptCount > maxAttempts) {
                        finishActivity(
                            BiometryResultType.FAILURE,
                            0,
                            String.format("The user exceeded the maximum of %d attempt(s)", maxAttempts)
                        );
                    }
                }
            }
        );

        biometricPrompt.authenticate(promptInfo);
    }

    void finishActivity(BiometryResultType resultType) {
        finishActivity(resultType, 0, "");
    }

    void finishActivity(BiometryResultType resultType, int errorCode, String errorMessage) {
        Intent intent = new Intent();
        String prefix = WSBiometricAuth.RESULT_EXTRA_PREFIX;

        intent
            .putExtra(prefix + WSBiometricAuth.RESULT_TYPE, resultType.toString())
            .putExtra(prefix + WSBiometricAuth.RESULT_ERROR_CODE, errorCode)
            .putExtra(prefix + WSBiometricAuth.RESULT_ERROR_MESSAGE, errorMessage);

        setResult(RESULT_OK, intent);
        finish();
    }
}
