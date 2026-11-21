// Datos de ejemplo de bóvedas, archivos, miembros e invitaciones para la maqueta v2.
// Todo vive en memoria: recargar la página restaura estos datos a su estado inicial.

// Fecha fija "hoy" de la maqueta para que coincida con el Figma.
export const MOCK_TODAY_DATE = '14/11/26';
export const MOCK_TODAY_DATETIME = '14/11/26 10:45';

// Contraseña FALSA de bóveda para la maqueta (canal 2 simulado). No es un secreto real.
export const BOVEDA_DEMO_PASSWORD = 'boveda-maqueta-2026';

// Métricas fijas del panel según el Figma (vista 03).
export const vaultSummary = {
  storageUsed: '38.2 MB',
  storageDetail: 'de 100 MB del plan',
  storageProgress: 38.2,
  activeVaults: '3',
  activeVaultsDetail: 'de 5 bóvedas',
  encryptedFiles: '17',
  encryptedFilesDetail: 'AES-256-GCM, una llave por archivo',
  pendingInvitations: '2',
  pendingInvitationsDetail: 'esperando verificación de identidad',
};

export const vaults = [
  {
    id: 'v-1',
    ownerId: 'u-1',
    ownerName: 'Alexander J.',
    name: 'Auditoría Financiera',
    status: 'ACTIVE',
    createdAt: '01/11/26',
    expiresAt: '30/11/26',
    kekVersion: 'v1',
    kekCreatedAt: '01/11/26',
    filesCount: 4,
    membersCount: 3,
    sizeLabel: '12.4 MB',
    subtitle: 'Creada 01/11/26 · expira 30/11/26',
  },
  {
    id: 'v-2',
    ownerId: 'u-1',
    ownerName: 'Alexander J.',
    name: 'Contratos 2026',
    status: 'ACTIVE',
    createdAt: '28/10/26',
    expiresAt: '28/12/26',
    kekVersion: 'v1',
    kekCreatedAt: '28/10/26',
    filesCount: 9,
    membersCount: 2,
    sizeLabel: '18.9 MB',
    subtitle: 'Creada 28/10/26 · expira 28/12/26',
  },
  {
    id: 'v-3',
    ownerId: 'u-1',
    ownerName: 'Alexander J.',
    name: 'Recursos Humanos',
    status: 'ACTIVE',
    createdAt: '05/11/26',
    expiresAt: '05/12/26',
    kekVersion: 'v1',
    kekCreatedAt: '05/11/26',
    filesCount: 3,
    membersCount: 1,
    sizeLabel: '6.9 MB',
    subtitle: 'Creada 05/11/26 · expira 05/12/26',
  },
  {
    id: 'v-4',
    ownerId: 'u-1',
    ownerName: 'Alexander J.',
    name: 'Due diligence Proveedor X',
    status: 'LOCKED',
    createdAt: '01/11/26',
    expiresAt: '01/12/26',
    kekVersion: 'v1',
    kekCreatedAt: '01/11/26',
    filesCount: 3,
    membersCount: 2,
    sizeLabel: '4.1 MB',
    subtitle: 'Bloqueada el 10/11/26 por intentos fallidos',
  },
  {
    id: 'v-5',
    ownerId: 'u-1',
    ownerName: 'Alexander J.',
    name: 'Licitación Q3',
    status: 'EXPIRED',
    createdAt: '01/10/26',
    expiresAt: '31/10/26',
    kekVersion: 'v1',
    kekCreatedAt: '01/10/26',
    filesCount: 0,
    membersCount: 0,
    sizeLabel: '0 MB',
    subtitle: 'Expiró el 31/10/26 · llaves destruidas',
  },
];

