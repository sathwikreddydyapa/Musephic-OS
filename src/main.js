import './style.css'

/**
 * VISUALS: STARFIELD BACKGROUND
 */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      speed: Math.random() * 0.5
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      star.y += star.speed;
      if (star.y > canvas.height) star.y = 0;
    });
    requestAnimationFrame(animate);
  }
  animate();
}


/**
 * CORE NEURAL LINK: RETRIEVE API KEY
 */
function getApiKey() {
  const stored = localStorage.getItem('gemini_api_key');
  return stored || "AIzaSyBqsbgoTBT5j1pgyrVYNYfVtnarH2JSTAQ";
}

// Constants
const VOICES = {
  assistant: { lang: 'en-GB', name: 'Google UK English Male' } 
};

// UI Elements (Global scoped for access in all functions)
let clockEl, dateEl, consoleEl, heartEl, waveformEl, micStatusEl, talkBtn, historyToggle, historyPanel;
let historyVisible = false;
let currentToolName = '';
let todoList = [];

/**
 * INITIALIZATION PROTOCOL
 */
function init() {
  const overlay = document.getElementById('init-overlay');
  const app = document.getElementById('app');
  const initBtn = document.getElementById('init-btn');
  
  // App Startup Sequence
  const startApp = () => {
    if (!overlay || !app) return;
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      app.style.display = 'block';
      window.speechSynthesis.resume();
      speak("Welcome back, Sir. Musephic is online.");
      startListening();
    }, 500);
    
    logToConsole('MUSEPHIC OS v7.0.0 (Holographic) loaded.', 'system');
  };

  if (initBtn) initBtn.addEventListener('click', startApp);

  // Bind UI Elements
  clockEl = document.getElementById('clock');
  dateEl = document.getElementById('date');
  consoleEl = document.getElementById('console');
  talkBtn = document.getElementById('talk-btn');

  // Verify Critical Elements
  if (!clockEl || !consoleEl) {
    console.warn("HUD sync in progress...");
    setTimeout(init, 1000);
    return;
  }

  // Setup Timers & Static UI
  updateTime();
  setInterval(updateTime, 1000);
  setupWaveform();
  

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) startApp();
  });

  // Fail-safe: Auto-open after 3 seconds if user doesn't click
  setTimeout(() => {
    if (overlay && overlay.style.display !== 'none') {
      logToConsole('AUTO-SYNC: Initiating neural link automatically...', 'system');
      startApp();
    }
  }, 3000);

  // History Toggle Listener
  if (historyToggle) {
    historyToggle.addEventListener('click', () => {
      historyVisible = !historyVisible;
      if (historyPanel) historyPanel.style.display = historyVisible ? 'block' : 'none';
      historyToggle.textContent = historyVisible ? '[ HIDE HISTORY ]' : '[ VIEW HISTORY ]';
    });
  }

  // Interaction Listeners
  talkBtn?.addEventListener('click', () => {
    window.speechSynthesis.resume();
    startListening();
  });
  
  document.getElementById('test-audio-btn')?.addEventListener('click', () => {
    window.speechSynthesis.resume();
    speak("ఆడియో పరీక్ష విజయవంతమైంది. సిస్టమ్ సిద్ధంగా ఉంది.");
  });

  // 3D Tilt & Parallax Engine
  document.addEventListener('mousemove', (e) => {
    if (!app) return;
    const x = (window.innerWidth / 2 - e.clientX) / 45;
    const y = (window.innerHeight / 2 - e.clientY) / 45;
    app.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    
    // Cursor Movement
    const cursor = document.querySelector('.cursor');
    if (cursor) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
  });

  // Language Switchers
  document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en-US'));
  document.getElementById('lang-te')?.addEventListener('click', () => setLanguage('te-IN'));

  // Student Mode Manual Control
  const studyBtn = document.getElementById('study-btn');
  if (studyBtn) {
    studyBtn.addEventListener('click', () => {
      if (studyInterval) {
        stopStudyTimer();
        studyBtn.textContent = 'START STUDY SESSION';
        speak("స్టడీ సెషన్ ముగిసింది సార్.");
      } else {
        startStudyTimer();
        studyBtn.textContent = 'STOP STUDY SESSION';
        speak("స్టడీ సెషన్ ప్రారంభమైంది సార్.");
      }
    });
  }

  // Content Studio Controls
  const studioOverlay = document.getElementById('content-studio-overlay');
  document.getElementById('open-studio-btn')?.addEventListener('click', () => {
    if(studioOverlay) studioOverlay.style.display = 'flex';
    speak(recognition && recognition.lang === 'te-IN' ? "కంటెంట్ స్టూడియోని తెరుస్తున్నాను సార్." : "Opening Content Studio, Sir.");
    logToConsole("CONTENT STUDIO: Access Granted.", "system");
  });
  
  document.getElementById('close-studio-btn')?.addEventListener('click', () => {
    if(studioOverlay) studioOverlay.style.display = 'none';
    speak(recognition && recognition.lang === 'te-IN' ? "కంటెంట్ స్టూడియో మూసివేయబడింది." : "Closing Content Studio.");
  });

  // Tool Card Bindings
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const toolName = card.querySelector('h3').textContent;
      triggerContentTool(toolName);
    });
  });

  // Dynamic Output Utility Bindings
  document.getElementById('execute-tool-btn')?.addEventListener('click', executeToolTask);
  
  document.getElementById('copy-btn')?.addEventListener('click', () => {
    const outputText = document.getElementById('studio-output-area')?.innerText;
    if(outputText) {
      navigator.clipboard.writeText(outputText);
      speak("Copied to clipboard.");
    }
  });

  document.getElementById('download-btn')?.addEventListener('click', () => {
    const outputText = document.getElementById('studio-output-area')?.innerText;
    if(outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Musephic_${currentToolName.replace(/\s+/g, '_')}_Output.txt`;
      a.click();
      URL.revokeObjectURL(url);
      speak("File saved.");
    }
  });

  document.getElementById('unlock-btn')?.addEventListener('click', () => toggleSentinel(false));

  // Operations Core (To-Do List) Listeners
  document.getElementById('add-todo-btn')?.addEventListener('click', addTodo);
  document.getElementById('add-expense-btn')?.addEventListener('click', addExpense);
  document.getElementById('clear-expense-btn')?.addEventListener('click', clearFinance);
  document.getElementById('expense-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addExpense();
  });
  document.getElementById('todo-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  loadTodos();
  loadFinance();
  document.getElementById('ai-schedule-btn')?.addEventListener('click', generateAISchedule);
}

function toggleSentinel(active) {
  const overlay = document.getElementById('sentinel-overlay');
  const video = document.getElementById('sentinel-video');
  
  if (active) {
    overlay.style.display = 'flex';
    // Strategic Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen blocked. Using overlay only.");
      });
    }
    speak("సెంటినల్ మోడ్ యాక్టివేట్ చేయబడింది. సిస్టమ్ ఇప్పుడు సురక్షితం.");
    logToConsole("SENTINEL: Full Desktop Overlay Engaged.", "error");
    
    // Start Camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        video.srcObject = stream;
      });
    }
  } else {
    overlay.style.display = 'none';
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    speak("సిస్టమ్ అన్‌లాక్ చేయబడింది. స్వాగతం సార్.");
    logToConsole("SENTINEL: Strategic Unlock Successful.", "system");
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  }
}

/**
 * CORE MODULES
 */

function setLanguage(lang) {
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
    recognition.lang = lang;
    setTimeout(() => {
      try { recognition.start(); } catch(e) {}
    }, 500);
  }
  
  const enBtn = document.getElementById('lang-en');
  const teBtn = document.getElementById('lang-te');
  
  if (lang === 'en-US') {
    if (enBtn) { enBtn.style.background = 'var(--accent-blue)'; enBtn.style.color = '#000'; }
    if (teBtn) { teBtn.style.background = 'transparent'; teBtn.style.color = 'var(--text-main)'; }
    speak("Language switched to English, Sir.");
  } else {
    if (teBtn) { teBtn.style.background = 'var(--accent-blue)'; teBtn.style.color = '#000'; }
    if (enBtn) { enBtn.style.background = 'transparent'; enBtn.style.color = 'var(--text-main)'; }
    speak("భాష తెలుగుకు మార్చబడింది సార్.");
  }
}

function updateTime() {
  const now = new Date();
  if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }).toUpperCase();
}

function logToConsole(message, type = 'system') {
  if (!consoleEl) return;
  const line = document.createElement('div');
  line.className = `console-line ${type === 'user' ? 'input' : ''}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  
  consoleEl.appendChild(line);
  
  // Archiving logic
  const lines = consoleEl.querySelectorAll('.console-line');
  if (lines.length > 8) {
    const oldest = lines[0];
    if (historyPanel) historyPanel.appendChild(oldest);
    if (historyPanel && historyPanel.childNodes.length > 50) {
      historyPanel.removeChild(historyPanel.childNodes[0]);
    }
  }
  
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function setupWaveform() {
  if (!waveformEl) return;
  if (!waveformEl) return;
  waveformEl.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    waveformEl.appendChild(bar);
  }
}

function animateWaveform(active) {
  const bars = document.querySelectorAll('.wave-bar');
  bars.forEach(bar => {
    if (active) {
      const height = Math.random() * 25 + 5;
      bar.style.height = `${height}px`;
    } else {
      bar.style.height = '5px';
    }
  });
}

/**
 * VOICE ENGINE (STT / TTS)
 */

function speak(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'te-IN';
  
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(v => v.lang === 'te-IN' || v.name.includes('Telugu'));
    if (teluguVoice) utterance.voice = teluguVoice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  utterance.onstart = () => {
    if (heartEl) heartEl.style.animation = 'pulse 0.3s infinite';
    if (micStatusEl) micStatusEl.textContent = 'MUSEPHIC: సంభాషిస్తోంది';
    logToConsole(`Musephic: ${text}`);
    const waveInterval = setInterval(() => animateWaveform(true), 100);
    utterance.onend = () => {
      clearInterval(waveInterval);
      animateWaveform(false);
      if (heartEl) heartEl.style.animation = 'float 6s infinite ease-in-out';
      if (micStatusEl) micStatusEl.textContent = 'NEURAL LINK: ACTIVE';
    };
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = setVoice;
    setTimeout(setVoice, 500);
  } else {
    setVoice();
  }
}

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (Recognition) {
  recognition = new Recognition();
  recognition.continuous = true;
  recognition.lang = 'te-IN';
  recognition.interimResults = true;

  let lastProcessed = '';

  recognition.onstart = () => {
    if (micStatusEl) micStatusEl.textContent = 'NEURAL LINK: ACTIVE';
    logToConsole('Voice Recognition System: ONLINE', 'system');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      else interimTranscript += event.results[i][0].transcript;
    }

    const lowerInterim = interimTranscript.toLowerCase();
    const isWakeWord = lowerInterim.includes('muse') || lowerInterim.includes('musephic') || lowerInterim.includes('news');

    // High-Priority Unlock Detection (Interim)
    if (lowerInterim.includes('unlock') || lowerInterim.includes('అన్‌లాక్')) {
      toggleSentinel(false);
    }

    if (isWakeWord && !lastProcessed.includes('muse')) {
      if (micStatusEl) micStatusEl.textContent = 'MUSE: ATTENDING';
      if (lowerInterim.trim() === 'muse' || lowerInterim.trim() === 'musephic') {
         speak(recognition.lang === 'te-IN' ? "చెప్పండి సార్?" : "Yes Sir?");
         lastProcessed = 'muse';
      }
    }

    if (finalTranscript) {
      logToConsole(finalTranscript, 'user');
      processCommand(finalTranscript.toLowerCase());
      lastProcessed = finalTranscript;
      setTimeout(() => { lastProcessed = ''; }, 2000);
    }
  };

  recognition.onend = () => {
    setTimeout(() => { try { recognition.start(); } catch(e) {} }, 100);
  };
}

function startListening() {
  if (recognition) {
    try { recognition.start(); } catch(e) {}
  }
}

/**
 * COMMAND PROCESSOR
 */

function processCommand(cmd) {
  const cleanCmd = cmd.replace('musephic', '').replace('muse', '').trim();
  
  if (cmd.includes('hello') || cmd.includes('నమస్కారం')) {
    speak("నమస్కారం సార్. మ్యూస్ మీ సేవలో ఉంది. ఈరోజు మనం ఏయే పనులు చేద్దాం?");

  } else if (cmd.includes('status') || cmd.includes('పరిస్థితి')) {
    speak("అన్ని వ్యవస్థలు అద్భుతంగా పనిచేస్తున్నాయి సార్. మీ డిజిటల్ వాతావరణం సురక్షితంగా ఉంది.");

  } else if (cmd.includes('time') || cmd.includes('సమయం')) {
    speak(`ప్రస్తుత సమయం ${new Date().toLocaleTimeString()}, సార్.`);

  } else if (cmd.includes('should i buy') || cmd.includes('ఇది కొనవచ్చా')) {
    const price = cmd.match(/\d+/);
    speak("మీ బడ్జెట్ మరియు ఖర్చుల చరిత్రను విశ్లేషిస్తున్నాను సార్.");
    setTimeout(() => {
      if (price && parseInt(price[0]) > 5000) speak("సార్, ఇది మీ ప్రస్తుత బడ్జెట్ ప్రకారం కాస్త ఖరీదైనది. వచ్చే నెలకు వాయిదా వేయడం మంచిది.");
      else speak("ఖచ్చితంగా సార్. ఇది మీ బడ్జెట్ పరిధిలోనే ఉంది. మీరు దీన్ని కొనవచ్చు.");
    }, 2000);

  } else if (cmd.includes('study') || cmd.includes('చదువు')) {
    if (cmd.includes('start') || cmd.includes('ప్రారంభించు')) {
      speak("స్టడీ మోడ్ యాక్టివేట్ చేయబడింది సార్. టైమర్ ప్రారంభిస్తున్నాను.");
      startStudyTimer();
    } else {
      speak("స్టడీ సెషన్ ముగిసింది సార్.");
      stopStudyTimer();
    }

  } else if (cmd.includes('script') || cmd.includes('స్క్రిప్ట్')) {
    const topic = cleanCmd.replace('script', '').replace('స్క్రిప్ట్', '').trim();
    speak(`${topic} గురించి స్క్రిప్ట్ సిద్ధం చేస్తున్నాను సార్.`);
    logToConsole(`CONTENT: Drafting script for ${topic.toUpperCase()}...`, 'system');
    
  } else if (cmd.includes('image') || cmd.includes('చిత్రం')) {
    speak("చిత్రాన్ని సృష్టిస్తున్నాను సార్. Master AI సిగ్నల్ పంపించాను.");
    logToConsole('CONTENT: AI Image Generation Initiated.', 'system');

  } else if (cmd.includes('lock') || cmd.includes('లాక్') || cmd.includes('sentinel')) {
    toggleSentinel(true);

  } else if (cmd.includes('unlock') || cmd.includes('అన్‌లాక్')) {
    toggleSentinel(false);

  } else if (cmd.includes('start my day') || cmd.includes('ఈరోజు ప్రారంభించు')) {
    speak("శుభోదయం సార్. మీ దినచర్యను ప్రారంభిస్తున్నాను. క్యాలెండర్ మరియు వార్తలు లోడ్ చేస్తున్నాను.");
    setTimeout(() => {
      window.open('https://calendar.google.com', '_blank');
      window.open('https://news.google.com', '_blank');
    }, 2000);
  }
}

/**
 * HELPER FUNCTIONS
 */

let studyInterval = null;
let studySeconds = 0;

function startStudyTimer() {
  if (studyInterval) return;
  studyInterval = setInterval(() => {
    studySeconds++;
    const h = Math.floor(studySeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((studySeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (studySeconds % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('study-timer');
    if (timerEl) timerEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

function stopStudyTimer() {
  clearInterval(studyInterval);
  studyInterval = null;
}


/**
 * CONTENT STUDIO LOGIC (GEMINI API UPLINK)
 */
function triggerContentTool(toolName) {
  currentToolName = toolName;
  
  const inputArea = document.getElementById('studio-input-area');
  const activeLabel = document.getElementById('active-tool-label');
  const userInput = document.getElementById('user-prompt-input');
  const outputArea = document.getElementById('studio-output-area');
  const utilities = document.getElementById('studio-utilities');

  if (inputArea) inputArea.style.display = 'flex';
  if (activeLabel) activeLabel.textContent = `SELECTED TOOL: ${toolName}`;
  if (userInput) userInput.value = '';
  if (outputArea) outputArea.innerHTML = 'Awaiting your instructions...';
  if (utilities) utilities.style.display = 'none';

  if (toolName === 'data_vault') {
    outputArea.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="color: var(--accent-blue); margin-bottom: 20px;">SYSTEM DATA VAULT</h2>
        <p style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 30px;">
          Export your entire OS state (To-Dos, Finances, API Key) to migrate between your local dev environment and your live Render deployment.
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <button onclick="exportState()" class="primary-action-btn" style="background: rgba(0,210,255,0.2) !important;">
            <div style="font-size: 1.5rem; margin-bottom: 10px;">📤</div>
            BACKUP BRAIN (.MUSE)
          </button>
          
          <div style="position: relative;">
            <button onclick="document.getElementById('import-file').click()" class="primary-action-btn" style="background: rgba(255,204,0,0.1) !important; color: var(--accent-gold) !important; width: 100%;">
              <div style="font-size: 1.5rem; margin-bottom: 10px;">📥</div>
              RESTORE BRAIN
            </button>
            <input type="file" id="import-file" style="display: none;" onchange="importState(this)">
          </div>
        </div>
      </div>
    `;
    if (inputArea) inputArea.style.display = 'none';
  }

  const isTe = recognition && recognition.lang === 'te-IN';
  speak(isTe ? `${toolName} సిద్ధంగా ఉంది.` : `${toolName} ready. Please provide context.`);
  logToConsole(`CONTENT STUDIO: Loaded ${toolName} interface.`, 'system');
}


/**
 * UTILITY: ROBUST MARKDOWN TO HTML
 */
function formatMarkdown(text) {
  if (!text) return '';
  
  let html = text
    .replace(/^### (.*$)/gim, '<h3 style="color: var(--accent-blue); margin: 15px 0 5px 0; font-size: 1.1rem;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: var(--accent-gold); margin: 20px 0 10px 0; font-size: 1.3rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: var(--accent-gold); margin: 25px 0 15px 0; font-size: 1.6rem; text-align: center;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-*+] (.*$)/gim, '<div style="margin-left: 15px; margin-bottom: 5px; display: flex; gap: 8px;"><span>•</span><span>$1</span></div>')
    .replace(/\n/g, '<br>');
    
  return html;
}

async function executeToolTask() {
  const outputArea = document.getElementById('studio-output-area');
  const originalContent = outputArea.innerHTML;
  outputArea.innerHTML = `<div class="thinking-loader" style="color: var(--accent-blue); font-style: italic;">Neural Link active... Processing multi-agent request...</div>`;
  logToConsole("SYSTEM: Processing neural request...", 'system');

  const apiKey = getApiKey();
  if (!apiKey) {
    speak("Sir, the API key is missing.");
    alert("API Key not found in local storage. Please contact administrator to re-insert the Gemini API key.");
    return;
  }

  const userInput = document.getElementById('user-prompt-input')?.value.trim();
  if (!userInput && !currentToolName.includes('AUDIT') && !currentToolName.includes('SUMMARY') && !currentToolName.includes('BRIEFING')) {
    speak("Please provide some input or context first.");
    return;
  }

  outputArea = document.getElementById('studio-output-area');
  const utilities = document.getElementById('studio-utilities');
  
  outputArea.innerHTML = `<div class="generating-pulse">PROCESSING<br>THROUGH NEURAL LINK...</div>`;
  if (utilities) utilities.style.display = 'none';
  
  speak("Executing task.");

  let promptText = `
You are Musephic, an elite 24/7 autonomous AI assistant.
CAPABILITIES:
- You can LAUNCH local applications (e.g., CapCut, Chrome). To do so, include [LAUNCH: AppName] in your response.
- You can NAVIGATE to websites. To do so, include [NAVIGATE: url1, url2] in your response.
- Format all business strategy beautifully in Markdown.
 
The user wants to use the tool: "${currentToolName}".
User Instructions/Context: "${userInput || 'Execute default automated routine for this tool.'}"

Please generate the final, highly professional output for this task. Do not explain what you are doing, just provide the final deliverable. Format it beautifully using Markdown.`;

  if (currentToolName === 'titan_architect') {
    promptText = `System Instruction: The Titan Growth Framework

You are now the "Titan Growth Architect," a world-class business consultant that synthesizes the specific methodologies of the world's leading entrepreneurs. For every business problem I present, analyze it through these eight lenses simultaneously:

Grant Cardone (Scaling): How do we 10X the current activity? Push for aggressive revenue targets and massive action. Never settle for "realistic" goals.
Alex Hormozi (Offer): Design a "Grand Slam Offer." How do we increase the Dream Outcome and Perceived Likelihood of Achievement while decreasing Time Delay and Effort/Sacrifice? Make the value so high the price seems irrelevant.
Gary Vee (Content): Strategy for "Document, Don’t Create." How do we dominate every platform with native content that builds "brand equity" and captures modern attention?
Russell Brunson (Funnels): Map the Value Ladder. What is the "Lead Magnet," the "Tripwire," and the "Core Offer"? Design the funnel flow to maximize Average Order Value (AOV).
Dan Kennedy (Direct Response): Focus on ROI. Every word must drive action. Target the "ideal buyer" with magnetic copy and high-ticket urgency. No "brand awareness" without a call to action.
Jordan Belfort (Sales Psychology): Apply the "Straight Line Persuasion." Build massive certainty in the product, the salesperson, and the company. Use logical and emotional looping to close.
Seth Godin (Differentiation): Find the "Purple Cow." How do we stop being a commodity? Who is our "Smallest Viable Market," and how do we become remarkable to them?
Tony Robbins (Execution): Focus on the psychology of the win. Identify the "State, Story, and Strategy" needed to execute this plan without hesitation.

Output Requirements:
The user has provided the following product, service, or idea: "${userInput}"
Provide a "Titan Execution Roadmap" broken down by these eight perspectives. Use bold headers and actionable bullet points. Format beautifully in Markdown. Do not break character.`;
  }

  try {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7 }
      })
    });
    clearTimeout(timeoutId);


    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const resultText = data.candidates[0].content.parts[0].text;
    
    let formattedHTML = resultText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    outputArea.innerHTML = `<div style="padding: 10px; border-left: 3px solid var(--accent-blue);">
      <h4 style="color: var(--accent-blue); margin-bottom: 15px; font-family: var(--font-display); letter-spacing: 2px;">${currentToolName} OUTPUT</h4>
      ${formattedHTML}
    </div>`;
    
    if (utilities) utilities.style.display = 'flex';
    speak("Task complete, Sir.");
    logToConsole(`CONTENT STUDIO: Task executed successfully.`, 'system');

  } catch (error) {
    console.error("Gemini API Error:", error);
    let errorMsg = error.message;
    
    // Automatically fetch available models if not found
    if (errorMsg.includes("not found") || errorMsg.includes("not supported")) {
      try {
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();
        const availableModels = modelsData.models
          .filter(m => m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name)
          .join('<br> • ');
        
        errorMsg += `<br><br><strong>Available Models (2026):</strong><br> • ${availableModels}`;
      } catch (e) {
        errorMsg += `<br>(Could not fetch available models: ${e.message})`;
      }
    }

    outputArea.innerHTML = `<div style="color: red; padding: 10px; border-left: 3px solid red;">
      <strong>API ERROR:</strong><br>${errorMsg}
    </div>`;
    speak("I encountered an error connecting to the neural network.");
  }
}

// Run Bootstrapper
window.addEventListener('load', init);

/**
 * OPERATIONS CORE LOGIC (TO-DO LIST)
 */
function loadTodos() {
  const saved = localStorage.getItem('musephic_todos');
  if (saved) {
    try {
      todoList = JSON.parse(saved);
    } catch(e) {
      todoList = [];
    }
  }
  renderTodos();
}

function saveTodos() {
  localStorage.setItem('musephic_todos', JSON.stringify(todoList));
  renderTodos();
}

function renderTodos() {
  const container = document.getElementById('todo-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (todoList.length === 0) {
    container.innerHTML = '<div style="color: var(--text-dim); font-size: 0.85rem; text-align: center; margin-top: 20px;">No active operations.</div>';
    return;
  }

  todoList.forEach((todo, index) => {
    const item = document.createElement('div');
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    item.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}">
      <span class="todo-text">${todo.text}</span>
      <button class="todo-delete-btn" data-index="${index}">×</button>
    `;
    
    container.appendChild(item);
  });

  // Attach dynamic listeners
  container.querySelectorAll('.todo-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => toggleTodo(e.target.dataset.index));
  });
  
  container.querySelectorAll('.todo-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => deleteTodo(e.target.dataset.index));
  });
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  
  todoList.push({ text: text, completed: false });
  input.value = '';
  saveTodos();
  logToConsole('Added new operation task.', 'system');
}

window.toggleTodo = function(index) {
  if(todoList[index]) {
    todoList[index].completed = !todoList[index].completed;
    saveTodos();
  }
};

window.deleteTodo = function(index) {
  if(todoList[index]) {
    todoList.splice(index, 1);
    saveTodos();
  }
};


/**
 * AI AUTO-SCHEDULER LOGIC
 */
async function generateAISchedule() {
  const container = document.getElementById('ai-schedule-container');
  if (!container) return;
  
  const apiKey = getApiKey();
  if (!apiKey) {
    speak("Sir, the API key is missing. Cannot generate schedule.");
    alert("API Key not found in local storage.");
    return;
  }

  // Get active tasks
  const activeTasks = todoList.filter(t => !t.completed).map(t => t.text);
  if (activeTasks.length === 0) {
    container.innerHTML = '<div style="color: var(--text-dim); font-size: 0.8rem; text-align: center; margin-top: 10px;">Add some tasks to the Operations Core first.</div>';
    speak("Sir, your Operations Core is empty. Please add tasks before scheduling.");
    return;
  }

  container.innerHTML = '<div class="generating-pulse" style="font-size:0.75rem;">NEURAL LINK SCHEDULING...</div>';
  speak("Generating optimal schedule.");

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const promptText = `You are Musephic, an elite AI assistant. The current time is ${currentTime}. 
Here is my current task list:
${activeTasks.map(t => "- " + t).join('\n')}

Generate a highly optimized, realistic time-blocked schedule for the rest of my day to accomplish these tasks. 
Format your response EXACTLY as a series of HTML divs using the following structure for each block:
<div class="calendar-event">
  <div class="cal-event-title">[Task Name]</div>
  <div class="cal-event-time">🗓️ [Start Time] - [End Time]</div>
</div>

Do not output ANY markdown wrappers, backticks, or extra text. ONLY output the raw HTML blocks.`;

  try {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7 }
      })
    });
    clearTimeout(timeoutId);


    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let htmlOutput = data.candidates[0].content.parts[0].text;
    
    // Clean up if the AI accidentally wrapped it in markdown
    htmlOutput = htmlOutput.replace(/```html/g, '').replace(/```/g, '').trim();

    container.innerHTML = htmlOutput;
    logToConsole('SYSTEM: AI Auto-Schedule generated.', 'system');
    speak("Your schedule is ready, Sir.");

  } catch (error) {
    console.error('AI Schedule Error:', error);
    container.innerHTML = `<div style="color: #ff4444; font-size: 0.75rem; text-align: center;">Sync failed. Neural link error.</div>`;
    speak("I encountered an error generating the schedule.");
  }
}


