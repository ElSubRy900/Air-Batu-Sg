
/**
 * SharedWorker.js - Simplified
 * 
 * Note: Since moving to Firebase Realtime Database, 
 * the SDK handles cross-tab synchronization automatically using its own internal socket sharing.
 * This worker is kept as a skeleton to prevent import errors in legacy code.
 */

self.onconnect = (e) => {
  const port = e.ports[0];
  port.postMessage({ type: 'STATUS', payload: 'Firebase is handling synchronization.' });
};
