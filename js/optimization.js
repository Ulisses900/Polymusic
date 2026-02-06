// optimization.js - Otimizações de performance

// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // 1. Gerenciamento de vídeos otimizado
    initOptimizedVideos();
    
    // 2. Lazy loading do mapa
    initLazyMap();
    
    // 3. Controle de memória
    initMemoryManagement();
    
    // 4. Performance monitoring
    initPerformanceMonitoring();
});

// 1. Sistema de vídeos otimizado
function initOptimizedVideos() {
    const videoContainers = document.querySelectorAll('.video-container[data-video-src]');
    
    videoContainers.forEach(container => {
        let video = null;
        let isVideoLoaded = false;
        
        // Carrega vídeo no hover
        container.addEventListener('mouseenter', function() {
            if (!isVideoLoaded) {
                loadVideo(this);
            } else if (video) {
                video.play().catch(e => console.log("Autoplay prevented:", e));
            }
        });
        
        // Pausa vídeo quando sai
        container.addEventListener('mouseleave', function() {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Toca ao clicar também
        container.addEventListener('click', function() {
            if (!isVideoLoaded) {
                loadVideo(this);
            } else if (video) {
                video.play().catch(e => console.log("Autoplay prevented:", e));
            }
        });
        
        function loadVideo(containerElement) {
            const videoSrc = containerElement.getAttribute('data-video-src');
            
            // Cria elemento de vídeo
            video = document.createElement('video');
            video.src = videoSrc;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            
            // Eventos do vídeo
            video.addEventListener('loadeddata', function() {
                containerElement.classList.add('active');
                isVideoLoaded = true;
                
                // Tenta tocar
                video.play().catch(e => {
                    console.log("Autoplay prevented on hover:", e);
                });
            });
            
            video.addEventListener('error', function() {
                console.error('Erro ao carregar vídeo:', videoSrc);
                // Mantém o preview estático
            });
            
            // Adiciona vídeo ao container
            containerElement.appendChild(video);
        }
    });
    
    // Otimização do vídeo de fundo do hero
    const heroVideo = document.querySelector('.hero-background');
    if (heroVideo) {
        // Aguarda a página carregar para tocar o vídeo
        setTimeout(() => {
            heroVideo.play().catch(e => {
                console.log("Hero video autoplay prevented:", e);
                // Fallback para imagem estática
                document.querySelector('.hero-fallback').style.display = 'block';
            });
        }, 500);
    }
}

// 2. Lazy loading do mapa
function initLazyMap() {
    const mapIframe = document.querySelector('.map-container iframe');
    if (!mapIframe) return;
    
    // Carrega o mapa apenas quando estiver visível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                const src = iframe.getAttribute('data-src');
                
                if (src) {
                    iframe.setAttribute('src', src);
                    iframe.removeAttribute('data-src');
                }
                
                observer.unobserve(iframe);
            }
        });
    }, {
        rootMargin: '100px', // Carrega 100px antes de aparecer
        threshold: 0.1
    });
    
    observer.observe(mapIframe);
}

// 3. Gerenciamento de memória
function initMemoryManagement() {
    // Limpa memória quando a página não está visível
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pausa vídeos quando a página não está visível
            pauseAllVideos();
        }
    });
    
    // Pausa vídeos quando a janela perde foco
    window.addEventListener('blur', function() {
        pauseAllVideos();
    });
    
    function pauseAllVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    }
}

// 4. Monitoramento de performance
function initPerformanceMonitoring() {
    // Verifica performance do carregamento
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Performance:', {
                    'Tempo total': perfData.loadEventEnd - perfData.startTime + 'ms',
                    'DOM carregado': perfData.domContentLoadedEventEnd - perfData.startTime + 'ms'
                });
            }
        }
    });
    
    // Verifica memória se disponível
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            console.log('Uso de memória:', {
                'JS Heap Size': Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                'Total JS Heap Size': Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB'
            });
        }, 30000); // A cada 30 segundos
    }
}

// 5. Debounce para eventos de resize/scroll
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplica debounce a eventos pesados
window.addEventListener('resize', debounce(function() {
    // Atualizações que precisam ser feitas no resize
}, 250));