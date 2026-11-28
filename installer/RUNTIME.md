# Bundled runtime

The Windows x64 package includes Node.js v22.23.5 and its LICENSE.

Official archive: https://nodejs.org/dist/v22.23.5/node-v22.23.5-win-x64.zip

Archive SHA256: 4a191082e9706866830379d577d2cc8a50c776fcd9436a8d061b063ed0d9a0e3

node.exe SHA256: 247e9693d316da9857e44990e5e11709f596f18112251b8026ec6eed80bdf38a

Verified against official SHASUMS256.txt and valid OpenJS Foundation Authenticode signature. Extract in a temporary directory, then run Build.ps1 -RuntimeDirectory <extracted-node-directory>. Delete temporary build and test directories after validation. The installer verifies the bundled executable before copying it and performs no runtime downloads.
