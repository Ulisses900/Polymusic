// ============================================
// FUNÇÕES PRINCIPAIS DO SISTEMA
// ============================================

// Variáveis globais
window.currentDate = new Date();
window.selectedDate = null;
window.selectedTimeSlot = null;
window.selectedStudio = 'audio';
window.currentService = 'audio';
window.availability = {};
window.adminCurrentDate = new Date();
window.adminLoggedIn = false;

// Funções globais
window.setService = function(service) {
    window.currentService = service;
    
    // Atualizar UI do seletor
    document.querySelectorAll('.service-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Encontrar a opção clicada e ativá-la
    if (service === 'audio') {
        document.querySelector('.service-option[onclick*="audio"]').classList.add('active');
    } else if (service === 'video') {
        document.querySelector('.service-option[onclick*="video"]').classList.add('active');
    }
    
    // Recarregar calendário
    generateCalendar(window.currentDate);
    
    // Resetar seleção de estúdio se necessário
    if (service === 'video' && window.selectedStudio !== 'video') {
        selectStudio('video');
    } else if (service === 'audio' && window.selectedStudio !== 'audio') {
        selectStudio('audio');
    }
    
    // Limpar seleção de data se não estiver disponível na nova visualização
    if (window.selectedDate) {
        const dateStr = formatDateForAvailability(window.selectedDate);
        const status = getDayStatus(dateStr, service);
        
        if (!status.disponivel) {
            window.selectedDate = null;
            // Remover seleção anterior
            const previousSelected = document.querySelector('.day.selected');
            if (previousSelected) {
                previousSelected.classList.remove('selected');
            }
            updateTimeSlots([]);
        }
    }
    
    validateForm();
};

window.selectStudio = function(studio) {
    window.selectedStudio = studio;
    
    // Atualizar UI
    const audioOption = document.getElementById('audio-studio');
    const videoOption = document.getElementById('video-studio');
    
    if (studio === 'audio') {
        audioOption.classList.add('selected');
        videoOption.classList.remove('selected');
        // Mudar para serviço de áudio
        setService('audio');
    } else {
        audioOption.classList.remove('selected');
        videoOption.classList.add('selected');
        // Mudar para serviço de vídeo
        setService('video');
    }
    
    // Atualizar slots de tempo
    if (window.selectedDate) {
        const dateStr = formatDateForAvailability(window.selectedDate);
        const status = getDayStatus(dateStr, studio);
        updateTimeSlots(status.periodos);
    } else {
        updateTimeSlots([]);
    }
    
    // Validar formulário
    validateForm();
};

window.confirmBooking = function() {
    if (!validateForm()) {
        alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.');
        return;
    }
    
    const clientName = document.getElementById('clientName').value.trim();
    const formattedDate = window.selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    // Determinar número do WhatsApp baseado no estúdio
    let whatsappNumber = '';
    let serviceType = '';
    
    if (window.selectedStudio === 'audio') {
        whatsappNumber = window.SYSTEM_CONFIG.whatsappNumbers.audio;
        serviceType = 'áudio';
        
        // Para áudio, incluir período selecionado
        let periodoMsg = '';
        if (window.selectedTimeSlot.period === 'personalizado') {
            periodoMsg = 'Período Personalizado';
        } else {
            periodoMsg = `${window.selectedTimeSlot.period} (${window.selectedTimeSlot.time})`;
        }
        
        const whatsappMessage = encodeURIComponent(
            `Olá, meu nome é ${clientName}. Estou querendo agendar o estúdio de áudio na data ${formattedDate}, no período ${periodoMsg}.`
        );
        
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
        window.open(whatsappURL, '_blank');
    } else {
        // Vídeo - apenas período completo
        whatsappNumber = window.SYSTEM_CONFIG.whatsappNumbers.video;
        serviceType = 'vídeo';
        
        const whatsappMessage = encodeURIComponent(
            `Olá, meu nome é ${clientName}. Gostaria de fazer um orçamento para o estúdio de vídeo na data ${formattedDate} (período completo).`
        );
        
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
        window.open(whatsappURL, '_blank');
    }
    
    // Scroll para a seção de contato
    document.querySelector('.contact-section').scrollIntoView({ behavior: 'smooth' });
};


window.openContactForm = function() {
    const contactMessage = `Entre em contato com nossa equipe técnica:\n\nWhatsApp Áudio: (81) 98446-3644\nWhatsApp Vídeo: (81) 99134-7040\nE-mail: ${window.SYSTEM_CONFIG.email}\n\nInforme suas necessidades de produção para receber um orçamento personalizado.`;
    alert(contactMessage);
};

window.showTerms = function() {
    document.getElementById('terms').scrollIntoView({ behavior: 'smooth' });
};

window.scrollToBooking = function() {
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
};

window.promptAdminPassword = function() {
    openAdminPanel();
};

// ============================================
// FUNÇÕES DO SISTEMA
// ============================================

// Carregar termos do JSON externo
async function loadTermsFromJson() {
    try {
        // Usar caminho relativo correto
        const response = await fetch('./static/json/terms.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar termos');
        }
        const termsData = await response.json();
        displayTerms(termsData);
    } catch (error) {
        console.error('Erro ao carregar termos:', error);
        // Fallback para termos básicos
        document.getElementById('termsContent').innerHTML = `
            <h3>Termos e Condições - Estúdio Polymusic</h3>
            <p>Ao realizar um agendamento no Estúdio Polymusic, você concorda com os seguintes termos:</p>
            <h4>1. Reservas e Pagamentos</h4>
            <ul>
                <li>A reserva do estúdio requer 50% de sinal no ato do agendamento</li>
                <li>O valor restante deve ser pago no dia da sessão</li>
                <li>Aceitamos PIX, cartão de crédito/débito e dinheiro</li>
                <li>Cancelamentos com até 48h de antecedência têm direito a reembolso</li>
            </ul>
            <h4>2. Horários</h4>
            <ul>
                <li>Período padrão: 8 horas (10h às 18h)</li>
                <li>Meio período: 4 horas (10h-14h ou 14h-18h)</li>
                <li>Atrasos superiores a 30 minutos podem resultar no cancelamento</li>
            </ul>
            <p>Para dúvidas: WhatsApp (81) 99134-7040 ou e-mail ${window.SYSTEM_CONFIG.email}</p>
        `;
    }
}

