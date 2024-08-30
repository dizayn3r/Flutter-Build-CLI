export default function getCurrentDateTime() {
    const now = new Date();
    const pad = num => String(num).padStart(2, '0');

    return `(${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())})`;
}