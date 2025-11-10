// This file assumes you load Leaflet CSS/JS from CDN in index.html or bundler
export function initMap(containerId = 'map', markers = []) {
  const map = L.map(containerId).setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  markers.forEach(m => {
    if (m.lat && m.lon) {
      const mk = L.marker([m.lat, m.lon]).addTo(markerLayer);
      mk.bindPopup(`<strong>${escapeHtml(m.name)}</strong><p>${escapeHtml(m.description || '')}</p>`);
    }
  });

  // fit bounds
  const coords = markers.filter(m => m.lat && m.lon).map(m => [m.lat, m.lon]);
  if (coords.length) map.fitBounds(coords);

  return { map, markerLayer };
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
