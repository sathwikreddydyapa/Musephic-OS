import './style.css'

// Constants & State
const API_KEY = "AIzaSyBqsbgoTBT5j1pgyrVYNYfVtnarH2JSTAQ";
let consoleEl, appEl, starCanvas, ctx;
let stars = [];

/**
 * INITIALIZATION
 */
function init() {
  consoleEl = document.getElementById('console');
  appEl = document.getElementById('app');
  starCanvas = document.getElementById('starfield');
  
  if (!consoleEl || !appEl || !starCanvas) {
    setTimeout(init, 500);
    return;
  }

  setupStarfield();
  setup3DEngine();
  setupVoiceCore();
  
  logToConsole('SYSTEM: Galaxy Network link established.', 'system');
  logToConsole('SYSTEM: Spatial Interface v2.4 online.', 'system');
}

/**
 * STARFIELD ENGINE
 */
function setupStarfield() {
  ctx = starCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1
    });
  }

  animateStars();
}

function resizeCanvas() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}

function animateStars() {
  ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  ctx.fillStyle = '#fff';
  
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    
    star.y += star.speed;
    if (star.y > starCanvas.height) star.y = 0;
  });
  
  requestAnimationFrame(animateStars);
}

/**
 * 3D SPATIAL ENGINE
 */
function setup3DEngine() {
  document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 50;
    const y = (window.innerHeight / 2 - e.clientY) / 50;
    appEl.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  });
}

/**
 * VOICE & NEURAL CORE
 */
function setupVoiceCore() {
  const talkBtn = document.getElementById('talk-btn');
  const micStatus = document.getElementById('mic-status');
  
  if (!talkBtn) return;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.lang = 'en-US';

  talkBtn.addEventListener('click', () => {
    recognition.start();
    micStatus.textContent = 'LISTENING...';
    micStatus.style.color = '#00f2ff';
  });

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    logToConsole(`USER: ${transcript}`, 'user');
    processNeuralQuery(transcript);
  };

  recognition.onend = () => {
    micStatus.textContent = 'STANDBY';
    micStatus.style.color = 'rgba(224, 250, 255, 0.6)';
  };
}

async function processNeuralQuery(query) {
  logToConsole('SYSTEM: Routing to Neural Brain...', 'system');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    
    logToConsole(`MUSEPHIC: ${reply}`, 'ai');
    speak(reply);
    
  } catch (err) {
    logToConsole('ERROR: Neural Bridge disconnected.', 'error');
  }
}

/**
 * UTILITIES
 */
function logToConsole(msg, type) {
  if (!consoleEl) return;
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span>></span> ${msg}`;
  if (type === 'ai') line.style.color = '#00f2ff';
  if (type === 'error') line.style.color = '#ff0033';
  
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

// BOOTSTRAP
init();
