window.buscarCEP = async function(cepValue, prefix = 'simple-') {
    // Remove formatação do CEP
    const cep = cepValue.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    // Mostrar indicador de carregamento
    const cepField = document.getElementById(prefix + 'cep');
    if (cepField) {
        cepField.style.borderColor = '#fbbf24'; // Amarelo durante busca
    }
    
    try {
        const response = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
        const data = await response.json();
        
        if (!data.erro) {
            // Preencher campos automaticamente
            const logradouroField = document.getElementById(prefix + 'logradouro');
            const bairroField = document.getElementById(prefix + 'bairro');
            const cidadeField = document.getElementById(prefix + 'cidade');
            const estadoField = document.getElementById(prefix + 'estado');
            
            if (logradouroField) logradouroField.value = data.logradouro || '';
            if (bairroField) bairroField.value = data.bairro || '';
            if (cidadeField) cidadeField.value = data.localidade || '';
            if (estadoField) estadoField.value = data.uf || '';
            
            // Indicar sucesso
            if (cepField) {
                cepField.style.borderColor = '#10b981'; // Verde sucesso
                setTimeout(() => {
                    cepField.style.borderColor = '#ddd';
                }, 2000);
            }
            
            // Focar no campo número
            const numeroField = document.getElementById(prefix + 'numero');
            if (numeroField) {
                numeroField.focus();
            }
        } else {
            if (cepField) {
                cepField.style.borderColor = '#ef4444'; // Vermelho erro
                setTimeout(() => {
                    cepField.style.borderColor = '#ddd';
                }, 2000);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao buscar CEP:', error);
        if (cepField) {
            cepField.style.borderColor = '#ef4444'; // Vermelho erro
            setTimeout(() => {
                cepField.style.borderColor = '#ddd';
            }, 2000);
        }
    }
}