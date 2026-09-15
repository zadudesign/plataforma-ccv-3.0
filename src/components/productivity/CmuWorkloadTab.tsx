'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Settings, 
  Sliders, 
  User, 
  Layers, 
  Sparkles, 
  BookOpen, 
  FolderKanban, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  X,
  Save,
  Info
} from 'lucide-react';
import { TareaCCV, Usuario, CmuCapacidadRol, RolCmuNombre } from '@/types';
import { 
  fetchCmuCapacidadRolesDB, 
  updateCmuCapacidadRolDB, 
  DEFAULT_CMU_CAPACIDAD 
} from '@/lib/supabaseService';

interface CmuWorkloadTabProps {
  tareas: TareaCCV[];
  usuarios: Usuario[];
  usuarioActual: Usuario | null;
  isAdmin: boolean;
  onSelectTask?: (tarea: TareaCCV) => void;
}

const ROLES_CMU_OFICIALES: RolCmuNombre[] = ['Diseño', 'Soporte', 'Producción', 'Multimedia'];

// Helper para obtener el inicio (lunes) y fin (domingo) de la semana de una fecha
function getRangoSemana(fecha: Date): { inicio: Date; fin: Date; lunesStr: string; domingoStr: string; label: string } {
  const d = new Date(fecha);
  const day = d.getDay();
  // En JS: 0=Domingo, 1=Lunes, ... 6=Sábado
  const diffAlLunes = d.getDate() - day + (day === 0 ? -6 : 1);
  
  const inicio = new Date(d);
  inicio.setDate(diffAlLunes);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  const lunesStr = inicio.toISOString().split('T')[0];
  const domingoStr = fin.toISOString().split('T')[0];

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const label = `${inicio.getDate()} ${meses[inicio.getMonth()]} - ${fin.getDate()} ${meses[fin.getMonth()]} ${fin.getFullYear()}`;

  return { inicio, fin, lunesStr, domingoStr, label };
}