// Exibir termos carregados do JSON
function displayTerms(termsData) {
    const termsContent = document.getElementById('termsContent');
    let html = '';
    
    if (termsData.title) {
        html += `<h3>${termsData.title}</h3>`;
    }
    
    if (termsData.introduction) {
        html += `<p>${termsData.introduction}</p>`;
    }
    
    if (termsData.sections && Array.isArray(termsData.sections)) {
        termsData.sections.forEach(section => {
            if (section.title) {
                html += `<h4>${section.title}</h4>`;
            }
            if (section.content) {
                if (Array.isArray(section.content)) {
                    html += '<ul>';
                    section.content.forEach(item => {
                        html += `<li>${item}</li>`;
                    });
                    html += '</ul>';
                } else {
                    html += `<p>${section.content}</p>`;
                }
            }
        });
    }
    
    if (termsData.conclusion) {
        html += `<p>${termsData.conclusion}</p>`;
    }
    
    termsContent.innerHTML = html;
}

// Carregar disponibilidade do Supabase
// Carregar disponibilidade do Supabase
async function loadAvailabilityFromSupabase() {
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase não configurado');
        }
        
        const { data, error } = await window.supabaseClient
            .from('availability')
            .select('*')
            .order('date', { ascending: true });
        
        if (error) {
            console.error('Erro ao carregar disponibilidade:', error);
            loadLocalAvailability();
            return;
        }
        
        // IMPORTANTE: Limpar o objeto de disponibilidade
        window.availability = {};
        
        if (data && data.length > 0) {
            // Converter dados do Supabase para o formato local
            data.forEach(item => {
                window.availability[item.date] = {
                    // Áudio: array de períodos (vazio = bloqueio total)
                    audio: item.audio_periods || [],
                    audio_periods: item.audio_periods || [],
                    // Vídeo: 'available' ou 'blocked'
                    video: item.video_available ? 'available' : 'blocked',
                    video_available: item.video_available
                };
            });
            console.log('Disponibilidade customizada carregada do Supabase:', Object.keys(window.availability).length, 'dias');
        } else {
            console.log('Nenhum dado no Supabase - usando sistema de regras padrão');
            // Não inicializar nada - o sistema usará regras padrão
        }
        
        // Atualizar calendário
        generateCalendar(window.currentDate);
        
        // Atualizar slots se houver data selecionada
        if (window.selectedDate) {
            const dateStr = formatDateForAvailability(window.selectedDate);
            const status = getDayStatus(dateStr, window.selectedStudio);
            updateTimeSlots(status.periodos);
        }
    } catch (error) {
        console.error('Erro ao conectar ao Supabase:', error);
        loadLocalAvailability();
    }
}


