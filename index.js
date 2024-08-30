#!/usr/bin/env node

import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import { join } from 'path';
import color from 'picocolors';
import { getPackageName, getPackageVersion } from './helpers/packageUtils.js';
import build from './helpers/build.js';
import rename from './helpers/rename.js';
import upload from './helpers/upload.js';

async function main() {
	console.clear();

	await setTimeout(500);

	p.intro(`${color.bgCyan(color.black('Flutter Build CLI'))}`);

	const project = await p.group(
		{
            projectPath: () =>
                p.text({
                    message: 'Enter the location of the Flutter project:',
                    initialValue: './',
                    defaultValue: './',
                    validate: (value) => {
                        if (!value) return 'Please enter a project path.';
                    },
                }),
			buildMode: () =>
				p.select({
					message: 'Pick a build mode (default: debug)',
					initialValue: 'debug',
					maxItems: 3,
					options: [
						{ value: 'debug', label: 'Debug' },
						{ value: 'profile', label: 'Profile' },
						{ value: 'release', label: 'Release' },
					],
				}),
			environment: () =>
				p.select({
					message: 'Pick an environment (default: dev)',
					initialValue: 'dev',
					maxItems: 3,
					options: [
						{ value: 'dev', label: 'Development' },
						{ value: 'staging', label: 'Staging' },
						{ value: 'prod', label: 'Production' },
					],
				}),
			target: () =>
				p.text({
					message: 'Enter the path of the target file for the build?',
					initialValue: 'lib/main.dart',
					defaultValue: 'lib/main.dart',
					validate: (value) => {
						if (!value) return 'Please enter a path.';
						if (!value.includes('.dart')) return 'Please include the file name in the path.';
					},
				}),
			buildType: () =>
				p.select({
					message: 'Pick a build type (default: apk)',
					initialValue: 'apk',
					maxItems: 3,
					options: [
						{ value: 'apk', label: 'APK' },
						{ value: 'appbundle', label: 'App Bundle' },
					],
				}),
			upload: () =>
				p.confirm({
					message: 'Upload to OneDrive?',
					initialValue: false,
				}),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			},
		}
	);

    const pubspecPath = join(project.projectPath, 'pubspec.yaml');
    const packageName = getPackageName(pubspecPath);
    const packageVersion = getPackageVersion(pubspecPath);

	p.note(
		`Package Name: ${packageName}\nVersion: ${packageVersion}\nBuild Mode: ${project.buildMode}\nEnvironment: ${project.environment}\nBuild Type: ${project.buildType}\nTarget: ${project.target}\nUpload to OneDrive: ${project.upload ? 'Yes' : 'No'}`,
		'Build Information'
	);

	const s = p.spinner();
	s.start('Building...');

	const status = await build(project.buildType, project.target, project.buildMode);

	s.stop(status ? 'Build complete' : 'Build failed');

	if (status) {
		p.outro(`${color.bgGreen(color.black('Build successful'))}`);
		const buildPath = rename(project.buildType, packageName, packageVersion, project.environment, project.buildMode);
		p.note(`Build path: ${buildPath}`, 'Build Path');

		if (project.upload) {
			const destinationPath = await p.text({
				message: 'Enter the destination path to move the build:',
				validate: (value) => {
					if (!value) return 'Please enter a destination path.';
				},
			});

			const fullDestinationPath = join(destinationPath, packageName, project.environment, packageVersion);
			const uploadStatus = await upload(buildPath, fullDestinationPath);

			if (uploadStatus) {
				p.outro(`${color.bgGreen(color.black('Build successfully moved to destination'))}`);
			} else {
				p.outro(`${color.bgRed(color.black('Failed to move build to destination'))}`);
			}
		}
	} else {
		p.outro(`${color.bgRed(color.black('Build failed'))}`);
	}
}

main().catch(console.error);