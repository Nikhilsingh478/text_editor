// Elements
const backBtn = document.getElementById('back-btn');
const fileNameDisplay = document.getElementById('file-name');
const savePdfBtn = document.getElementById('save-pdf-btn');
const addCheckboxBtn = document.getElementById('add-checkbox-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Get fileId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const fileId = parseInt(urlParams.get('fileId'), 10);

// Data Structures
let files = JSON.parse(localStorage.getItem('files')) || [];
let currentFile = files.find(file => file.id === fileId);

// Initialize Quill Editor
const quill = new Quill('#editor', {
    modules: {
        toolbar: '#toolbar',
        history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true
        }
    },
    theme: 'snow'
});

// Set file name in header
if (currentFile) {
    fileNameDisplay.textContent = `Editing: ${currentFile.name}`;
    quill.setContents(quill.clipboard.convert(currentFile.content));
} else {
    alert('File not found.');
    window.location.href = 'index.html';
}

// Event Listeners
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});
savePdfBtn.addEventListener('click', saveAsPDF);
addCheckboxBtn.addEventListener('click', addCheckbox); // Button for adding checkbox
darkModeToggle.addEventListener('change', toggleDarkMode);
quill.on('selection-change', updateActiveButtons);
quill.on('text-change', saveContentToFile);

// Handle Undo and Redo Buttons
const undoBtn = document.querySelector('.ql-undo');
const redoBtn = document.querySelector('.ql-redo');

if (undoBtn) {
    undoBtn.addEventListener('click', () => {
        quill.history.undo();
    });
}

if (redoBtn) {
    redoBtn.addEventListener('click', () => {
        quill.history.redo();
    });
}

// Functions

function saveAsPDF() {
    if (!currentFile) {
        alert('Please select a file to save.');
        return;
    }
    const editorContent = document.getElementById('editor');
    const opt = {
        margin:       0.5,
        filename:     `${currentFile.name}.pdf`,
        image:        { type: 'jpeg', quality: 0.7 },
        html2canvas:  { scale: 1.5, logging: false, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(editorContent).set(opt).save();
}

function addCheckbox() {
    const range = quill.getSelection();
    if (range) {
        const checkboxEmoji = '✅'; // Checkbox emoji
        quill.insertText(range.index, checkboxEmoji, Quill.sources.USER); // Insert checkbox emoji
        quill.insertText(range.index + checkboxEmoji.length, ' ', Quill.sources.USER); // Insert space after checkbox emoji
        quill.setSelection(range.index + checkboxEmoji.length + 1, Quill.sources.SILENT); // Move cursor after checkbox emoji and space
    }
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        switch (event.key) {
            case 'r': // Checkbox - Ctrl + R
                event.preventDefault();
                addCheckbox();
                break;
            case 'z': // Undo
                event.preventDefault();
                quill.history.undo();
                break;
            case 'y': // Redo
                event.preventDefault();
                quill.history.redo();
                break;
        }
    }
});

// Custom Checkbox Blot
const Inline = Quill.import('blots/inline');

class CheckboxBlot extends Inline {
    static create(value) {
        let node = super.create();
        node.innerHTML = `<input type="checkbox" style="transform: scale(1.5); margin-right: 5px;" />`;
        return node;
    }

    static formats(node) {
        return true;
    }
}
CheckboxBlot.blotName = 'checkbox';
CheckboxBlot.tagName = 'span';
CheckboxBlot.className = 'ql-checkbox';
Quill.register(CheckboxBlot);

// Dark Mode Functions
function toggleDarkMode() {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
}

function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
}

// Initialize Dark Mode on Load
initializeDarkMode();

// Save Content to File on Text Change
function saveContentToFile() {
    if (currentFile) {
        currentFile.content = quill.root.innerHTML;
        localStorage.setItem('files', JSON.stringify(files));
    }
}

// Update Active Buttons Based on Selection
function updateActiveButtons(range, oldRange, source) {
    const toolbarButtons = document.querySelectorAll('#toolbar button');
    toolbarButtons.forEach(button => {
        const format = button.classList[0].replace('ql-', '');
        if (format === 'undo' || format === 'redo') return; // Skip undo and redo buttons

        if (quill.getFormat().hasOwnProperty(format)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Add Event Listener for Checkbox Clicks
document.getElementById('editor').addEventListener('click', function(e) {
    if (e.target.matches('.ql-checkbox input[type="checkbox"]')) {
        e.target.checked = !e.target.checked; // Toggle checkbox state on click
    }
});
