// ============================================
// FUNÇÕES DO PAINEL ADMINISTRATIVO - VERSÃO FINAL
// ============================================

// Função hash para senha
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

// Hash da senha correta
const ADMIN_PASSWORD_HASH = simpleHash(window.SYSTEM_CONFIG.adminPassword);

// Abrir painel admin
function openAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminBackdrop').style.display = 'block';
}

// Fechar painel admin
function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminBackdrop').style.display = 'none';
    window.adminLoggedIn = false;
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// Login admin
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    const passwordHash = simpleHash(password);
    
    if (passwordHash === ADMIN_PASSWORD_HASH) {
        window.adminLoggedIn = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        updatePeriodOptionsForStudio('audio'); // Inicializar com áudio
        generateAdminCalendar(window.adminCurrentDate);
        
        // Adicionar event listeners para navegação do mês no admin
        document.getElementById('admin-prev-month').addEventListener('click', function() {
            window.adminCurrentDate.setMonth(window.adminCurrentDate.getMonth() - 1);
            generateAdminCalendar(window.adminCurrentDate);
        });
        
        document.getElementById('admin-next-month').addEventListener('click', function() {
            window.adminCurrentDate.setMonth(window.adminCurrentDate.getMonth() + 1);
            generateAdminCalendar(window.adminCurrentDate);
        });
        
        // Event listener para mudança de tipo de estúdio
        document.getElementById('adminStudioType').addEventListener('change', function() {
            updatePeriodOptionsForStudio(this.value);
            generateAdminCalendar(window.adminCurrentDate);
        });
        
        // Event listener para mudança de período
        document.getElementById('adminPeriodType').addEventListener('change', function() {
            generateAdminCalendar(window.adminCurrentDate);
        });
    } else {
        alert('Senha incorreta!');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Atualizar opções de período baseado no tipo de estúdio
function updatePeriodOptionsForStudio(studioType) {
    const periodSelect = document.getElementById('adminPeriodType');
    
    if (studioType === 'audio') {
        periodSelect.innerHTML = `
            <option value="full">Período Completo (8h)</option>
            <option value="half1">Meio Período (10h-14h)</option>
            <option value="half2">Meio Período (14h-18h)</option>
        `;
    } else {
        // Para vídeo, apenas período completo
        periodSelect.innerHTML = `
            <option value="full">Período Completo (8h)</option>
        `;
    }
}

// Gerar calendário para o painel admin
function generateAdminCalendar(date) {
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    document.getElementById('admin-current-month').textContent = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendarDays = document.getElementById('admin-calendar-days');
    calendarDays.innerHTML = '';
    
    // Dias em branco
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        calendarDays.appendChild(emptyDay);
    }
    
    // Dias do mês
    const today = new Date();
    const studioType = document.getElementById('adminStudioType').value;
    const periodType = document.getElementById('adminPeriodType').value;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;
        
        const currentDateObj = new Date(year, month, day);
        const dateStr = formatDateForAvailability(currentDateObj);
        
        // Usar nova função para determinar status
        const status = getDayStatus(dateStr, studioType);
        
        // Marcar hoje
        if (currentDateObj.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Adicionar tooltip
        dayElement.title = getAdminTooltipMessage(status, studioType, periodType);
        
        if (status.disponivel) {
            dayElement.classList.add('available');
            
            if (status.customizado) {
                dayElement.classList.add('custom-disponivel');
            } else {
                dayElement.classList.add('padrao-disponivel');
            }
        } else {
            dayElement.classList.add('unavailable');
            
            if (status.motivo === 'final_de_semana') {
                dayElement.classList.add('final-semana');
            } else if (status.motivo === 'ponto_facultativo') {
                dayElement.classList.add('ponto-facultativo');
            } else if (status.tipo) {
                dayElement.classList.add(status.tipo.replace(/_/g, '-'));
            } else if (status.motivo === 'bloqueado_adm') {
                dayElement.classList.add('bloqueado-adm');
            }
        }
        
        dayElement.addEventListener('click', function() {
            applyAdminBlock(dateStr, studioType, periodType);
        });
        
        calendarDays.appendChild(dayElement);
    }
}

