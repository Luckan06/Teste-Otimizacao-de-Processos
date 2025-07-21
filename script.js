// script.js

// --- CONSTANTES DA API (REESTRUTURADAS POR DOMÍNIO) ---
const API_BASE_URL = 'http://localhost:9000/api';
const API_METRICAS_URL = `${API_BASE_URL}/metricas`;
const API_ASSOCIACOES_URL = `${API_BASE_URL}/associacoes`;
const API_ANALISE_URL = `${API_BASE_URL}/analise`;
const API_OPERADORES_URL = `${API_BASE_URL}/operadores`;
const API_TURNOS_URL = `${API_BASE_URL}/turnos`;
const API_METAS_URL = `${API_BASE_URL}/metas`;


// --- ELEMENTOS DO DOM ---
const linkResultados = document.getElementById('link-resultados');
const linkProcessos = document.getElementById('link-processos');
const linkProgramador = document.getElementById('link-programador');
const linkConfiguracoes = document.getElementById('link-configuracoes');

const secaoResultados = document.getElementById('secao-resultados');
const secaoProcessos = document.getElementById('secao-processos');
const secaoProgramador = document.getElementById('secao-programador');
const secaoConfiguracoes = document.getElementById('secao-configuracoes');

const processoSelect = document.getElementById('processoId');
const processFlowContainer = document.getElementById('process-flow-container');

// Filtros de Data
const dateFilterResultados = document.getElementById('date-filter-resultados');
const btnClearDateResultados = document.getElementById('btn-clear-date-resultados');
const dateFilterProcessos = document.getElementById('date-filter-processos');
const btnClearDateProcessos = document.getElementById('btn-clear-date-processos');

// Operadores
const formAddOperador = document.getElementById('form-add-operador');
const listaOperadores = document.getElementById('lista-operadores');
const formAssociarOperador = document.getElementById('form-associar-operador');
const selectOperadorAssoc = document.getElementById('select-operador-assoc');
const selectProcessoAssoc = document.getElementById('select-processo-assoc');
const listaAssociacoes = document.getElementById('lista-associacoes');

// Turnos
const formGerenciarTurnos = document.getElementById('form-gerenciar-turnos');
const selectGerenciarProcesso = document.getElementById('select-gerenciar-processo');
const listaTurnosCheckboxes = document.getElementById('lista-turnos-checkboxes');

// Registro de Ciclo
const formRegistrarCiclo = document.getElementById('form-registrar-ciclo');
const processoCicloSelect = document.getElementById('processo-ciclo-select');
const duracaoCicloInput = document.getElementById('duracao-ciclo-input');
const refugoCicloInput = document.getElementById('refugo-ciclo-input');
const pecasBoasCicloInput = document.getElementById('pecas-boas-ciclo-input');

// Registro de Parada
const formRegistrarParada = document.getElementById('form-registrar-parada');
const processoParadaSelect = document.getElementById('processo-parada-select');
const motivoParadaSelect = document.getElementById('motivo-parada-select');
const duracaoParadaInput = document.getElementById('duracao-parada-input');

// Registro de Tempo de Troca
const formRegistrarTroca = document.getElementById('form-registrar-troca');
const processoTrocaSelect = document.getElementById('processo-troca-select');
const duracaoTrocaInput = document.getElementById('duracao-troca-input');

// Metas de Produção
const formDefinirMeta = document.getElementById('form-definir-meta');
const metaProcessoSelect = document.getElementById('meta-processo-select');
const metaTurnoSelect = document.getElementById('meta-turno-select');
const metaPecasInput = document.getElementById('meta-pecas-input');
const metaTempoInput = document.getElementById('meta-tempo-input');
const listaMetas = document.getElementById('lista-metas');

// Análise Geral e por Turno
const analiseGeralContainer = document.getElementById('analise-geral-container');
const analiseTurnoContainer = document.getElementById('analise-turno-container');

// OEE, MTTR, MTBF
const oeeGeral = document.getElementById('oee-geral');
const oeeDisponibilidade = document.getElementById('oee-disponibilidade');
const oeePerformance = document.getElementById('oee-performance');
const oeeQualidade = document.getElementById('oee-qualidade');
const oeeMttr = document.getElementById('oee-mttr');
const oeeMtbf = document.getElementById('oee-mtbf');

// --- VARIÁVEIS DE ESTADO ---
let chartRefugo = null;
let chartDisponibilidade = null;
let dataFiltroGlobal = null;


