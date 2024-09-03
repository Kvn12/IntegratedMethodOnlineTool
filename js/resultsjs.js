function getParams(data) {
    if(data == null){
        const productivityFormData = JSON.parse(localStorage.getItem('productivityFormData'));
        const costFormData = JSON.parse(localStorage.getItem('costFormData'));

        return {
            productivity: {
                availabilityLoss: productivityFormData['availability-loss'],
                slownessLoss: productivityFormData['slowness-loss'],
                completenessLoss: productivityFormData['completeness-loss'],
                algorithmsLoss: productivityFormData['algorithms-loss'],
                integrationLoss: productivityFormData['integration-loss'],
                contextualizationLoss: productivityFormData['contextualization-loss'],
                managementLoss: productivityFormData['management-loss']
            }, 
            cost: {
                sizeDatasetInput: costFormData['size-dataset'],
                costCollectingInput: costFormData['cost-collecting'],
                costStoringInput: costFormData['cost-storing'],
                costPreprocessingInput: costFormData['cost-preprocessing'],
                costMaintainingInput: costFormData['cost-maintaining']
            }           
        };
    }
    else{
        return {
            productivity: {
                availabilityLoss: data['availabilityLoss'],
                slownessLoss: data['slownessLoss'],
                completenessLoss: data['completenessLoss'],
                algorithmsLoss: data['algorithmsLoss'],
                integrationLoss: data['integrationLoss'],
                contextualizationLoss: data['contextualizationLoss'],
                managementLoss: data['managementLoss']
            }, 
            cost: {
                sizeDatasetInput: data['sizeDatasetInput'],
                costCollectingInput: data['costCollectingInput'],
                costStoringInput: data['costStoringInput'],
                costPreprocessingInput: data['costPreprocessingInput'],
                costMaintainingInput: data['costMaintainingInput']
            }           
        };
    }
}

function calcularResultado(data) {
    let prodParams;
    let costParams;
    if(data == null){
        const params = getParams();
        prodParams = params.productivity;
        costParams = params.cost;
    }
    else{
        const params = getParams(data);
        prodParams = params.productivity;
        costParams = params.cost;
    }

    var avalability = (1-parseFloat(prodParams.availabilityLoss));
    var quality = (1-parseFloat(prodParams.slownessLoss)*(1-parseFloat(prodParams.completenessLoss)));
    var productivity = (1-parseFloat(prodParams.algorithmsLoss)*(1-parseFloat(prodParams.integrationLoss))*(1-parseFloat(prodParams.contextualizationLoss))*(1-parseFloat(prodParams.managementLoss)));
    
    var dataProductivityIndex = avalability * quality * productivity;  

    var totalCost = parseFloat(costParams.costCollectingInput) + parseFloat(costParams.costStoringInput) + parseFloat(costParams.costPreprocessingInput) + parseFloat(costParams.costMaintainingInput);  
    var totalCostPerByte = totalCost/parseFloat(costParams.sizeDatasetInput);

    if(data == null){
        document.getElementById('resultIndex').innerText = `The Data Value Productivity Index is: ${dataProductivityIndex.toFixed(2)}`;
        document.getElementById('resultCost').innerText = `The Total Cost of the Data is R$ ${totalCost.toFixed(2)}`;
        document.getElementById('resultCostByte').innerText = `The Total Cost of the Data per byte is R$ ${totalCostPerByte.toFixed(2)}/byte`;
    }
    else{
        return {dataProductivityIndex, totalCost, totalCostPerByte};
    }
}

