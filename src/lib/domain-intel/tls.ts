/**
 * Real TLS certificate inspection: connects to the domain on port 443 and
 * reads back the negotiated protocol version and certificate validity from
 * the live handshake. `rejectUnauthorized: false` lets the connection
 * complete even for a broken/expired/self-signed cert so we can report the
 * *actual* validity ourselves (via `socket.authorized`) instead of the
 * connection just throwing on anything imperfect.
 */
import tls from "node:tls";

export interface TlsInfo {
  valid: boolean;
  protocol: string | null;
  validTo: string | null;
}

export function inspectTls(hostname: string, timeoutMs = 6000): Promise<TlsInfo | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: TlsInfo | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, timeout: timeoutMs, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const validTo = cert?.valid_to ? new Date(cert.valid_to).toISOString() : null;
        finish({ valid: socket.authorized === true, protocol: protocol || null, validTo });
        socket.end();
      },
    );

    socket.on("error", () => finish(null));
    socket.on("timeout", () => {
      socket.destroy();
      finish(null);
    });
  });
}