// --- NAVEGAÇÃO ENTRE SEÇÕES ---
function navegarPara(secao) {
    secaoResultados.classList.add('hidden');
    secaoProcessos.classList.add('hidden');
    secaoProgramador.classList.add('hidden');
    secaoConfiguracoes.classList.add('hidden');
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    
    if (secao === 'resultados') {
        secaoResultados.classList.remove('hidden');
        linkResultados.parentElement.classList.add('active');
    } else if (secao === 'processos') {
        secaoProcessos.classList.remove('hidden');
        linkProcessos.parentElement.classList.add('active');
    } else if (secao === 'programador') {
        secaoProgramador.classList.remove('hidden');
        linkProgramador.parentElement.classList.add('active');
    } else if (secao === 'configuracoes') {
        secaoConfiguracoes.classList.remove('hidden');
        linkConfiguracoes.parentElement.classList.add('active');
    }
}

linkResultados.addEventListener('click', (e) => { e.preventDefault(); navegarPara('resultados'); });
linkProcessos.addEventListener('click', (e) => { e.preventDefault(); navegarPara('processos'); });
linkProgramador.addEventListener('click', (e) => { e.preventDefault(); navegarPara('programador'); });
linkConfiguracoes.addEventListener('click', (e) => { e.preventDefault(); navegarPara('configuracoes'); });

// --- FUNÇÕES DE DASHBOARD ---
function formatarDuracao(totalSegundos) {
    if (totalSegundos === null || typeof totalSegundos === 'undefined' || isNaN(totalSegundos)) {
        return '--';
    }
    totalSegundos = Math.round(totalSegundos);
    if (totalSegundos < 60) {
        return `${totalSegundos} s`;
    }
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    let partes = [];
    if (horas > 0) {
        partes.push(`${horas}h`);
    }
    if (minutos > 0) {
        partes.push(`${minutos}min`);
    }
    if (segundos > 0 && horas === 0) { // Mostra segundos só se for menos de 1h
        partes.push(`${segundos}s`);
    }
    return partes.join(' ');
}


function formatarNumero(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return '--';
    return Math.round(valor).toLocaleString('pt-BR');
}

function construirUrlComFiltro(baseUrl, dataFiltro) {
    const url = new URL(baseUrl);
    if (dataFiltro) {
        url.searchParams.append('data', dataFiltro);
    }
    return url.toString();
}

async function carregarDashboard(processoId, dataFiltro = null) {
    console.log(`Buscando dados para o processo "${processoId}" com data "${dataFiltro || 'N/A'}"...`);
    document.getElementById('kpi-ciclo-medio').textContent = 'Carregando...';
    document.getElementById('kpi-troca-media').textContent = 'Carregando...';
    document.getElementById('kpi-refugo').textContent = 'Carregando...';
    document.getElementById('kpi-disponibilidade').textContent = 'Carregando...';

    const encodedProcessoId = encodeURIComponent(processoId);
    const tempoTotalPlanejado = 28800;

    const urlCiclo = construirUrlComFiltro(`${API_METRICAS_URL}/${encodedProcessoId}/ciclo`, dataFiltro);
    const urlTroca = construirUrlComFiltro(`${API_METRICAS_URL}/${encodedProcessoId}/troca`, dataFiltro);
    const urlRefugo = construirUrlComFiltro(`${API_METRICAS_URL}/${encodedProcessoId}/refugo`, dataFiltro);
    const urlDispo = construirUrlComFiltro(`${API_METRICAS_URL}/${encodedProcessoId}/disponibilidade?tempoTotalPlanejadoSegundos=${tempoTotalPlanejado}`, dataFiltro);

    try {
        const [cicloRes, trocaRes, refugoRes, dispoRes] = await Promise.all([
            fetch(urlCiclo),
            fetch(urlTroca),
            fetch(urlRefugo),
            fetch(urlDispo)
        ]);

        const dadosCiclo = cicloRes.ok ? await cicloRes.json() : { media_ciclo_segundos: 0 };
        const dadosTroca = trocaRes.ok ? await trocaRes.json() : { media_troca_segundos: 0 };
        const dadosRefugo = refugoRes.ok ? await refugoRes.json() : { percentual_refugo: 0, total_produzido: 0, total_refugado: 0 };
        const dadosDispo = dispoRes.ok ? await dispoRes.json() : { disponibilidade_percentual: 0, total_parada_segundos: 0, tempo_produtivo_real_segundos: 0 };

        document.getElementById('kpi-ciclo-medio').textContent = formatarDuracao(dadosCiclo.media_ciclo_segundos);
        document.getElementById('kpi-troca-media').textContent = formatarDuracao(dadosTroca.media_troca_segundos);
        document.getElementById('kpi-refugo').textContent = `${dadosRefugo.percentual_refugo.toFixed(2)} %`;
        document.getElementById('kpi-disponibilidade').textContent = `${dadosDispo.disponibilidade_percentual.toFixed(2)} %`;

        atualizarGraficoRefugo(dadosRefugo.total_produzido, dadosRefugo.total_refugado);

        const perdaEstimada = dadosCiclo.media_ciclo_segundos > 0
            ? Math.round(dadosDispo.total_parada_segundos / dadosCiclo.media_ciclo_segundos)
            : 0;

        atualizarGraficoDisponibilidade(
            dadosDispo.tempo_produtivo_real_segundos,
            dadosDispo.total_parada_segundos,
            dadosRefugo.total_produzido,
            perdaEstimada
        );

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        document.getElementById('kpi-ciclo-medio').textContent = 'Erro';
        document.getElementById('kpi-troca-media').textContent = 'Erro';
        document.getElementById('kpi-refugo').textContent = 'Erro';
        document.getElementById('kpi-disponibilidade').textContent = 'Erro';
    }
}

