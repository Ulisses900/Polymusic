// ============================================
// FUNÇÕES DO CALENDÁRIO
// ============================================

// Nova função para verificar se a data é hoje ou no passado
function isTodayOrPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove horas para comparar apenas a data
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate <= today;
}

// Nova função para encontrar o próximo dia útil
function getNextBusinessDay(startDate) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1); // Começa a verificar a partir de amanhã
    
    // Loop até encontrar um dia útil
    let attempts = 0;
    const maxAttempts = 30; // Limite de segurança para evitar loop infinito
    
    while (attempts < maxAttempts) {
        const dateStr = formatDateForAvailability(date);
        const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
        
        // Verifica se não é final de semana
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            // Verifica se não é feriado
            const feriadoInfo = verificarFeriado(dateStr);
            if (!feriadoInfo) {
                return date;
            }
        }
        
        // Próximo dia
        date.setDate(date.getDate() + 1);
        attempts++;
    }
    
    // Se não encontrar em 30 dias, retorna amanhã mesmo
    const tomorrow = new Date(startDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}

// Função principal para determinar status do dia - MODIFICADA
function getDayStatus(dateStr, service) {
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
    
    // 0. BLOQUEAR HOJE E DATAS PASSADAS
    if (isTodayOrPast(date)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        if (date.getTime() === today.getTime()) {
            return {
                disponivel: false,
                motivo: 'hoje_bloqueado',
                periodos: [],
                observacao: 'Agendamento disponível apenas a partir de amanhã'
            };
        } else {
            return {
                disponivel: false,
                motivo: 'passado',
                periodos: [],
                observacao: 'Não é possível agendar para datas passadas'
            };
        }
    }
    
    // 1. Verificar se é final de semana
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
        return {
            disponivel: false,
            motivo: 'final_de_semana',
            periodos: [],
            observacao: getObservacaoFeriado(dateStr)
        };
    }
    
    // 2. Verificar se é feriado ou ponto facultativo
    const feriadoInfo = verificarFeriado(dateStr);
    if (feriadoInfo) {
        return {
            disponivel: false,
            motivo: feriadoInfo.tipo === 'ponto_facultativo' ? 'ponto_facultativo' : 'feriado',
            periodos: [],
            observacao: feriadoInfo.descricao,
            tipo: feriadoInfo.tipo
        };
    }
    
    // 3. Verificar no Supabase (bloqueios manuais do ADM)
    const dayData = window.availability ? window.availability[dateStr] : null;
    
    if (dayData && Object.keys(dayData).length > 0) {
        // ADM já definiu algo para este dia
        if (service === 'audio') {
            // Para áudio: verificar períodos disponíveis
            const periodos = dayData.audio_periods || dayData.audio || [];
            
            // Se o array está vazio, significa bloqueio total pelo ADM
            if (periodos.length === 0) {
                return {
                    disponivel: false,
                    motivo: 'bloqueado_adm',
                    periodos: [],
                    customizado: true,
                    observacao: 'Bloqueado manualmente (período completo)'
                };
            }
            
            // Se há períodos disponíveis
            return {
                disponivel: periodos.length > 0,
                motivo: periodos.length > 0 ? 'disponivel_adm' : 'bloqueado_adm',
                periodos: periodos,
                customizado: true,
                observacao: periodos.length > 0 ? `Períodos disponíveis: ${periodos.length}` : ''
            };
        } else {
            // Para vídeo: verificar se está disponível
            // Suporta ambos os formatos: video_available (boolean) ou video (string)
            let disponivel = false;
            
            if (typeof dayData.video_available === 'boolean') {
                disponivel = dayData.video_available;
            } else if (dayData.video === 'available') {
                disponivel = true;
            } else if (dayData.video === 'blocked') {
                disponivel = false;
            }
            
            return {
                disponivel: disponivel,
                motivo: disponivel ? 'disponivel_adm' : 'bloqueado_adm',
                periodos: disponivel ? ['available'] : [],
                customizado: true,
                observacao: disponivel ? '' : 'Bloqueado manualmente (período completo)'
            };
        }
    }
    
    // 4. Padrão: Dia útil não feriado = DISPONÍVEL para ambos
    if (service === 'audio') {
        return {
            disponivel: true,
            motivo: 'padrao_disponivel',
            periodos: ['full', 'half1', 'half2'],
            customizado: false,
            observacao: ''
        };
    } else {
        // VÍDEO: Por padrão, dias úteis são disponíveis
        return {
            disponivel: true,
            motivo: 'padrao_disponivel',
            periodos: ['available'],
            customizado: false,
            observacao: ''
        };
    }
}

