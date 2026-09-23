import { PlantillaTareaCurso, TareaCCV } from '@/types';

export const DURACIONES_PREDETERMINADAS = [30, 45, 60, 75, 90, 105, 120] as const;
export type DuracionPredeterminada = typeof DURACIONES_PREDETERMINADAS[number];

export interface HitoCronograma {
  id: string;
  fase: number;
  nombreFase: string;
  unidad?: number;
  etapaIndex: number;
  diasDesdeInicio: number;
  fechaInicioEtapa: string;
  fechaVencimiento: string;
  diaSemana: string;
  tareasCount: number;
  tareasTitulos: string[];
}

/**
 * Ajusta una fecha para que nunca caiga en fin de semana.
 * Si cae en Sábado -> Viernes anterior (-1 día).
 * Si cae en Domingo -> Viernes anterior (-2 días).
 */
export function ajustarADiaHabil(fecha: Date): Date {
  const d = new Date(fecha.getTime());
  const diaSemana = d.getDay(); // 0 = Domingo, 6 = Sábado
  if (diaSemana === 6) {
    d.setDate(d.getDate() - 1);
  } else if (diaSemana === 0) {
    d.setDate(d.getDate() - 2);
  }
  return d;
}

/**
 * Convierte un objeto Date en string 'YYYY-MM-DD' en hora local
 */
export function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea un string 'YYYY-MM-DD' en formato legible con día de la semana en español
 * Ejemplo: "Viernes, 24 de Octubre de 2026"
 */