function atualizarGraficoRefugo(produzido, refugado) {
    const ctx = document.getElementById('graficoRefugo').getContext('2d');
    produzido = produzido || 0;
    refugado = refugado || 0;
    const pecasBoas = Math.max(0, produzido - refugado);

    const data = {
        labels: ['Peças Boas', 'Peças Refugadas'],
        datasets: [{ data: [pecasBoas, refugado], backgroundColor: ['#28a745', '#dc3545'], borderWidth: 2 }]
    };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

    if (chartRefugo) {
        chartRefugo.data = data;
        chartRefugo.update();
    } else {
        chartRefugo = new Chart(ctx, { type: 'pie', data, options });
    }

    document.getElementById('summary-refugo-total').textContent = `${formatarNumero(produzido)} peças`;
    document.getElementById('summary-refugo-boas').textContent = `${formatarNumero(pecasBoas)} peças`;
    document.getElementById('summary-refugo-refugadas').textContent = `${formatarNumero(refugado)} peças`;
}

function atualizarGraficoDisponibilidade(tempoProdutivoReal, parada, totalProduzido, perdaEstimada) {
    const ctx = document.getElementById('graficoDisponibilidade').getContext('2d');
    tempoProdutivoReal = tempoProdutivoReal || 0;
    parada = parada || 0;

    const data = {
        labels: ['Tempo Operacional', 'Tempo em Parada'],
        datasets: [{ data: [tempoProdutivoReal, parada], backgroundColor: ['#28a745', '#dc3545'], borderWidth: 2 }]
    };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

    if (chartDisponibilidade) {
        chartDisponibilidade.data = data;
        chartDisponibilidade.update();
    } else {
        chartDisponibilidade = new Chart(ctx, { type: 'pie', data, options });
    }

    document.getElementById('summary-disp-produtivo').textContent = formatarDuracao(tempoProdutivoReal);
    document.getElementById('summary-disp-parada-total').textContent = formatarDuracao(parada);
    document.getElementById('summary-disp-produzidas').textContent = `${formatarNumero(totalProduzido)} peças`;
    document.getElementById('summary-disp-perda').textContent = `${formatarNumero(perdaEstimada)} peças`;
}

function formatarNumeroDecimal(valor, casasDecimais = 2) {
    if (valor === null || valor === undefined || isNaN(valor)) return '--';
    const numero = parseFloat(valor);
    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais,
    });
}

