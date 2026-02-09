// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.2"),
        .package(name: "AparajitaCapacitorBiometricAuth", path: "../../../.."),
        .package(name: "CapacitorApp", path: "../../../../node_modules/.pnpm/@capacitor+app@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/app"),
        .package(name: "CapacitorHaptics", path: "../../../../node_modules/.pnpm/@capacitor+haptics@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/haptics"),
        .package(name: "CapacitorKeyboard", path: "../../../../node_modules/.pnpm/@capacitor+keyboard@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/keyboard"),
        .package(name: "CapacitorSplashScreen", path: "../../../../node_modules/.pnpm/@capacitor+splash-screen@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/splash-screen")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "AparajitaCapacitorBiometricAuth", package: "AparajitaCapacitorBiometricAuth"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen")
            ]
        )
    ]
)
