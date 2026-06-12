// ============================================================
// diagnostico.ts — Lógica de evaluación médica y derivación
// 25 síntomas en 6 categorías
// ============================================================

import { guardarEvaluacion } from './script-mejoras';

// ── Tipos ────────────────────────────────────────────────────

interface ReglaDiagnostico {
  sintomasRequeridos: string[];
  sintomasOpcionales: string[];
  enfermedad: string;
  probabilidad: number;
  gravedad: 'leve' | 'moderado' | 'grave';
  derivacion: string;
  descripcion: string;
  recomendaciones: string[];
}

// ── Catálogo completo de diagnósticos ────────────────────────

const CATALOGO_REGLAS: ReglaDiagnostico[] = [

  // ── EMERGENCIAS ─────────────────────────────────────────
  {
    sintomasRequeridos: ['dolor-pecho', 'dificultad-respirar'],
    sintomasOpcionales: ['palpitaciones', 'mareos', 'cansancio'],
    enfermedad: 'Posible Síndrome Coronario Agudo',
    probabilidad: 90,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias — Cardiólogo / Neumólogo',
    descripcion: 'La combinación de dolor de pecho con dificultad respiratoria puede indicar un evento cardiorrespiratorio grave.',
    recomendaciones: [
      '🚨 Llama al 911 AHORA.',
      'No te quedes solo/a — busca ayuda inmediata.',
      'Quédate en reposo, no hagas esfuerzo físico.',
      'Si tienes aspirina y no eres alérgico/a, mastícala mientras esperas.'
    ]
  },
  {
    sintomasRequeridos: ['perdida-conocimiento'],
    sintomasOpcionales: ['mareos', 'dolor-cabeza', 'hormigueo'],
    enfermedad: 'Pérdida de Conocimiento — Urgencia Neurológica',
    probabilidad: 85,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias — Neurólogo',
    descripcion: 'La pérdida de conocimiento es una emergencia médica que requiere atención inmediata.',
    recomendaciones: [
      '🚨 Llama al 911 AHORA.',
      'No dejes sola a la persona.',
      'Coloca a la persona de lado para evitar ahogamiento.',
      'No le des nada de comer ni beber.'
    ]
  },
  {
    sintomasRequeridos: ['piel-amarilla'],
    sintomasOpcionales: ['dolor-abdominal', 'nauseas', 'cansancio'],
    enfermedad: 'Posible Ictericia — Problema Hepático',
    probabilidad: 80,
    gravedad: 'grave',
    derivacion: '🏥 Gastroenterólogo / Hepatólogo — Urgente',
    descripcion: 'La piel amarillenta (ictericia) puede indicar problemas graves en el hígado o vesícula biliar.',
    recomendaciones: [
      'Busca atención médica ese mismo día.',
      'Evita el alcohol completamente.',
      'No tomes medicamentos sin prescripción médica.',
      'Necesitarás análisis de sangre urgentes.'
    ]
  },

  // ── CARDIOVASCULAR ───────────────────────────────────────
  {
    sintomasRequeridos: ['dolor-pecho'],
    sintomasOpcionales: ['palpitaciones', 'dificultad-respirar', 'hinchazon-piernas'],
    enfermedad: 'Posible Problema Cardíaco',
    probabilidad: 75,
    gravedad: 'grave',
    derivacion: '❤️ Cardiólogo — Urgente',
    descripcion: 'El dolor de pecho puede tener causas cardíacas graves que requieren evaluación urgente.',
    recomendaciones: [
      'Busca atención médica urgente hoy.',
      'Evita esfuerzos físicos.',
      'Llama al 911 si el dolor se irradia al brazo o mandíbula.',
      'Anota cuándo comenzó y cómo es el dolor.'
    ]
  },
  {
    sintomasRequeridos: ['palpitaciones'],
    sintomasOpcionales: ['mareos', 'cansancio', 'dificultad-respirar'],
    enfermedad: 'Arritmia o Taquicardia',
    probabilidad: 65,
    gravedad: 'moderado',
    derivacion: '❤️ Cardiólogo',
    descripcion: 'Las palpitaciones frecuentes pueden indicar una alteración del ritmo cardíaco.',
    recomendaciones: [
      'Agenda cita con cardiólogo pronto.',
      'Reduce el consumo de cafeína y alcohol.',
      'Evita el estrés y descansa bien.',
      'Lleva un registro de cuándo ocurren las palpitaciones.'
    ]
  },
  {
    sintomasRequeridos: ['hinchazon-piernas'],
    sintomasOpcionales: ['cansancio', 'dificultad-respirar'],
    enfermedad: 'Posible Insuficiencia Venosa o Cardíaca',
    probabilidad: 60,
    gravedad: 'moderado',
    derivacion: '❤️ Cardiólogo / Médico General',
    descripcion: 'La hinchazón en piernas puede indicar problemas de circulación o cardíacos.',
    recomendaciones: [
      'Eleva las piernas cuando estés en reposo.',
      'Reduce el consumo de sal.',
      'Consulta con tu médico esta semana.',
      'Evita estar mucho tiempo de pie sin moverte.'
    ]
  },

  // ── RESPIRATORIO ─────────────────────────────────────────
  {
    sintomasRequeridos: ['silbido-respirar'],
    sintomasOpcionales: ['tos', 'dificultad-respirar', 'cansancio'],
    enfermedad: 'Posible Asma o Broncoespasmo',
    probabilidad: 75,
    gravedad: 'moderado',
    derivacion: '🫁 Neumólogo',
    descripcion: 'El silbido al respirar (sibilancias) puede indicar asma u otras condiciones bronquiales.',
    recomendaciones: [
      'Consulta con un neumólogo pronto.',
      'Evita humo, polvo y alérgenos.',
      'Si tienes inhalador, úsalo según indicación.',
      'En crisis severa, ve a urgencias.'
    ]
  },
  {
    sintomasRequeridos: ['fiebre', 'tos', 'dolor-garganta'],
    sintomasOpcionales: ['congestion-nasal', 'cansancio', 'escalofrios'],
    enfermedad: 'Infección Respiratoria — Gripe o Faringitis',
    probabilidad: 80,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General',
    descripcion: 'Cuadro clínico compatible con infección viral respiratoria estacional.',
    recomendaciones: [
      'Reposo en casa y abundante líquido.',
      'Paracetamol o ibuprofeno para la fiebre.',
      'Consulta si la fiebre supera 39°C o persiste más de 3 días.',
      'Aísate para no contagiar a otros.'
    ]
  },
  {
    sintomasRequeridos: ['congestion-nasal', 'tos'],
    sintomasOpcionales: ['dolor-garganta', 'fiebre'],
    enfermedad: 'Resfriado Común',
    probabilidad: 70,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General (si persiste)',
    descripcion: 'Síntomas típicos de resfriado viral. Generalmente se resuelve solo en 7-10 días.',
    recomendaciones: [
      'Descansa y toma mucho líquido.',
      'Descongestionantes nasales de venta libre.',
      'Caldo caliente y miel con limón ayudan.',
      'Consulta si no mejoras en una semana.'
    ]
  },

  // ── NEUROLÓGICO ──────────────────────────────────────────
  {
    sintomasRequeridos: ['dolor-cabeza', 'vision-borrosa'],
    sintomasOpcionales: ['mareos', 'nauseas'],
    enfermedad: 'Migraña con Aura o Hipertensión',
    probabilidad: 70,
    gravedad: 'moderado',
    derivacion: '🧠 Neurólogo / Médico General',
    descripcion: 'La combinación de dolor de cabeza con visión borrosa puede indicar migraña o presión arterial elevada.',
    recomendaciones: [
      'Controla tu presión arterial.',
      'Descansa en un lugar oscuro y silencioso.',
      'Consulta al médico si ocurre frecuentemente.',
      'Lleva un diario de episodios (hora, duración, intensidad).'
    ]
  },
  {
    sintomasRequeridos: ['hormigueo'],
    sintomasOpcionales: ['dolor-cabeza', 'mareos', 'vision-borrosa'],
    enfermedad: 'Posible Neuropatía o Problema Circulatorio',
    probabilidad: 60,
    gravedad: 'moderado',
    derivacion: '🧠 Neurólogo',
    descripcion: 'El hormigueo en extremidades puede indicar problemas nerviosos o circulatorios.',
    recomendaciones: [
      'Agenda cita con neurólogo.',
      'Evita posturas que compriman nervios.',
      'Controla niveles de azúcar en sangre.',
      'Haz ejercicio suave de forma regular.'
    ]
  },
  {
    sintomasRequeridos: ['mareos'],
    sintomasOpcionales: ['nauseas', 'dolor-cabeza', 'vision-borrosa'],
    enfermedad: 'Vértigo o Mareo Postural',
    probabilidad: 60,
    gravedad: 'leve',
    derivacion: '👂 Otorrinolaringólogo / Médico General',
    descripcion: 'Los mareos frecuentes pueden tener origen en el oído interno o la presión arterial.',
    recomendaciones: [
      'Levántate despacio para evitar mareos.',
      'Mantente bien hidratado.',
      'Consulta si los episodios son frecuentes o intensos.',
      'Evita movimientos bruscos de cabeza.'
    ]
  },

  // ── DIGESTIVO ────────────────────────────────────────────
  {
    sintomasRequeridos: ['nauseas', 'vomito', 'diarrea'],
    sintomasOpcionales: ['dolor-abdominal', 'fiebre', 'cansancio'],
    enfermedad: 'Gastroenteritis Aguda',
    probabilidad: 85,
    gravedad: 'leve',
    derivacion: '🫃 Gastroenterólogo / Médico General',
    descripcion: 'Infección gastrointestinal, probablemente viral o bacteriana.',
    recomendaciones: [
      'Hidratación oral constante — suero o agua.',
      'Dieta blanda: arroz, plátano, tostadas.',
      'Evita lácteos y comidas grasas.',
      'Consulta si hay sangre en heces o fiebre alta.'
    ]
  },
  {
    sintomasRequeridos: ['dolor-abdominal'],
    sintomasOpcionales: ['nauseas', 'fiebre', 'vomito'],
    enfermedad: 'Dolor Abdominal — Evaluación Necesaria',
    probabilidad: 60,
    gravedad: 'moderado',
    derivacion: '🫃 Gastroenterólogo / Médico General',
    descripcion: 'El dolor abdominal puede tener múltiples causas que requieren evaluación médica.',
    recomendaciones: [
      'Si el dolor es intenso o repentino, ve a urgencias.',
      'Anota la ubicación exacta y tipo de dolor.',
      'Evita automedicarte con analgésicos fuertes.',
      'Consulta con tu médico esta semana.'
    ]
  },

  // ── SISTÉMICOS ───────────────────────────────────────────
  {
    sintomasRequeridos: ['fiebre', 'escalofrios', 'dolor-corporal'],
    sintomasOpcionales: ['cansancio', 'sudoracion-nocturna'],
    enfermedad: 'Síndrome Gripal o Infección Sistémica',
    probabilidad: 80,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General',
    descripcion: 'Cuadro compatible con infección viral o bacteriana que afecta todo el organismo.',
    recomendaciones: [
      'Reposo absoluto y abundante hidratación.',
      'Consulta al médico si la fiebre supera 39°C.',
      'Analgésicos de venta libre para el malestar.',
      'Aísate para evitar contagios.'
    ]
  },
  {
    sintomasRequeridos: ['sudoracion-nocturna', 'cansancio'],
    sintomasOpcionales: ['fiebre', 'perdida-conocimiento'],
    enfermedad: 'Posible Infección Crónica o Problema Hormonal',
    probabilidad: 55,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General — Análisis de Sangre',
    descripcion: 'La sudoración nocturna con cansancio prolongado puede indicar infecciones crónicas o alteraciones hormonales.',
    recomendaciones: [
      'Agenda análisis de sangre completos.',
      'Informa al médico sobre la duración de los síntomas.',
      'Mantén un registro de cuándo ocurren los episodios.',
      'Evalúa niveles de tiroides y glucosa.'
    ]
  },

  // ── DERMATOLÓGICO ────────────────────────────────────────
  {
    sintomasRequeridos: ['sarpullido', 'picazon'],
    sintomasOpcionales: ['fiebre', 'congestion-nasal'],
    enfermedad: 'Reacción Alérgica o Dermatitis',
    probabilidad: 75,
    gravedad: 'leve',
    derivacion: '💆 Dermatólogo / Alergólogo',
    descripcion: 'Reacción cutánea compatible con alergia o dermatitis de contacto.',
    recomendaciones: [
      'Identifica y evita el posible alérgeno.',
      'Antihistamínicos de venta libre pueden aliviar.',
      'No rasques la zona afectada.',
      'Consulta al dermatólogo si empeora o se extiende.'
    ]
  }
];