// --- FUNÇÕES DE CONFIGURAÇÕES ---
async function carregarOperadores() {
    try {
        const res = await fetch(API_OPERADORES_URL);
        if (!res.ok) throw new Error('Falha ao buscar operadores');
        const data = await res.json();
        
        listaOperadores.innerHTML = '';
        selectOperadorAssoc.innerHTML = '<option value="">Selecione um operador...</option>';

        if (data.length === 0) {
            listaOperadores.innerHTML = '<li>Nenhum operador cadastrado.</li>';
            return;
        }

        data.forEach(op => {
            const li = document.createElement('li');
            li.textContent = `${op.nome_operador} (Matrícula: ${op.matricula})`;
            listaOperadores.appendChild(li);

            const option = document.createElement('option');
            option.value = op.id_operador;
            option.textContent = op.nome_operador;
            selectOperadorAssoc.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        listaOperadores.innerHTML = '<li>Erro ao carregar operadores.</li>';
    }
}

formAddOperador.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome_operador = document.getElementById('nome_operador').value;
    const matricula = document.getElementById('matricula').value;
    try {
        const res = await fetch(API_OPERADORES_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_operador, matricula })
        });
        if (!res.ok) throw new Error('Falha ao adicionar operador');
        alert('Operador adicionado com sucesso!');
        formAddOperador.reset();
        await carregarOperadores();
    } catch (error) {
        console.error(error);
        alert('Erro ao adicionar operador.');
    }
});

async function carregarAssociacoes() {
    listaAssociacoes.innerHTML = '<li>Carregando...</li>';
    try {
        const nomesDosProcessos = ['processo 1', 'processo 2', 'processo 3', 'processo 4'];
        const promessas = nomesDosProcessos.map(nome => 
            fetch(`${API_ASSOCIACOES_URL}/${encodeURIComponent(nome)}/operadores`).then(res => res.json())
        );
        
        const resultados = await Promise.all(promessas);
        
        listaAssociacoes.innerHTML = '';
        let encontrouAssociacao = false;

        resultados.forEach((operadores, index) => {
            const nomeProcesso = nomesDosProcessos[index];
            if (operadores.length > 0) {
                encontrouAssociacao = true;
                operadores.forEach(op => {
                    const li = document.createElement('li');
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    
                    const nomeCapitalizado = nomeProcesso.charAt(0).toUpperCase() + nomeProcesso.slice(1);
                    
                    const removeButton = document.createElement('button');
                    removeButton.textContent = '✖';
                    removeButton.className = 'remove-btn';
                    removeButton.dataset.idOperador = op.id_operador;
                    removeButton.dataset.nomeProcesso = nomeProcesso;
                    removeButton.style.border = 'none';
                    removeButton.style.background = 'transparent';
                    removeButton.style.color = 'var(--red-accent)';
                    removeButton.style.cursor = 'pointer';
                    removeButton.style.fontSize = '1.2rem';
                    removeButton.style.marginLeft = '10px';

                    const textSpan = document.createElement('span');
                    textSpan.textContent = `${op.nome_operador} → ${nomeCapitalizado}`;
                    
                    li.appendChild(textSpan);
                    li.appendChild(removeButton);
                    listaAssociacoes.appendChild(li);
                });
            }
        });

        if (!encontrouAssociacao) {
            listaAssociacoes.innerHTML = '<li>Nenhuma associação cadastrada.</li>';
        }
    } catch (error) {
        console.error(error);
        listaAssociacoes.innerHTML = '<li>Erro ao carregar associações.</li>';
    }
}

formAssociarOperador.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id_operador = selectOperadorAssoc.value;
    const nome_processo = selectProcessoAssoc.value;

    if (!id_operador) {
        alert('Por favor, selecione um operador.');
        return;
    }

    const encodedProcessoId = encodeURIComponent(nome_processo);
    const url = `${API_ASSOCIACOES_URL}/${encodedProcessoId}/operadores`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_operador }) 
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.erro || 'Falha ao associar operador.');

        alert('Associação criada com sucesso!');
        await carregarAssociacoes();
        await carregarVisaoGeralProcessos(dataFiltroGlobal);
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

listaAssociacoes.addEventListener('click', async (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const id_operador = e.target.dataset.idOperador;
        const nome_processo = e.target.dataset.nomeProcesso;

        if (!confirm(`Tem certeza que deseja remover esta associação?`)) {
            return;
        }

        const encodedProcessoId = encodeURIComponent(nome_processo);
        const url = `${API_ASSOCIACOES_URL}/${encodedProcessoId}/operadores/${id_operador}`;

        try {
            const res = await fetch(url, { method: 'DELETE' });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.erro || 'Falha ao remover associação.');
            }

            alert('Associação removida com sucesso!');
            await carregarAssociacoes();
            await carregarVisaoGeralProcessos(dataFiltroGlobal);
        } catch (error) {
            console.error(error);
            alert('Erro ao remover associação.');
        }
    }
});

