// The indexer provider expects a named WebSocket export. Browsers provide it
// natively, whereas isomorphic-ws exposes only a default browser export.
export const WebSocket = globalThis.WebSocket;
export default WebSocket;
