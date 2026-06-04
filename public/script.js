const API_BASE_URL = window.location.origin;

const cardsGrid = document.getElementById('cardsGrid');
const formModal = document.getElementById('formModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const viewCloseModalBtn = document.getElementById('viewCloseModalBtn');
const greetingForm = document.getElementById('greetingForm');
const searchBar = document.getElementById('searchBar');

const recipientInput = document.getElementById('recipientName');
const senderInput = document.getElementById('senderName');
const messageInput = document.getElementById('message');

let allFetchedCards = [];

// Triggers Write Mode
openModalBtn.addEventListener('click', () => {
  formModal.setAttribute('data-mode', 'write');
  greetingForm.reset();
  setInputsReadOnly(false);
  formModal.classList.add('active');
});

// Closes modal handlers
const hideModal = () => formModal.classList.remove('active');
closeModalBtn.addEventListener('click', hideModal);
viewCloseModalBtn.addEventListener('click', hideModal);

formModal.addEventListener('click', (e) => {
  if (e.target === formModal) hideModal();
});

function setInputsReadOnly(isReadOnly) {
  recipientInput.readOnly = isReadOnly;
  senderInput.readOnly = isReadOnly;
  messageInput.readOnly = isReadOnly;
}

// Fetch and load database greeting cards
async function loadGreetingCards() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cards`);
    allFetchedCards = await response.json();
    renderCards(allFetchedCards);
  } catch (error) {
    cardsGrid.innerHTML = '<div class="loading-state" style="color: red;">Error displaying greetings board.</div>';
  }
}

// Renders layouts with Framer-style staggered transitions
function renderCards(cardsArray) {
  if (cardsArray.length === 0) {
    cardsGrid.innerHTML = `<div class="loading-state">No greeting cards found.</div>`;
    return;
  }

  cardsGrid.innerHTML = '';
  cardsArray.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'grid-paper-card';
    
    // 🌟 FRAMER MOTION EMULATION: Staggers card entrances progressively down the array
    cardElement.style.animationDelay = `${index * 0.04}s`;
    
    cardElement.innerHTML = `
      <div class="tf-row tf-top">
        <span class="tf-label">To</span>
        <span class="tf-val hand">${escapeHTML(card.recipientName)}</span>
      </div>
      <div class="field message hand">
        ${escapeHTML(card.message).replace(/\n/g, '<br>')}
      </div>
      <div class="tf-row tf-bottom">
        <span class="tf-label">From</span>
        <span class="tf-val hand">${escapeHTML(card.senderName)}</span>
      </div>
    `;

    // Launch full view pop model on node click
    cardElement.addEventListener('click', () => {
      formModal.setAttribute('data-mode', 'view');
      recipientInput.value = card.recipientName;
      messageInput.value = card.message;
      senderInput.value = card.senderName;
      setInputsReadOnly(true);
      formModal.classList.add('active');
    });

    cardsGrid.appendChild(cardElement);
  });
}

// Search matching queries
searchBar.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtered = allFetchedCards.filter(card => {
    return card.recipientName.toLowerCase().includes(query) || 
           card.senderName.toLowerCase().includes(query);
  });
  renderCards(filtered);
});

// Creation Submission Handler
greetingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (formModal.getAttribute('data-mode') === 'view') return;

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Publishing...';

  const payload = {
    recipientName: recipientInput.value.trim(),
    senderName: senderInput.value.trim(),
    message: messageInput.value.trim()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      greetingForm.reset();
      hideModal();
      searchBar.value = '';
      await loadGreetingCards();
    }
  } catch (error) {
    alert('Network connection error.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publish Greeting';
  }
});

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

document.addEventListener('DOMContentLoaded', loadGreetingCards);