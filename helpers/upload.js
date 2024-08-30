import fs from 'fs';
import path from 'path';

/**
 * Moves the build file to the specified destination folder.
 * @param {string} buildPath - The current path of the build file.
 * @param {string} destinationPath - The destination folder where the build should be moved.
 * @returns {Promise<boolean>} - Resolves to `true` if the move is successful, otherwise `false`.
 */
export default function uploadBuild(buildPath, destinationPath) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(buildPath);
        const destinationFilePath = path.join(destinationPath, fileName);

        fs.mkdir(destinationPath, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error creating directory: ${err.message}`);
                resolve(false);
                return;
            }

            fs.rename(buildPath, destinationFilePath, (err) => {
                if (err) {
                    console.error(`Error moving file: ${err.message}`);
                    resolve(false);
                    return;
                }

                console.log(`Build moved to: ${destinationFilePath}`);
                resolve(true);
            });
        });
    });
}
