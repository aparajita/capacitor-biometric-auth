#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(WSBiometricAuth, "WSBiometricAuth",
  CAP_PLUGIN_METHOD(checkBiometry, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(authenticate, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getCredentials, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(setCredentials, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(deleteCredentials, CAPPluginReturnPromise);
)
