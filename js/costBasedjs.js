// Armazena os dados do form no localStorage
document.getElementById('costForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObj = Object.fromEntries(formData.entries());
    localStorage.setItem('costFormData', JSON.stringify(formObj));
    window.location.href = 'results.html?source=manual'; // Redireciona para a tela de resultados
});
// Volta para tela anterior
function voltar() {
    window.history.back();
}