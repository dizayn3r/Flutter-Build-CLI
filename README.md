# Flutter Build CLI

**Flutter Build CLI** is a Node.js command-line tool that simplifies the process of building a Flutter APK, renaming it based on your project's package name, package version, environment, and the current date/time.

## Features

- **Automated Build**: Select your desired build mode (debug, release, profile) and environment (dev, uat, prod).
- **Custom APK Naming**: Automatically rename the built APK using the package name, package version, environment, and timestamp.
- **Interactive CLI**: User-friendly, interactive prompts guide you through the build and upload process.

## Prerequisites

Before using this CLI, ensure you have the following installed:

- **Node.js** (v14.x or later)
- **Flutter SDK** (v2.x or later)

## Installation

1. Clone this repository to your local machine:
   ```bash
   git clone <repository_url>
   ```
2. Navigate to the project directory:
   ```bash
   cd flutter-build-cli
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Make the script executable:
   ```bash
   chmod +x index.js
   ```
5. Optionally, link the CLI tool globally:
   ```bash
   npm link
   ```

## Usage

To use the Flutter Build CLI:

1. Navigate to the root directory of your Flutter project:

   ```bash
   cd /path/to/your/flutter/project
   ```
2. Run the CLI tool:

   ```bash
   flutter-build-cli
   ```
3. Follow the interactive prompts:

   - Select the build mode (debug, release, profile).
   - Select the environment (dev, uat, staging, prod).
   - Choose whether to upload the APK to OneDrive.

### Example

Here’s a sample session using the CLI:

```bash
$ flutter-build-cli

Package name: Flutter App
Selected build mode: release
Selected environment: prod
Running command: flutter build apk --target lib/main.dart --release
Build output: ...

APK renamed to: Flutter App PROD 1.0.0+1 (20240814-153045).apk
```