// ── Función principal ────────────────────────────────────────

export function realizarEvaluacionMedica(): void {
  const edadInput = document.getElementById('edad') as HTMLInputElement | null;
  const edad = edadInput?.value ? parseInt(edadInput.value) : null;

  const checkboxes = document.querySelectorAll<HTMLInputElement>('input[name="sintomas"]:checked');
  const sintomasSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  if (sintomasSeleccionados.length === 0) {
    mostrarError('Por favor, selecciona al menos un síntoma para continuar.');
    return;
  }

  ocultarError();
  mostrarSpinnerLocal();

  setTimeout(() => {
    ocultarSpinnerLocal();

    // Buscar mejor coincidencia
    let mejorRegla: ReglaDiagnostico | null = null;
    let mejorPuntaje = 0;

    for (const regla of CATALOGO_REGLAS) {
      const cumpleTodos = regla.sintomasRequeridos.every(s => sintomasSeleccionados.includes(s));
      if (!cumpleTodos) continue;

      const puntaje =
        regla.sintomasRequeridos.filter(s => sintomasSeleccionados.includes(s)).length * 2 +
        regla.sintomasOpcionales.filter(s => sintomasSeleccionados.includes(s)).length;

      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejorRegla = regla;
      }
    }

    // Default si no hay coincidencia
    if (!mejorRegla) {
      mejorRegla = {
        sintomasRequeridos: sintomasSeleccionados,
        sintomasOpcionales: [],
        enfermedad: 'Malestar General — Evaluación Recomendada',
        probabilidad: 50,
        gravedad: 'leve',
        derivacion: '👨‍⚕️ Médico General',
        descripcion: 'No se detectaron patrones específicos de alarma. Se recomienda una consulta de rutina.',
        recomendaciones: [
          'Agenda una consulta con tu médico de cabecera.',
          'Anota todos tus síntomas y su duración.',
          'Mantente hidratado y descansa bien.',
          'Evita automedicarte sin consultar.'
        ]
      };
    }

    renderizarResultado(mejorRegla, sintomasSeleccionados, edad);

    guardarEvaluacion({
      sintomas: sintomasSeleccionados,
      edad,
      fecha: new Date().toISOString(),
      diagnosticos: [{
        nombre: mejorRegla.enfermedad,
        probabilidad: mejorRegla.probabilidad,
        gravedad: mejorRegla.gravedad,
        descripcion: mejorRegla.descripcion
      }],
      recomendaciones: mejorRegla.recomendaciones
    });

  }, 900);
}

