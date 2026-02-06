// =========================================================================
// ARQUIVO: js/portfolio.js
// LÓGICA: Link Direto - Clicar na capa abre o YouTube em nova aba
// =========================================================================

const PRODUCOES_POLYDISC = [
    { "titulo": "Kelly Olliveira - Sobrando Azar (Clipe Oficial)", "id": "5B4_FzzFZXk" },                 // :contentReference[oaicite:0]{index=0}
    { "titulo": "Ana Valença - Novo Namorado (Clipe Oficial)", "id": "f8Fif4RLMUc" },              // :contentReference[oaicite:1]{index=1}
    { "titulo": "Eletra - O Som É Massa (Clipe Oficial)", "id": "V8ABoh5giMc" },                  // :contentReference[oaicite:2]{index=2}
    { "titulo": "Simples Olhar - Uma Cama e Dois Lençóis (Clipe Oficial)", "id": "MZLnLEAFBvY" },   // :contentReference[oaicite:3]{index=3}
    { "titulo": "Maciel Melo - A Rosa e o Girassol (Clipe Oficial)", "id": "C_zCYRZ6kYo" },         // :contentReference[oaicite:4]{index=4}
    { "titulo": "Banda Metade - Não Diga Nada (Clipe Oficial)", "id": "cOGEcMAVyNY" },             // :contentReference[oaicite:5]{index=5}
    { "titulo": "DECIDA - DEB LIMA (Clipe Oficial)", "id": "EGrOaF-cO5U" },                        // :contentReference[oaicite:6]{index=6}
    { "titulo": "Petrúcio Amorim - Nada Levarei (Clipe Oficial)", "id": "oovT0y_87YQ" },            // :contentReference[oaicite:7]{index=7}
    { "titulo": "Gustavo Travassos Ft. Charles Theone - Galo Misterioso", "id": "meiqLXI-MXQ" },     // :contentReference[oaicite:8]{index=8}
    { "titulo": "Bia Villa-Chan Ft. Kelvis Duran - Medley: Perdoa-me", "id": "k6pL6J0JfuA" }          // :contentReference[oaicite:9]{index=9}
];


// --- FUNÇÕES DE CONTROLE (MANTER IGUAL) ---

function openPortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    if (modal) {
        modal.classList.add('active'); 
        modal.style.display = 'flex';
        carregarFotos();
        carregarVideos();
    }
}

function closePortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const targetId = tabName + 'Tab'; 
    const targetDiv = document.getElementById(targetId);

    if (targetDiv) {
        targetDiv.classList.add('active');
        targetDiv.style.display = 'block';
        if (tabName === 'productions') carregarVideos();
    }
    
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

// --- CARREGAMENTO DE FOTOS ---
function carregarFotos() {
    const gallery = document.getElementById('portfolioGallery');
    if (gallery && (gallery.innerHTML.includes('Carregando') || gallery.innerHTML.trim() === '')) {
        gallery.innerHTML = ''; 
        const fotos = ['foto1.jpg', 'foto2.jpg', 'foto3.jpg', 'foto4.jpg', 'foto5.jpg', 'foto6.jpg', 'foto7.jpg', 'foto8.jpg'];
        
        fotos.forEach(foto => {
            gallery.innerHTML += `
                <img src="static/portfolio/${foto}" 
                     class="img-portfolio" 
                     onclick="window.open(this.src)" 
                     style="width:100%; margin-bottom:15px; border-radius:8px; cursor:pointer;" 
                     onerror="this.style.display='none'">`;
        });
    }
}

// --- CARREGAMENTO DE VÍDEOS (MODO LINK EXTERNO SEGURO) ---
function carregarVideos() {
    const list = document.getElementById('productionsList');
    if (!list) return;

    if (list.innerHTML.includes('Carregando') || list.innerHTML.trim() === '') {
        list.innerHTML = ''; 
        
        PRODUCOES_POLYDISC.forEach((video) => {
            // URL da Thumbnail
            const thumbUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
            // URL para assistir (Nova Aba)
            const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;
            
            list.innerHTML += `
                <div class="video-card" style="margin-bottom: 30px; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border: 1px solid #333;">
                    
                    <div class="video-wrapper" 
                         style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; cursor: pointer; border: 1px solid #444;" 
                         onclick="window.open('${watchUrl}', '_blank')"
                         title="Assistir no YouTube">
                        
                        <img src="${thumbUrl}" 
                             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.9; transition: transform 0.3s;" 
                             alt="${video.titulo}">
                        
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(204, 0, 0, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(0,0,0,0.6); z-index: 2; pointer-events: none;">
                            <i class="fas fa-play" style="color: white; font-size: 28px; margin-left: 5px;"></i>
                        </div>
                        
                    </div>

                    <div style="text-align: center; margin-top: 15px;">
                        <p style="color: white; font-weight: 600; font-size: 1rem; margin-bottom: 5px;">${video.titulo}</p>
                        
                        <a href="${watchUrl}" target="_blank" style="font-size: 0.85rem; color: #aaa; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-external-link-alt"></i> Ver no YouTube
                        </a>
                    </div>
                </div>`;
        });
    }
}

// Fechar modal clicando fora
window.addEventListener('click', function(event) {
    const modal = document.getElementById('portfolioModal');
    if (event.target === modal) closePortfolioModal();
});