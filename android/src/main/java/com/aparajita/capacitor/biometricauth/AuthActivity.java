package com.aparajita.capacitor.biometricauth;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import java.util.concurrent.Executor;

public class AuthActivity extends AppCompatActivity {

  static boolean allowDeviceCredential;

  @SuppressLint("WrongConstant")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_auth_activity);

    Executor executor;

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      executor = this.getMainExecutor();
    } else {
      executor = (command) -> new Handler(this.getMainLooper()).post(command);
    }

    BiometricPrompt.PromptInfo.Builder builder =
      new BiometricPrompt.PromptInfo.Builder();

    Intent intent = getIntent();
    String title = intent.getStringExtra(BiometricAuthNative.TITLE);
    String subtitle = intent.getStringExtra(BiometricAuthNative.SUBTITLE);
    String description = intent.getStringExtra(BiometricAuthNative.REASON);

    int authenticators = intent.getIntExtra(
      BiometricAuthNative.BIOMETRIC_STRENGTH,
      BiometricManager.Authenticators.BIOMETRIC_WEAK
    );

    allowDeviceCredential = intent.getBooleanExtra(
      BiometricAuthNative.DEVICE_CREDENTIAL,
      false
    );

    // Android docs say that BIOMETRIC_STRONG | DEVICE_CREDENTIAL cannot be used on API 28-29.
    // If that is the case, fall back to BIOMETRIC_WEAK.
    if (
      authenticators == BiometricManager.Authenticators.BIOMETRIC_STRONG &&
      allowDeviceCredential &&
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
      Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q
    ) {
      authenticators = BiometricManager.Authenticators.BIOMETRIC_WEAK;
    }

    if (allowDeviceCredential) {
      authenticators |= BiometricManager.Authenticators.DEVICE_CREDENTIAL;
    }

    builder.setAllowedAuthenticators(authenticators);

    // The title must be non-null and non-empty
    if (title == null || title.isEmpty()) {
      title = "Authenticate";
    }

    builder.setTitle(title).setSubtitle(subtitle).setDescription(description);

    // Android docs say that negative button text should not be set if device credential is allowed.
    if (!allowDeviceCredential) {
      String negativeButtonText = intent.getStringExtra(
        BiometricAuthNative.CANCEL_TITLE
      );
      builder.setNegativeButtonText(
        negativeButtonText == null || negativeButtonText.isEmpty()
          ? "Cancel"
          : negativeButtonText
      );
    }

    builder.setConfirmationRequired(
      intent.getBooleanExtra(BiometricAuthNative.CONFIRMATION_REQUIRED, true)
    );

    BiometricPrompt.PromptInfo promptInfo = builder.build();
    BiometricPrompt prompt = new BiometricPrompt(
      this,
      executor,
      new BiometricPrompt.AuthenticationCallback() {
        @Override
        public void onAuthenticationError(
          int errorCode,
          @NonNull CharSequence errorMessage
        ) {
          super.onAuthenticationError(errorCode, errorMessage);
          finishActivity(
            BiometryResultType.ERROR,
            errorCode,
            (String) errorMessage
          );
        }

        @Override
        public void onAuthenticationSucceeded(
          @NonNull BiometricPrompt.AuthenticationResult result
        ) {
          super.onAuthenticationSucceeded(result);
          finishActivity();
        }
      }
    );

    prompt.authenticate(promptInfo);
  }

  void finishActivity() {
    finishActivity(BiometryResultType.SUCCESS, 0, "");
  }

  void finishActivity(
    BiometryResultType resultType,
    int errorCode,
    String errorMessage
  ) {
    Intent intent = new Intent();
    String prefix = BiometricAuthNative.RESULT_EXTRA_PREFIX;

    intent
      .putExtra(prefix + BiometricAuthNative.RESULT_TYPE, resultType.toString())
      .putExtra(prefix + BiometricAuthNative.RESULT_ERROR_CODE, errorCode)
      .putExtra(
        prefix + BiometricAuthNative.RESULT_ERROR_MESSAGE,
        errorMessage
      );

    setResult(RESULT_OK, intent);
    finish();
  }
}
