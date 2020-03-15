const API = 'https://cotizaciones-brou.herokuapp.com/api/'; // descargamos la cotización desde la instancia Heroku de gmanriqueUY (https://github.com/gmanriqueUy/cotizaciones-brou/)
// API/currency/:fecha devuelve cotización más cercana a :fecha
async function usd_at_date(date_check) {
    console.log(date_check);
    var request = await fetch(API + 'currency/' + date_check.getFullYear() + '-' + (date_check.getMonth()+1) + '-' + date_check.getDate());
    var values = await request.json();
    return values.rates.USD.sell;
}

// API/currency/latest devuelve cotizaciones más recientes
async function latest_usd() {
    var request = await fetch(API + 'currency/latest');
    var values = await request.json();
    return values.rates.USD.sell;
}


var cache = {}; //

async function get_cache(date) {
    if (!('current' in cache)) // casi python: asegurar que cache contiene clave K es (k in cache). asegurar que no la contiene es !(k in cache)
	cache.current = await latest_usd();
    if (!(date in cache))
	cache[date] = await usd_at_date(date);
}

async function monetary_fail(x, date) {
    await get_cache(date); // esperar a que estén las monedas cargadas
    current_usd = x / cache.current; // convertir el salario a dolares
    previous_usd = x / cache[date]; // con ambas tasas
    difference = current_usd - previous_usd;
    str_difference = (difference < 0 ?
		      'perdido' : 'ganado') + ' ' + difference; // si algún día baja el dólar, van a haber *ganado* salario real. no va a pasar pero bueno xd
    return {'cur_usd': current_usd, 'prev_usd': previous_usd, 'difference': str_difference, 'start-date-span': date.toLocaleDateString(),
	    'pesos-old': cache[date], 'pesos-new': cache.current, 'diff-dolares': difference}; // esto es sucio pt 1
}

function calculate_salary()
{
    var salario_pesos = 0;
    salario_pesos = Number.parseInt(document.getElementById('salario').value);
    if(salario_pesos === NaN) salario_pesos = 0;
    fecha_inicio = document.getElementById('start-date').valueAsDate;
    // llamada asincronica
    monetary_fail(salario_pesos, fecha_inicio).then(x => {
	for(let i of Object.keys(x)) {
	    document.getElementById(i).innerText = x[i]; // esto es sucio pt 2
	}
	// d-none en bootstrap esconde objetos (style.disply = none)
	document.getElementById('explanation').classList.remove('d-none');
    });
    
}

function setup_handlers() {
    document.getElementById('salario').addEventListener('change', calculate_salary);
    document.getElementById('start-date').addEventListener('change', calculate_salary);
}
