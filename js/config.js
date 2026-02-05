// ============================================
// CONFIGURAÇÕES DO SISTEMA
// ============================================

// Configurações do Supabase
window.SUPABASE_CONFIG = {
    url: 'https://krdsejsvnfqtstsgryrw.supabase.co',
    anonKey: 'sb_publishable_Hf4fOV2BzuDU8oFVvr6f2g_-yvs5vMa'
};

// FERIADOS COMPLETOS 2026 - RECIFE/PE
window.FERIADOS = [
    // JANEIRO
    '2026-01-01', // Confraternização Universal
    
    // FEVEREIRO
    '2026-02-16', '2026-02-17', '2026-02-18', // Carnaval + Quarta de Cinzas
    
    // MARÇO
    '2026-03-06', // Revolução Pernambucana
    '2026-03-12', // Aniversário do Recife
    
    // ABRIL
    '2026-04-03', // Sexta-feira Santa
    '2026-04-21', // Tiradentes
    
    // MAIO
    '2026-05-01', // Dia do Trabalhador
    
    // JUNHO
    '2026-06-04', // Corpus Christi
    '2026-06-24', // São João (PE)
    
    // JULHO
    '2026-07-16', // N.S. do Carmo (Recife)
    
    // SETEMBRO
    '2026-09-07', // Independência do Brasil
    
    // OUTUBRO
    '2026-10-12', // N.S. Aparecida
    '2026-10-28', // Servidor Público
    
    // NOVEMBRO
    '2026-11-02', // Finados
    '2026-11-20', // Consciência Negra
    
    // DEZEMBRO
    '2026-12-08', // N.S. da Conceição
    '2026-12-24', // Véspera de Natal
    '2026-12-25', // Natal
    '2026-12-31'  // Véspera de Ano-Novo
];

// Configurações do sistema
window.SYSTEM_CONFIG = {
    // Tratar pontos facultativos como feriados?
    pontosFacultativosComoFeriados: true,
    
    // Regras padrão
    regrasPadrao: {
        diasUteis: [1, 2, 3, 4, 5], // Segunda (1) a Sexta (5)
        horarioComercial: {
            inicio: 10,
            fim: 18
        }
    },
    
    // Números de WhatsApp
    whatsappNumbers: {
        audio: '5581991347040',
        video: '5581996332752'
    },
    
    // E-mail
    email: 'adm@somax.com.br',

};

// Informações dos feriados detalhados
window.FERIADOS_DETALHADOS = {
    // JANEIRO
    '2026-01-01': { descricao: 'Confraternização Universal', tipo: 'feriado_nacional' },
    
    // FEVEREIRO
    '2026-02-16': { descricao: 'Carnaval', tipo: 'ponto_facultativo' },
    '2026-02-17': { descricao: 'Carnaval', tipo: 'ponto_facultativo' },
    '2026-02-18': { descricao: 'Quarta-feira de Cinzas', tipo: 'ponto_facultativo' },
    
    // MARÇO
    '2026-03-06': { descricao: 'Revolução Pernambucana de 1817', tipo: 'feriado_estadual' },
    '2026-03-12': { descricao: 'Aniversário do Recife', tipo: 'feriado_municipal' },
    
    // ABRIL
    '2026-04-03': { descricao: 'Sexta-feira Santa', tipo: 'feriado_nacional' },
    '2026-04-21': { descricao: 'Tiradentes', tipo: 'feriado_nacional' },
    
    // MAIO
    '2026-05-01': { descricao: 'Dia do Trabalhador', tipo: 'feriado_nacional' },
    
    // JUNHO
    '2026-06-04': { descricao: 'Corpus Christi', tipo: 'ponto_facultativo' },
    '2026-06-24': { descricao: 'Festa de São João', tipo: 'feriado_estadual' },
    
    // JULHO
    '2026-07-16': { descricao: 'Nossa Senhora do Carmo (Padroeira do Recife)', tipo: 'feriado_municipal' },
    
    // SETEMBRO
    '2026-09-07': { descricao: 'Independência do Brasil', tipo: 'feriado_nacional' },
    
    // OUTUBRO
    '2026-10-12': { descricao: 'Nossa Senhora Aparecida', tipo: 'feriado_nacional' },
    '2026-10-28': { descricao: 'Dia do Servidor Público', tipo: 'ponto_facultativo' },
    
    // NOVEMBRO
    '2026-11-02': { descricao: 'Finados', tipo: 'feriado_nacional' },
    '2026-11-20': { descricao: 'Dia da Consciência Negra', tipo: 'feriado_nacional' },
    
    // DEZEMBRO
    '2026-12-08': { descricao: 'Nossa Senhora da Conceição', tipo: 'feriado_municipal' },
    '2026-12-24': { descricao: 'Véspera de Natal', tipo: 'ponto_facultativo' },
    '2026-12-25': { descricao: 'Natal', tipo: 'feriado_nacional' },
    '2026-12-31': { descricao: 'Véspera de Ano-Novo', tipo: 'ponto_facultativo' }

};
