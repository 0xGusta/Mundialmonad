const introOverlay = document.getElementById('introOverlay');
const introVideo = document.getElementById('introVideo');
const introLoader = document.getElementById('introLoader');
const enterButton = document.getElementById('enterButton');
const loaderMessage = document.getElementById('loaderMessage');
const soundControl = document.getElementById('soundControl');
const backgroundSound = document.getElementById('backgroundSound');
const soundSettingsModal = document.getElementById('soundSettingsModal');
const volumeSlider = document.getElementById('volumeSlider');
const playPauseBtn = document.getElementById('playPauseBtn');

window.addEventListener('load', () => {
    loadSoundPreferences();
    const videoSeen = localStorage.getItem('introVideoSeen');

    setTimeout(() => {
        enterButton.style.display = 'block';
        if (videoSeen !== 'true') {
            loaderMessage.textContent = "Pressione 'Entrar' para continuar.";
            enterButton.addEventListener('click', handleFirstVisitEnter);
        } else {
            loaderMessage.textContent = "Pressione 'Entrar' para continuar.";
            enterButton.addEventListener('click', startMainApp);
        }
    }, 1000);

    introVideo.onerror = () => {
        console.error("Erro ao carregar o vídeo. Pulando introdução.");
        localStorage.setItem('introVideoSeen', 'true');
        startMainApp();
    };
});

function handleFirstVisitEnter() {
    localStorage.setItem('introVideoSeen', 'true');
    enterButton.style.display = 'none';
    loaderMessage.textContent = "Iniciando vídeo...";
    introLoader.style.display = 'flex';

    introVideo.style.display = 'block';
    introVideo.play().then(() => {
        introLoader.style.display = 'none';
    }).catch(e => {
        console.log("Autoplay do vídeo bloqueado (após clique):", e);
        startMainApp();
    });

    introVideo.onended = () => {
        startMainApp();
    };
}

function startMainApp() {
    introVideo.pause();
    introOverlay.classList.add('hidden');
    setTimeout(() => {
        introOverlay.style.display = 'none';
    }, 500);

    setupSoundEventListeners();

    const musicPausedPreviously = localStorage.getItem('musicPausedByUser');
    if (musicPausedPreviously !== 'true') {
        backgroundSound.play().catch(e => console.log("Autoplay de música bloqueado:", e));
    }
    updateUiBasedOnSoundState();
}

function loadSoundPreferences() {
    const savedVolume = localStorage.getItem('backgroundVolume');

    if (savedVolume !== null) {
        backgroundSound.volume = parseFloat(savedVolume);
        volumeSlider.value = parseFloat(savedVolume);
    } else {
        backgroundSound.volume = 0.2;
        volumeSlider.value = 0.2;
    }
    updateUiBasedOnSoundState();
}

function setupSoundEventListeners() {
    if (soundControl.getAttribute('data-listeners-set') === 'true') return;

    soundControl.addEventListener('click', toggleSoundSettings);
    volumeSlider.addEventListener('input', handleVolumeChange);
    playPauseBtn.addEventListener('click', (event) => {
        event.stopPropagation(); 
        togglePlayPause();
    });

    document.addEventListener('click', (event) => {
        if (!soundSettingsModal.contains(event.target) && !soundControl.contains(event.target)) {
            soundSettingsModal.classList.remove('active');
        }
    });
    soundControl.setAttribute('data-listeners-set', 'true');
}

function toggleSoundSettings() {
    soundSettingsModal.classList.toggle('active');
}

function handleVolumeChange() {
    const volume = volumeSlider.value;
    backgroundSound.volume = volume;
    localStorage.setItem('backgroundVolume', volume);

    if (backgroundSound.muted && volume > 0) {
        backgroundSound.muted = false;
    }
    
    updateUiBasedOnSoundState();
}

function togglePlayPause() {
    if (backgroundSound.paused) {
        if (backgroundSound.volume == 0) {
            backgroundSound.volume = 0.1;
            volumeSlider.value = 0.1;
            localStorage.setItem('backgroundVolume', '0.1');
        }
        backgroundSound.play().catch(e => console.log("Erro ao tentar tocar o som:", e));
        localStorage.setItem('musicPausedByUser', 'false');
    } else {
        backgroundSound.pause();
        localStorage.setItem('musicPausedByUser', 'true');
    }
    updateUiBasedOnSoundState();
}

function updateUiBasedOnSoundState() {
    if (backgroundSound.paused || backgroundSound.muted || backgroundSound.volume === 0) {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i><p>Tocar Música</p>'
        soundControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i><p>Pausar Música</p>'
        soundControl.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}