// Tooltip para admin
function getAdminTooltipMessage(status, studioType, periodType) {
    if (status.disponivel) {
        if (status.customizado) {
            return `${studioType === 'audio' ? 'Áudio' : 'Vídeo'}: Disponível (Configurado manualmente)\nClique para ${periodType === 'full' ? 'bloquear período completo' : `alternar ${periodType}`}`;
        } else {
            return `${studioType === 'audio' ? 'Áudio' : 'Vídeo'}: Disponível por padrão\nClique para ${periodType === 'full' ? 'bloquear período completo' : `bloquear ${periodType}`}`;
        }
    } else {
        if (status.motivo === 'final_de_semana') {
            return 'Final de semana\nClique para liberar';
        } else if (status.motivo === 'feriado' || status.motivo === 'ponto_facultativo') {
            return `${status.observacao}\nClique para liberar`;
        } else {
            return `${studioType === 'audio' ? 'Áudio' : 'Vídeo'}: Bloqueado manualmente\nClique para liberar`;
        }
    }
}

// Atualizar calendário admin
function updateAdminCalendar() {
    generateAdminCalendar(window.adminCurrentDate);
}

// NOVA FUNÇÃO: Aplicar bloqueio admin (regra de negócio)
function applyAdminBlock(dateStr, studioType, periodType) {
    if (!window.availability) window.availability = {};
    if (!window.availability[dateStr]) window.availability[dateStr] = {};
    
    const dayData = window.availability[dateStr];
    
    if (studioType === 'audio') {
        // ÁUDIO: FULL = bloqueio total, half1/half2 = bloqueio parcial
        if (periodType === 'full') {
            // FULL (8h) = BLOQUEIO TOTAL
            const jaBloqueado = Array.isArray(dayData.audio) && dayData.audio.length === 0;
            if (jaBloqueado) {
                // Se já está bloqueado, libera todos os períodos
                dayData.audio = ['full', 'half1', 'half2'];
            } else {
                // Bloqueia totalmente
                dayData.audio = [];
            }
        } else {
            // Parcial: alterna half1/half2
            if (!Array.isArray(dayData.audio)) {
                // Inicializa com todos disponíveis
                dayData.audio = ['full', 'half1', 'half2'];
            }
            
            const set = new Set(dayData.audio);
            
            if (set.has(periodType)) {
                set.delete(periodType);
            } else {
                set.add(periodType);
            }
            
            // Remove 'full' se estiver presente (para não conflitar)
            set.delete('full');
            
            dayData.audio = Array.from(set);
        }
    } else if (studioType === 'video') {
        // VÍDEO: FULL = toggle disponível/bloqueado, ignora half1/half2
        // Para vídeo, treat half1/half2 como full também
        const isBlocked = (dayData.video === 'blocked');
        dayData.video = isBlocked ? 'available' : 'blocked';
    }
    
    // Verificar se voltou ao padrão e remover se necessário
    if (isDefaultForDate(dateStr, dayData)) {
        delete window.availability[dateStr];
    }
    
    // Atualizar visualização
    generateAdminCalendar(window.adminCurrentDate);
    
    // Atualizar calendário principal se estiver no mesmo mês
    if (window.currentDate.getMonth() === window.adminCurrentDate.getMonth() && 
        window.currentDate.getFullYear() === window.adminCurrentDate.getFullYear()) {
        generateCalendar(window.currentDate);
    }
    
    // Atualizar slots de tempo se esta data está selecionada
    if (window.selectedDate && formatDateForAvailability(window.selectedDate) === dateStr) {
        const newStatus = getDayStatus(dateStr, window.selectedStudio);
        updateTimeSlots(newStatus.periodos);
    }
}

// Verificar se um dia está no padrão
function isDefaultForDate(dateStr, dayData) {
    if (!dayData || Object.keys(dayData).length === 0) {
        return true;
    }
    
    // Verificar se é dia útil
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Verificar se é feriado
    const feriadoInfo = verificarFeriado(dateStr);
    const isHoliday = feriadoInfo && feriadoInfo.tipo !== 'ponto_facultativo';
    const isFacultativo = feriadoInfo && feriadoInfo.tipo === 'ponto_facultativo';
    
    // Se for final de semana, feriado ou ponto facultativo
    if (isWeekend || isHoliday || isFacultativo) {
        // Padrão é bloqueado para ambos
        const audioBlocked = !dayData.audio || dayData.audio.length === 0;
        const videoBlocked = !dayData.video || dayData.video === 'blocked';
        return audioBlocked && videoBlocked;
    }
    
    // Dia útil: padrão é disponível
    const audioDefault = !dayData.audio || arraysEqual(dayData.audio, ['full', 'half1', 'half2']);
    const videoDefault = !dayData.video || dayData.video === 'available';
    
    return audioDefault && videoDefault;
}