export function formatearFechaConDia(fechaStr: string): string {
  if (!fechaStr || fechaStr === 'Sin fecha') return 'Sin fecha';
  const [y, m, d] = fechaStr.split('-').map(Number);
  if (!y || !m || !d) return fechaStr;

  const date = new Date(y, m - 1, d);
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const texto = date.toLocaleDateString('es-CO', opciones);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Extrae o infiere el número de fase y nombre de una tarea de plantilla
 */
export function resolverFasePlantilla(tarea: PlantillaTareaCurso): { fase: number; nombreFase: string } {
  if (tarea.fase && tarea.fase > 0) {
    return {
      fase: tarea.fase,
      nombreFase: tarea.nombre_fase || `Fase ${tarea.fase}`
    };
  }

  // Inferencia por sección u orden si la tarea no tiene fase explícita
  const seccionUpper = (tarea.seccion || '').toUpperCase();
  if (seccionUpper.includes('GENERAL') || tarea.orden <= 3) {
    return { fase: 1, nombreFase: 'Fase 1: Estructuración y Acuerdos Curriculares' };
  }
  if (tarea.aplica_por_unidad || seccionUpper.includes('UNIDAD') || (tarea.orden >= 4 && tarea.orden <= 6)) {
    return { fase: 2, nombreFase: 'Fase 2: Elaboración y Producción de Contenidos' };
  }
  return { fase: 3, nombreFase: 'Fase 3: Montaje en LMS y Certificación de Calidad' };
}

/**
 * Calcula en tiempo real la proyección de hitos de entrega por fases y unidades
 * a partir de la fecha de inicio y la duración total en días.
 */
export function calcularHitosCronograma(
  fechaInicioStr: string,
  duracionDias: number,
  numeroUnidades: number,
  plantillaTareas: PlantillaTareaCurso[]
): {
  hitos: HitoCronograma[];
  fechaInicio: string;
  fechaFinEstimada: string;
  duracionTotal: number;
} {
  const unidades = Math.max(1, numeroUnidades || 1);
  const [y, m, d] = (fechaInicioStr || toLocalDateString(new Date())).split('-').map(Number);
  const baseDate = new Date(y, m - 1, d);

  // 1. Clasificar tareas activas de la plantilla en Fases
  const tareasActivas = plantillaTareas.filter(t => t.activa);
  const mapaFases = new Map<number, { nombreFase: string; tareas: PlantillaTareaCurso[]; aplicaPorUnidad: boolean }>();

  tareasActivas.forEach(t => {
    const { fase, nombreFase } = resolverFasePlantilla(t);
    if (!mapaFases.has(fase)) {
      mapaFases.set(fase, {
        nombreFase,
        tareas: [],
        aplicaPorUnidad: !!t.aplica_por_unidad
      });
    }
    const entrada = mapaFases.get(fase)!;
    entrada.tareas.push(t);
    if (t.aplica_por_unidad) entrada.aplicaPorUnidad = true;
  });

  const fasesOrdenadas = Array.from(mapaFases.keys()).sort((a, b) => a - b);

  // 2. Construir lista lineal de etapas (desglosando las fases por unidad si aplica)
  interface EtapaDef {
    fase: number;
    nombreFase: string;
    unidad?: number;
    tareas: PlantillaTareaCurso[];
  }

  const etapas: EtapaDef[] = [];
  fasesOrdenadas.forEach(numFase => {
    const info = mapaFases.get(numFase)!;
    if (!info.aplicaPorUnidad) {
      etapas.push({
        fase: numFase,
        nombreFase: info.nombreFase,
        tareas: info.tareas
      });
    } else {
      // Una etapa por cada unidad
      for (let u = 1; u <= unidades; u++) {
        etapas.push({
          fase: numFase,
          nombreFase: `${info.nombreFase} (Unidad ${u})`,
          unidad: u,
          tareas: info.tareas
        });
      }
    }
  });

  const totalEtapas = Math.max(1, etapas.length);
  const diasPorEtapaExactos = duracionDias / totalEtapas;

  // 3. Generar hitos calculando fecha límite para cada etapa ajustada a día hábil
  let diasAcumulados = 0;
  const hitos: HitoCronograma[] = etapas.map((etapa, idx) => {
    diasAcumulados += diasPorEtapaExactos;
    const diasEnteros = Math.round(diasAcumulados);

    const targetDate = new Date(baseDate.getTime());
    targetDate.setDate(targetDate.getDate() + diasEnteros);

    const fechaHabil = ajustarADiaHabil(targetDate);
    const fechaLimStr = toLocalDateString(fechaHabil);

    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaSemana = nombresDias[fechaHabil.getDay()];

    return {
      id: `hito-${etapa.fase}-${etapa.unidad || 'gen'}-${idx}`,
      fase: etapa.fase,
      nombreFase: etapa.nombreFase,
      unidad: etapa.unidad,
      etapaIndex: idx + 1,
      diasDesdeInicio: diasEnteros,
      fechaInicioEtapa: toLocalDateString(baseDate),
      fechaVencimiento: fechaLimStr,
      diaSemana,
      tareasCount: etapa.tareas.length,
      tareasTitulos: etapa.tareas.map(t => etapa.unidad ? `[Unidad ${etapa.unidad}] ${t.titulo}` : t.titulo)
    };
  });

  const targetDateFinal = new Date(baseDate.getTime());
  targetDateFinal.setDate(targetDateFinal.getDate() + duracionDias);
  const fechaFinHabil = ajustarADiaHabil(targetDateFinal);

  return {
    hitos,
    fechaInicio: toLocalDateString(baseDate),
    fechaFinEstimada: toLocalDateString(fechaFinHabil),
    duracionTotal: duracionDias
  };
}

/**
 * Aplica el cálculo de fechas de vencimiento a una lista de tareas de curso en memoria
 */
export function aplicarCronogramaATareas(
  tareas: TareaCCV[],
  hitos: HitoCronograma[]
): TareaCCV[] {
  const mapaFechas = new Map<string, string>();
  hitos.forEach(h => {
    const key = h.unidad ? `${h.fase}_${h.unidad}` : `${h.fase}`;
    mapaFechas.set(key, h.fechaVencimiento);
  });

  return tareas.map(t => {
    const keyConUnidad = t.numero_unidad ? `${t.fase || 2}_${t.numero_unidad}` : `${t.fase || 1}`;
    const fechaCalculada = mapaFechas.get(keyConUnidad) || mapaFechas.get(`${t.fase || 1}`);

    if (fechaCalculada) {
      return {
        ...t,
        fecha_vencimiento: fechaCalculada,
        hora_vencimiento: t.hora_vencimiento || '18:00'
      };
    }
    return t;
  });
}