// ── Renderizado ──────────────────────────────────────────────

function renderizarResultado(resultado: ReglaDiagnostico, sintomas: string[], edad: number | null): void {
  const contenedor = document.getElementById('resultado-diagnostico');
  if (!contenedor) return;

  const colores = {
    grave:    { borde: '#ef4444', fondo: '#fee2e2', texto: '#991b1b' },
    moderado: { borde: '#f59e0b', fondo: '#fef3c7', texto: '#92400e' },
    leve:     { borde: '#22c55e', fondo: '#dcfce7', texto: '#15803d'  }
  };
  const c = colores[resultado.gravedad];
  const edadTexto = edad !== null ? `<span style="font-size:0.85rem;color:var(--text-light);">Paciente: ${edad} años</span>` : '';
  const iconoGravedad = resultado.gravedad === 'grave' ? '🚨' : resultado.gravedad === 'moderado' ? '⚠️' : '✅';

  contenedor.innerHTML = `
    <div style="padding:24px;border-radius:14px;border-left:6px solid ${c.borde};background:var(--bg-white);box-shadow:0 4px 20px rgba(0,0,0,0.08);margin-top:24px;">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
        <h3 style="color:var(--primary-dark);margin:0;font-size:1.1rem;">📋 ${resultado.enfermedad}</h3>
        ${edadTexto}
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
        <span style="padding:4px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;background:${c.fondo};color:${c.texto};border:1px solid ${c.borde};">
          ${iconoGravedad} ${resultado.gravedad.toUpperCase()}
        </span>
        <span style="padding:4px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;background:color-mix(in srgb, var(--primary) 12%, transparent);color:var(--primary-dark);">
          ${resultado.probabilidad}% coincidencia
        </span>
      </div>

      <p style="color:var(--text-light);font-size:0.95rem;line-height:1.6;margin-bottom:16px;">${resultado.descripcion}</p>

      <div style="margin-bottom:16px;">
        <strong style="font-size:0.88rem;color:var(--primary-dark);">Síntomas seleccionados:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
          ${sintomas.map(s => `
            <span style="background:color-mix(in srgb,var(--primary) 12%,var(--bg));color:var(--primary-dark);border:1px solid color-mix(in srgb,var(--primary) 25%,transparent);border-radius:16px;padding:3px 12px;font-size:0.82rem;">
              ${s.replace(/-/g, ' ')}
            </span>`).join('')}
        </div>
      </div>

      <div style="background:color-mix(in srgb,var(--primary) 8%,var(--bg));padding:16px;border-radius:10px;border:1px dashed color-mix(in srgb,var(--primary) 40%,transparent);margin-bottom:16px;">
        <p style="margin:0;color:var(--primary-dark);font-weight:700;font-size:1rem;">
          📍 Te recomendamos acudir a: ${resultado.derivacion}
        </p>
      </div>

      <div>
        <strong style="font-size:0.9rem;color:var(--primary-dark);">💡 Recomendaciones:</strong>
        <ul style="margin:10px 0 0 20px;padding:0;font-size:0.9rem;line-height:1.9;color:var(--text-light);">
          ${resultado.recomendaciones.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-top:18px;padding:10px 14px;background:#fef3c7;border-radius:8px;font-size:0.82rem;color:#92400e;">
        ⚠️ Este resultado es <strong>orientativo</strong> y no reemplaza una consulta médica profesional.
        En emergencia llama al <strong>911</strong>.
      </div>
    </div>
  `;

  contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Helpers ──────────────────────────────────────────────────

function mostrarError(msg: string): void {
  let el = document.getElementById('error-diagnostico');
  if (!el) {
    el = document.createElement('div');
    el.id = 'error-diagnostico';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'color:#ef4444;background:#fee2e2;padding:10px 14px;border-radius:8px;margin-top:12px;font-size:0.9rem;';
    document.getElementById('diagnostico-form')?.appendChild(el);
  }
  el.textContent = msg;
  el.removeAttribute('hidden');
}

function ocultarError(): void {
  document.getElementById('error-diagnostico')?.setAttribute('hidden', '');
}

function mostrarSpinnerLocal(): void {
  const btn = document.getElementById('btn-evaluar') as HTMLButtonElement | null;
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Analizando...'; }
}

function ocultarSpinnerLocal(): void {
  const btn = document.getElementById('btn-evaluar') as HTMLButtonElement | null;
  if (btn) { btn.disabled = false; btn.textContent = 'Comenzar Evaluación'; }
}
