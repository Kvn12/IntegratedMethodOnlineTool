// Receber arquivo xlsx e salvar para proxima tela
function saveFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        localStorage.setItem('uploadedFile', JSON.stringify(Array.from(data)));
        window.location.href = 'results.html?source=excel';
    };
    reader.readAsArrayBuffer(file);
}

// Baixar o template 
function downloadTemplate() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['availabilityLoss', 'slownessLoss', 'completenessLoss', 'algorithmsLoss', 'integrationLoss', 'contextualizationLoss',
    'managementLoss', 'sizeDatasetInput', 'costCollectingInput', 'costStoringInput', 'costPreprocessingInput', 'costMaintainingInput']]); 
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// voltar tela anterior 
function voltar() {
    window.history.back();
}