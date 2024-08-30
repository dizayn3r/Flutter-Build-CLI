import fs from 'fs';
import yaml from 'yaml';

export function getPackageName(pubspecPath) {
	try {
		const file = fs.readFileSync(pubspecPath, 'utf8');
		const pubspec = yaml.parse(file);
		return pubspec.name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Unknown';
	} catch (error) {
		console.error('Failed to get package name:', error.message);
		return 'Unknown';
	}
}

export function getPackageVersion(pubspecPath) {
	try {
		const file = fs.readFileSync(pubspecPath, 'utf8');
		const pubspec = yaml.parse(file);
		return pubspec.version || 'Unknown';
	} catch (error) {
		console.error('Failed to get package version:', error.message);
		return 'Unknown';
	}
}
