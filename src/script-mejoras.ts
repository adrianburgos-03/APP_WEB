// ============================================================
// script-mejoras.ts — Módulo de historial, modal y exportación PDF
// Responsable: persistencia en localStorage, modal de historial,
//              estadísticas y exportación PDF
// ============================================================

// ── Tipos ────────────────────────────────────────────────────

export interface DiagnosticoGuardado {
  nombre: string;
  probabilidad: number;
  gravedad: 'leve' | 'moderado' | 'grave';
  descripcion: string;
}

export interface EvaluacionGuardada {
  id: string;
  sintomas: string[];
  edad: number | null;
  diagnosticos: DiagnosticoGuardado[];
  recomendaciones: string[];
  fecha: string;
}

const STORAGE_KEY = 'saludassist-historial';

// ── Persistencia localStorage ────────────────────────────────

export function guardarEvaluacion(evaluacion: Omit<EvaluacionGuardada, 'id'>): void {
  const historial = cargarHistorial();
  const nueva: EvaluacionGuardada = {
    ...evaluacion,
    id: `eval-${Date.now()}`
  };
  historial.unshift(nueva);          // más reciente primero

  // Límite: máximo 20 evaluaciones guardadas
  const limitado = historial.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitado));
}

export function cargarHistorial(): EvaluacionGuardada[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EvaluacionGuardada[];
  } catch {
    return [];
  }
}

export function eliminarEvaluacion(id: string): void {
  const historial = cargarHistorial().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
}

export function limpiarHistorial(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Estadísticas ─────────────────────────────────────────────

interface Estadisticas {
  total: number;
  ultimaFecha: string;
  sintomaFrecuente: string;
}

function calcularEstadisticas(historial: EvaluacionGuardada[]): Estadisticas {
  if (historial.length === 0) {
    return { total: 0, ultimaFecha: '—', sintomaFrecuente: '—' };
  }

  // Síntoma más frecuente
  const conteo: Record<string, number> = {};
  for (const ev of historial) {
    for (const s of ev.sintomas) {
      conteo[s] = (conteo[s] ?? 0) + 1;
    }
  }
  const sintomaFrecuente = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const ultimaFecha = new Date(historial[0].fecha).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return { total: historial.length, ultimaFecha, sintomaFrecuente };
}

// ── Renderizado del modal ────────────────────────────────────

function renderizarEstadisticas(stats: Estadisticas): void {
  const el = document.getElementById('history-stats');
  if (!el) return;
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-number">${stats.total}</span>
        <span class="stat-label">Evaluaciones</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${stats.ultimaFecha}</span>
        <span class="stat-label">Última evaluación</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${stats.sintomaFrecuente}</span>
        <span class="stat-label">Síntoma frecuente</span>
      </div>
    </div>
  `;
}

function renderizarListaHistorial(historial: EvaluacionGuardada[]): void {
  const el = document.getElementById('history-list');
  if (!el) return;

  if (historial.length === 0) {
    el.innerHTML = '<p class="empty-history">No hay evaluaciones guardadas todavía.</p>';
    return;
  }

  el.innerHTML = historial.map(ev => {
    const fecha = new Date(ev.fecha).toLocaleString('es-EC');
    const diagnosticoTop = ev.diagnosticos[0];
    const badgeColor = diagnosticoTop
      ? `badge-${diagnosticoTop.gravedad}`
      : 'badge-leve';
    const diagnosticoNombre = diagnosticoTop?.nombre ?? 'Sin coincidencia';

    return `
      <div class="history-item" data-id="${ev.id}">
        <div class="history-item-header">
          <span class="history-date">${fecha}</span>
          <span class="badge ${badgeColor}">${diagnosticoNombre}</span>
        </div>
        <p class="history-symptoms">
          <strong>Síntomas:</strong> ${ev.sintomas.join(', ')}
        </p>
        ${ev.edad !== null ? `<p class="history-age">Edad: ${ev.edad} años</p>` : ''}
        <button
          class="btn btn-sm btn-danger"
          data-delete="${ev.id}"
          aria-label="Eliminar evaluación del ${fecha}">
          🗑️ Eliminar
        </button>
      </div>
    `;
  }).join('');

  // Eventos de eliminación individual
  el.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete') ?? '';
      eliminarEvaluacion(id);
      abrirModalHistorial(); // re-renderizar
    });
  });
}

// ── Modal ────────────────────────────────────────────────────

export function abrirModalHistorial(): void {
  const modal = document.getElementById('history-modal');
  if (!modal) return;

  const historial = cargarHistorial();
  const stats = calcularEstadisticas(historial);
  renderizarEstadisticas(stats);
  renderizarListaHistorial(historial);

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

export function cerrarModalHistorial(): void {
  const modal = document.getElementById('history-modal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function limpiarYCerrar(): void {
  limpiarHistorial();
  abrirModalHistorial();
}

// ── Exportar PDF ──────────────────────────────────────────────

export function exportDiagnosticsPDF(): void {
  const seccion = document.getElementById('resultados');
  if (!seccion) {
    alert('No hay resultados para exportar. Realiza una evaluación primero.');
    return;
  }

  // html2pdf.js se carga como script externo — usamos any para evitar error TS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (window as any).html2pdf;
  if (typeof html2pdf !== 'function') {
    alert('La librería de PDF no está disponible. Verifica la conexión.');
    return;
  }

  const opciones = {
    margin:       [10, 10, 10, 10],
    filename:     `SaludAsist-${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opciones).from(seccion).save();
}

// ── Inicialización del módulo ────────────────────────────────

function iniciarModal(): void {
  // Botón abrir historial
  document.getElementById('history-btn')?.addEventListener('click', abrirModalHistorial);

  // Botón cerrar modal (×)
  document.querySelector('.btn-close')?.addEventListener('click', cerrarModalHistorial);

  // Botón limpiar historial
  document.querySelector('[onclick="clearHistoryData()"]')?.addEventListener('click', limpiarYCerrar);

  // Cerrar al hacer clic fuera del modal
  document.getElementById('history-modal')?.addEventListener('click', (e: Event) => {
    if ((e.target as HTMLElement).id === 'history-modal') {
      cerrarModalHistorial();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') cerrarModalHistorial();
  });
}

// Exponer funciones que el HTML llama con onclick=""
(window as Window & typeof globalThis & {
  closeHistoryModal: () => void;
  clearHistoryData: () => void;
}).closeHistoryModal = cerrarModalHistorial;

(window as Window & typeof globalThis & {
  closeHistoryModal: () => void;
  clearHistoryData: () => void;
}).clearHistoryData = limpiarYCerrar;

document.addEventListener('DOMContentLoaded', iniciarModal);
