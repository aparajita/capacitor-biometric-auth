package com.aparajita.capacitor.biometricauth;

import com.getcapacitor.PluginCall;
import java.util.HashMap;

public class CredentialsException extends Throwable {

    private static final HashMap<ErrorKind, String> credentialErrorMap;

    static {
        credentialErrorMap = new HashMap<>();
        credentialErrorMap.put(ErrorKind.notFound, "Credentials for the domain '%s' not found");
        credentialErrorMap.put(ErrorKind.missingParameter, "No %s parameter was given");
        credentialErrorMap.put(ErrorKind.invalidData, "The data in the store is an invalid format");
        credentialErrorMap.put(ErrorKind.osError, "An OS error occurred: %s");
        credentialErrorMap.put(ErrorKind.unknownError, "An unknown error occurred: %s");
    }

    private String message;
    private String code = "";

    CredentialsException(ErrorKind kind) {
        init(kind, "", null);
    }

    CredentialsException(ErrorKind kind, String param) {
        init(kind, param, null);
    }

    CredentialsException(ErrorKind kind, Throwable osExcepton) {
        init(kind, null, osExcepton);
    }

    CredentialsException(ErrorKind kind, String param, Throwable osException) {
        init(kind, param, osException);
    }

    public static void reject(PluginCall call, ErrorKind kind, String param, Throwable osException) {
        CredentialsException ex = new CredentialsException(kind, param, osException);
        call.reject(ex.message, ex.code);
    }

    void init(ErrorKind kind, String param, Throwable osException) {
        String message = credentialErrorMap.get(kind);

        if (message != null) {
            switch (kind) {
                case osError:
                case unknownError:
                    this.message = String.format(message, osException.getClass().getSimpleName());
                    break;
                case notFound:
                case missingParameter:
                    this.message = String.format(message, param);
                    break;
                default:
                    this.message = message;
            }

            this.code = kind.toString();
        }
    }

    public String getMessage() {
        return this.message;
    }

    public String getCode() {
        return this.code;
    }

    public void rejectCall(PluginCall call) {
        call.reject(this.message, this.code);
    }

    public enum ErrorKind {
        notFound,
        missingParameter,
        invalidData,
        osError,
        unknownError
    }
}
