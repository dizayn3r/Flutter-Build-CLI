import { exec } from 'child_process';

export default async function build(buildType, target, buildMode) {
    const command = `flutter build ${buildType} --target ${target} --${buildMode}`;
    console.log(`Running command: ${command}`);

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error building APK: ${error.message}`);
                reject(false);
            } else if (stderr) {
                console.error(`Error output: ${stderr}`);
                reject(false);
            } else {
                console.log(`Build output: ${stdout}`);
                resolve(true);
            }
        });
    });
}
