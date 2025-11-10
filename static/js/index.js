window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    
    if (!bibtexElement || !button) {
        return;
    }
    
    const copyText = button.querySelector('.copy-text');
    const textToCopy = bibtexElement.textContent;
    
    const showCopiedState = () => {
        button.classList.add('copied');
        if (copyText) {
            copyText.textContent = 'Copied';
        }
        setTimeout(function() {
            button.classList.remove('copied');
            if (copyText) {
                copyText.textContent = 'Copy';
            }
        }, 2000);
    };
    
    const fallbackCopy = () => {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopiedState();
    };
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(showCopiedState).catch(function(err) {
            console.error('Failed to copy: ', err);
            fallbackCopy();
        });
    } else {
        fallbackCopy();
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

const evaluationConfig = {
    words: [
        'bowl',
        'broadcast',
        'chocolate',
        'damage',
        'dawn',
        'deformation',
        'formulation',
        'ghost',
        'gorgonzola',
        'jacket',
        'jamboree',
        'lawschool',
        'loan',
        'mansion',
        'minority',
        'mortgage',
        'navigation',
        'nomad'
    ],
    methods: [
        { key: 'CPA', label: 'CPA cue' },
        { key: 'ENG', label: 'ENG word' },
        { key: 'KOR', label: 'KOR loanword' }
    ],
    displayOverrides: {
        lawschool: 'Law School'
    }
};

let activeParticipant = 'F';
const audioCache = new Map();

function formatWordLabel(word) {
    if (!word) return '';
    if (evaluationConfig.displayOverrides[word]) {
        return evaluationConfig.displayOverrides[word];
    }
    const spacedWord = word.replace(/_/g, ' ');
    return spacedWord.replace(/(^|\\s)([a-z])/g, function(match, prefix, letter) {
        return prefix + letter.toUpperCase();
    });
}

function buildAudioPath(participant, word, method, sample) {
    return `static/records/${participant}/${word}_${method}_${sample}.wav`;
}

function handlePlaySample(event) {
    const button = event.currentTarget;
    const participant = button.dataset.participant;
    const word = button.dataset.word;
    const method = button.dataset.method;
    const sample = button.dataset.sample;
    
    if (!participant || !word || !method) {
        return;
    }
    
    const filePath = buildAudioPath(participant, word, method, sample);
    
    if (!audioCache.has(filePath)) {
        audioCache.set(filePath, new Audio(filePath));
    }
    
    const audioInstance = audioCache.get(filePath);
    if (audioInstance) {
        audioInstance.currentTime = 0;
        audioInstance.play().catch(function(error) {
            console.error('Audio playback failed:', error);
        });
    }
}

function renderRecordsGrid(participant) {
    const grid = document.getElementById('recordsGrid');
    if (!grid) {
        return;
    }
    
    grid.innerHTML = '';
    
    evaluationConfig.words.forEach(function(word) {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        
        const wordHeading = document.createElement('h4');
        wordHeading.className = 'record-word';
        wordHeading.textContent = formatWordLabel(word);
        recordCard.appendChild(wordHeading);
        
        evaluationConfig.methods.forEach(function(method) {
            const cueRow = document.createElement('div');
            cueRow.className = 'record-cue';
            
            const cueLabel = document.createElement('span');
            cueLabel.className = 'cue-label';
            cueLabel.textContent = method.key;
            cueRow.appendChild(cueLabel);
            
            const sampleButtons = document.createElement('div');
            sampleButtons.className = 'sample-buttons';
            
            for (let sampleIndex = 0; sampleIndex < 3; sampleIndex += 1) {
                const playButton = document.createElement('button');
                playButton.className = 'button is-small is-light play-sample';
                playButton.type = 'button';
                playButton.dataset.participant = participant;
                playButton.dataset.word = word;
                playButton.dataset.method = method.key;
                playButton.dataset.sample = sampleIndex;
                playButton.textContent = (sampleIndex + 1).toString();
                playButton.setAttribute('aria-label', `Play sample ${sampleIndex + 1} for ${formatWordLabel(word)} (${method.label}, participant ${participant})`);
                playButton.addEventListener('click', handlePlaySample);
                sampleButtons.appendChild(playButton);
            }
            
            cueRow.appendChild(sampleButtons);
            recordCard.appendChild(cueRow);
        });
        
        grid.appendChild(recordCard);
    });
}

function updateToggleState(participant) {
    const toggleButtons = document.querySelectorAll('.participant-toggle .toggle-btn');
    toggleButtons.forEach(function(button) {
        const isActive = button.dataset.participant === participant;
        button.classList.toggle('is-active', isActive);
    });
}

function setActiveParticipant(participant) {
    if (!participant || participant === activeParticipant) {
        return;
    }
    activeParticipant = participant;
    updateToggleState(participant);
    renderRecordsGrid(participant);
}

function initializeRecordings() {
    const grid = document.getElementById('recordsGrid');
    const toggleButtons = document.querySelectorAll('.participant-toggle .toggle-btn');
    
    if (!grid || toggleButtons.length === 0) {
        return;
    }
    
    toggleButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            setActiveParticipant(button.dataset.participant);
        });
    });
    
    updateToggleState(activeParticipant);
    renderRecordsGrid(activeParticipant);
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();
    
    initializeRecordings();

})