// Função para verificar se é feriado
function verificarFeriado(dateStr) {
    return window.FERIADOS_DETALHADOS[dateStr] || null;
}

// Função para obter observação específica do feriado
function getObservacaoFeriado(dateStr) {
    const feriadosDomingo = {
        '2026-11-15': 'Proclamação da República (feriado nacional)'
    };
    
    return feriadosDomingo[dateStr] || 'Final de semana';
}

// Função auxiliar para tooltip - MODIFICADA
function getTooltipMessage(status) {
    const motivos = {
        'final_de_semana': 'Final de semana',
        'feriado': `Feriado: ${status.observacao}`,
        'ponto_facultativo': `Ponto facultativo: ${status.observacao}`,
        'padrao_disponivel': 'Disponível',
        'disponivel_adm': 'Disponível',
        'bloqueado_adm': status.observacao || 'Indisponível',
        'hoje_bloqueado': 'Agendamento disponível apenas a partir de amanhã',
        'passado': 'Não é possível agendar para datas passadas'
    };
    
    return motivos[status.motivo] || 'Clique para selecionar';
}

// Gerar calendário - MODIFICADA para sugerir próximo dia útil
function generateCalendar(date) {
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    document.getElementById('current-month').textContent = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // Dias em branco antes do primeiro dia do mês
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        calendarDays.appendChild(emptyDay);
    }
    
    // Dias do mês
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;
        
        const currentDateObj = new Date(year, month, day);
        const dateStr = formatDateForAvailability(currentDateObj);
        
        // Usar nova função para determinar status
        const status = getDayStatus(dateStr, window.currentService);
        
        // Marcar hoje
        currentDateObj.setHours(0, 0, 0, 0);
        if (currentDateObj.getTime() === today.getTime()) {
            dayElement.classList.add('today');
            // Adicionar badge "Hoje"
            const todayBadge = document.createElement('span');
            todayBadge.className = 'today-badge';
            todayBadge.textContent = 'Hoje';
            dayElement.appendChild(todayBadge);
        }
        
        // Adicionar tooltip informativo
        if (status.motivo === 'hoje_bloqueado' || status.motivo === 'passado' || 
            status.motivo === 'feriado' || status.motivo === 'ponto_facultativo') {
            dayElement.title = getTooltipMessage(status);
        }
        
        if (status.disponivel) {
            dayElement.classList.add('available');
            
            dayElement.addEventListener('click', function() {
                selectDate(currentDateObj);
            });
        } else {
            dayElement.classList.add('unavailable');
            
            // Adicionar classe específica baseada no motivo
            if (status.motivo === 'hoje_bloqueado') {
                dayElement.classList.add('hoje-bloqueado');
                // Adicionar ícone de bloqueio para hoje
                const lockIcon = document.createElement('i');
                lockIcon.className = 'fas fa-lock';
                lockIcon.style.marginLeft = '5px';
                lockIcon.style.fontSize = '0.8em';
                dayElement.appendChild(lockIcon);
            } else if (status.motivo === 'passado') {
                dayElement.classList.add('passado');
            } else if (status.motivo === 'final_de_semana') {
                dayElement.classList.add('final-semana');
            } else if (status.motivo === 'ponto_facultativo') {
                dayElement.classList.add('ponto-facultativo');
            } else if (status.tipo) {
                dayElement.classList.add(status.tipo.replace(/_/g, '-'));
            } else {
                dayElement.classList.add('bloqueado-adm');
            }
        }
        
        // Verificar se é a data selecionada
        if (window.selectedDate && window.selectedDate.toDateString() === currentDateObj.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Se o mês atual contém hoje, destacar a próxima data disponível
    highlightNextAvailableDate();
}