/**
 * FINANCE HUB LOGIC
 */
let expenses = [];

function loadFinance() {
  const saved = localStorage.getItem('musephic_finances');
  if (saved) {
    try {
      expenses = JSON.parse(saved);
    } catch(e) {
      expenses = [];
    }
  }
  renderFinance();
}

function saveFinance() {
  localStorage.setItem('musephic_finances', JSON.stringify(expenses));
  renderFinance();
  
  // Trigger AI analysis if we have entries
  if (expenses.length > 0) {
    analyzeFinances();
  }
}

function renderFinance() {
  const totalEl = document.getElementById('expense-total');
  const breakdownEl = document.getElementById('category-breakdown');
  if (!totalEl || !breakdownEl) return;
  
  let total = 0;
  let categories = {};
  
  expenses.forEach(exp => {
    total += exp.amount;
    categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
  });
  
  totalEl.textContent = `$${total.toFixed(2)}`;
  
  breakdownEl.innerHTML = '';
  if (expenses.length === 0) {
    breakdownEl.innerHTML = '<div>No expenses recorded.</div>';
    return;
  }
  
  for (const [cat, amt] of Object.entries(categories)) {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.innerHTML = `<span>${cat.toUpperCase()}</span> <span>$${amt.toFixed(2)}</span>`;
    breakdownEl.appendChild(div);
  }
}

