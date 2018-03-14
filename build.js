//
//
// const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
// const path = require('path')
//
// getInstallerConfig()
//   .then(createWindowsInstaller)
//   .catch((error) => {
//   console.error(error.message || error)
// process.exit(1)
// })
//
// function getInstallerConfig () {
//   console.log('creating windows installer')
//   const rootPath = path.join('./')
//   const outPath = path.join(rootPath)
//   console.log('creating windows installer', outPath);
//
//   return Promise.resolve({
//     appDirectory: path.join(outPath, 'sprinttool-win32-x64/'),
//     authors: 'JH',
//     noMsi: true,
//     outputDirectory: path.join(outPath, 'windows-installer'),
//     exe: 'sprinttool.exe',
//     setupExe: 'SprintToolSetup.exe',
//   })
// }
