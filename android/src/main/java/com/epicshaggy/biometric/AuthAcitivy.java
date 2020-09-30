package com.epicshaggy.biometric;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.biometric.BiometricPrompt;

import android.os.Handler;
import android.util.Log;
import android.view.View;

import com.epicshaggy.biometric.capacitornativebiometric.R;

import java.util.concurrent.Executor;

public class AuthAcitivy extends AppCompatActivity {

    private Executor executor;
    private BiometricPrompt.PromptInfo promptInfo;
    private BiometricPrompt biometricPrompt;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth_acitivy);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.P){
            executor = this.getMainExecutor();
        }else{
            executor = new Executor() {
                @Override
                public void execute(Runnable command) {
                    new Handler().post(command);
                }
            };
        }

        promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(getIntent().hasExtra("title") ? getIntent().getStringExtra("title") : "Authenticate")
                .setSubtitle(getIntent().hasExtra("subtitle") ? getIntent().getStringExtra("subtitle") : null)
                .setDescription(getIntent().hasExtra("description") ? getIntent().getStringExtra("description") : null)
                .setNegativeButtonText("Cancel")
                .build();

        biometricPrompt = new BiometricPrompt(this, executor, new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                finishActivity("error");
            }

            @Override
            public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                finishActivity("success");
            }

            @Override
            public void onAuthenticationFailed() {
                super.onAuthenticationFailed();
                finishActivity("failed");
            }
        });

        biometricPrompt.authenticate(promptInfo);

    }

    void finishActivity(String result) {
        Intent intent = new Intent();
        intent.putExtra("result", result);
        setResult(RESULT_OK, intent);
        finish();
    }

}
