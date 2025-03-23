// Updated script.js with delete functionality

// Elements
const createFolderBtn = document.getElementById('create-folder-btn');
const createFileBtn = document.getElementById('create-file-btn');
const folderList = document.getElementById('folder-list');
const fileList = document.getElementById('file-list');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Data Structures
let folders = JSON.parse(localStorage.getItem('folders')) || [];
let files = JSON.parse(localStorage.getItem('files')) || [];
let currentFolder = null;

// Initialize
renderFolders();
renderFiles();
initializeDarkMode();

// Event Listeners
createFolderBtn.addEventListener('click', createFolder);
createFileBtn.addEventListener('click', createFile);
darkModeToggle.addEventListener('change', toggleDarkMode);

// Functions
function createFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName && !folders.find(folder => folder.name === folderName)) {
        const newFolder = { id: Date.now(), name: folderName };
        folders.push(newFolder);
        localStorage.setItem('folders', JSON.stringify(folders));
        renderFolders();
    } else if (folderName) {
        alert('Folder name already exists.');
    }
}

function renderFolders() {
    folderList.innerHTML = '';
    folders.forEach(folder => {
        const li = document.createElement('li');
        li.innerHTML = `${folder.name} <i class="fa fa-trash delete-icon" onclick="deleteFolder(${folder.id})"></i>`;
        li.dataset.id = folder.id;
        li.addEventListener('click', () => selectFolder(folder.id));
        if (currentFolder === folder.id) {
            li.classList.add('active');
        }
        folderList.appendChild(li);
    });
}

function deleteFolder(folderId) {
    const folderToDelete = folders.find(folder => folder.id === folderId);
    if (folderToDelete) {
        folders = folders.filter(folder => folder.id !== folderId);
        files = files.filter(file => file.folderId !== folderId); // Remove associated files
        localStorage.setItem('folders', JSON.stringify(folders));
        localStorage.setItem('files', JSON.stringify(files));
        currentFolder = null;
        renderFolders();
        renderFiles();
        alert(`Folder "${folderToDelete.name}" has been deleted successfully.`);
    } else {
        alert('Folder not found.'); // Similar unexpected error handling
    }
}

function selectFolder(folderId) {
    currentFolder = folderId;
    renderFolders();
    renderFiles();
}

function createFile() {
    if (!currentFolder) {
        alert('Please select a folder first.');
        return;
    }
    const fileName = prompt('Enter file name:');
    if (fileName && !files.find(file => file.name === fileName && file.folderId === currentFolder)) {
        const newFile = { id: Date.now(), name: fileName, folderId: currentFolder, content: '' };
        files.push(newFile);
        localStorage.setItem('files', JSON.stringify(files));
        renderFiles();
    } else if (fileName) {
        alert('File name already exists in this folder.');
    }
}

function renderFiles() {
    fileList.innerHTML = '';
    const filteredFiles = files.filter(file => file.folderId === currentFolder);
    filteredFiles.forEach(file => {
        const li = document.createElement('li');
        li.innerHTML = `${file.name} <i class="fa fa-trash delete-icon" onclick="deleteFile(${file.id})"></i>`;
        li.dataset.id = file.id;
        li.addEventListener('click', () => openFile(file.id));
        fileList.appendChild(li);
    });
}

function deleteFile(fileId) {
    const fileToDelete = files.find(file => file.id === fileId);
    if (fileToDelete) {
        files = files.filter(file => file.id !== fileId);
        localStorage.setItem('files', JSON.stringify(files));
        renderFiles();
        window.sessionStorage.setItem('fileDeleted', 'true'); // Set flag for file deletion
        alert(`File "${fileToDelete.name}" has been deleted successfully.`);
    }
}

function openFile(fileId) {
    window.location.href = `file.html?fileId=${fileId}`;
}

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
