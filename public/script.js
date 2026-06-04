const API_BASE_URL = window.location.origin;

// 👥 Master Directory of all 68 Edwisely Employees
const edwiselyEmployees = [
  "Satish", "Harsha", "Prahalya", "Yashwanth", "Kalyan", "Sneha M", "Priya MS", 
  "Rukmananda", "Amrith", "Poonam", "Venkateswarlu", "Swathi", "Shreya", "Bhargav", 
  "Priya B", "Geetha", "Rahul", "Paramjeet", "Praveen", "Soaham", "Srujan", 
  "Varsha", "Debarati", "Saiteja", "Akhilesh", "Chandrudu", "Laxman", "Mohan", 
  "Kusuma", "Bharadwaj", "Theertha", "Pavani", "Haritha", "Manoj", "Somia", 
  "Harini M", "Prasanthi", "Harini V", "Sridhar", "Subhash", "Sneha B", "Dipankar", 
  "Anna", "Priti", "Naveen", "Shweta", "Athira", "Ayushi", "Mahalaxmi", "Deepak", 
  "Shikha", "Nusrat", "Aastha", "Anushka", "Vijaya", "Sathvika", "Laasya", 
  "Abhiram", "Tusshar", "Viraj", "Padma", "Sree Varshini", "Nidhi", "Arun", 
  "Yash", "Likith", "Ayush", "Arnav"
];

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

// Custom Dropdown Selections
const recipientDropdown = document.getElementById('recipientDropdown');
const senderDropdown = document.getElementById('senderDropdown');

let allFetchedCards = [];

// 🌟 NEW: Custom Dropdown Engine
function renderDropdown(inputElement, dropdownElement, query) {
  dropdownElement.innerHTML = ''; // Clear old results
  const trimmedQuery = query.trim().toLowerCase();

  // Hide if input is empty
  if (!trimmedQuery) {
    dropdownElement.classList.remove('active');
    return;
  }

  // Find matches and sort alphabetically
  const filtered = edwiselyEmployees.filter(emp => 
    emp.toLowerCase().includes(trimmedQuery)
  ).sort();

  // Hide if no matches found
  if (filtered.length === 0) {
    dropdownElement.classList.remove('active');
    return;
  }

  // Build the list
  filtered.forEach(emp => {
    const li = document.createElement('li');
    li.textContent = emp;
    
    // When a name is clicked, fill the input and close the dropdown
    li.addEventListener('click', () => {
      inputElement.value = emp;
      dropdownElement.classList.remove('active');
    });
    
    dropdownElement.appendChild(li);
  });
  
  // Show the beautifully populated list
  dropdownElement.classList.add('active');
}

// Listen to keystrokes on both inputs
recipientInput.addEventListener('input', (e) => renderDropdown(recipientInput, recipientDropdown, e.target.value));
senderInput.addEventListener('input', (e) => renderDropdown(senderInput, senderDropdown, e.target.value));

// Instantly close dropdowns if user clicks anywhere else on the page
document.addEventListener('click', (e) => {
  if (e.target !== recipientInput) recipientDropdown.classList.remove('active');
  if (e.target !== senderInput) senderDropdown.classList.remove('active');
});

// Triggers Write Mode
openModalBtn.addEventListener('click', () => {
  formModal.setAttribute('data-mode', 'write');
  greetingForm.reset();
  recipientDropdown.classList.remove('active'); // Close open dropdowns
  senderDropdown.classList.remove('active');
  setInputsReadOnly(false);
  formModal.classList.add('active');
});

// Closes modal handlers
const hideModal = () => {
  formModal.classList.remove('active');
  recipientDropdown.classList.remove('active');
  senderDropdown.classList.remove('active');
};
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

// App bootstrapping sequence
document.addEventListener('DOMContentLoaded', () => {
  loadGreetingCards();
});