selectGerenciarProcesso.addEventListener('change', (e) => {
    carregarTurnosParaGerenciamento(e.target.value);
});

async function carregarTurnosParaGerenciamento(processoId) {
    listaTurnosCheckboxes.innerHTML = '<p>Carregando turnos...</p>';
    const encodedProcessoId = encodeURIComponent(processoId);

    try {
        const [todosTurnosRes, turnosAssociadosRes] = await Promise.all([
            fetch(API_TURNOS_URL),
            fetch(`${API_ASSOCIACOES_URL}/${encodedProcessoId}/turnos`)
        ]);

        if (!todosTurnosRes.ok || !turnosAssociadosRes.ok) {
            throw new Error('Falha ao buscar dados de turnos.');
        }

        const todosTurnos = await todosTurnosRes.json();
        const turnosAssociados = await turnosAssociadosRes.json();
        const idsTurnosAssociados = new Set(turnosAssociados.map(t => t.id_turno));

        listaTurnosCheckboxes.innerHTML = '';
        if (todosTurnos.length === 0) {
            listaTurnosCheckboxes.innerHTML = '<p>Nenhum turno cadastrado no sistema.</p>';
            return;
        }

        todosTurnos.forEach(turno => {
            const li = document.createElement('li');
            li.className = 'checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `turno-${turno.id_turno}`;
            checkbox.value = turno.id_turno;
            checkbox.checked = idsTurnosAssociados.has(turno.id_turno);

            const label = document.createElement('label');
            label.htmlFor = `turno-${turno.id_turno}`;
            label.textContent = turno.nome_turno;

            li.appendChild(checkbox);
            li.appendChild(label);
            listaTurnosCheckboxes.appendChild(li);
        });

    } catch (error) {
        console.error(error);
        listaTurnosCheckboxes.innerHTML = '<p style="color: red;">Erro ao carregar turnos.</p>';
    }
}

