#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WSBiometricAuth, "WSBiometricAuth",
  CAP_PLUGIN_METHOD(checkBiometry, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(authenticate, CAPPluginReturnPromise);
)
