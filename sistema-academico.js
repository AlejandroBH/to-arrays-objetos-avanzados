// Base de datos de estudiantes
const estudiantes = [
  {
    id: 1,
    nombre: "Ana García",
    edad: 22,
    carrera: "Ingeniería Informática",
    calificaciones: [
      { asignatura: "Matemáticas", nota: 8.5, creditos: 6 },
      { asignatura: "Programación", nota: 9.0, creditos: 8 },
      { asignatura: "Bases de Datos", nota: 7.5, creditos: 4 },
    ],
    activo: true,
  },
  {
    id: 2,
    nombre: "Carlos López",
    edad: 24,
    carrera: "Ingeniería Informática",
    calificaciones: [
      { asignatura: "Matemáticas", nota: 6.0, creditos: 6 },
      { asignatura: "Programación", nota: 8.5, creditos: 8 },
      { asignatura: "Redes", nota: 7.0, creditos: 5 },
    ],
    activo: true,
  },
  {
    id: 3,
    nombre: "María Rodríguez",
    edad: 21,
    carrera: "Arquitectura",
    calificaciones: [
      { asignatura: "Dibujo Técnico", nota: 9.5, creditos: 4 },
      { asignatura: "Historia del Arte", nota: 8.0, creditos: 3 },
    ],
    activo: false,
  },
];

// Sistema de análisis académico
const AnalizadorAcademico = {
  // Calcular promedio ponderado por estudiante
  calcularPromedioPonderado(estudiante) {
    const { calificaciones } = estudiante;
    const totalCreditos = calificaciones.reduce(
      (sum, cal) => sum + cal.creditos,
      0
    );
    const sumaPonderada = calificaciones.reduce(
      (sum, cal) => sum + cal.nota * cal.creditos,
      0
    );

    return totalCreditos > 0 ? sumaPonderada / totalCreditos : 0;
  },

  // Obtener mejores estudiantes por carrera
  mejoresPorCarrera(estudiantes, limite = 3) {
    // Agrupar por carrera
    const porCarrera = estudiantes.reduce((grupos, estudiante) => {
      const carrera = estudiante.carrera;
      if (!grupos[carrera]) grupos[carrera] = [];
      grupos[carrera].push({
        ...estudiante,
        promedio: this.calcularPromedioPonderado(estudiante),
      });
      return grupos;
    }, {});

    // Ordenar y limitar por carrera
    const resultado = {};
    for (const [carrera, estudiantesCarrera] of Object.entries(porCarrera)) {
      resultado[carrera] = estudiantesCarrera
        .sort((a, b) => b.promedio - a.promedio)
        .slice(0, limite);
    }

    return resultado;
  },

  // Analizar rendimiento por asignatura
  analizarAsignaturas(estudiantes) {
    // Aplanar todas las calificaciones
    const todasCalificaciones = estudiantes.flatMap((estudiante) =>
      estudiante.calificaciones.map((cal) => ({
        asignatura: cal.asignatura,
        nota: cal.nota,
        estudiante: estudiante.nombre,
        carrera: estudiante.carrera,
      }))
    );

    // Agrupar por asignatura
    const porAsignatura = todasCalificaciones.reduce((grupos, cal) => {
      const asignatura = cal.asignatura;
      if (!grupos[asignatura]) {
        grupos[asignatura] = [];
      }
      grupos[asignatura].push(cal);
      return grupos;
    }, {});

    // Calcular estadísticas por asignatura
    return Object.entries(porAsignatura).map(([asignatura, calificaciones]) => {
      const notas = calificaciones.map((c) => c.nota);
      const promedio =
        notas.reduce((sum, nota) => sum + nota, 0) / notas.length;

      return {
        asignatura,
        promedio: Math.round(promedio * 100) / 100,
        estudiantes: calificaciones.length,
        maxNota: Math.max(...notas),
        minNota: Math.min(...notas),
        carreras: [...new Set(calificaciones.map((c) => c.carrera))],
      };
    });
  },

  // Generar reportes personalizados
  generarReporte(estudiante) {
    const promedio = this.calcularPromedioPonderado(estudiante);
    const { calificaciones } = estudiante;

    // Destructuring avanzado
    const {
      nombre,
      edad,
      carrera,
      activo,
      calificaciones: [
        primeraCalificacion,
        segundaCalificacion,
        ...restoCalificaciones
      ] = [],
    } = estudiante;

    return {
      estudiante: { nombre, edad, carrera, activo },
      rendimiento: {
        promedio,
        totalAsignaturas: calificaciones.length,
        mejorNota: Math.max(...calificaciones.map((c) => c.nota)),
        peorNota: Math.min(...calificaciones.map((c) => c.nota)),
        asignaturasAprobadas: calificaciones.filter((c) => c.nota >= 7).length,
      },
      detalle: {
        primeraAsignatura: primeraCalificacion,
        segundaAsignatura: segundaCalificacion,
        otrasAsignaturas: restoCalificaciones.length,
      },
    };
  },
};