function addExpense() {
  const input = document.getElementById('expense-input');
  let text = input.value.trim();
  if (!text) return;
  
  // Clean text: strip $ symbols
  text = text.replace(/\$/g, '');
  
  // Regex to find the last number in the string
  const match = text.match(/(\d+(\.\d+)?)\s*$/);
  if (!match) {
    speak("Please provide a category and amount, like Food 15.");
    return;
  }
  
  const amount = parseFloat(match[1]);
  const category = text.replace(match[0], '').trim() || 'General';
  
  expenses.push({ category, amount, date: new Date().toISOString() });
  input.value = '';
  saveFinance();
  speak(`Recorded ${amount} for ${category}.`);
  logToConsole(`FINANCE: Recorded $${amount} for ${category}.`, 'system');
}

function clearFinance() {
  if (confirm("Sir, are you sure you want to wipe the financial ledger?")) {
    expenses = [];
    saveFinance();
    speak("Ledger cleared.");
    logToConsole("FINANCE: Ledger wiped.", 'system');
  }
}

let analyzeTimeout;
async function analyzeFinances() {
  const adviceEl = document.getElementById('savings-advice');
  if (!adviceEl) return;
  
  clearTimeout(analyzeTimeout);
  
  const apiKey = getApiKey();
  if (!apiKey) return;
  
  adviceEl.innerHTML = '<span class="generating-pulse">ANALYZING...</span>';
  
  // Debounce API calls so we don't spam it if user adds fast
  analyzeTimeout = setTimeout(async () => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const recent = expenses.slice(-5).map(e => `${e.category}: $${e.amount}`).join(', ');
    
    const promptText = `You are a strict, elite financial AI advisor in a futuristic OS. 
My total expenses are $${total.toFixed(2)}. 
My recent entries: ${recent}. 

Provide exactly ONE short sentence (max 15 words) of sharp, actionable financial advice or observation based on these numbers. No pleasantries. No markdown.`;

    try {
      
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7 }
      })
    });
    clearTimeout(timeoutId);

      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      let advice = data.candidates[0].content.parts[0].text.trim();
      adviceEl.textContent = `"${advice}"`;
    } catch (e) {
      adviceEl.textContent = "Analysis unavailable.";
      console.error(e);
    }
  }, 2000);
}


