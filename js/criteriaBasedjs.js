// Armazena os dados do form no localStorage
document.getElementById('productivityForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObj = Object.fromEntries(formData.entries());
    localStorage.setItem('productivityFormData', JSON.stringify(formObj));
    window.location.href = 'costBased.html'; // Redireciona para a próxima tela
});

// Volta para tela anterior
function voltar() {
    window.history.back();
}