const introOverlay = document.getElementById('introOverlay');
const introVideo = document.getElementById('introVideo');
const introLoader = document.getElementById('introLoader');
const enterButton = document.getElementById('enterButton');
const loaderMessage = document.getElementById('loaderMessage');

const soundControl = document.getElementById('soundControl');
const backgroundSound = document.getElementById('backgroundSound');
const soundSettingsModal = document.getElementById('soundSettingsModal');
const volumeSlider = document.getElementById('volumeSlider');
const muteToggle = document.getElementById('muteToggle');

let soundInitialized = false;

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
    backgroundSound.play().catch(e => console.log("Autoplay de música bloqueado:", e));
}

function loadSoundPreferences() {
    const savedVolume = localStorage.getItem('backgroundVolume');
    const savedMute = localStorage.getItem('backgroundMute');

    if (savedVolume !== null) {
        backgroundSound.volume = parseFloat(savedVolume);
        volumeSlider.value = parseFloat(savedVolume);
    } else {
        backgroundSound.volume = 0.2;
        volumeSlider.value = 0.2;
    }

    if (savedMute === 'true') {
        backgroundSound.muted = true;
        muteToggle.checked = true;
        soundControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        backgroundSound.muted = false;
        muteToggle.checked = false;
        soundControl.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    soundInitialized = true;
}

function setupSoundEventListeners() {
    if (soundControl.getAttribute('data-listeners-set') === 'true') return;

    soundControl.addEventListener('click', toggleSoundSettings);
    volumeSlider.addEventListener('input', updateVolume);
    muteToggle.addEventListener('change', toggleMute);

    document.addEventListener('click', (event) => {
        if (!soundSettingsModal.contains(event.target) && !soundControl.contains(event.target)) {
            soundSettingsModal.classList.remove('active');
        }
    });
    soundControl.setAttribute('data-listeners-set', 'true');
}


function toggleSoundSettings() {
    soundSettingsModal.classList.toggle('active');
    if (soundSettingsModal.classList.contains('active')) {
        muteToggle.checked = backgroundSound.muted;
    }
}

function updateVolume() {
    backgroundSound.volume = volumeSlider.value;
    localStorage.setItem('backgroundVolume', volumeSlider.value);
    if (backgroundSound.muted && volumeSlider.value > 0) {
        backgroundSound.muted = false;
        muteToggle.checked = false;
        soundControl.innerHTML = '<i class="fas fa-volume-up"></i>';
        localStorage.setItem('backgroundMute', 'false');
    } else if (volumeSlider.value == 0 && !backgroundSound.muted) {
        backgroundSound.muted = true;
        muteToggle.checked = true;
        soundControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
        localStorage.setItem('backgroundMute', 'true');
    }
    if (backgroundSound.volume > 0 && !backgroundSound.muted && backgroundSound.paused) {
        backgroundSound.play().catch(e => console.log("Autoplay blocked on volume change:", e));
    }
}

function toggleMute() {
    backgroundSound.muted = muteToggle.checked;
    soundControl.innerHTML = muteToggle.checked ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    localStorage.setItem('backgroundMute', muteToggle.checked);
    if (!backgroundSound.muted && backgroundSound.volume === 0) {
         backgroundSound.volume = 0.1;
         volumeSlider.value = 0.1;
         localStorage.setItem('backgroundVolume', 0.1);
    }
    if (!backgroundSound.paused && backgroundSound.muted) {
    } else if (!backgroundSound.paused && !backgroundSound.muted && soundInitialized) {
         backgroundSound.play().catch(e => console.log("Autoplay blocked on unmute:", e));
    }
}