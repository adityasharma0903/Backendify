export function logInfo(message) {
  console.log(`[Backendify] ${message}`);
}

export function logWarn(message) {
  console.warn(`[Backendify][warn] ${message}`);
}

export function logError(message) {
  console.error(`[Backendify][error] ${message}`);
}

export default {
  logInfo,
  logWarn,
  logError
};
