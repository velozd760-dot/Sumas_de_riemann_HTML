// --- 1. LÓGICA DE LAS PESTAÑAS (GLOBAL E INDESTRUCTIBLE) ---
function abrirPestana(evt, nombrePestana) {
    try {
        let i, contenidoPestana, btnPestana;

        contenidoPestana = document.getElementsByClassName("contenido-pestana");
        for (i = 0; i < contenidoPestana.length; i++) {
            contenidoPestana[i].style.display = "none";
        }

        btnPestana = document.getElementsByClassName("btn-pestana");
        for (i = 0; i < btnPestana.length; i++) {
            btnPestana[i].className = btnPestana[i].className.replace(" activo", "");
        }

        const pestanaObjetivo = document.getElementById(nombrePestana);
        if (pestanaObjetivo) {
            pestanaObjetivo.style.display = "block";
        }
        
        if (evt && evt.currentTarget) {
            evt.currentTarget.className += " activo";
        }

        if (typeof actualizarGrafica === 'function') {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                actualizarGrafica(); 
            }, 50);
        }
    } catch (e) {
        console.error("Ignorando error de pestañas:", e);
    }
}

let actualizarGrafica;

// --- 2. LÓGICA MATEMÁTICA Y DE LA GRÁFICA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Búsqueda robusta de elementos
    const selFuncion = document.getElementById('funcion') || document.getElementById('casoEstudio');
    const inA = document.getElementById('valA') || document.getElementById('inicio');
    const inB = document.getElementById('valB') || document.getElementById('fin');
    const inN = document.getElementById('rectangulos') || document.getElementById('slider');
    const selMetodo = document.getElementById('metodo') || document.getElementById('evaluacion');
    const txtNumRect = document.getElementById('numRectVisual') || document.getElementById('txtN');
    const txtResultado = document.getElementById('resultado') || document.getElementById('txtResultado');
    const panelDidactico = document.getElementById('mensajeDidactico') || document.getElementById('leccion');

    // Diccionario de funciones
    const funcionesMath = {
        'lineal': (x) => x + 2,
        'cuadratica': (x) => x * x,
        'cubica': (x) => x * x * x,
        'raiz': (x) => Math.sqrt(Math.abs(x)),
        'exponencial': (x) => Math.exp(x),
        'trigonometrica': (x) => Math.sin(x) + 2, 
        'gaussiana': (x) => Math.exp(-x * x),
        'absoluto': (x) => Math.abs(x)
    };

    // Diccionario de mensajes de la Función
    const mensajesLeccion = {
        'lineal': '💡 <strong>Lección:</strong> La función lineal es perfecta para comprobar tus cálculos. El área bajo esta recta forma figuras geométricas simples.',
        'cuadratica': '💡 <strong>Lección:</strong> Con la curva parabólica notarás claramente cómo los rectángulos dejan "huecos" o se "pasan" del área real.',
        'cubica': '💡 <strong>Lección:</strong> Las funciones cúbicas pueden tener áreas negativas si cruzan el eje X. ¿Qué pasa si pones el inicio (a) en un número negativo?',
        'raiz': '💡 <strong>Lección:</strong> La curva de la raíz cuadrada crece muy rápido al principio y luego se aplana.',
        'exponencial': '💡 <strong>Lección:</strong> ¡Crecimiento explosivo! Aquí verás que un extremo falla por muchísimo si usas pocos rectángulos.',
        'trigonometrica': '💡 <strong>Lección:</strong> Las ondas son ideales para ver cómo los errores se comportan en las subidas y bajadas.',
        'gaussiana': '💡 <strong>Lección:</strong> La famosa Campana de Gauss. Su área total es muy importante en probabilidad y estadística.',
        'absoluto': '💡 <strong>Lección:</strong> El valor absoluto crea un "pico" afilado. Fíjate qué sucede cerca del vértice central.'
    };

    // Diccionario de Tips del Método
    const mensajesMetodo = {
        'izquierda': '🔹 <strong>Tip de Evaluación:</strong> Usas el lado izquierdo. Fíjate si los rectángulos quedan por debajo o por encima de la curva.',
        'derecha': '🔹 <strong>Tip de Evaluación:</strong> Usas el lado derecho. Compara cómo cambia el área sobrante respecto al método izquierdo.',
        'medio': '⭐ <strong>Tip del Punto Medio:</strong> ¡El más exacto! Al tomar la mitad, el triangulito que sobra de un lado suele compensar al que falta del otro.'
    };

    // Valores por defecto
    const rangosPorDefecto = {
        'lineal': { a: 0, b: 5 },
        'cuadratica': { a: -2, b: 2 },
        'cubica': { a: -2, b: 2 },
        'raiz': { a: 0, b: 4 },
        'exponencial': { a: -1, b: 2 },
        'trigonometrica': { a: 0, b: 6.28 }, 
        'gaussiana': { a: -3, b: 3 },
        'absoluto': { a: -3, b: 3 }
    };

    actualizarGrafica = function() {
        try { // BLINDAJE CONTRA ERRORES
            if (!selFuncion || !inA || !inB || !inN || !selMetodo) return;

            // Extracción de texto súper segura
            let rawValue = String(selFuncion.value || '').toLowerCase();
            let claveFuncion = 'lineal';
            if (rawValue.includes('lineal')) claveFuncion = 'lineal';
            else if (rawValue.includes('cuad')) claveFuncion = 'cuadratica';
            else if (rawValue.includes('cub') || rawValue.includes('cúb')) claveFuncion = 'cubica';
            else if (rawValue.includes('raiz') || rawValue.includes('raíz')) claveFuncion = 'raiz';
            else if (rawValue.includes('exp')) claveFuncion = 'exponencial';
            else if (rawValue.includes('trig')) claveFuncion = 'trigonometrica';
            else if (rawValue.includes('gauss')) claveFuncion = 'gaussiana';
            else if (rawValue.includes('abs')) claveFuncion = 'absoluto';

            let f = funcionesMath[claveFuncion] || funcionesMath['lineal'];
            let a = parseFloat(inA.value);
            let b = parseFloat(inB.value);
            let n = parseInt(inN.value);
            
            // Extracción de método súper segura
            let metodoRaw = String(selMetodo.value || '').toLowerCase();
            let claveMetodo = 'medio';
            if (metodoRaw.includes('izq')) claveMetodo = 'izquierda';
            else if (metodoRaw.includes('der')) claveMetodo = 'derecha';

            if (isNaN(a) || isNaN(b) || a >= b || isNaN(n) || n < 1) return;

            if (txtNumRect) txtNumRect.textContent = n;
            
            if (panelDidactico) {
                let msgF = mensajesLeccion[claveFuncion] || '';
                let msgM = mensajesMetodo[claveMetodo] || '';
                panelDidactico.innerHTML = `<p style="margin-bottom: 8px;">${msgF}</p><p>${msgM}</p>`;
            }

            let dx = (b - a) / n;
            let areaSuma = 0;
            let datosGrafico = [];

            for (let i = 0; i < n; i++) {
                let xInicio = a + i * dx;
                let xFin = a + (i + 1) * dx;
                let xEval = (claveMetodo === 'izquierda') ? xInicio : (claveMetodo === 'derecha') ? xFin : xInicio + dx / 2; 

                let altura = f(xEval);
                areaSuma += altura * dx;

                datosGrafico.push({
                    x: [xInicio, xFin, xFin, xInicio, xInicio],
                    y: [0, 0, altura, altura, 0],
                    fill: 'toself',
                    fillcolor: 'rgba(14, 165, 233, 0.5)', 
                    line: { color: 'rgba(14, 165, 233, 0.8)', width: 1 },
                    type: 'scatter', 
                    mode: 'lines', 
                    hoverinfo: 'skip'
                });
            }

            if (txtResultado) txtResultado.textContent = areaSuma.toFixed(4) + " u²";

            let xCurva = [], yCurva = [];
            let margen = (b - a) * 0.1; 
            let plotA = a - margen;
            let plotB = b + margen;

            for (let i = 0; i <= 200; i++) {
                let x = plotA + i * ((plotB - plotA) / 200);
                xCurva.push(x);
                yCurva.push(f(x));
            }

            let trazoCurva = {
                x: xCurva, y: yCurva, mode: 'lines', line: { color: '#1e293b', width: 3 }, name: 'Función'
            };

            // TÍTULO GRANDE Y LLAMATIVO
            let layout = {
                title: {
                    text: '<b>Área bajo la curva (Sumas de Riemann)</b>',
                    font: { family: 'Arial, sans-serif', size: 24, color: '#2563eb' },
                    y: 0.95
                },
                autosize: true,
                xaxis: { title: 'Eje X', range: [plotA, plotB], zeroline: true, zerolinecolor: '#94a3b8', gridcolor: '#f1f5f9' },
                yaxis: { title: 'Eje Y', zeroline: true, zerolinecolor: '#94a3b8', gridcolor: '#f1f5f9' },
                margin: { l: 50, r: 20, b: 50, t: 70 },
                showlegend: false, plot_bgcolor: '#ffffff', paper_bgcolor: '#ffffff', dragmode: 'pan'
            };

            const divGrafico = document.getElementById('grafico');
            // Verificamos que Plotly ya haya cargado antes de dibujar
            if (divGrafico && typeof Plotly !== 'undefined') {
                 Plotly.react('grafico', [trazoCurva, ...datosGrafico], layout, {responsive: true});
            }
        } catch (error) {
            console.error("El simulador atrapó un error, pero no se congelará:", error);
        }
    };

    // --- 3. ASIGNACIÓN SEGURA DE EVENTOS ---
    if (selFuncion) {
        selFuncion.addEventListener('change', () => {
            try {
                let rawValue = String(selFuncion.value || '').toLowerCase();
                let clave = 'lineal';
                if (rawValue.includes('lineal')) clave = 'lineal';
                else if (rawValue.includes('cuad')) clave = 'cuadratica';
                else if (rawValue.includes('cub') || rawValue.includes('cúb')) clave = 'cubica';
                else if (rawValue.includes('raiz') || rawValue.includes('raíz')) clave = 'raiz';
                else if (rawValue.includes('exp')) clave = 'exponencial';
                else if (rawValue.includes('trig')) clave = 'trigonometrica';
                else if (rawValue.includes('gauss')) clave = 'gaussiana';
                else if (rawValue.includes('abs')) clave = 'absoluto';

                if (rangosPorDefecto[clave]) {
                    if (inA) inA.value = rangosPorDefecto[clave].a;
                    if (inB) inB.value = rangosPorDefecto[clave].b;
                }
                actualizarGrafica();
            } catch (e) {
                console.error("Error al cambiar función, ignorado.", e);
            }
        });
        selFuncion.addEventListener('input', actualizarGrafica);
    }

    if (inA) inA.addEventListener('input', actualizarGrafica);
    if (inB) inB.addEventListener('input', actualizarGrafica);
    if (inN) inN.addEventListener('input', actualizarGrafica);
    if (selMetodo) selMetodo.addEventListener('input', actualizarGrafica);
    
    // Retraso intencional de 100ms para asegurar que la página y Plotly estén 100% listos
    setTimeout(() => {
        try { actualizarGrafica(); } catch (e) {}
    }, 100);
});