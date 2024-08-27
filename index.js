#!/usr/bin/env node

import { existsSync, renameSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import inquirer from "inquirer";
import { exec } from 'child_process';

const PUBSPEC_FILE = 'pubspec.yaml';
const APK_OUTPUT_DIR = join('build', 'app', 'outputs', 'flutter-apk');
const ONEDRIVE_REMOTE = 'ApploreOneDrive'; // Replace with your actual remote name

function findPubspec() {
    const filePath = join(process.cwd(), PUBSPEC_FILE);
    if (!existsSync(filePath)) {
        console.error(`Error: ${PUBSPEC_FILE} not found in the current directory.`);
        process.exit(1);
    }
    return filePath;
}

function getPackageName(pubspecPath) {
    const fileContents = readFileSync(pubspecPath, 'utf8');
    const pubspec = parse(fileContents);

    if (!pubspec?.name) {
        console.error('Error: package name not found in pubspec.yaml');
        process.exit(1);
    }

    return pubspec.name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getPackageVersion(pubspecPath) {
    const fileContents = readFileSync(pubspecPath, 'utf8');
    const pubspec = parse(fileContents);

    if (!pubspec?.version) {
        console.error('Error: package version not found in pubspec.yaml');
        process.exit(1);
    }

    return pubspec.version;
}

async function promptUser() {
    const { buildMode } = await inquirer.prompt({
        type: 'list',
        name: 'buildMode',
        message: 'Select a build mode:',
        choices: ['debug', 'release', 'profile'],
    });

    const { environment } = await inquirer.prompt({
        type: 'list',
        name: 'environment',
        message: 'Select an environment mode:',
        choices: ['dev', 'uat', 'prod'],
    });

    const { buildType } = await inquirer.prompt({
        type: 'list',
        name: 'buildType',
        message: 'Select a build type:',
        choices: ['appbundle', 'apk', 'aab'],
    });

    return { buildMode, environment, buildType };
}

function buildApk(packageName, version, environment, buildMode) {
    const command = `flutter build apk --target lib/main.dart --${buildMode}`;
    console.log(`Running command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(`Error building APK: ${error?.message || stderr}`);
            process.exit(1);
        }

        console.log(`Build output: ${stdout}`);
        const apkPath = renameApk(packageName, version, environment, buildMode);
        askToUpload(apkPath, packageName, version, environment);
    });
}

function getCurrentDateTime() {
    const now = new Date();
    const pad = num => String(num).padStart(2, '0');

    return `(${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())})`;
}

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

async function askToUpload(apkPath, packageName, version, environment) {
    const { confirmUpload } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmUpload',
        message: 'Do you want to upload the APK to OneDrive?',
        default: true,
    });

    if (confirmUpload) {
        uploadToOneDrive(apkPath, packageName, version, environment.toUpperCase());
    } else {
        console.log('APK upload skipped.');
    }
}

function uploadToOneDrive(apkPath, packageName, version, environment) {
    const uploadPath = `${packageName}/${environment}/${version}/`;
    const uploadCommand = `rclone copy "${apkPath}" ${ONEDRIVE_REMOTE}:"${uploadPath}" --progress`;
    const uploadProcess = exec(uploadCommand);

    uploadProcess.stdout.on('data', data => {
        const output = data.toString();
        const match = output.match(/(\d{1,3})%/);
        if (match) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Uploading APK to OneDrive...: ${match[1]}%`);
        }
    });

    uploadProcess.stderr.on('data', data => {
        process.stderr.write(data);
    });

    uploadProcess.on('close', code => {
        if (code === 0) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            console.log('\nAPK successfully uploaded');
        } else {
            console.error(`\nError uploading APK, exited with code ${code}`);
        }
    });
}



async function main() {
    const pubspecPath = findPubspec();
    const packageName = getPackageName(pubspecPath);
    const version = getPackageVersion(pubspecPath);
    console.log(`Package name: ${packageName}`);

    const { buildMode, environment } = await promptUser();

    buildApk(packageName, version, environment, buildMode);
}

main();
