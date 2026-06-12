// ============================================================
// script.ts — Punto de entrada principal de SaludAsist
// Importa y arranca todos los módulos
// ============================================================

import { realizarEvaluacionMedica } from './diagnostico';
import { abrirModalHistorial, cerrarModalHistorial, limpiarYCerrar, exportDiagnosticsPDF } from './script-mejoras';

// ── Tema oscuro / claro ──────────────────────────────────────

function iniciarTema(): void {
  const btn = document.getElementById('theme-toggle');
  const temaGuardado = localStorage.getItem('saludassist-tema') ?? 'claro';
  aplicarTema(temaGuardado);

  btn?.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme') ?? 'claro';
    const nuevo = actual === 'claro' ? 'oscuro' : 'claro';
    aplicarTema(nuevo);
    localStorage.setItem('saludassist-tema', nuevo);
  });
}

function aplicarTema(tema: string): void {
  document.documentElement.setAttribute('data-theme', tema);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = tema === 'oscuro' ? '☀️' : '🌙';
}

// ── Acordeones ───────────────────────────────────────────────

function iniciarAcordeones(): void {
  const botones = document.querySelectorAll<HTMLButtonElement>('.accordion-header');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      const expandido = btn.getAttribute('aria-expanded') === 'true';
      const contenidoId = btn.getAttribute('aria-controls');
      const contenido = contenidoId ? document.getElementById(contenidoId) : null;
      btn.setAttribute('aria-expanded', String(!expandido));
      if (contenido) {
        expandido ? contenido.setAttribute('hidden', '') : contenido.removeAttribute('hidden');
      }
    });
  });
}

// ── Carga de imágenes ────────────────────────────────────────

function iniciarCargaImagenes(): void {
  const input = document.getElementById('image-upload') as HTMLInputElement | null;
  const preview = document.getElementById('image-preview');
  if (!input || !preview) return;

  input.addEventListener('change', () => {
    preview.innerHTML = '';
    const archivos = Array.from(input.files ?? []);
    if (archivos.length > 5) {
      alert('Máximo 5 imágenes permitidas.');
      input.value = '';
      return;
    }
    archivos.forEach(archivo => {
      if (archivo.size > 5 * 1024 * 1024) {
        alert(`"${archivo.name}" supera los 5 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;
        img.alt = `Vista previa: ${archivo.name}`;
        img.className = 'preview-img';
        preview.appendChild(img);
      };
      reader.readAsDataURL(archivo);
    });
  });
}

// ── Formulario de contacto ───────────────────────────────────

function validarCampo(campo: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
  const valor = campo.value.trim();
  let error = '';
  if (!valor) {
    error = 'Este campo es obligatorio.';
  } else if (campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    error = 'Ingresa un correo válido.';
  } else if (campo.tagName === 'TEXTAREA' && valor.length < 10) {
    error = 'El mensaje debe tener al menos 10 caracteres.';
  }
  let errorEl = campo.parentElement?.querySelector<HTMLSpanElement>('.field-error');
  if (error) {
    campo.setAttribute('aria-invalid', 'true');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.setAttribute('role', 'alert');
      errorEl.style.cssText = 'color:red;font-size:0.82rem;display:block;margin-top:4px;';
      campo.parentElement?.appendChild(errorEl);
    }
    errorEl.textContent = error;
    return false;
  } else {
    campo.removeAttribute('aria-invalid');
    errorEl?.remove();
    return true;
  }
}

function iniciarFormularioContacto(): void {
  const form = document.getElementById('contacto-form') as HTMLFormElement | null;
  if (!form) return;

  const campos = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input[required], textarea[required], select[required]'
  );

  campos.forEach(campo => {
    campo.addEventListener('blur', () => validarCampo(campo));
  });

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    let valido = true;
    campos.forEach(campo => { if (!validarCampo(campo)) valido = false; });
    if (valido) {
      form.innerHTML = `
        <div class="form-success" role="alert" style="text-align:center;padding:40px;">
          <span style="font-size:3rem">✅</span>
          <h3>¡Mensaje enviado!</h3>
          <p>Gracias por contactarnos. Te responderemos pronto.</p>
        </div>`;
    }
  });
}

// ── Exponer funciones globales que usa el HTML con onclick="" ─

type WindowExtended = Window & typeof globalThis & {
  closeHistoryModal: () => void;
  clearHistoryData: () => void;
  exportDiagnosticsPDF: () => void;
};

(window as WindowExtended).closeHistoryModal   = cerrarModalHistorial;
(window as WindowExtended).clearHistoryData    = limpiarYCerrar;
(window as WindowExtended).exportDiagnosticsPDF = exportDiagnosticsPDF;

// ── Inicialización ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  iniciarTema();
  iniciarAcordeones();
  iniciarCargaImagenes();
  iniciarFormularioContacto();

  // Botón del formulario principal de evaluación
  document.getElementById('btn-evaluar')?.addEventListener('click', realizarEvaluacionMedica);

  // Botón historial
  document.getElementById('history-btn')?.addEventListener('click', abrirModalHistorial);
});