// Demostración del sistema
console.log("🎓 SISTEMA DE ANÁLISIS ACADÉMICO\n");

// 1. Calcular promedios individuales
console.log("📊 PROMEDIOS INDIVIDUALES:");
const promedios = estudiantes.map((estudiante) => ({
  nombre: estudiante.nombre,
  promedio:
    Math.round(
      AnalizadorAcademico.calcularPromedioPonderado(estudiante) * 100
    ) / 100,
}));

promedios.forEach(({ nombre, promedio }) => {
  console.log(`${nombre}: ${promedio}`);
});

// 2. Mejores estudiantes por carrera
console.log("\n🏆 MEJORES ESTUDIANTES POR CARRERA:");
const mejores = AnalizadorAcademico.mejoresPorCarrera(estudiantes, 2);

Object.entries(mejores).forEach(([carrera, estudiantesCarrera]) => {
  console.log(`\n${carrera}:`);
  estudiantesCarrera.forEach(({ nombre, promedio }, index) => {
    console.log(`  ${index + 1}. ${nombre} (${promedio})`);
  });
});

// 3. Análisis por asignaturas
console.log("\n📚 ANÁLISIS POR ASIGNATURAS:");
const analisisAsignaturas =
  AnalizadorAcademico.analizarAsignaturas(estudiantes);

analisisAsignaturas.forEach((asignatura) => {
  console.log(`${asignatura.asignatura}:`);
  console.log(`  Promedio: ${asignatura.promedio}`);
  console.log(`  Estudiantes: ${asignatura.estudiantes}`);
  console.log(`  Rango: ${asignatura.minNota} - ${asignatura.maxNota}`);
  console.log(`  Carreras: ${asignatura.carreras.join(", ")}\n`);
});

// 4. Reporte detallado de un estudiante
console.log("📋 REPORTE DETALLADO:");
const reporte = AnalizadorAcademico.generarReporte(estudiantes[0]);
console.log(JSON.stringify(reporte, null, 2));

// 5. Operaciones funcionales avanzadas
console.log("\n🔧 OPERACIONES FUNCIONALES AVANZADAS:");

// Filtrar estudiantes activos con buen rendimiento
const estudiantesDestacados = estudiantes
  .filter((estudiante) => estudiante.activo)
  .map((estudiante) => ({
    ...estudiante,
    promedio: AnalizadorAcademico.calcularPromedioPonderado(estudiante),
  }))
  .filter((estudiante) => estudiante.promedio >= 8.0)
  .sort((a, b) => b.promedio - a.promedio);

console.log("Estudiantes destacados (activos, promedio >= 8.0):");
estudiantesDestacados.forEach(({ nombre, promedio }) => {
  console.log(`- ${nombre}: ${promedio}`);
});

// Estadísticas generales
const estadisticasGenerales = estudiantes.reduce(
  (stats, estudiante) => {
    stats.total++;
    stats.activos += estudiante.activo ? 1 : 0;
    stats.totalCalificaciones += estudiante.calificaciones.length;

    const promedio = AnalizadorAcademico.calcularPromedioPonderado(estudiante);
    stats.promedioGeneral =
      (stats.promedioGeneral * (stats.total - 1) + promedio) / stats.total;

    return stats;
  },
  {
    total: 0,
    activos: 0,
    totalCalificaciones: 0,
    promedioGeneral: 0,
  }
);

console.log("\n📈 ESTADÍSTICAS GENERALES:");
console.log(`Total estudiantes: ${estadisticasGenerales.total}`);
console.log(`Estudiantes activos: ${estadisticasGenerales.activos}`);
console.log(
  `Total calificaciones: ${estadisticasGenerales.totalCalificaciones}`
);
console.log(
  `Promedio general: ${
    Math.round(estadisticasGenerales.promedioGeneral * 100) / 100
  }`
);

console.log("\n✅ Sistema de análisis académico completado exitosamente!");