// Carregar disponibilidade local (fallback)
function loadLocalAvailability() {
    console.log('Carregando disponibilidade local...');
    const savedAvailability = localStorage.getItem('polymusicAvailability');
    if (savedAvailability) {
        window.availability = JSON.parse(savedAvailability);
        console.log('Disponibilidade local carregada:', Object.keys(window.availability).length, 'dias');
    } else {
        console.log('Usando sistema de regras padrão...');
        initializeDefaultAvailability();
    }
}

// Inicializar disponibilidade padrão
function initializeDefaultAvailability() {
    // Não inicializar mais dias automaticamente
    // Apenas usar o objeto vazio - o sistema usará as regras padrão
    window.availability = {};
    console.log('Sistema iniciado com lógica de regras padrão');
    
    // Remover do localStorage se existir versão antiga
    localStorage.removeItem('polymusicAvailability');
}

// Salvar disponibilidade no Supabase
async function saveAvailabilityToSupabase() {
    try {
        if (!window.supabaseClient) {
            console.log('Supabase não configurado, salvando localmente');
            localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
            return false;
        }
    
        // Primeiro, limpar todos os registros existentes
        const { error: deleteError } = await window.supabaseClient
            .from('availability')
            .delete()
            .gte('date', '1900-01-01');
        
        if (deleteError) {
            console.error('Erro ao limpar disponibilidade:', deleteError);
            return false;
        }
        
        // Preparar dados para inserção (apenas dias com configuração personalizada)
        const availabilityArray = Object.keys(window.availability).map(date => {
            return {
                date: date,
                audio_periods: window.availability[date].audio || [],
                video_available: window.availability[date].video === 'available'
            };
        });
        
        // Inserir em lotes (se houver dados)
        if (availabilityArray.length > 0) {
            const batchSize = 50;
            for (let i = 0; i < availabilityArray.length; i += batchSize) {
                const batch = availabilityArray.slice(i, i + batchSize);
                const { error: insertError } = await window.supabaseClient
                    .from('availability')
                    .insert(batch);
                
                if (insertError) {
                    console.error('Erro ao salvar disponibilidade:', insertError);
                    localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
                    return false;
                }
            }
            
            console.log('Disponibilidade salva no Supabase com sucesso!');
        } else {
            console.log('Nenhuma configuração personalizada para salvar');
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao conectar ao Supabase:', error);
        localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
        return false;
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Supabase apenas uma vez
    if (!window.supabaseClient) {
        try {
            window.supabaseClient = window.supabase.createClient(
                window.SUPABASE_CONFIG.url, 
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('Supabase inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar Supabase:', error);
        }
    }
    
    loadTermsFromJson();
    loadAvailabilityFromSupabase();
    generateCalendar(window.currentDate);
    updateTimeSlots([]);
    selectStudio('audio');
    
    // Inicializar navegação do mês
    initMonthNavigation();
    
    // Event listener para checkbox de termos
    document.getElementById('termsCheckbox').addEventListener('change', function() {
        const confirmButton = document.getElementById('confirmButton');
        if (this.checked) {
            confirmButton.disabled = false;
            confirmButton.classList.remove('btn-disabled');
        } else {
            confirmButton.disabled = true;
            confirmButton.classList.add('btn-disabled');
        }
    });
    
    // Event listener para nome do cliente
    document.getElementById('clientName').addEventListener('input', validateForm);
});