// Função para destacar a próxima data disponível
function highlightNextAvailableDate() {
    const today = new Date();
    const nextBusinessDay = getNextBusinessDay(today);
    const nextDateStr = formatDateForAvailability(nextBusinessDay);
    
    // Verificar se a próxima data disponível está no mês atual do calendário
    const currentMonth = window.currentDate.getMonth();
    const currentYear = window.currentDate.getFullYear();
    
    if (nextBusinessDay.getMonth() === currentMonth && nextBusinessDay.getFullYear() === currentYear) {
        const dayElements = document.querySelectorAll('.day:not(.empty)');
        dayElements.forEach(dayElement => {
            if (parseInt(dayElement.textContent) === nextBusinessDay.getDate()) {
                dayElement.classList.add('next-available');
                dayElement.title = 'Próxima data disponível para agendamento';
                
                // Adicionar badge indicativo
                const badge = document.createElement('span');
                badge.className = 'next-available-badge';
                badge.textContent = 'Próximo disponível';
                dayElement.appendChild(badge);
            }
        });
    }
}

// Selecionar data - MODIFICADA para mensagem mais clara
function selectDate(date) {
    const dateStr = formatDateForAvailability(date);
    const status = getDayStatus(dateStr, window.selectedStudio);
    
    if (!status.disponivel) {
        let mensagem = 'Esta data não está disponível para agendamento.';
        if (status.motivo === 'hoje_bloqueado') {
            mensagem = 'Não é possível agendar para hoje. O agendamento está disponível apenas a partir de amanhã.';
        } else if (status.motivo === 'passado') {
            mensagem = 'Não é possível agendar para datas passadas.';
        } else if (status.motivo === 'final_de_semana') {
            mensagem = 'Final de semana não disponível para agendamento regular.';
        } else if (status.motivo === 'feriado') {
            mensagem = `Feriado (${status.observacao}) não disponível para agendamento.`;
        } else if (status.motivo === 'ponto_facultativo') {
            mensagem = `Ponto facultativo (${status.observacao}) não disponível para agendamento.`;
        } else if (status.motivo === 'bloqueado_adm') {
            mensagem = 'Data bloqueada pela administração.';
        }
        
        // Mostrar sugestão de próxima data disponível
        const today = new Date();
        const nextAvailable = getNextBusinessDay(today);
        const nextDateStr = nextAvailable.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (status.motivo === 'hoje_bloqueado' || status.motivo === 'passado') {
            mensagem += `\n\nSugestão: Próxima data disponível: ${nextDateStr}`;
        }
        
        alert(mensagem);
        return;
    }
    
    window.selectedDate = date;
    
    // Remover seleção anterior
    const previousSelected = document.querySelector('.day.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Adicionar seleção à nova data
    const days = document.querySelectorAll('.day');
    days.forEach(day => {
        if (parseInt(day.textContent) === date.getDate() && !day.classList.contains('unavailable')) {
            day.classList.add('selected');
        }
    });
    
    // Atualizar slots de tempo disponíveis
    updateTimeSlots(status.periodos);
    
    // Validar formulário
    validateForm();
}

// Atualizar slots de tempo
function updateTimeSlots(availablePeriods) {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    window.selectedTimeSlot = null;
    
    if (!window.selectedDate || availablePeriods.length === 0) {
        const noSlots = document.createElement('div');
        noSlots.classList.add('time-slot', 'unavailable');
        noSlots.innerHTML = '<p>Nenhum período disponível</p>';
        timeSlotsContainer.appendChild(noSlots);
        return;
    }
    
    // Para vídeo
    if (window.selectedStudio === 'video' && availablePeriods.includes('available')) {
        const slotElement = document.createElement('div');
        slotElement.classList.add('time-slot');
        slotElement.innerHTML = `
            <h4>Período Personalizado</h4>
            <p>Entre em contato para orçamento</p>
        `;
        slotElement.addEventListener('click', function() {
            selectTimeSlot(slotElement, { period: 'personalizado', time: 'Personalizado' });
        });
        timeSlotsContainer.appendChild(slotElement);
        return;
    }
    
    // Para áudio
    const periodMap = {
        'full': { time: '10:00 - 18:00', period: 'Período Completo (8h)', value: 'full' },
        'half1': { time: '10:00 - 14:00', period: 'Meio Período (4h)', value: 'half1' },
        'half2': { time: '14:00 - 18:00', period: 'Meio Período (4h)', value: 'half2' }
    };
    
    Object.keys(periodMap).forEach(periodKey => {
        const slot = periodMap[periodKey];
        const isAvailable = availablePeriods.includes(periodKey);
        
        const slotElement = document.createElement('div');
        slotElement.classList.add('time-slot');
        
        if (!isAvailable) {
            slotElement.classList.add('unavailable');
            slotElement.innerHTML = `
                <h4>${slot.period}</h4>
                <p>${slot.time}</p>
                <small>Indisponível</small>
            `;
        } else {
            slotElement.innerHTML = `
                <h4>${slot.period}</h4>
                <p>${slot.time}</p>
            `;
            slotElement.addEventListener('click', function() {
                selectTimeSlot(slotElement, slot);
            });
        }
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

// Selecionar slot de tempo
function selectTimeSlot(element, slot) {
    // Remover seleção anterior
    const previousSelected = document.querySelector('.time-slot.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Adicionar seleção ao novo slot
    element.classList.add('selected');
    window.selectedTimeSlot = slot;
    
    // Validar formulário
    validateForm();
}

// Funções utilitárias
function formatDateForAvailability(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Validar formulário
function validateForm() {
    const clientName = document.getElementById('clientName').value.trim();
    const termsChecked = document.getElementById('termsCheckbox').checked;
    const isValid = clientName && window.selectedDate && window.selectedTimeSlot && termsChecked;
    
    const confirmButton = document.getElementById('confirmButton');
    if (isValid) {
        confirmButton.disabled = false;
        confirmButton.classList.remove('btn-disabled');
    } else {
        confirmButton.disabled = true;
        confirmButton.classList.add('btn-disabled');
    }
    
    return isValid;
}

// Inicializar navegação do mês
function initMonthNavigation() {
    document.getElementById('prev-month').addEventListener('click', function() {
        window.currentDate.setMonth(window.currentDate.getMonth() - 1);
        generateCalendar(window.currentDate);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        window.currentDate.setMonth(window.currentDate.getMonth() + 1);
        generateCalendar(window.currentDate);
    });
}

// Função para inicializar calendário com data padrão
function initializeCalendar() {
    const today = new Date();
    const nextBusinessDay = getNextBusinessDay(today);
    
    // Definir data atual como a próxima disponível
    window.currentDate = new Date();
    window.selectedDate = null;
    window.selectedTimeSlot = null;
    
    // Iniciar com a data atual, mas destacar a próxima disponível
    generateCalendar(window.currentDate);
    initMonthNavigation();
    
    // Adicionar mensagem informativa no calendário
    addCalendarInfoMessage();
}

// Adicionar mensagem informativa sobre agendamento
function addCalendarInfoMessage() {
    const calendarContainer = document.querySelector('.calendar');
    if (!calendarContainer) return;
    
    const infoBox = document.createElement('div');
    infoBox.className = 'calendar-info-message';
    infoBox.innerHTML = `
        <p><i class="fas fa-info-circle"></i> <strong>Importante:</strong> Agendamentos disponíveis apenas a partir do próximo dia útil.</p>
    `;
    
    calendarContainer.insertAdjacentElement('afterend', infoBox);
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que tudo esteja carregado
    setTimeout(initializeCalendar, 100);
});