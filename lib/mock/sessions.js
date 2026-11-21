// Datos de ejemplo de sesiones activas y revocadas para la vista 12 (/security, nodo 31:1187).
// Todo vive en memoria y se reinicia al recargar la página.

export const sessions = [
  {
    id: 's-1',
    device: 'Chrome · Windows (este dispositivo)',
    detail: '187.190.42.10 · Tuxtla Gutiérrez · activa ahora · jti 7c1e…a4',
    jti: '7c1e…a4',
    ip: '187.190.42.10',
    status: 'ACTIVE',
    current: true,
  },
  {
    id: 's-2',
    device: 'Safari · iPhone',
    detail: '187.190.40.2 · Tuxtla Gutiérrez · activa hace 3 h · jti 2d9a…77',
    jti: '2d9a…77',
    ip: '187.190.40.2',
    status: 'ACTIVE',
    current: false,
  },
  {
    id: 's-3',
    device: 'Firefox · Linux',
    detail: '201.141.7.33 · Ciudad de México · activa hace 1 día · jti e41b…0f',
    jti: 'e41b…0f',
    ip: '201.141.7.33',
    status: 'ACTIVE',
    current: false,
  },
  {
    id: 's-4',
    device: 'Chrome · Android',
    detail: '189.203.11.4 · Monterrey · revocada hace 1 min · jti 9b0f…c2',
    jti: '9b0f…c2',
    ip: '189.203.11.4',
    status: 'REVOKED',
    current: false,
  },
];
