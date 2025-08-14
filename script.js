document.getElementById('form-consumidor').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('consumidor-nome').value;
    const telefone = document.getElementById('consumidor-telefone').value;

    const dadosLead = {
        nome: nome,
        telefone: telefone
    };

    try {
        const resposta = await fetch('https://vxyctdclkfasiakasjvr.supabase.co/rest/v1/Leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eWN0ZGNsa2Zhc2lha2FzanZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODEwMDksImV4cCI6MjA3MDc1NzAwOX0.R1WbyrzEGJxmg1q7oSSwF1_vpjN3lnQn4S247LBF0w0'
            },
            body: JSON.stringify(dadosLead)
        });

        if (resposta.ok) {
            console.log('Lead cadastrado com sucesso!');
            alert('Lead cadastrado com sucesso!');
            document.getElementById('form-consumidor').reset();
        } else {
             
            const erro = await resposta.text(); 
            console.error('Status da requisição:', resposta.status);
            console.error('Mensagem de erro do servidor:', erro);
            alert('Erro ao cadastrar o lead. Por favor, cheque o console do navegador para mais detalhes.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro na conexão. Verifique sua rede e tente novamente.');
    }
});