export const vaultFiles = {
  'v-1': [
    { id: 'f-1', name: 'balance_general_2026.pdf', sizeLabel: '2.4 MB', typeLabel: 'PDF', uploadedAt: '01/11/26', author: 'Alexander J.' },
    { id: 'f-2', name: 'estado_resultados_q3.xlsx', sizeLabel: '860 KB', typeLabel: 'Excel', uploadedAt: '01/11/26', author: 'Alexander J.' },
    { id: 'f-3', name: 'contrato_auditoria_firmado.pdf', sizeLabel: '1.1 MB', typeLabel: 'PDF', uploadedAt: '02/11/26', author: 'Alexander J.' },
    { id: 'f-4', name: 'credenciales_erp.env', sizeLabel: '2 KB', typeLabel: 'texto', uploadedAt: '03/11/26', author: 'Alexander J.' },
  ],
  'v-2': [
    { id: 'f-201', name: 'contrato_marco_servicios.pdf', sizeLabel: '3.1 MB', typeLabel: 'PDF', uploadedAt: '28/10/26', author: 'Alexander J.' },
    { id: 'f-202', name: 'anexo_tecnico_cloud.pdf', sizeLabel: '2.0 MB', typeLabel: 'PDF', uploadedAt: '29/10/26', author: 'Alexander J.' },
    { id: 'f-203', name: 'acuerdo_confidencialidad_nda.pdf', sizeLabel: '1.4 MB', typeLabel: 'PDF', uploadedAt: '30/10/26', author: 'Alexander J.' },
    { id: 'f-204', name: 'tarifario_proveedores_2026.xlsx', sizeLabel: '950 KB', typeLabel: 'Excel', uploadedAt: '31/10/26', author: 'Alexander J.' },
    { id: 'f-205', name: 'poliza_responsabilidad_civil.pdf', sizeLabel: '4.2 MB', typeLabel: 'PDF', uploadedAt: '01/11/26', author: 'Alexander J.' },
    { id: 'f-206', name: 'adenda_renovacion_q1.pdf', sizeLabel: '1.8 MB', typeLabel: 'PDF', uploadedAt: '03/11/26', author: 'Alexander J.' },
    { id: 'f-207', name: 'matriz_sla_soporte.xlsx', sizeLabel: '640 KB', typeLabel: 'Excel', uploadedAt: '05/11/26', author: 'Alexander J.' },
    { id: 'f-208', name: 'dictamen_juridico_2026.pdf', sizeLabel: '2.7 MB', typeLabel: 'PDF', uploadedAt: '07/11/26', author: 'Alexander J.' },
    { id: 'f-209', name: 'firmas_autorizadas.pdf', sizeLabel: '2.1 MB', typeLabel: 'PDF', uploadedAt: '09/11/26', author: 'Alexander J.' },
  ],
  'v-3': [
    { id: 'f-301', name: 'nomina_ejecutiva_nov2026.xlsx', sizeLabel: '1.9 MB', typeLabel: 'Excel', uploadedAt: '05/11/26', author: 'Alexander J.' },
    { id: 'f-302', name: 'tabulador_salarial_2026.pdf', sizeLabel: '3.2 MB', typeLabel: 'PDF', uploadedAt: '06/11/26', author: 'Alexander J.' },
    { id: 'f-303', name: 'expedientes_direccion.pdf', sizeLabel: '1.8 MB', typeLabel: 'PDF', uploadedAt: '08/11/26', author: 'Alexander J.' },
  ],
  'v-4': [
    { id: 'f-401', name: 'reporte_riesgo_proveedor_x.pdf', sizeLabel: '2.1 MB', typeLabel: 'PDF', uploadedAt: '02/11/26', author: 'Alexander J.' },
    { id: 'f-402', name: 'estados_financieros_auditados.pdf', sizeLabel: '1.5 MB', typeLabel: 'PDF', uploadedAt: '03/11/26', author: 'Alexander J.' },
    { id: 'f-403', name: 'cuestionario_seguridad_iso27001.xlsx', sizeLabel: '520 KB', typeLabel: 'Excel', uploadedAt: '04/11/26', author: 'Alexander J.' },
  ],
  'v-5': [],
};

export const vaultMembers = {
  'v-1': [
    {
      id: 'm-1',
      userId: 'u-2',
      email: 'auditor@empresa.com',
      status: 'ACCEPTED',
      attempts: '0/5',
      activity: 'hace 2 h',
      token: 'Tq7aN2xLm9Wc4ZpR8vK1sB6yH3dJ0eGf5uIo2nXaMrE',
    },
    {
      id: 'm-2',
      userId: null,
      email: 'contador@despacho.mx',
      status: 'PENDING',
      attempts: '—',
      activity: 'expira en 46 h',
      token: 'Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk',
    },
    {
      id: 'm-3',
      userId: null,
      email: 'legal@empresa.com',
      status: 'TEMP_LOCK',
      attempts: '3/5',
      activity: 'bloqueado 16 s',
      token: 'Kp4mR8vN1xL6zW3qT9yB2cF5hJ7dE0gS4uIo1nXaMrZ',
    },
  ],
  'v-2': [
    {
      id: 'm-201',
      userId: 'u-2',
      email: 'auditor@empresa.com',
      status: 'ACCEPTED',
      attempts: '0/5',
      activity: 'hace 1 día',
      token: 'Zx9cV4bN7mK2lP5qW8eR1tY3uI6oA0sD4fG7hJ2kL5n',
    },
    {
      id: 'm-202',
      userId: null,
      email: 'juridico@corporativo.mx',
      status: 'PENDING',
      attempts: '—',
      activity: 'expira en 24 h',
      token: 'Mn8bV5cX2zL9kJ6hG3fD0sA7pO4iU1yT6rE3wQ9aZ2x',
    },
  ],
  'v-3': [
    {
      id: 'm-301',
      userId: null,
      email: 'direccion.rh@upchiapas.edu.mx',
      status: 'ACCEPTED',
      attempts: '0/5',
      activity: 'hace 5 h',
      token: 'Qw1eR4tY7uI0oP3aS6dF9gH2jK5lZ8xC1vB4nM7qW0e',
    },
  ],
  'v-4': [
    {
      id: 'm-401',
      userId: null,
      email: 'contacto@proveedorx.com',
      status: 'LOCKED',
      attempts: '5/5',
      activity: 'bloqueado el 10/11/26',
      token: 'Pl0oK9iJ8uH7yG6tF5rD4eS3wA2qZ1xC0vB9nM8lK7j',
    },
    {
      id: 'm-402',
      userId: 'u-2',
      email: 'auditor@empresa.com',
      status: 'ACCEPTED',
      attempts: '0/5',
      activity: 'hace 4 días',
      token: 'Hy6tG5rF4eD3sW2aQ1zX0cV9bN8mL7kJ6hG5fD4sA3p',
    },
  ],
  'v-5': [],
};

// Invitaciones por token para consulta directa en /invitacion/[token].
export const invitationsByToken = {
  Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk: {
    token: 'Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk',
    vaultId: 'v-1',
    vaultName: 'Auditoría Financiera',
    ownerName: 'Alexander J.',
    inviteEmail: 'contador@despacho.mx',
    expiresInHours: 48,
    status: 'PENDING',
  },
  Tq7aN2xLm9Wc4ZpR8vK1sB6yH3dJ0eGf5uIo2nXaMrE: {
    token: 'Tq7aN2xLm9Wc4ZpR8vK1sB6yH3dJ0eGf5uIo2nXaMrE',
    vaultId: 'v-1',
    vaultName: 'Auditoría Financiera',
    ownerName: 'Alexander J.',
    inviteEmail: 'auditor@empresa.com',
    expiresInHours: 48,
    status: 'ACCEPTED',
  },
};
