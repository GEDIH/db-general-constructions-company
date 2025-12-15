/**
 * File Manager Module
 * Handles file browsing, upload, delete, replace, and organization
 */

const FileManager = {
  currentFolder: 'root',
  selectedFiles: [],

  /**
   * Initialize file manager
   */
  init() {
    this.setupEventListeners();
    this.loadFiles();
    this.createDefaultFolders();
  },

  /**
   * Create default folder structure
   */
  createDefaultFolders() {
    const folders = StorageUtil.get('db_file_folders', []);
    
    if (folders.length === 0) {
      const defaultFolders = [
        { id: 'root', name: 'Root', parent: null, path: '/' },
        { id: 'images', name: 'Images', parent: 'root', path: '/images' },
        { id: 'documents', name: 'Documents', parent: 'root', path: '/documents' },
        { id: 'projects', name: 'Project Files', parent: 'root', path: '/projects' },
        { id: 'uploads', name: 'Uploads', parent: 'root', path: '/uploads' }
      ];
      
      StorageUtil.set('db_file_folders', defaultFolders);
    }
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // File upload
    const fileUploadInput = document.getElementById('fileManagerUpload');
    if (fileUploadInput) {
      fileUploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Search
    const searchInput = document.getElementById('fileManagerSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  },

  /**
   * Load and display files
   */
  loadFiles() {
    const files = this.getAllFiles();
    const folders = StorageUtil.get('db_file_folders', []);
    
    this.displayFolderStructure(folders);
    this.displayFiles(files);
    this.updateStorageInfo();
  },

  /**
   * Get all files from storage
   * @returns {array} - Array of file objects
   */
  getAllFiles() {
    const files = [];
    
    // Get all image files
    const imageKeys = StorageUtil.keys().filter(key => key.startsWith('db_image_'));
    imageKeys.forEach(key => {
      const imageData = StorageUtil.get(key);
      if (imageData) {
        files.push({
          id: imageData.id,
          name: `${imageData.id}.${imageData.metadata?.type?.split('/')[1] || 'jpg'}`,
          type: 'image',
          mimeType: imageData.metadata?.type || 'image/jpeg',
          size: imageData.original?.size || 0,
          uploadDate: imageData.metadata?.uploadDate || new Date().toISOString(),
          folder: 'images',
          thumbnail: imageData.thumbnail?.dataUrl,
          url: imageData.original?.dataUrl
        });
      }
    });
    
    // Get document files (if any)
    const documents = StorageUtil.get('db_documents', []);
    documents.forEach(doc => {
      files.push({
        id: doc.id,
        name: doc.name,
        type: 'document',
        mimeType: doc.mimeType,
        size: doc.size,
        uploadDate: doc.uploadDate,
        folder: doc.folder || 'documents',
        url: doc.url
      });
    });
    
    return files;
  },

  /**
   * Display folder structure
   * @param {array} folders - Array of folder objects
   */
  displayFolderStructure(folders) {
    const container = document.getElementById('folderStructure');
    if (!container) return;

    const rootFolders = folders.filter(f => f.parent === 'root' || f.parent === null);
    
    container.innerHTML = `
      <div class="list-group">
        <a href="#" class="list-group-item list-group-item-action ${this.currentFolder === 'root' ? 'active' : ''}" 
           onclick="FileManager.selectFolder('root'); return false;">
          <i class="fas fa-folder me-2"></i>All Files
        </a>
        ${rootFolders.map(folder => `
          <a href="#" class="list-group-item list-group-item-action ${this.currentFolder === folder.id ? 'active' : ''}" 
             onclick="FileManager.selectFolder('${folder.id}'); return false;">
            <i class="fas fa-folder me-2"></i>${folder.name}
          </a>
        `).join('')}
      </div>
    `;
  },

  /**
   * Display files in grid or list view
   * @param {array} files - Array of file objects
   */
  displayFiles(files) {
    const container = document.getElementById('fileManagerGrid');
    if (!container) return;

    // Filter by current folder
    let filteredFiles = files;
    if (this.currentFolder !== 'root') {
      filteredFiles = files.filter(f => f.folder === this.currentFolder);
    }

    if (filteredFiles.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
          <p class="text-muted">No files in this folder</p>
          <button class="btn btn-primary" onclick="document.getElementById('fileManagerUpload').click()">
            <i class="fas fa-upload me-2"></i>Upload Files
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredFiles.map(file => `
      <div class="col-md-3 col-sm-4 col-6 mb-3">
        <div class="card file-card h-100" data-file-id="${file.id}">
          <div class="card-body text-center p-2">
            <div class="file-preview mb-2" style="height: 120px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 5px;">
              ${file.type === 'image' ? 
                `<img src="${file.thumbnail || file.url}" alt="${file.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` :
                `<i class="fas fa-file-${this.getFileIcon(file.mimeType)} fa-3x text-secondary"></i>`
              }
            </div>
            <div class="file-info">
              <small class="d-block text-truncate fw-bold" title="${file.name}">${file.name}</small>
              <small class="text-muted d-block">${this.formatFileSize(file.size)}</small>
              <small class="text-muted d-block">${new Date(file.uploadDate).toLocaleDateString()}</small>
            </div>
          </div>
          <div class="card-footer p-2">
            <div class="btn-group w-100" role="group">
              <button class="btn btn-sm btn-outline-primary" onclick="FileManager.viewFile('${file.id}')" title="View">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-info" onclick="FileManager.downloadFile('${file.id}')" title="Download">
                <i class="fas fa-download"></i>
              </button>
              <button class="btn btn-sm btn-outline-warning" onclick="FileManager.renameFile('${file.id}')" title="Rename">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="FileManager.deleteFile('${file.id}')" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Get file icon based on mime type
   * @param {string} mimeType - File mime type
   * @returns {string} - Font Awesome icon name
   */
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
    return 'alt';
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Select folder
   * @param {string} folderId - Folder ID
   */
  selectFolder(folderId) {
    this.currentFolder = folderId;
    this.loadFiles();
  },

  /**
   * Handle file upload
   * @param {Event} e - Change event
   */
  handleFileUpload(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Show upload progress
    this.showUploadProgress(files.length);

    let uploadedCount = 0;
    const uploadPromises = files.map(file => {
      return this.uploadFile(file).then(() => {
        uploadedCount++;
        this.updateUploadProgress(uploadedCount, files.length);
      });
    });

    Promise.all(uploadPromises).then(() => {
      this.hideUploadProgress();
      this.loadFiles();
      this.showNotification('success', `${files.length} file(s) uploaded successfully!`);
      
      // Log action
      if (typeof AdminDashboard !== 'undefined') {
        AdminDashboard.logAction('upload', 'files', 'multiple', { count: files.length });
        AdminDashboard.addActivity('file_upload', `Uploaded ${files.length} file(s)`);
      }
    }).catch(error => {
      this.hideUploadProgress();
      this.showNotification('error', 'Failed to upload some files');
      console.error('Upload error:', error);
    });

    // Reset input
    e.target.value = '';
  },

  /**
   * Upload single file
   * @param {File} file - File object
   * @returns {Promise} - Upload promise
   */
  uploadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const fileData = {
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          mimeType: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          folder: this.currentFolder === 'root' ? 'uploads' : this.currentFolder,
          url: e.target.result
        };

        // If it's an image, optimize it
        if (file.type.startsWith('image/')) {
          this.optimizeAndStoreImage(file, fileData).then(resolve).catch(reject);
        } else {
          // Store document
          const documents = StorageUtil.get('db_documents', []);
          documents.push(fileData);
          StorageUtil.set('db_documents', documents);
          resolve();
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Optimize and store image
   * @param {File} file - Image file
   * @param {object} fileData - File metadata
   * @returns {Promise} - Promise
   */
  optimizeAndStoreImage(file, fileData) {
    return new Promise((resolve, reject) => {
      if (typeof ImageOptimizer !== 'undefined') {
        ImageOptimizer.optimizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        }).then(result => {
          // Store optimized image
          StorageUtil.set(`db_image_${fileData.id}`, {
            id: fileData.id,
            original: result.original,
            thumbnail: result.thumbnail,
            metadata: {
              ...fileData,
              ...result.metadata
            }
          });
          resolve();
        }).catch(reject);
      } else {
        // Fallback: store without optimization
        StorageUtil.set(`db_image_${fileData.id}`, {
          id: fileData.id,
          original: { dataUrl: fileData.url, size: fileData.size },
          thumbnail: { dataUrl: fileData.url, size: fileData.size },
          metadata: fileData
        });
        resolve();
      }
    });
  },

  /**
   * View file
   * @param {string} fileId - File ID
   */
  viewFile(fileId) {
    const files = this.getAllFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      this.showNotification('error', 'File not found');
      return;
    }

    // Open file in modal or new window
    if (file.type === 'image') {
      this.showImageModal(file);
    } else {
      window.open(file.url, '_blank');
    }
  },

  /**
   * Show image in modal
   * @param {object} file - File object
   */
  showImageModal(file) {
    const modal = document.getElementById('fileViewModal');
    if (!modal) {
      // Create modal if it doesn't exist
      const modalHtml = `
        <div class="modal fade" id="fileViewModal" tabindex="-1">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="fileViewModalTitle"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body text-center">
                <img id="fileViewModalImage" src="" alt="" style="max-width: 100%; max-height: 70vh;">
              </div>
              <div class="modal-footer">
                <div class="text-start flex-grow-1">
                  <small class="text-muted" id="fileViewModalInfo"></small>
                </div>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Update modal content
    document.getElementById('fileViewModalTitle').textContent = file.name;
    document.getElementById('fileViewModalImage').src = file.url;
    document.getElementById('fileViewModalInfo').textContent = 
      `Size: ${this.formatFileSize(file.size)} | Uploaded: ${new Date(file.uploadDate).toLocaleString()}`;

    // Show modal
    const modalInstance = new bootstrap.Modal(document.getElementById('fileViewModal'));
    modalInstance.show();
  },

  /**
   * Download file
   * @param {string} fileId - File ID
   */
  downloadFile(fileId) {
    const files = this.getAllFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      this.showNotification('error', 'File not found');
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showNotification('success', 'File downloaded');
    
    // Log action
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.logAction('download', 'file', fileId, { name: file.name });
    }
  },

  /**
   * Rename file
   * @param {string} fileId - File ID
   */
  renameFile(fileId) {
    const files = this.getAllFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      this.showNotification('error', 'File not found');
      return;
    }

    const newName = prompt('Enter new file name:', file.name);
    
    if (!newName || newName === file.name) return;

    // Update file name
    if (file.type === 'image') {
      const imageData = StorageUtil.get(`db_image_${fileId}`);
      if (imageData && imageData.metadata) {
        imageData.metadata.name = newName;
        StorageUtil.set(`db_image_${fileId}`, imageData);
      }
    } else {
      const documents = StorageUtil.get('db_documents', []);
      const docIndex = documents.findIndex(d => d.id === fileId);
      if (docIndex !== -1) {
        documents[docIndex].name = newName;
        StorageUtil.set('db_documents', documents);
      }
    }

    this.loadFiles();
    this.showNotification('success', 'File renamed successfully');
    
    // Log action
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.logAction('rename', 'file', fileId, { oldName: file.name, newName });
      AdminDashboard.addActivity('file_rename', `Renamed file: ${file.name} → ${newName}`);
    }
  },

  /**
   * Delete file
   * @param {string} fileId - File ID
   */
  deleteFile(fileId) {
    const files = this.getAllFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      this.showNotification('error', 'File not found');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    // Delete file from storage
    if (file.type === 'image') {
      StorageUtil.remove(`db_image_${fileId}`);
    } else {
      const documents = StorageUtil.get('db_documents', []);
      const filtered = documents.filter(d => d.id !== fileId);
      StorageUtil.set('db_documents', filtered);
    }

    this.loadFiles();
    this.showNotification('success', 'File deleted successfully');
    
    // Log action
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.logAction('delete', 'file', fileId, { name: file.name });
      AdminDashboard.addActivity('file_delete', `Deleted file: ${file.name}`);
    }
  },

  /**
   * Move file to different folder
   * @param {string} fileId - File ID
   * @param {string} targetFolder - Target folder ID
   */
  moveFile(fileId, targetFolder) {
    const files = this.getAllFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      this.showNotification('error', 'File not found');
      return;
    }

    // Update file folder
    if (file.type === 'image') {
      const imageData = StorageUtil.get(`db_image_${fileId}`);
      if (imageData && imageData.metadata) {
        imageData.metadata.folder = targetFolder;
        StorageUtil.set(`db_image_${fileId}`, imageData);
      }
    } else {
      const documents = StorageUtil.get('db_documents', []);
      const docIndex = documents.findIndex(d => d.id === fileId);
      if (docIndex !== -1) {
        documents[docIndex].folder = targetFolder;
        StorageUtil.set('db_documents', documents);
      }
    }

    this.loadFiles();
    this.showNotification('success', 'File moved successfully');
    
    // Log action
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.logAction('move', 'file', fileId, { name: file.name, targetFolder });
    }
  },

  /**
   * Handle search
   * @param {string} query - Search query
   */
  handleSearch(query) {
    const files = this.getAllFiles();
    
    if (!query.trim()) {
      this.displayFiles(files);
      return;
    }

    const filtered = files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );

    this.displayFiles(filtered);
  },

  /**
   * Update storage info display
   */
  updateStorageInfo() {
    const storageSize = StorageUtil.getSize();
    const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const usagePercent = (storageSize / maxSize) * 100;

    const storageInfoEl = document.getElementById('storageInfo');
    if (storageInfoEl) {
      storageInfoEl.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-muted">Storage Used</small>
          <small class="text-muted">${this.formatFileSize(storageSize)} / ${this.formatFileSize(maxSize)}</small>
        </div>
        <div class="progress" style="height: 8px;">
          <div class="progress-bar ${usagePercent > 80 ? 'bg-danger' : usagePercent > 60 ? 'bg-warning' : 'bg-success'}" 
               style="width: ${Math.min(usagePercent, 100)}%"></div>
        </div>
      `;
    }
  },

  /**
   * Show upload progress
   * @param {number} total - Total files
   */
  showUploadProgress(total) {
    const progressEl = document.getElementById('uploadProgress');
    if (progressEl) {
      progressEl.style.display = 'block';
      progressEl.innerHTML = `
        <div class="progress">
          <div id="uploadProgressBar" class="progress-bar progress-bar-striped progress-bar-animated" 
               role="progressbar" style="width: 0%">0 / ${total}</div>
        </div>
      `;
    }
  },

  /**
   * Update upload progress
   * @param {number} current - Current count
   * @param {number} total - Total count
   */
  updateUploadProgress(current, total) {
    const progressBar = document.getElementById('uploadProgressBar');
    if (progressBar) {
      const percent = (current / total) * 100;
      progressBar.style.width = percent + '%';
      progressBar.textContent = `${current} / ${total}`;
    }
  },

  /**
   * Hide upload progress
   */
  hideUploadProgress() {
    const progressEl = document.getElementById('uploadProgress');
    if (progressEl) {
      setTimeout(() => {
        progressEl.style.display = 'none';
      }, 1000);
    }
  },

  /**
   * Show notification
   * @param {string} type - Notification type (success, error, info)
   * @param {string} message - Notification message
   */
  showNotification(type, message) {
    if (typeof ContentManagement !== 'undefined' && ContentManagement.showNotification) {
      ContentManagement.showNotification(type, message);
    } else {
      alert(message);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileManager;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.FileManager = FileManager;
}
