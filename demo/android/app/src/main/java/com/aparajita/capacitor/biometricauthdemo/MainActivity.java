package com.aparajita.capacitor.biometricauthdemo;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Disable edge-to-edge mode to prevent content from going under status bar
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
  }
}
