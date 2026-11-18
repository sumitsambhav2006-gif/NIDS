// Unified API Client for NIDS Python SQLite Backend

const API_BASE = ''; // empty string leverages Vite proxy during dev and direct relative paths in prod

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

export async function fetchAlerts({ page = 1, perPage = 15, severity = 'all', status = 'all', search = '', pcapSource = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    severity,
    status,
    search,
    pcap_source: pcapSource
  });
  const res = await fetch(`${API_BASE}/api/alerts?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
  return res.json();
}

export async function updateAlertStatus(alertId, newStatus) {
  const res = await fetch(`${API_BASE}/alerts/api/${alertId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error(`Failed to update alert status: ${res.statusText}`);
  return res.json();
}

export async function deleteAlert(alertId) {
  const res = await fetch(`${API_BASE}/alerts/api/${alertId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete alert: ${res.statusText}`);
  return res.json();
}

export async function clearAllData() {
  const res = await fetch(`${API_BASE}/api/alerts/clear`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to clear database: ${res.statusText}`);
  return res.json();
}

export async function fetchTraffic({ page = 1, perPage = 25, protocol = 'ALL', search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    protocol,
    search,
  });
  const res = await fetch(`${API_BASE}/api/traffic?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch traffic events: ${res.statusText}`);
  return res.json();
}

export async function fetchSamplePcaps() {
  const res = await fetch(`${API_BASE}/api/samples`);
  if (!res.ok) throw new Error(`Failed to fetch sample PCAPs: ${res.statusText}`);
  return res.json();
}

export async function loadSamplePcap(sampleName) {
  const res = await fetch(`${API_BASE}/api/load-sample/${encodeURIComponent(sampleName)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to analyze sample: ${res.statusText}`);
  }
  return res.json();
}

export async function uploadPcapFile(file) {
  const formData = new FormData();
  formData.append('pcap_file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Upload failed: ${res.statusText}`);
  }
  return res.json();
}

export async function simulateAttack({ attackType, count = 25, attackerIp, targetIp, targetPort }) {
  const res = await fetch(`${API_BASE}/api/simulate-attack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attack_type: attackType,
      count,
      attacker_ip: attackerIp,
      target_ip: targetIp,
      target_port: targetPort,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Simulation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/api/settings`);
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.statusText}`);
  return res.json();
}

export async function saveSettings(settings) {
  const res = await fetch(`${API_BASE}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`Failed to save settings: ${res.statusText}`);
  return res.json();
}
