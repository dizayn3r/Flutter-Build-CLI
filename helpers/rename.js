import { existsSync, renameSync } from 'fs';
import { join } from 'path';
import getCurrentDateTime from './getCurrentDateTime.js';

const APK_OUTPUT_DIR = join('build', 'app', 'outputs', 'flutter-apk');
const APP_BUNDLE_OUTPUT_DIR = join('build', 'app', 'outputs', 'bundle', 'release');

function renameApk(packageName, version, environment, buildMode) {
    const apkName = buildMode === 'release' ? 'app-release.apk' : `app-${buildMode}.apk`;
    const oldApkPath = join(APK_OUTPUT_DIR, apkName);
    const dateTime = getCurrentDateTime();
    const newApkName = `${packageName} ${environment.toUpperCase()} ${version} ${dateTime}.apk`;
    const newApkPath = join(APK_OUTPUT_DIR, newApkName);

    if (!existsSync(oldApkPath)) {
        console.error(`Error: APK file not found at ${oldApkPath}`);
        process.exit(1);
    }

    renameSync(oldApkPath, newApkPath);
    console.log(`APK renamed to: ${newApkName}`);
    return newApkPath;
}

function renameAppBundle(packageName, version, environment, buildMode) {
    const appBundleName = buildMode === 'release' ? 'app-release.aab' : `app-${buildMode}.aab`;
    const oldAppBundlePath = join(APP_BUNDLE_OUTPUT_DIR, appBundleName);
    const dateTime = getCurrentDateTime();
    const newAppBundleName = `${packageName} ${environment.toUpperCase()} ${version} ${dateTime}.aab`;
    const newAppBundlePath = join(APP_BUNDLE_OUTPUT_DIR, newAppBundleName);
    if (!existsSync(oldAppBundlePath)) {
        console.error(`Error: App Bundle file not found at ${oldAppBundlePath}`);
        process.exit(1);
    }
    renameSync(oldAppBundlePath, newAppBundlePath);
    console.log(`App Bundle renamed to: ${newAppBundleName}`);
    return newAppBundlePath;
}

export default function rename(buildType, packageName, version, environment, buildMode) {
    if (buildType === 'apk') {
        return renameApk(packageName, version, environment, buildMode);
    } else if (buildType === 'appbundle') {
        return renameAppBundle(packageName, version, environment, buildMode);
    } else {
        console.error(`Error: Invalid build type: ${buildType}`);
        process.exit(1);
    }
};