export const CmuWorkloadTab: React.FC<CmuWorkloadTabProps> = ({
  tareas,
  usuarios,
  usuarioActual,
  isAdmin,
  onSelectTask,
}) => {
  // 1. Estado de la fecha de referencia para la semana (por defecto hoy)
  const [fechaReferencia, setFechaReferencia] = useState<Date>(() => new Date());
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [miembroExpandidoId, setMiembroExpandidoId] = useState<string | null>(null);

  // 2. Estado de capacidades de los 4 roles
  const [capacidades, setCapacidades] = useState<CmuCapacidadRol[]>(DEFAULT_CMU_CAPACIDAD);
  const [cargandoCapacidades, setCargandoCapacidades] = useState<boolean>(true);

  // 3. Modal de configuración para Administrador
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [formCapacidades, setFormCapacidades] = useState<Record<string, number>>({
    'Diseño': 40,
    'Soporte': 40,
    'Producción': 40,
    'Multimedia': 40,
  });
  const [guardandoConfig, setGuardandoConfig] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Cargar capacidades desde Supabase
  useEffect(() => {
    let montado = true;
    async function load() {
      setCargandoCapacidades(true);
      const res = await fetchCmuCapacidadRolesDB();
      if (montado) {
        setCapacidades(res);
        const mapVals: Record<string, number> = {
          'Diseño': 40,
          'Soporte': 40,
          'Producción': 40,
          'Multimedia': 40,
        };
        res.forEach(c => {
          mapVals[c.rol_nombre] = c.horas_semanales_maximas;
        });
        setFormCapacidades(mapVals);
        setCargandoCapacidades(false);
      }
    }
    load();
    return () => { montado = false; };
  }, []);

  // Rango de la semana actual seleccionada
  const rangoSemana = useMemo(() => getRangoSemana(fechaReferencia), [fechaReferencia]);

  // Navegación de semanas
  const handleSemanaAnterior = () => {
    const nueva = new Date(fechaReferencia);
    nueva.setDate(nueva.getDate() - 7);
    setFechaReferencia(nueva);
  };

  const handleSemanaSiguiente = () => {
    const nueva = new Date(fechaReferencia);
    nueva.setDate(nueva.getDate() + 7);
    setFechaReferencia(nueva);
  };

  const handleSemanaActual = () => {
    setFechaReferencia(new Date());
  };

  // Helper para obtener el límite configurado de un rol
  const getLimiteRol = (rolNombre: string): number => {
    const cap = capacidades.find(c => c.rol_nombre.toLowerCase() === rolNombre.toLowerCase());
    return cap ? cap.horas_semanales_maximas : 40;
  };

  // 4. Filtrar los colaboradores que pertenecen al CMU con los 4 roles oficiales
  const miembrosCMU = useMemo(() => {
    return usuarios.filter(u => {
      const areaMatch = u.area_nombre?.toUpperCase().includes('CMU') || u.area_id === 'a-5' || u.area_id === 'a-5-1' || u.area_id === 'a-5-2' || u.area_id === 'a-5-3';
      const rolMatch = ROLES_CMU_OFICIALES.some(r => 
        u.rol_nombre?.toLowerCase() === r.toLowerCase() ||
        (r === 'Producción' && u.rol_nombre?.toLowerCase().includes('producci'))
      );
      return areaMatch || rolMatch;
    });
  }, [usuarios]);

  // 5. Filtrar las tareas que vencen en la semana seleccionada
  const tareasDeLaSemana = useMemo(() => {
    return tareas.filter(t => {
      if (!t.fecha_vencimiento) return false;
      return t.fecha_vencimiento >= rangoSemana.lunesStr && t.fecha_vencimiento <= rangoSemana.domingoStr;
    });
  }, [tareas, rangoSemana]);

  // 6. Computar la carga de trabajo semanal por cada colaborador del CMU
  const dataMiembros = useMemo(() => {
    return miembrosCMU.map(m => {
      // Normalizar el rol del miembro dentro de los 4 roles CMU
      let rolNormalizado: RolCmuNombre = 'Diseño';
      const rolUpper = (m.rol_nombre || '').toUpperCase();
      if (rolUpper.includes('MULTIMEDIA')) rolNormalizado = 'Multimedia';
      else if (rolUpper.includes('SOPORTE')) rolNormalizado = 'Soporte';
      else if (rolUpper.includes('PRODUCCI')) rolNormalizado = 'Producción';
      else if (rolUpper.includes('DISEÑO') || rolUpper.includes('DISENO')) rolNormalizado = 'Diseño';

      // Tareas asignadas al miembro esta semana (como Principal o como Secundario)
      const tareasAsignadas = tareasDeLaSemana.filter(t => {
        const esPrincipal = t.responsable_id === m.id;
        const esSecundario = t.responsable_secundario_id === m.id;
        return esPrincipal || esSecundario;
      });

      // Regla Requerimiento: "Cuando una tarea tiene Responsable Principal y Segundo Responsable 
      // ambos asumen el 100% de las horas ya que ambos van a invertir ese tiempo en cumplir la tarea."
      let horasEstimadasTotal = 0;
      let horasInvertidasTotal = 0;

      tareasAsignadas.forEach(t => {
        horasEstimadasTotal += Number(t.tiempo_estimado || 0);
        if (t.responsable_id === m.id) {
          horasInvertidasTotal += Number(t.tiempo_invertido || 0);
        } else if (t.responsable_secundario_id === m.id) {
          horasInvertidasTotal += Number(t.tiempo_invertido_secundario || 0);
        }
      });

      const horasLimite = getLimiteRol(rolNormalizado);
      const porcentajeOcupacion = horasLimite > 0 ? Math.round((horasEstimadasTotal / horasLimite) * 100) : 0;

      // Estado de semáforo
      let estadoSaturacion: 'disponible' | 'optimo' | 'sobrecarga' = 'disponible';
      if (porcentajeOcupacion > 100) {
        estadoSaturacion = 'sobrecarga';
      } else if (porcentajeOcupacion >= 80) {
        estadoSaturacion = 'optimo';
      }

      return {
        usuario: m,
        rolNormalizado,
        tareas: tareasAsignadas,
        horasEstimadasTotal,
        horasInvertidasTotal,
        horasLimite,
        porcentajeOcupacion,
        estadoSaturacion,
      };
    });
  }, [miembrosCMU, tareasDeLaSemana, capacidades]);

  // Filtrar miembros según el filtro de rol seleccionado
  const miembrosFiltrados = useMemo(() => {
    if (filtroRol === 'todos') return dataMiembros;
    return dataMiembros.filter(d => d.rolNormalizado === filtroRol);
  }, [dataMiembros, filtroRol]);

  // KPIs Generales del CMU en la semana
  const kpis = useMemo(() => {
    const totalCapacidadHoras = dataMiembros.reduce((acc, m) => acc + m.horasLimite, 0);
    const totalHorasEstimadas = dataMiembros.reduce((acc, m) => acc + m.horasEstimadasTotal, 0);
    const totalHorasInvertidas = dataMiembros.reduce((acc, m) => acc + m.horasInvertidasTotal, 0);
    const totalTareasSemana = tareasDeLaSemana.length;
    const miembrosSobrecargados = dataMiembros.filter(m => m.estadoSaturacion === 'sobrecarga').length;
    const porcentajeGlobal = totalCapacidadHoras > 0 ? Math.round((totalHorasEstimadas / totalCapacidadHoras) * 100) : 0;

    return {
      totalCapacidadHoras,
      totalHorasEstimadas,
      totalHorasInvertidas,
      totalTareasSemana,
      miembrosSobrecargados,
      porcentajeGlobal,
    };
  }, [dataMiembros, tareasDeLaSemana]);

  // Guardar configuración de límites (Solo Admin)
  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoConfig(true);
    setMensajeExito(null);

    const promesas = ROLES_CMU_OFICIALES.map(rol => {
      const horas = formCapacidades[rol] || 40;
      return updateCmuCapacidadRolDB(rol, horas);
    });

    await Promise.all(promesas);

    // Recargar
    const nuevas = await fetchCmuCapacidadRolesDB();
    setCapacidades(nuevas);
    setGuardandoConfig(false);
    setMensajeExito('¡Límites de horas semanales actualizados exitosamente!');
    setTimeout(() => {
      setMensajeExito(null);
      setIsConfigModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Barra Superior de Control de Semanas y Acción de Administrador */}
      <div className="ccv-card p-5 bg-white border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Selector Temporal de Semana */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={handleSemanaAnterior}
              className="p-1.5 rounded-lg text-charcoal-600 hover:bg-white hover:text-charcoal-900 transition-all"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleSemanaActual}
              className="px-3 py-1 rounded-lg text-xs font-black text-slate-800 hover:bg-white transition-all"
            >
              Hoy
            </button>
            <button
              onClick={handleSemanaSiguiente}
              className="p-1.5 rounded-lg text-charcoal-600 hover:bg-white hover:text-charcoal-900 transition-all"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-charcoal-500 block">
                Semana de Trabajo ({rangoSemana.lunesStr} al {rangoSemana.domingoStr})
              </span>
              <span className="text-sm font-black text-charcoal-900">
                {rangoSemana.label}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones: Filtro de Rol y Botón Admin */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Filtro rápido por rol */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFiltroRol('todos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filtroRol === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({miembrosCMU.length})
            </button>
            {ROLES_CMU_OFICIALES.map(rol => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filtroRol === rol ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rol}
              </button>
            ))}
          </div>

          {/* Botón Exclusivo de Admin */}
          {isAdmin && (
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Límites Semanales (Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas KPI de Resumen Global de Capacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capacidad Total Instalada */}
        <div className="ccv-card p-5 bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Capacidad Total CMU</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-charcoal-900">{kpis.totalCapacidadHoras}</span>
              <span className="text-xs font-extrabold text-charcoal-500">hrs/sem</span>
            </div>
            <p className="text-[10px] text-charcoal-500 mt-0.5">
              {miembrosCMU.length} miembros activos en el CMU
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Carga Estimada Comprometida */}
        <div className="ccv-card p-5 bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Carga Comprometida</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-sky-700">{kpis.totalHorasEstimadas}</span>
              <span className="text-xs font-extrabold text-charcoal-500">hrs estimadas</span>
            </div>
            <p className="text-[10px] text-charcoal-500 mt-0.5">
              {kpis.totalTareasSemana} tareas con vencimiento esta semana
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Tasa de Ocupación Global */}
        <div className="ccv-card p-5 bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Ocupación Global</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-black ${
                kpis.porcentajeGlobal > 100 ? 'text-rose-600' :
                kpis.porcentajeGlobal >= 80 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {kpis.porcentajeGlobal}%
              </span>
              <span className="text-xs font-extrabold text-charcoal-500">del tope</span>
            </div>
            <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full rounded-full ${
                  kpis.porcentajeGlobal > 100 ? 'bg-rose-500' :
                  kpis.porcentajeGlobal >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(kpis.porcentajeGlobal, 100)}%` }}
              />
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            kpis.porcentajeGlobal > 100 ? 'bg-rose-50 text-rose-600' :
            kpis.porcentajeGlobal >= 80 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Estado de Sobrecarga / Balance */}
        <div className="ccv-card p-5 bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Balance del Equipo</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-black ${kpis.miembrosSobrecargados > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {kpis.miembrosSobrecargados}
              </span>
              <span className="text-xs font-extrabold text-charcoal-500">con sobrecarga</span>
            </div>
            <p className="text-[10px] text-charcoal-500 mt-0.5">
              {kpis.miembrosSobrecargados > 0 
                ? 'Requiere redistribuir entregables' 
                : 'Carga balanceada y dentro del límite'}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            kpis.miembrosSobrecargados > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {kpis.miembrosSobrecargados > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Grid Principal de Colaboradores del CMU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-charcoal-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sage-600" />
            <span>Capacidad y Asignación por Colaborador del CMU</span>
          </h3>
          <span className="text-xs text-charcoal-500 font-medium">
            Horas estimadas al 100% para cada rol asignado
          </span>
        </div>

        {miembrosFiltrados.length === 0 ? (
          <div className="ccv-card p-12 bg-white text-center border border-stone-200">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h4 className="text-base font-extrabold text-charcoal-800">No se encontraron miembros para el rol seleccionado</h4>
            <p className="text-xs text-charcoal-500 mt-1">Asegúrate de que los usuarios tengan asignado el rol correspondiente en el área CMU.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {miembrosFiltrados.map(item => {
              const esExpandido = miembroExpandidoId === item.usuario.id;
              
              // Color de badges y barras según saturación
              const colorInfo = item.estadoSaturacion === 'sobrecarga'
                ? { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500', label: 'Sobrecarga (>100%)' }
                : item.estadoSaturacion === 'optimo'
                ? { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500', label: 'Carga Alta / Óptima' }
                : { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', label: 'Capacidad Disponible' };

              return (
                <div 
                  key={item.usuario.id}
                  className="ccv-card bg-white border border-stone-200 shadow-xs transition-all overflow-hidden"
                >
                  {/* Tarjeta Resumen */}
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Identificación del Miembro */}
                    <div className="flex items-center gap-3.5 min-w-[260px]">
                      <img
                        src={item.usuario.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={item.usuario.nombre_completo}
                        className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shadow-2xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-charcoal-900 text-sm">
                            {item.usuario.nombre_completo}
                          </h4>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            {item.rolNormalizado}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          {item.usuario.email}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Progreso y Carga */}
                    <div className="flex-1 max-w-xl">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-charcoal-900">
                            {item.horasEstimadasTotal}h / {item.horasLimite}h
                          </span>
                          <span className="text-[11px] text-charcoal-500 font-medium">
                            (Tope semanal fijo)
                          </span>
                        </div>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                          {item.porcentajeOcupacion}% — {colorInfo.label}
                        </span>
                      </div>

                      {/* Barra Visual */}
                      <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colorInfo.bar}`}
                          style={{ width: `${Math.min(item.porcentajeOcupacion, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-charcoal-500 font-medium mt-1">
                        <span>Horas reales invertidas: <strong className="text-charcoal-800">{item.horasInvertidasTotal}h</strong></span>
                        <span>{item.tareas.length} tarea(s) esta semana</span>
                      </div>
                    </div>

                    {/* Botón para desplegar tareas */}
                    <div className="shrink-0 flex items-center justify-end">
                      <button
                        onClick={() => setMiembroExpandidoId(esExpandido ? null : item.usuario.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                          esExpandido 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-stone-50 text-charcoal-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <span>{esExpandido ? 'Ocultar Tareas' : `Ver Tareas (${item.tareas.length})`}</span>
                        {esExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Acordeón de Tareas Asignadas */}
                  {esExpandido && (
                    <div className="border-t border-stone-100 bg-stone-50/60 p-5 animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-extrabold text-charcoal-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-sage-600" />
                          <span>Entregables que componen la carga semanal ({item.tareas.length}):</span>
                        </h5>
                        <span className="text-[11px] text-charcoal-500">
                          Vencen entre {rangoSemana.lunesStr} y {rangoSemana.domingoStr}
                        </span>
                      </div>

                      {item.tareas.length === 0 ? (
                        <div className="p-4 bg-white rounded-xl border border-stone-200 text-center text-xs text-charcoal-500 font-medium">
                          Este colaborador no tiene tareas programadas para vencer en la semana seleccionada.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.tareas.map(t => {
                            const esPrincipal = t.responsable_id === item.usuario.id;
                            return (
                              <div
                                key={t.id}
                                className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                      {t.tipo_tarea}
                                    </span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      t.estado === 'Completada' ? 'bg-emerald-100 text-emerald-800' :
                                      t.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                                      t.estado === 'En Revisión' ? 'bg-amber-100 text-amber-800' :
                                      'bg-stone-100 text-stone-700'
                                    }`}>
                                      {t.estado}
                                    </span>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                                      {esPrincipal ? '⭐ Responsable Principal' : '👥 Segundo Responsable'}
                                    </span>
                                  </div>
                                  <h6 className="text-xs font-bold text-charcoal-900">
                                    {t.titulo}
                                  </h6>
                                  <p className="text-[11px] text-charcoal-500">
                                    {t.curso_nombre || t.proyecto_nombre || 'Asignación General CCV'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                                  <div>
                                    <div className="text-xs font-extrabold text-charcoal-900 flex items-center gap-1 sm:justify-end">
                                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Est: <strong>{t.tiempo_estimado || 0} hrs</strong></span>
                                    </div>
                                    <span className="text-[10px] text-charcoal-500 block">
                                      Vence: {t.fecha_vencimiento}
                                    </span>
                                  </div>

                                  {onSelectTask && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectTask(t)}
                                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 transition-colors shadow-2xs cursor-pointer"
                                      title="Abrir detalles de la tarea"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIGURACIÓN EXCLUSIVA DE ADMINISTRADOR */}
      {isConfigModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="ccv-card w-full max-w-lg bg-white shadow-floating border border-stone-300 rounded-3xl overflow-hidden">
            {/* Cabecera */}
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-cream-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-charcoal-900">
                    Límites Semanales de Horas CMU
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Gestión exclusiva del Administrador para control de carga
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-charcoal-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarConfig} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <p className="text-[11px] leading-relaxed">
                  Define el número máximo de horas de trabajo asignable por semana para cada rol del área CMU. Si un colaborador supera este número de horas en una semana, el sistema emitirá una alerta visual de sobrecarga.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {ROLES_CMU_OFICIALES.map(rol => (
                  <div key={rol} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <h5 className="font-extrabold text-charcoal-900 text-xs">{rol}</h5>
                      <span className="text-[10px] text-charcoal-500">Rol del área CMU</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="168"
                        step="1"
                        required
                        value={formCapacidades[rol] ?? 40}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormCapacidades(prev => ({ ...prev, [rol]: val }));
                        }}
                        className="w-20 p-2 rounded-xl border border-stone-300 text-center font-black text-xs text-charcoal-900 focus:ring-2 focus:ring-slate-800 focus:outline-none bg-white"
                      />
                      <span className="font-extrabold text-charcoal-600">hrs/sem</span>
                    </div>
                  </div>
                ))}
              </div>

              {mensajeExito && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-bold text-xs animate-fadeIn flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{mensajeExito}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoConfig}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{guardandoConfig ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