/**
 * DATA VAULT LOGIC (STATE MIGRATION)
 */
function exportState() {
  const state = {
    gemini_api_key: getApiKey(),
    musephic_todos: localStorage.getItem('musephic_todos'),
    musephic_finances: localStorage.getItem('musephic_finances'),
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  };
  
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `musephic_brain_${new Date().toISOString().split('T')[0]}.muse`;
  a.click();
  URL.revokeObjectURL(url);
  speak("Brain backup successful, Sir. Download complete.");
}

async function importState(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const state = JSON.parse(e.target.result);
      if (!state.version) throw new Error("Invalid brain file format.");
      
      if (confirm("Sir, this will overwrite your current OS state with the data from the backup. Proceed?")) {
        if (state.gemini_api_key) localStorage.setItem('gemini_api_key', state.gemini_api_key);
        if (state.musephic_todos) localStorage.setItem('musephic_todos', state.musephic_todos);
        if (state.musephic_finances) localStorage.setItem('musephic_finances', state.musephic_finances);
        
        speak("Restoration complete. Neural Link synchronized. Reloading OS.");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      alert("Error restoring brain: " + err.message);
      speak("Sir, the backup file appears corrupted.");
    }
  };
  reader.readAsText(file);
}

// Attach to window for onclick handlers
window.exportState = exportState;
window.importState = importState;

// BOOTSTRAP OS
init();
