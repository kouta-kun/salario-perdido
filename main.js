const API = 'https://cotizaciones-brou.herokuapp.com/api/'; // descargamos la cotización desde la instancia Heroku de gmanriqueUY (https://github.com/gmanriqueUy/cotizaciones-brou/)

// API/currency/latest devuelve cotizaciones más recientes
async function latest_usd() {
    var request = await fetch(API + 'currency/latest');
    var values = await request.json();
    return values.rates.USD.sell;
}

// API/currency/:fecha devuelve cotización más cercana a :fecha
async function usd_at_gov_change() {
    var request = await fetch(API + 'currency/2020-02-29');
    var values = await request.json();
    return values.rates.USD.sell;
}

var cache = {};


async function get_cache() {
    if (!('current' in cache)) // casi python: asegurar que cache contiene clave K es (k in cache). asegurar que no la contiene es !(k in cache)
	cache.current = await latest_usd();
    if (!('previous' in cache))
	cache.previous = await usd_at_gov_change();
}

async function monetary_fail(x) {
    await get_cache(); // esperar a que estén las monedas cargadas
    current_usd = x / cache.current; // convertir el salario a dolares
    previous_usd = x / cache.previous; // con ambas tasas
    difference = current_usd - previous_usd;
    str_difference = (difference < 0 ?
		      'perdido' : 'ganado') + ' ' + difference; // si algún día baja el dólar, van a haber *ganado* salario real. no va a pasar pero bueno xd
    return {'cur_usd': current_usd, 'prev_usd': previous_usd, 'difference': str_difference,
	    'pesos-old': cache.previous, 'pesos-new': cache.current, 'diff-dolares': difference}; // esto es sucio pt 1
}

function calculate_salary()
{
    var salario_pesos = 0;
    salario_pesos = Number.parseInt(document.getElementById('salario').value);
    if(salario_pesos === NaN) salario_pesos = 0;
    // llamada asincronica
    monetary_fail(salario_pesos).then(x => {
	for(let i of Object.keys(x)) {
	    document.getElementById(i).innerText = x[i]; // esto es sucio pt 2
	}
	// d-none en bootstrap esconde objetos (style.disply = none)
	document.getElementById('explanation').classList.remove('d-none');
    });
    
}

function setup_handlers() {
    get_cache();
    document.getElementById('salario').addEventListener('change', calculate_salary);
}