formGerenciarTurnos.addEventListener('submit', async (e) => {
    e.preventDefault();
    const processoId = selectGerenciarProcesso.value;
    const encodedProcessoId = encodeURIComponent(processoId);

    const checkboxesMarcados = document.querySelectorAll('#lista-turnos-checkboxes input[type="checkbox"]:checked');
    const turnosIds = Array.from(checkboxesMarcados).map(cb => parseInt(cb.value, 10));

    try {
        const res = await fetch(`${API_ASSOCIACOES_URL}/${encodedProcessoId}/turnos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnosIds })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.erro || 'Falha ao salvar alterações.');

        alert('Turnos do processo atualizados com sucesso!');
        await carregarVisaoGeralProcessos(dataFiltroGlobal);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

async function carregarTurnosParaDropdown() {
    try {
        const res = await fetch(API_TURNOS_URL);
        if (!res.ok) throw new Error('Falha ao buscar turnos');
        const data = await res.json();
        
        metaTurnoSelect.innerHTML = '<option value="">Selecione um turno...</option>';
        if (data.length === 0) return;

        data.forEach(turno => {
            const option = document.createElement('option');
            option.value = turno.nome_turno;
            option.textContent = turno.nome_turno;
            metaTurnoSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        metaTurnoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function carregarMetas() {
    listaMetas.innerHTML = '<li>Carregando...</li>';
    try {
        const res = await fetch(API_METAS_URL);
        if (!res.ok) throw new Error('Falha ao buscar metas.');
        const data = await res.json();

        listaMetas.innerHTML = '';
        if (data.length === 0) {
            listaMetas.innerHTML = '<li>Nenhuma meta definida.</li>';
            return;
        }

        data.forEach(meta => {
            const li = document.createElement('li');
            const processoCapitalizado = meta.processo_id.charAt(0).toUpperCase() + meta.processo_id.slice(1);
            li.textContent = `${processoCapitalizado} (${meta.nome_turno}): ${meta.meta_pecas_por_turno} peças em ${meta.tempo_planejado_segundos}s`;
            listaMetas.appendChild(li);
        });

    } catch (error) {
        console.error(error);
        listaMetas.innerHTML = '<li>Erro ao carregar metas.</li>';
    }
}

formDefinirMeta.addEventListener('submit', async (e) => {
    e.preventDefault();
    const processo_id = metaProcessoSelect.value;
    const nome_turno = metaTurnoSelect.value;
    const meta_pecas_por_turno = metaPecasInput.value;
    const tempo_planejado_segundos = metaTempoInput.value;

    if (!processo_id || !nome_turno || !meta_pecas_por_turno || !tempo_planejado_segundos) {
        alert('Todos os campos são obrigatórios.');
        return;
    }

    try {
        const res = await fetch(API_METAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processo_id, nome_turno, meta_pecas_por_turno, tempo_planejado_segundos })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.erro || 'Falha ao definir meta.');

        alert('Meta definida com sucesso!');
        formDefinirMeta.reset();
        await carregarMetas();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

async function carregarVisaoGeralProcessos(dataFiltro = null) {
    processFlowContainer.innerHTML = '<p>Carregando fluxograma dos processos...</p>';
    try {
        const nomesDosProcessos = ['processo 1', 'processo 2', 'processo 3', 'processo 4'];
        let finalHTML = '';

        const setaSVG = `
            <div class="process-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </div>
        `;

        for (const [index, nome] of nomesDosProcessos.entries()) {
            const nomeCapitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);
            const encodedNome = encodeURIComponent(nome);

            try {
                const urls = [
                    construirUrlComFiltro(`${API_METRICAS_URL}/${encodedNome}/ciclo`, dataFiltro),
                    construirUrlComFiltro(`${API_METRICAS_URL}/${encodedNome}/troca`, dataFiltro),
                    construirUrlComFiltro(`${API_METRICAS_URL}/${encodedNome}/refugo`, dataFiltro),
                    construirUrlComFiltro(`${API_METRICAS_URL}/${encodedNome}/disponibilidade?tempoTotalPlanejadoSegundos=28800`, dataFiltro),
                    `${API_ASSOCIACOES_URL}/${encodedNome}/operadores`,
                    `${API_ASSOCIACOES_URL}/${encodedNome}/turnos`,
                    construirUrlComFiltro(`${API_ANALISE_URL}/${encodedNome}/oee`, dataFiltro)
                ];

                const responses = await Promise.all(urls.map(url => fetch(url)));
                const [ciclo, troca, refugo, disponibilidade, operadores, turnos, oee] = await Promise.all(
                    responses.map(res => res.ok ? res.json() : Promise.resolve({}))
                );

                const cardHTML = `
                    <div class="process-card">
                        <h3 class="process-card-header">${nomeCapitalizado}</h3>
                        <ul class="metric-list">
                            <li class="metric-item"><span class="metric-label">Tempo de Ciclo</span><span class="metric-value">${formatarNumero(ciclo.media_ciclo_segundos)}<span class="unit">s</span></span></li>
                            <li class="metric-item"><span class="metric-label">Tempo de Troca</span><span class="metric-value">${formatarNumero(troca.media_troca_segundos)}<span class="unit">s</span></span></li>
                            <li class="metric-item"><span class="metric-label">% de Refugo</span><span class="metric-value" style="color: #f97b4f;">${formatarNumeroDecimal(refugo.percentual_refugo)}<span class="unit">%</span></span></li>
                            <li class="metric-item"><span class="metric-label">Disponibilidade</span><span class="metric-value" style="color: #34b3f1;">${formatarNumeroDecimal(disponibilidade.disponibilidade_percentual)}<span class="unit">%</span></span></li>
                        </ul>
                        <div class="oee-metrics-group">
                            <div class="oee-main-metric"><span class="oee-label">OEE</span><span class="oee-value">${formatarNumeroDecimal(oee.oee)}%</span></div>
                            <div class="oee-sub-metric"><span class="oee-label">MTTR</span><span class="oee-value">${formatarNumeroDecimal(oee.mttr)} min</span></div>
                            <div class="oee-sub-metric"><span class="oee-label">MTBF</span><span class="oee-value">${formatarNumeroDecimal(oee.mtbf)} h</span></div>
                        </div>
                        <h4 class="sub-list-title">Turnos</h4>
                        <ul class="sub-list">${turnos.length > 0 ? turnos.map(t => `<li>${t.nome_turno}</li>`).join('') : '<li>Nenhum turno associado</li>'}</ul>
                        <h4 class="sub-list-title">Operadores</h4>
                        <ul class="sub-list">${operadores.length > 0 ? operadores.map(o => `<li>${o.nome_operador}</li>`).join('') : '<li>Nenhum operador associado</li>'}</ul>
                    </div>
                `;
                finalHTML += cardHTML;

            } catch (error) {
                console.error(`Falha ao carregar dados para ${nome}:`, error);
                finalHTML += `<div class="process-card" style="border-color: var(--red-accent);"><h3 class="process-card-header">${nomeCapitalizado}</h3><p>Falha ao carregar dados.</p></div>`;
            }

            if (index < nomesDosProcessos.length - 1) {
                finalHTML += setaSVG;
            }
        }
        processFlowContainer.innerHTML = finalHTML;
    } catch (error) {
        console.error("Erro geral ao carregar visão geral dos processos:", error);
        processFlowContainer.innerHTML = '<p style="color: red;">Falha crítica ao carregar os dados. Verifique a conexão com a API.</p>';
    }
}

function getTurnoAtual() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 14) return 'Manhã';
    if (hora >= 14 && hora < 22) return 'Tarde';
    return 'Noite';
}

formRegistrarCiclo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const processoId = processoCicloSelect.value;
    const duracao_segundos = parseInt(duracaoCicloInput.value, 10);
    const pecas_boas = parseInt(pecasBoasCicloInput.value, 10);
    const pecas_refugadas = parseInt(refugoCicloInput.value, 10);
    const turno = getTurnoAtual();

    if (isNaN(duracao_segundos) || duracao_segundos <= 0 || isNaN(pecas_boas) || isNaN(pecas_refugadas) || (pecas_boas + pecas_refugadas) === 0) {
        alert('Por favor, preencha todos os campos com valores válidos. O ciclo deve registrar ao menos 1 peça.');
        return;
    }
    
    await salvarMetrica(`${API_METRICAS_URL}/${encodeURIComponent(processoId)}/ciclo`, { duracao_segundos, turno, pecas_refugadas, pecas_boas }, 'Ciclo');
    formRegistrarCiclo.reset();
    pecasBoasCicloInput.value = '1';
    refugoCicloInput.value = '0';
});

formRegistrarTroca.addEventListener('submit', async (e) => {
    e.preventDefault();
    const processoId = processoTrocaSelect.value;
    const duracao_segundos = parseInt(duracaoTrocaInput.value, 10);

    if (!processoId || isNaN(duracao_segundos) || duracao_segundos <= 0) {
        alert('Por favor, selecione um processo e insira uma duração válida em segundos.');
        return;
    }

    await salvarMetrica(`${API_METRICAS_URL}/${encodeURIComponent(processoId)}/troca`, { duracao_segundos }, 'Tempo de Troca');
    formRegistrarTroca.reset();
});

formRegistrarParada.addEventListener('submit', async (e) => {
    e.preventDefault();
    const processoId = processoParadaSelect.value;
    const motivo = motivoParadaSelect.value;
    const duracao_segundos = parseInt(duracaoParadaInput.value, 10);
    const turno = getTurnoAtual();

    if (!processoId || !motivo || isNaN(duracao_segundos) || duracao_segundos <= 0) {
        alert('Por favor, preencha todos os campos com valores válidos.');
        return;
    }

    await salvarMetrica(`${API_METRICAS_URL}/${encodeURIComponent(processoId)}/parada`, { motivo, turno, duracao_segundos }, 'Parada');
    formRegistrarParada.reset();
});

async function salvarMetrica(url, body, nomeMetrica) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ erro: `Falha ao salvar ${nomeMetrica}. Status: ${res.status}` }));
            throw new Error(err.erro);
        }
        alert(`${nomeMetrica} salvo(a) com sucesso!`);
        await recarregarDadosDaPagina();
    } catch (error) {
        console.error(`Erro ao salvar ${nomeMetrica}:`, error);
        alert(error.message);
    }
}

async function carregarAnaliseGeral(processoId, dataFiltro = null) {
    analiseGeralContainer.innerHTML = '<p>Carregando análise geral...</p>';
    analiseTurnoContainer.innerHTML = '<p>Carregando análise por turno...</p>';
    const encodedProcessoId = encodeURIComponent(processoId);
    const url = construirUrlComFiltro(`${API_ANALISE_URL}/${encodedProcessoId}/geral`, dataFiltro);

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error((await res.json()).erro || 'Falha ao carregar análise.');
        const dados = await res.json();
        
        const geral = dados.analiseGeral;
        analiseGeralContainer.innerHTML = `
            <div class="geral-kpi"><p class="kpi-title">Total Produzido</p><p class="kpi-value">${formatarNumero(geral.total_produzido)}</p></div>
            <div class="geral-kpi"><p class="kpi-title">Total de Refugo</p><p class="kpi-value">${formatarNumero(geral.total_refugo)}</p></div>
            <div class="geral-kpi"><p class="kpi-title">Total de Paradas</p><p class="kpi-value">${formatarNumero(geral.numero_paradas)}</p></div>
            <div class="geral-kpi"><p class="kpi-title">Tempo Total Parado</p><p class="kpi-value">${formatarDuracao(geral.tempo_total_paradas_minutos * 60)}</p></div>
        `;

        analiseTurnoContainer.innerHTML = '';
        if (!dados.analisePorTurno || dados.analisePorTurno.length === 0) {
            analiseTurnoContainer.innerHTML = '<p>Nenhum dado de turno encontrado.</p>';
            return;
        }

        dados.analisePorTurno.forEach(turno => {
            const atingiuMeta = turno.total_produzido >= turno.meta_producao && turno.meta_producao > 0;
            const card = document.createElement('div');
            card.className = `turno-card ${atingiuMeta ? 'success' : 'failure'}`;
            card.innerHTML = `
                <h3>Turno: ${turno.nome_turno}</h3>
                <div class="turno-metric"><span class="turno-metric-label">Meta de Produção:</span><span class="turno-metric-value">${formatarNumero(turno.meta_producao)}</span></div>
                <div class="turno-metric"><span class="turno-metric-label">Total Produzido:</span><span class="turno-metric-value">${formatarNumero(turno.total_produzido)}</span></div>
            `;
            analiseTurnoContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        analiseGeralContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        analiseTurnoContainer.innerHTML = '';
    }
}

async function carregarOEE(processoId, dataFiltro = null) {
    oeeGeral.textContent = '-- %';
    oeeDisponibilidade.textContent = '-- %';
    oeePerformance.textContent = '-- %';
    oeeQualidade.textContent = '-- %';
    oeeMttr.textContent = '-- min';
    oeeMtbf.textContent = '-- h';

    const encodedProcessoId = encodeURIComponent(processoId);
    const url = construirUrlComFiltro(`${API_ANALISE_URL}/${encodedProcessoId}/oee`, dataFiltro);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Falha ao calcular OEE.');
        const data = await res.json();

        oeeGeral.textContent = `${formatarNumeroDecimal(data.oee)} %`;
        oeeDisponibilidade.textContent = `${formatarNumeroDecimal(data.disponibilidade)} %`;
        oeePerformance.textContent = `${formatarNumeroDecimal(data.performance)} %`;
        oeeQualidade.textContent = `${formatarNumeroDecimal(data.qualidade)} %`;
        oeeMttr.textContent = `${formatarNumeroDecimal(data.mttr)} min`;
        oeeMtbf.textContent = `${formatarNumeroDecimal(data.mtbf)} h`;

    } catch (error) {
        console.error(error);
    }
}

function recarregarDadosDaPagina() {
    const processoId = processoSelect.value;
    carregarDashboard(processoId, dataFiltroGlobal);
    carregarVisaoGeralProcessos(dataFiltroGlobal);
    carregarAnaliseGeral(processoId, dataFiltroGlobal);
    carregarOEE(processoId, dataFiltroGlobal);
}

processoSelect.addEventListener('change', (event) => {
    recarregarDadosDaPagina();
});

function handleDateChange(event) {
    dataFiltroGlobal = event.target.value;
    dateFilterResultados.value = dataFiltroGlobal;
    dateFilterProcessos.value = dataFiltroGlobal;
    recarregarDadosDaPagina();
}

function handleClearDate() {
    dataFiltroGlobal = null;
    dateFilterResultados.value = '';
    dateFilterProcessos.value = '';
    recarregarDadosDaPagina();
}

dateFilterResultados.addEventListener('change', handleDateChange);
dateFilterProcessos.addEventListener('change', handleDateChange);
btnClearDateResultados.addEventListener('click', handleClearDate);
btnClearDateProcessos.addEventListener('click', handleClearDate);

window.onload = () => {
    recarregarDadosDaPagina();
    carregarOperadores();
    carregarAssociacoes();
    carregarTurnosParaGerenciamento(selectGerenciarProcesso.value);
    carregarTurnosParaDropdown();
    carregarMetas();
    navegarPara('resultados');
};