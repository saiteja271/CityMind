/**
 * workerBridge.js
 * Bridge utility to communicate with the simulation Web Worker from the main thread.
 * Wraps the Worker postMessage/onmessage API into a clean Promise-based interface.
 */

let _worker = null;
let _pendingRequests = new Map(); // requestId -> { resolve, reject }
let _requestCounter = 0;

/**
 * Initialize the simulation worker. Safe to call multiple times (idempotent).
 * @returns {boolean} True if worker initialized successfully
 */
export function initWorker() {
  if (_worker) return true;
  try {
    _worker = new Worker(new URL('./simulationWorker.js', import.meta.url), { type: 'module' });
    _worker.onmessage = _handleMessage;
    _worker.onerror = (err) => {
      console.error('[workerBridge] Worker error:', err.message);
    };
    return true;
  } catch (err) {
    console.warn('[workerBridge] Failed to init worker (will run on main thread):', err.message);
    _worker = null;
    return false;
  }
}

/**
 * Send a task to the simulation worker and await the result.
 * Falls back gracefully if worker is unavailable.
 *
 * @param {string} type - Message type (matches worker switch cases)
 * @param {object} payload - Task payload
 * @param {number} [timeoutMs=10000] - Max wait before rejection
 * @returns {Promise<any>} Resolved with worker result
 */
export function sendToWorker(type, payload, timeoutMs = 10_000) {
  if (!_worker) {
    return Promise.reject(new Error('Worker not initialized'));
  }

  const requestId = `req_${++_requestCounter}`;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      _pendingRequests.delete(requestId);
      reject(new Error(`[workerBridge] Timeout waiting for "${type}" (${timeoutMs}ms)`));
    }, timeoutMs);

    _pendingRequests.set(requestId, { resolve, reject, timer });
    _worker.postMessage({ type, payload, requestId });
  });
}

/**
 * Terminate the worker and clean up all pending requests.
 */
export function destroyWorker() {
  if (_worker) {
    _worker.terminate();
    _worker = null;
  }
  for (const { reject, timer } of _pendingRequests.values()) {
    clearTimeout(timer);
    reject(new Error('Worker destroyed'));
  }
  _pendingRequests.clear();
}

/** @returns {boolean} Whether the worker is currently active */
export function isWorkerReady() {
  return _worker !== null;
}

// ─── Internal message handler ─────────────────────────────────────────────────

function _handleMessage(event) {
  const { type, requestId, result, error } = event.data ?? {};

  const pending = _pendingRequests.get(requestId);
  if (!pending) return;

  clearTimeout(pending.timer);
  _pendingRequests.delete(requestId);

  if (type === 'error') {
    pending.reject(new Error(error ?? 'Worker error'));
  } else {
    pending.resolve(result);
  }
}
