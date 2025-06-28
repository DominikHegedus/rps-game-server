export function logger(message: string) {
  console.log(`[${new Date().toUTCString()}] ${message}`);
}