// Helper: comparar arrays (ignorando ordem)
function arraysEqual(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    
    for (const item of set1) {
        if (!set2.has(item)) return false;
    }
    return true;
}

// SALVAR NO SUPABASE: só dias customizados
async function saveAdminChanges() {
    try {
        if (!window.supabaseClient) {
            console.log('Supabase não configurado, salvando localmente');
            localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
            return false;
        }
        
        // 1) Apaga tudo
        const { error: deleteError } = await window.supabaseClient
            .from('availability')
            .delete()
            .gte('date', '1900-01-01');
        
        if (deleteError) {
            console.error('Erro ao limpar disponibilidade:', deleteError);
            return false;
        }
        
        // 2) Monta só os dias customizados
        const customEntries = [];
        
        Object.entries(window.availability || {}).forEach(([dateStr, dayData]) => {
            if (dayData && !isDefaultForDate(dateStr, dayData)) {
                const row = { date: dateStr };
                
                // Só grava áudio se o ADM mexeu em áudio
                if ('audio' in dayData) {
                    row.audio_periods = Array.isArray(dayData.audio) ? dayData.audio : [];
                }
                
                // Só grava vídeo se o ADM mexeu em vídeo
                if ('video' in dayData) {
                    row.video_available = (dayData.video === 'available');
                }
                
                customEntries.push(row);
            }
        });
        
        // 3) Insere os customizados
        if (customEntries.length > 0) {
            const batchSize = 50;
            for (let i = 0; i < customEntries.length; i += batchSize) {
                const batch = customEntries.slice(i, i + batchSize);
                const { error: insertError } = await window.supabaseClient
                    .from('availability')
                    .insert(batch);
                
                if (insertError) {
                    console.error('Erro ao salvar disponibilidade:', insertError);
                    localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
                    return false;
                }
            }
            
            console.log('Disponibilidade customizada salva no Supabase:', customEntries.length, 'dias');
        } else {
            console.log('Nenhuma configuração personalizada para salvar');
        }
        
        // 4) Salva localmente também
        localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
        
        alert('Alterações salvas com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao conectar ao Supabase:', error);
        localStorage.setItem('polymusicAvailability', JSON.stringify(window.availability));
        alert('Alterações salvas localmente. Erro ao conectar ao Supabase.');
        return false;
    }
}

// Resetar alterações do admin
async function resetAdminChanges() {
    if (confirm('Tem certeza que deseja resetar todas as alterações? Isso removerá TODAS as configurações personalizadas.')) {
        window.availability = {};
        const success = await saveAdminChanges();
        if (success) {
            generateAdminCalendar(window.adminCurrentDate);
            generateCalendar(window.currentDate);
            updateTimeSlots([]);
            alert('Todas as configurações personalizadas foram removidas.');
        } else {
            alert('Configurações resetadas localmente.');
        }
    }
}

// Restaurar padrão para data selecionada no admin
function restoreDefaultForSelectedDate() {
    const selectedAdminDate = document.querySelector('#admin-calendar-days .day.selected');
    if (!selectedAdminDate) {
        alert('Por favor, selecione uma data no calendário do painel administrativo.');
        return;
    }
    
    const dayNum = parseInt(selectedAdminDate.textContent);
    const year = window.adminCurrentDate.getFullYear();
    const month = window.adminCurrentDate.getMonth();
    const date = new Date(year, month, dayNum);
    const dateStr = formatDateForAvailability(date);
    
    if (confirm(`Restaurar disponibilidade padrão para ${dateStr}?`)) {
        delete window.availability[dateStr];
        saveAdminChanges();
        generateAdminCalendar(window.adminCurrentDate);
        
        // Atualizar calendário principal se necessário
        if (window.currentDate.getMonth() === month && window.currentDate.getFullYear() === year) {
            generateCalendar(window.currentDate);
        }
        
        alert('Dia restaurado para disponibilidade padrão');
    }
}