function downloadManualResults() {
// Função para extrair o valor numérico de um texto
function extractNumber(text) {
    const match = text.match(/[\d.]+/);
    return match ? match[0] : '';
}

// Obter os textos das divs
const resultIndexText = document.getElementById('resultIndex').innerText;
const resultCostText = document.getElementById('resultCost').innerText;
const resultCostByteText = document.getElementById('resultCostByte').innerText;

// Extrair os valores numéricos
const resultIndex = extractNumber(resultIndexText);
const resultCost = extractNumber(resultCostText);
const resultCostByte = extractNumber(resultCostByteText);

// Adicione aqui os dados do formulário, exemplo:
const formData = getParams();
const prodParams = formData.productivity;
const costParams = formData.cost;

// Criar arrays para cabeçalhos e valores
let headers = [];
let values = [];

// Adicionar os dados de produtividade ao arrays
for (const [key, value] of Object.entries(prodParams)) {
    headers.push(key);
    values.push(value);
}

// Adicionar os dados de custo ao arrays
for (const [key, value] of Object.entries(costParams)) {
    headers.push(key);
    values.push(value);
}

// Adicionar os resultados aos arrays
headers.push('Index', 'Cost', 'Cost per Byte');
values.push(resultIndex, resultCost, resultCostByte);

// Criar um workbook e uma planilha
const wb = XLSX.utils.book_new();
const ws_data = [headers, values]; // Primeiro linha de cabeçalhos, segunda linha de valores
const ws = XLSX.utils.aoa_to_sheet(ws_data);
XLSX.utils.book_append_sheet(wb, ws, 'Results');

// Download do arquivo Excel
XLSX.writeFile(wb, 'results.xlsx');
}


function processFile(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    const headers = worksheet[0];
    const rows = worksheet.slice(1);

    const validRows = rows.filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''));

    const results = validRows.map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index];
        });

        const calcResults = calcularResultado(rowData);
        return { ...rowData, ...calcResults };
    });

    return results;
}

function downloadExcelResults() {
    const storedData = JSON.parse(localStorage.getItem('uploadedFile'));
    if (!storedData) {
        alert('Nenhum arquivo foi carregado.');
        return;
    }

    const data = new Uint8Array(storedData);
    const results = processFile(data);

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    if (results.length > 0) {
        const headers = Object.keys(results[0]);
        ws_data.push(headers);
        results.forEach(row => {
            ws_data.push(headers.map(header => row[header]));
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, 'results.xlsx');
}

function getQueryStringParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function displayCharts(results) {
    const productionIndexData = results.map(row => parseFloat(row['dataProductivityIndex']));
    const costPerByteData = results.map(row => parseFloat(row['totalCostPerByte']));
    const totalCostData = results.map(row => parseFloat(row['totalCost']));

    const ctx1 = document.getElementById('productionIndexChart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: results.map((_, i) => `${i + 1}`),
            datasets: [{
                label: 'Production Index',
                data: productionIndexData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Entry'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Productivity Index'
                    }
                }
            }
        }
    });

    const ctx2 = document.getElementById('costPerByteChart').getContext('2d');
    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: results.map((_, i) => `${i + 1}`),
            datasets: [{
                label: 'Cost per Byte',
                data: costPerByteData,
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Entry'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cost per Byte (R$)'
                    }
                }
            }
        }
    });

    const ctx3 = document.getElementById('costVsProductivityChart').getContext('2d');
    new Chart(ctx3, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Cost vs Productivity',
                data: results.map(row => ({ x: parseFloat(row['totalCostPerByte']), y: parseFloat(row['dataProductivityIndex']) })),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cost per byte (R$)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Productivity Index'
                    }
                }
            }
        }
    });
}

function voltar() {
    window.location.href = "index.html"
}

window.onload = function() {
    const source = getQueryStringParameter('source');
    if (source === 'manual') {
        calcularResultado();
    } else if (source === 'excel') {
        document.getElementById('resultDivs').style.display = 'none';
        const storedData = JSON.parse(localStorage.getItem('uploadedFile'));
        if (storedData) {
            const data = new Uint8Array(storedData);
            const results = processFile(data);
            displayCharts(results);
        }
    }
}

// Adiciona o evento de clique ao botão de download
document.getElementById('downloadExcelButton').addEventListener('click', function() {
    const source = getQueryStringParameter('source');

    if (source === 'manual') {
        return downloadManualResults();
    } else if (source === 'excel') {
        return downloadExcelResults();
    }
});