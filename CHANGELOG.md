# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [5.0.0](https://github.com/aparajita/capacitor-biometric-auth/compare/v4.0.0...v5.0.0) (2023-06-15)


### ⚠ BREAKING CHANGES

* The plugin now requires Capacitor 5.

### Features

* upgrade to Capacitor 5 ([a410458](https://github.com/aparajita/capacitor-biometric-auth/commit/a410458c12055774e549df346774c02cfe796d7c))


### Docs

* mention .code ([b116d18](https://github.com/aparajita/capacitor-biometric-auth/commit/b116d1821b3a472bd95610995a7769bb865f28d0))


### Maintenance

* don’t log name + version at startup ([ec2eb08](https://github.com/aparajita/capacitor-biometric-auth/commit/ec2eb086ddad5f70550f5d0861fb27b8c4648e01))
* prettier format change ([7e3c1f1](https://github.com/aparajita/capacitor-biometric-auth/commit/7e3c1f1075352737c75ed9146f395cf0458389ca))
* remove unused stuff ([68ab6b1](https://github.com/aparajita/capacitor-biometric-auth/commit/68ab6b1e6df958dc2cb4f975c4552c981f55134d))
* update deps, upgrade to Capacitor 5 ([584c966](https://github.com/aparajita/capacitor-biometric-auth/commit/584c9667091e6a0c9f8e82e8fbff2297a067e90b))
* updates to dev environment ([ae163e4](https://github.com/aparajita/capacitor-biometric-auth/commit/ae163e4135aa2dcc9ff0db7f678238e5e14ba610))

## [4.0.0](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.1.4...v4.0.0) (2023-03-31)


### ⚠ BREAKING CHANGES

* BiometryErrorType has changed from a numeric enum to a string enum.

### Features

* convert enum to string, add .none as a key ([4f179a8](https://github.com/aparajita/capacitor-biometric-auth/commit/4f179a89ae82163895bd7dbcda0ff069a726182b))
* return error code from checkBiometry() ([5e3c012](https://github.com/aparajita/capacitor-biometric-auth/commit/5e3c012727bd17689d5282d1c74b71807a23cea6))


### Maintenance

* update deps ([69819ae](https://github.com/aparajita/capacitor-biometric-auth/commit/69819ae05f59e3b17d782cd83c4d35bf82736478))

### [3.1.4](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.1.3...v3.1.4) (2022-10-24)


### Bug Fixes

* remove unused style, fixes [#4](https://github.com/aparajita/capacitor-biometric-auth/issues/4) ([81f0951](https://github.com/aparajita/capacitor-biometric-auth/commit/81f0951f3f8166da8a67c1dc5fa605dcebabc5e4))


### Maintenance

* not sure how this got there ([d6808ed](https://github.com/aparajita/capacitor-biometric-auth/commit/d6808ed06c3637068fead99d220db210bc3db145))
* remove unused resources, fix typo ([492bb22](https://github.com/aparajita/capacitor-biometric-auth/commit/492bb22f12829531b069f1af6754e93cb1d04642))


### Docs

* clarify failed attempt limit ([9ea721e](https://github.com/aparajita/capacitor-biometric-auth/commit/9ea721ebc03599bf5ca197b7fddc9b62d0b4479e))

### [3.1.3](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.1.2...v3.1.3) (2022-08-12)


### Bug Fixes

* remove test code ([e98deff](https://github.com/aparajita/capacitor-biometric-auth/commit/e98defff93c6c57049f595b89876ed3226743c93))

### [3.1.2](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.1.1...v3.1.2) (2022-08-12)


### Maintenance

* more explicit naming ([df00cbb](https://github.com/aparajita/capacitor-biometric-auth/commit/df00cbbd79a968927f835872610903c5c0fa860b))
* remove all traces of ultra-runner ([af5a384](https://github.com/aparajita/capacitor-biometric-auth/commit/af5a384204823b77351b8db19a5bcf48f2e35734))


### Refactoring

* patch native methods in constructor ([3a1184f](https://github.com/aparajita/capacitor-biometric-auth/commit/3a1184f671059601162a0ede64aab659c1485269))

### [3.1.1](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.1.0...v3.1.1) (2022-08-10)


### Bug Fixes

* tslib is no longer necessary ([abb4cf0](https://github.com/aparajita/capacitor-biometric-auth/commit/abb4cf082f04d0643e061ebb0e2ccf50b7bcd230))

## [3.1.0](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.0.2...v3.1.0) (2022-08-10)


### Features

* don’t use native-decorator, lazy load ([4a03a0d](https://github.com/aparajita/capacitor-biometric-auth/commit/4a03a0d8fce40c316a60ee70e9d9e39aa2ae838c))


### Maintenance

* ditch ultra-runner, use pre/post scripts ([184ffe0](https://github.com/aparajita/capacitor-biometric-auth/commit/184ffe06996225c237b2e312b78424eb86e34981))

### [3.0.2](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.0.1...v3.0.2) (2022-08-06)


### Bug Fixes

* export original instance, not registered ([6c1298b](https://github.com/aparajita/capacitor-biometric-auth/commit/6c1298b605fd27746a3e6149f37190a97efa61b3))


### Maintenance

* add missing ignore ([729913a](https://github.com/aparajita/capacitor-biometric-auth/commit/729913ad8bfd220be62433705b4f554785ec4ccb))
* build system tweaks ([f5835c1](https://github.com/aparajita/capacitor-biometric-auth/commit/f5835c167122db05b8958e42e3e55abcff722b11))

### [3.0.1](https://github.com/aparajita/capacitor-biometric-auth/compare/v3.0.0...v3.0.1) (2022-08-04)


### Bug Fixes

* oops, wrong name ([77fb52e](https://github.com/aparajita/capacitor-biometric-auth/commit/77fb52e2f2d3320c73d8bcae9d8700f542d72488))


### Maintenance

* be brave, just do it ([4ab5082](https://github.com/aparajita/capacitor-biometric-auth/commit/4ab5082511736052b97f535cb99ce9034132cbd9))
* prettify after docgen ([f904eae](https://github.com/aparajita/capacitor-biometric-auth/commit/f904eaee7af31a2b38a5b2b0c6030736032607b1))
* update screen recordings ([63ad658](https://github.com/aparajita/capacitor-biometric-auth/commit/63ad658228d7ad9fafdb539eea8d9517c01b899a))

## [3.0.0](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.8...v3.0.0) (2022-08-04)


### ⚠ BREAKING CHANGES

* Capacitor 4 is now required.
* `androidMaxAttempts` is no longer supported, the plugin now relies on system limits.

### Features

* rely only on system limits ([b502005](https://github.com/aparajita/capacitor-biometric-auth/commit/b502005e14b50d9f28ba852917ec6736ebec5da4))


### Refactoring

* new build system ([c7677a1](https://github.com/aparajita/capacitor-biometric-auth/commit/c7677a197b82aa2ce02318d7014e2cc38f262dd2))
* rename ([35d819d](https://github.com/aparajita/capacitor-biometric-auth/commit/35d819d716d81a40f037353a4f66b605d6f22eb8))
* upgrade to Capacitor 4 ([684c987](https://github.com/aparajita/capacitor-biometric-auth/commit/684c9878d01489ffc961fa90bc00d6a4fcddc31d))

### [2.0.8](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.7...v2.0.8) (2022-07-25)


### Bug Fixes

* don’t import from package.json ([7744424](https://github.com/aparajita/capacitor-biometric-auth/commit/7744424fa09e1b259e7ece67b4e0724484e9e59a))


### Maintenance

* fix bundle identifier ([f347e8b](https://github.com/aparajita/capacitor-biometric-auth/commit/f347e8b19341a1497a482ebebcfe5566014654c0))
* fix command ([5673363](https://github.com/aparajita/capacitor-biometric-auth/commit/5673363082920ca9a39a0f28f8437f899b14a1e8))
* update deps ([0f9b0f3](https://github.com/aparajita/capacitor-biometric-auth/commit/0f9b0f34f01e5c5795f68004fab2802c91606bc3))


### Docs

* tweak ([2cf0dc2](https://github.com/aparajita/capacitor-biometric-auth/commit/2cf0dc236109b63ac0a33811d64753f90027211b))

### [2.0.7](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.6...v2.0.7) (2022-07-19)


### Maintenance

* let eslint handle this ([8a7e90e](https://github.com/aparajita/capacitor-biometric-auth/commit/8a7e90e756d5cea9738a948f339754a54be05552))
* reorganize build scripts ([b8ddacb](https://github.com/aparajita/capacitor-biometric-auth/commit/b8ddacba9c8d7f989686a441b8167086486e8f65))
* update release scripts ([e25bb4b](https://github.com/aparajita/capacitor-biometric-auth/commit/e25bb4b10344626d1f3506fc832989c93aa8313f))
* updates deps ([7805fe5](https://github.com/aparajita/capacitor-biometric-auth/commit/7805fe5c093b8cfe40525cafac918d49086a1956))

### [2.0.6](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.5...v2.0.6) (2022-07-14)


### Docs

* remove unnecessary jsdoc ([6be9e0a](https://github.com/aparajita/capacitor-biometric-auth/commit/6be9e0a773f0941313df7a540795efbfbbc66a92))
* update to describe change to androidMaxAttempts ([e9aab77](https://github.com/aparajita/capacitor-biometric-auth/commit/e9aab77e38fd3c70c468688c50204d7d01e58be6))
* update to describe change to androidMaxAttempts ([3be919e](https://github.com/aparajita/capacitor-biometric-auth/commit/3be919e13fc45bd6e4d3a8ac125abe26c268d063))


### Maintenance

* change java indent to 2 ([9b819e4](https://github.com/aparajita/capacitor-biometric-auth/commit/9b819e4bd9ca39828eb598a0e61ca0e31efd8385))
* might as well check code here ([4cad0c4](https://github.com/aparajita/capacitor-biometric-auth/commit/4cad0c417be1dbdb3d22e25566fbe3dac1f43efc))
* never hurts to cache eslint ([d0baa8b](https://github.com/aparajita/capacitor-biometric-auth/commit/d0baa8b89146b72b21bda01857e55d9f351d6165))
* remove unnecessary disable ([82eac79](https://github.com/aparajita/capacitor-biometric-auth/commit/82eac798f51c4cf386d0d32c40218fbd286348bf))
* script updates ([a63b7c7](https://github.com/aparajita/capacitor-biometric-auth/commit/a63b7c74c5909503034478878bfe8396f4173654))
* update deps ([12bdaab](https://github.com/aparajita/capacitor-biometric-auth/commit/12bdaab7e46df256bd799849ab28daacb138ba6b))
* update target version ([a5f8067](https://github.com/aparajita/capacitor-biometric-auth/commit/a5f806774feb11df9eb23bb67d7615f241986a51))

### [2.0.5](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.4...v2.0.5) (2022-07-05)


### Bug Fixes

* give up when maxAttempts is reached ([09ee75b](https://github.com/aparajita/capacitor-biometric-auth/commit/09ee75b807e90f0a52a22de08704cb2d80a241e6))

### [2.0.4](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.3...v2.0.4) (2022-07-04)


### Bug Fixes

* update to fixed native-decorator ([9c1c5f7](https://github.com/aparajita/capacitor-biometric-auth/commit/9c1c5f777e08df8230bf1eb0fadaf1b149fd8bc7))


### Docs

* add demo videos ([11ba830](https://github.com/aparajita/capacitor-biometric-auth/commit/11ba830b0aec86b1d81ee41003e59b761a2ffcc3))
* add demo videos ([1e8c63e](https://github.com/aparajita/capacitor-biometric-auth/commit/1e8c63edd6d150dae8281528fe2d7d7cd7b574d5))


### Maintenance

* add missing extension ([7b83029](https://github.com/aparajita/capacitor-biometric-auth/commit/7b830298e46c4350a360f5ab9a07b06ca5352459))
* don't need .gitattributes ([c076dc8](https://github.com/aparajita/capacitor-biometric-auth/commit/c076dc89cded17ce0544777f66f87d07776f49a0))
* update deps ([9ecffac](https://github.com/aparajita/capacitor-biometric-auth/commit/9ecffac20eb8b101daa3668c59a885048622a8b3))
* update deps ([608028d](https://github.com/aparajita/capacitor-biometric-auth/commit/608028d636cdbab16e61a512f004511469d97b25))
* videos are stored on github ([e688790](https://github.com/aparajita/capacitor-biometric-auth/commit/e688790224003604c2c8515714b9e74c4531ee7e))

### [2.0.3](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.2...v2.0.3) (2022-07-02)


### Maintenance

* update deps ([045987a](https://github.com/aparajita/capacitor-biometric-auth/commit/045987a9600fcd29b02a1ac37ef342135e4e5d9c))


### Docs

* add npm version badge ([1a34357](https://github.com/aparajita/capacitor-biometric-auth/commit/1a34357888568b89d69c38dc965cbb9857992673))

### [2.0.2](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.1...v2.0.2) (2022-07-02)


### Bug Fixes

* can’t get version statically ([e7068cf](https://github.com/aparajita/capacitor-biometric-auth/commit/e7068cf84c6f9c1b8bc6ccad55c3fc2109e5f7a7))


### Maintenance

* rework release scripts ([ab4442d](https://github.com/aparajita/capacitor-biometric-auth/commit/ab4442dcf8d7a3d401f4ea64e30a8bfb934a12c9))
* update deps ([c0a9921](https://github.com/aparajita/capacitor-biometric-auth/commit/c0a99213aa8902c3f2fd38e136d52b38ad9a4df0))

### [2.0.1](https://github.com/aparajita/capacitor-biometric-auth/compare/v2.0.0...v2.0.1) (2022-07-02)


### Features

* log plugin name & version ([db2e3f1](https://github.com/aparajita/capacitor-biometric-auth/commit/db2e3f18ce15ccca5c8067e03328a431af934164))


### Maintenance

* lint ([3452ef7](https://github.com/aparajita/capacitor-biometric-auth/commit/3452ef702d0608ab7e4793348af1c5a978b6a1b0))
* rework scripts for conditional source maps ([d9cab0a](https://github.com/aparajita/capacitor-biometric-auth/commit/d9cab0aef7f2afe11a62fd3d842a5ea508db144a))
* update deps ([d6d8728](https://github.com/aparajita/capacitor-biometric-auth/commit/d6d8728f6fdbdb36e2f8a22db61c8273cc337b68))

## [2.0.0](https://github.com/aparajita/capacitor-biometric-auth/compare/v1.0.7...v2.0.0) (2022-07-01)


### ⚠ BREAKING CHANGES

* upgrade to Capacitor 3, callback support

### Features

* upgrade to Capacitor 3, callback support ([4177317](https://github.com/aparajita/capacitor-biometric-auth/commit/417731737d6a38e031b1ddff88a81d4cb71a994b))


### Maintenance

* add missing ignores ([81da849](https://github.com/aparajita/capacitor-biometric-auth/commit/81da8490ab6caf17ad345fb1243a8568b9f42c15))
* format with 2 space indent (google std) ([ca1fba3](https://github.com/aparajita/capacitor-biometric-auth/commit/ca1fba3a0903911527a54c4c7e8c390629d3717f))
* parserOptions not necessary with latest eslint ([aeae681](https://github.com/aparajita/capacitor-biometric-auth/commit/aeae6816efc254d39b1fbd6f63fe0fbe3351f3b3))
* renamed class ([0c5c3b2](https://github.com/aparajita/capacitor-biometric-auth/commit/0c5c3b23f4e3e3dbe82a7fdf94de27d3ce05f980))
* update config files ([f75f0d3](https://github.com/aparajita/capacitor-biometric-auth/commit/f75f0d36fcc2b914e60b799bf1ba2a2f1b12ead8))
* upgrade dev environment ([f675f29](https://github.com/aparajita/capacitor-biometric-auth/commit/f675f29d2f957ae79c9115a4cc250b82aa055b12))

### [1.0.7](https://github.com/aparajita/capacitor-biometric-auth/compare/v1.0.6...v1.0.7) (2021-04-02)


### Maintenance

* eliminate unnecessary stuff in the package ([3aaa594](https://github.com/aparajita/capacitor-biometric-auth/commit/3aaa594541ec6ece3d2c1b3e184014c0741b0070))

### [1.0.6](https://github.com/aparajita/capacitor-biometric-auth/compare/v1.0.5...v1.0.6) (2021-04-01)


### Maintenance

* fix license ([9852042](https://github.com/aparajita/capacitor-biometric-auth/commit/9852042678248de14adeab9ad4da7ef9ffa1310c))

### [1.0.5](https://github.com/aparajita/capacitor-biometric-auth/compare/v1.0.4...v1.0.5) (2021-04-01)


### Maintenance

* fix link ([4609b1d](https://github.com/aparajita/capacitor-biometric-auth/commit/4609b1d977b2507f833d0da0fb8b35615408357c))
* fix urls ([19954c0](https://github.com/aparajita/capacitor-biometric-auth/commit/19954c05373792bf86cbdbbb00a3f15252bde274))

### [1.0.4](https://github.com/aparajita/capacitor-biometric-auth/compare/v1.0.3...v1.0.4) (2021-03-31)


### Maintenance

* add license ([938b24f](https://github.com/aparajita/capacitor-biometric-auth/commit/938b24f9e3e551101297acc8be96c5ab00f710e1))
* add push script ([6069525](https://github.com/aparajita/capacitor-biometric-auth/commit/6069525d84e319e54d0d62bc2b73c216aa7ac245))

### [1.0.3](https://github.com/aparajita/capacitor-biometric-auth/compare/v1.0.2...v1.0.3) (2021-03-31)


### Maintenance

* fix urls ([eed2a14](https://github.com/aparajita/capacitor-biometric-auth/commit/eed2a147b76cc7718d27a3c2464584cd4c95db63))

### [1.0.2](https://github.com/willsub/ws-capacitor-biometric-auth/compare/v1.0.1...v1.0.2) (2021-03-31)


### Bug Fixes

* change target to transform optional chaining ([f278127](https://github.com/willsub/ws-capacitor-biometric-auth/commit/f278127247bbb7881fe93dee889193b6fd641966))
* deps in the wrong place ([0746a21](https://github.com/willsub/ws-capacitor-biometric-auth/commit/0746a21c1a5a8a89d5e84544de13295719797171))

### [1.0.1](https://github.com/willsub/ws-capacitor-biometric-auth/compare/v1.0.0...v1.0.1) (2021-03-29)


### Features

* add docs ([dd96a67](https://github.com/willsub/ws-capacitor-biometric-auth/commit/dd96a673edeb8d9362bdde908698e45428426919))


### Bug Fixes

* options might be undefined ([8e66f7e](https://github.com/willsub/ws-capacitor-biometric-auth/commit/8e66f7ea6b77916194106f8687156585504da250))


### Maintenance

* always use strict mode ([b8fa32a](https://github.com/willsub/ws-capacitor-biometric-auth/commit/b8fa32ac3fba8f20506e0c645acbc17a1cbb1ac8))
* clean up loose ends ([876561c](https://github.com/willsub/ws-capacitor-biometric-auth/commit/876561c1ac8f4b51d47307f67c5d9ecf235ac71a))
* lint ([1780d90](https://github.com/willsub/ws-capacitor-biometric-auth/commit/1780d9017e803a3eed5855f5e51813a6d11ec81c))
* rename package ([b2cf9dd](https://github.com/willsub/ws-capacitor-biometric-auth/commit/b2cf9dd21c1fa838103353a5ee780ee5ac135621))
* update deps ([9edbd18](https://github.com/willsub/ws-capacitor-biometric-auth/commit/9edbd18202c3e553a94561a5d05c1528cacc1464))
* update scripts ([2f1f5be](https://github.com/willsub/ws-capacitor-biometric-auth/commit/2f1f5bee235b5b4767622c3570cdd6a5de20f637))
* **deps:** updated ([c753fa3](https://github.com/willsub/ws-capacitor-biometric-auth/commit/c753fa32dbcbeb3bc601b261c675e071d7733c01))
