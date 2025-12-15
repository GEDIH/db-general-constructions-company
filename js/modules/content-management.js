/**
 * Content Management Module
 * Handles CRUD operations for projects, blog posts, team members, testimonials, and service offerings
 */

const ContentManagement = {
  /**
   * Initialize content management
   */
  init() {
    this.setupEventListeners();
    this.loadAllContent();
  },

  /**
   * Setup event listeners for content management
   */
  setupEventListeners() {
    // Project management listeners
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
      projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
      
      // Save as draft button
      const saveDraftBtn = document.getElementById('saveProjectDraft');
      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleProjectSubmit(new Event('submit', { cancelable: true }), true);
        });
      }
    }

    // Blog post management listeners
    const blogForm = document.getElementById('blogForm');
    if (blogForm) {
      blogForm.addEventListener('submit', (e) => this.handleBlogSubmit(e));
      
      // Save as draft button
      const saveDraftBtn = document.getElementById('saveBlogDraft');
      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleBlogSubmit(new Event('submit', { cancelable: true }), true);
        });
      }
    }

    // Team member management listeners
    const teamForm = document.getElementById('teamForm');
    if (teamForm) {
      teamForm.addEventListener('submit', (e) => this.handleTeamSubmit(e));
    }

    // Testimonial management listeners
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
      testimonialForm.addEventListener('submit', (e) => this.handleTestimonialSubmit(e));
      
      // Save as draft button
      const saveDraftBtn = document.getElementById('saveTestimonialDraft');
      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleTestimonialSubmit(new Event('submit', { cancelable: true }), true);
        });
      }
    }

    // Service offering management listeners
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
      serviceForm.addEventListener('submit', (e) => this.handleServiceSubmit(e));
      
      // Save as draft button
      const saveDraftBtn = document.getElementById('saveServiceDraft');
      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleServiceSubmit(new Event('submit', { cancelable: true }), true);
        });
      }
    }

    // Setup image upload handlers
    this.setupImageUploadHandlers();
  },

  /**
   * Load all content types
   */
  loadAllContent() {
    this.loadProjects();
    this.loadBlogPosts();
    this.loadTeamMembers();
    this.loadTestimonials();
    this.loadServiceOfferings();
    this.loadArchivedContent();
  },

  // ==================== PROJECT MANAGEMENT ====================

  /**
   * Load and display projects
   */
  loadProjects() {
    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    this.displayProjects(projects);
  },

  /**
   * Display projects in table
   * @param {array} projects - Projects to display
   */
  displayProjects(projects) {
    const tbody = document.getElementById('projectsContentTableBody');
    if (!tbody) return;

    if (projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No projects found</td></tr>';
      return;
    }

    tbody.innerHTML = projects.map(project => `
      <tr>
        <td><strong>${project.title || 'Untitled'}</strong></td>
        <td>${project.category ? project.category.join(', ') : 'N/A'}</td>
        <td>${project.location?.address || 'N/A'}</td>
        <td><span class="badge bg-${this.getStatusColor(project.status)}">${project.status || 'N/A'}</span></td>
        <td>${project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'N/A'}</td>
        <td><span class="badge bg-${project.published ? 'success' : 'warning'}">${project.published ? 'Published' : 'Draft'}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-${project.published ? 'secondary' : 'success'}" 
                  onclick="ContentManagement.toggleProjectPublish('${project.id}')" 
                  title="${project.published ? 'Unpublish' : 'Publish'}">
            <i class="fas fa-${project.published ? 'eye-slash' : 'check'}"></i>
          </button>
          <button class="btn btn-sm btn-primary" onclick="ContentManagement.viewProject('${project.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="ContentManagement.editProject('${project.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="ContentManagement.deleteProject('${project.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Get status color for badge
   * @param {string} status - Status value
   * @returns {string} - Bootstrap color class
   */
  getStatusColor(status) {
    const colors = {
      'completed': 'success',
      'active': 'primary',
      'in-progress': 'warning',
      'planned': 'info',
      'on-hold': 'secondary'
    };
    return colors[status] || 'secondary';
  },

  /**
   * Handle project form submission
   * @param {Event} e - Submit event
   * @param {boolean} isDraft - Whether to save as draft
   */
  handleProjectSubmit(e, isDraft = false) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projectId = formData.get('projectId');
    
    const projectData = {
      id: projectId || 'project_' + Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.getAll('category'),
      location: {
        address: formData.get('location'),
        lat: parseFloat(formData.get('lat')) || 0,
        lng: parseFloat(formData.get('lng')) || 0
      },
      completionDate: formData.get('completionDate'),
      duration: parseInt(formData.get('duration')) || 0,
      size: parseFloat(formData.get('size')) || 0,
      client: formData.get('client'),
      cost: formData.get('cost'),
      status: formData.get('status'),
      published: isDraft ? false : (formData.get('published') === 'true'),
      images: formData.get('images') ? formData.get('images').split(',') : [],
      features: formData.get('features') ? formData.get('features').split(',') : [],
      createdAt: projectId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    
    if (projectId) {
      // Update existing project
      const index = projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
        AdminDashboard.logAction('update', 'project', projectId, projectData);
        AdminDashboard.addActivity('project_update', `Updated project: ${projectData.title}`);
      }
    } else {
      // Create new project
      projects.push(projectData);
      AdminDashboard.logAction('create', 'project', projectData.id, projectData);
      AdminDashboard.addActivity('project_create', `Created new project: ${projectData.title}`);
    }

    StorageUtil.set(CONFIG.STORAGE_KEYS.PROJECTS, projects);
    this.loadProjects();
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
    if (modal) modal.hide();
    e.target.reset();
    
    const statusMsg = isDraft ? 'Project saved as draft!' : 'Project saved successfully!';
    this.showNotification('success', statusMsg);
  },

  /**
   * Edit project
   * @param {string} projectId - Project ID
   */
  editProject(projectId) {
    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      this.showNotification('error', 'Project not found');
      return;
    }

    // Populate form with project data
    const form = document.getElementById('projectForm');
    if (form) {
      form.elements['projectId'].value = project.id;
      form.elements['title'].value = project.title || '';
      form.elements['description'].value = project.description || '';
      form.elements['location'].value = project.location?.address || '';
      form.elements['completionDate'].value = project.completionDate || '';
      form.elements['duration'].value = project.duration || '';
      form.elements['size'].value = project.size || '';
      form.elements['client'].value = project.client || '';
      form.elements['cost'].value = project.cost || '';
      form.elements['status'].value = project.status || '';
      form.elements['published'].value = project.published ? 'true' : 'false';
      
      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('projectModal'));
      modal.show();
    }
  },

  /**
   * View project details
   * @param {string} projectId - Project ID
   */
  viewProject(projectId) {
    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      this.showNotification('error', 'Project not found');
      return;
    }

    // Display project details in modal or navigate to detail page
    alert(`Project: ${project.title}\nStatus: ${project.status}\nClient: ${project.client}`);
  },

  /**
   * Delete project (archive)
   * @param {string} projectId - Project ID
   */
  deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? It will be archived.')) {
      return;
    }

    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      this.showNotification('error', 'Project not found');
      return;
    }

    // Archive instead of delete
    project.deleted = true;
    project.deletedAt = new Date().toISOString();
    
    StorageUtil.set(CONFIG.STORAGE_KEYS.PROJECTS, projects);
    AdminDashboard.logAction('delete', 'project', projectId, { title: project.title });
    AdminDashboard.addActivity('project_delete', `Archived project: ${project.title}`);
    
    this.loadProjects();
    this.showNotification('success', 'Project archived successfully!');
  },

  // ==================== BLOG POST MANAGEMENT ====================

  /**
   * Load and display blog posts
   */
  loadBlogPosts() {
    const posts = StorageUtil.get('db_blog_posts', []);
    this.displayBlogPosts(posts);
  },

  /**
   * Display blog posts
   * @param {array} posts - Blog posts to display
   */
  displayBlogPosts(posts) {
    const container = document.getElementById('blogPostsContainer');
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No blog posts found</p></div>';
      return;
    }

    container.innerHTML = posts.filter(p => !p.deleted).map(post => `
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm">
          ${post.image ? `<img src="${post.image}" class="card-img-top" alt="${post.title}">` : ''}
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary">${post.category || 'Uncategorized'}</span>
              <span class="badge bg-${post.published ? 'success' : 'warning'}">${post.published ? 'Published' : 'Draft'}</span>
            </div>
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text text-muted">${post.excerpt || post.content?.substring(0, 100) + '...' || ''}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="fas fa-calendar me-1"></i>${post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'Draft'}
                <i class="fas fa-eye ms-2 me-1"></i>${post.views || 0} views
              </small>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-${post.published ? 'secondary' : 'success'}" 
                        onclick="ContentManagement.toggleBlogPublish('${post.id}')"
                        title="${post.published ? 'Unpublish' : 'Publish'}">
                  <i class="fas fa-${post.published ? 'eye-slash' : 'check'}"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="ContentManagement.viewBlogPost('${post.id}')">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="ContentManagement.editBlogPost('${post.id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="ContentManagement.deleteBlogPost('${post.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Handle blog post form submission
   * @param {Event} e - Submit event
   * @param {boolean} isDraft - Whether to save as draft
   */
  handleBlogSubmit(e, isDraft = false) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const postId = formData.get('postId');
    
    const postData = {
      id: postId || 'post_' + Date.now(),
      title: formData.get('title'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      category: formData.get('category'),
      author: formData.get('author'),
      image: formData.get('image'),
      tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [],
      published: isDraft ? false : (formData.get('published') === 'true'),
      publishDate: formData.get('publishDate') || new Date().toISOString(),
      views: postId ? undefined : 0,
      createdAt: postId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const posts = StorageUtil.get('db_blog_posts', []);
    
    if (postId) {
      const index = posts.findIndex(p => p.id === postId);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...postData };
        AdminDashboard.logAction('update', 'blog_post', postId, postData);
        AdminDashboard.addActivity('blog_update', `Updated blog post: ${postData.title}`);
      }
    } else {
      posts.push(postData);
      AdminDashboard.logAction('create', 'blog_post', postData.id, postData);
      AdminDashboard.addActivity('blog_create', `Created new blog post: ${postData.title}`);
    }

    StorageUtil.set('db_blog_posts', posts);
    this.loadBlogPosts();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('blogModal'));
    if (modal) modal.hide();
    e.target.reset();
    
    const statusMsg = isDraft ? 'Blog post saved as draft!' : 'Blog post saved successfully!';
    this.showNotification('success', statusMsg);
  },

  /**
   * Edit blog post
   * @param {string} postId - Post ID
   */
  editBlogPost(postId) {
    const posts = StorageUtil.get('db_blog_posts', []);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      this.showNotification('error', 'Blog post not found');
      return;
    }

    const form = document.getElementById('blogForm');
    if (form) {
      form.elements['postId'].value = post.id;
      form.elements['title'].value = post.title || '';
      form.elements['content'].value = post.content || '';
      form.elements['excerpt'].value = post.excerpt || '';
      form.elements['category'].value = post.category || '';
      form.elements['author'].value = post.author || '';
      form.elements['image'].value = post.image || '';
      form.elements['tags'].value = post.tags ? post.tags.join(', ') : '';
      form.elements['published'].value = post.published ? 'true' : 'false';
      
      const modal = new bootstrap.Modal(document.getElementById('blogModal'));
      modal.show();
    }
  },

  /**
   * View blog post
   * @param {string} postId - Post ID
   */
  viewBlogPost(postId) {
    const posts = StorageUtil.get('db_blog_posts', []);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      this.showNotification('error', 'Blog post not found');
      return;
    }

    alert(`Blog Post: ${post.title}\nCategory: ${post.category}\nPublished: ${post.published ? 'Yes' : 'No'}`);
  },

  /**
   * Delete blog post
   * @param {string} postId - Post ID
   */
  deleteBlogPost(postId) {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    const posts = StorageUtil.get('db_blog_posts', []);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      this.showNotification('error', 'Blog post not found');
      return;
    }

    post.deleted = true;
    post.deletedAt = new Date().toISOString();
    
    StorageUtil.set('db_blog_posts', posts);
    AdminDashboard.logAction('delete', 'blog_post', postId, { title: post.title });
    AdminDashboard.addActivity('blog_delete', `Deleted blog post: ${post.title}`);
    
    this.loadBlogPosts();
    this.showNotification('success', 'Blog post deleted successfully!');
  },

  // ==================== TEAM MEMBER MANAGEMENT ====================

  /**
   * Load and display team members
   */
  loadTeamMembers() {
    const members = StorageUtil.get('db_team_members', []);
    this.displayTeamMembers(members);
  },

  /**
   * Display team members
   * @param {array} members - Team members to display
   */
  displayTeamMembers(members) {
    const container = document.getElementById('teamMembersContainer');
    if (!container) return;

    if (members.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No team members found</p></div>';
      return;
    }

    container.innerHTML = members.filter(m => !m.deleted).map(member => `
      <div class="col-md-4 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <img src="${member.photo || 'Images/dale.png'}" class="rounded-circle mb-3" 
                 style="width: 100px; height: 100px; object-fit: cover;" alt="${member.name}">
            <h5 class="fw-bold">${member.name}</h5>
            <p class="text-primary mb-2">${member.position}</p>
            <p class="text-muted small mb-3">
              <i class="fas fa-envelope me-2"></i>${member.email || 'N/A'}<br>
              <i class="fas fa-phone me-2"></i>${member.phone || 'N/A'}
            </p>
            <div class="mb-3">
              <span class="badge bg-${member.active ? 'success' : 'secondary'}">${member.active ? 'Active' : 'Inactive'}</span>
              ${member.experience ? `<span class="badge bg-info">${member.experience} Years Exp</span>` : ''}
            </div>
            <div class="btn-group w-100">
              <button class="btn btn-sm btn-outline-primary" onclick="ContentManagement.viewTeamMember('${member.id}')">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-warning" onclick="ContentManagement.editTeamMember('${member.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="ContentManagement.deleteTeamMember('${member.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Handle team member form submission
   * @param {Event} e - Submit event
   */
  handleTeamSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberId = formData.get('memberId');
    
    const memberData = {
      id: memberId || 'member_' + Date.now(),
      name: formData.get('name'),
      position: formData.get('position'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      photo: formData.get('photo'),
      bio: formData.get('bio'),
      experience: parseInt(formData.get('experience')) || 0,
      specialization: formData.get('specialization'),
      active: formData.get('active') === 'true',
      createdAt: memberId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const members = StorageUtil.get('db_team_members', []);
    
    if (memberId) {
      const index = members.findIndex(m => m.id === memberId);
      if (index !== -1) {
        members[index] = { ...members[index], ...memberData };
        AdminDashboard.logAction('update', 'team_member', memberId, memberData);
        AdminDashboard.addActivity('team_update', `Updated team member: ${memberData.name}`);
      }
    } else {
      members.push(memberData);
      AdminDashboard.logAction('create', 'team_member', memberData.id, memberData);
      AdminDashboard.addActivity('team_create', `Added new team member: ${memberData.name}`);
    }

    StorageUtil.set('db_team_members', members);
    this.loadTeamMembers();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('teamModal'));
    if (modal) modal.hide();
    e.target.reset();
    
    this.showNotification('success', 'Team member saved successfully!');
  },

  /**
   * Edit team member
   * @param {string} memberId - Member ID
   */
  editTeamMember(memberId) {
    const members = StorageUtil.get('db_team_members', []);
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
      this.showNotification('error', 'Team member not found');
      return;
    }

    const form = document.getElementById('teamForm');
    if (form) {
      form.elements['memberId'].value = member.id;
      form.elements['name'].value = member.name || '';
      form.elements['position'].value = member.position || '';
      form.elements['email'].value = member.email || '';
      form.elements['phone'].value = member.phone || '';
      form.elements['photo'].value = member.photo || '';
      form.elements['bio'].value = member.bio || '';
      form.elements['experience'].value = member.experience || '';
      form.elements['specialization'].value = member.specialization || '';
      form.elements['active'].value = member.active ? 'true' : 'false';
      
      const modal = new bootstrap.Modal(document.getElementById('teamModal'));
      modal.show();
    }
  },

  /**
   * View team member
   * @param {string} memberId - Member ID
   */
  viewTeamMember(memberId) {
    const members = StorageUtil.get('db_team_members', []);
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
      this.showNotification('error', 'Team member not found');
      return;
    }

    alert(`Team Member: ${member.name}\nPosition: ${member.position}\nEmail: ${member.email}`);
  },

  /**
   * Delete team member
   * @param {string} memberId - Member ID
   */
  deleteTeamMember(memberId) {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    const members = StorageUtil.get('db_team_members', []);
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
      this.showNotification('error', 'Team member not found');
      return;
    }

    member.deleted = true;
    member.deletedAt = new Date().toISOString();
    
    StorageUtil.set('db_team_members', members);
    AdminDashboard.logAction('delete', 'team_member', memberId, { name: member.name });
    AdminDashboard.addActivity('team_delete', `Removed team member: ${member.name}`);
    
    this.loadTeamMembers();
    this.showNotification('success', 'Team member removed successfully!');
  },

  // ==================== TESTIMONIAL MANAGEMENT ====================

  /**
   * Load and display testimonials
   */
  loadTestimonials() {
    const testimonials = StorageUtil.get('db_testimonials', []);
    this.displayTestimonials(testimonials);
  },

  /**
   * Display testimonials
   * @param {array} testimonials - Testimonials to display
   */
  displayTestimonials(testimonials) {
    const tbody = document.getElementById('testimonialsTableBody');
    if (!tbody) return;

    if (testimonials.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No testimonials found</td></tr>';
      return;
    }

    tbody.innerHTML = testimonials.filter(t => !t.deleted).map(testimonial => `
      <tr>
        <td><strong>${testimonial.clientName}</strong></td>
        <td>${testimonial.company || 'N/A'}</td>
        <td>${testimonial.projectName || 'N/A'}</td>
        <td>
          ${'★'.repeat(testimonial.rating || 0)}${'☆'.repeat(5 - (testimonial.rating || 0))}
        </td>
        <td><span class="badge bg-${testimonial.published ? 'success' : 'warning'}">${testimonial.published ? 'Published' : 'Draft'}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-${testimonial.published ? 'secondary' : 'success'}" 
                  onclick="ContentManagement.toggleTestimonialPublish('${testimonial.id}')" 
                  title="${testimonial.published ? 'Unpublish' : 'Publish'}">
            <i class="fas fa-${testimonial.published ? 'eye-slash' : 'check'}"></i>
          </button>
          <button class="btn btn-sm btn-primary" onclick="ContentManagement.viewTestimonial('${testimonial.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="ContentManagement.editTestimonial('${testimonial.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="ContentManagement.deleteTestimonial('${testimonial.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Handle testimonial form submission
   * @param {Event} e - Submit event
   * @param {boolean} isDraft - Whether to save as draft
   */
  handleTestimonialSubmit(e, isDraft = false) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const testimonialId = formData.get('testimonialId');
    
    const testimonialData = {
      id: testimonialId || 'testimonial_' + Date.now(),
      clientName: formData.get('clientName'),
      company: formData.get('company'),
      position: formData.get('position'),
      projectName: formData.get('projectName'),
      testimonial: formData.get('testimonial'),
      rating: parseInt(formData.get('rating')) || 5,
      photo: formData.get('photo'),
      published: isDraft ? false : (formData.get('published') === 'true'),
      date: formData.get('date') || new Date().toISOString(),
      createdAt: testimonialId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const testimonials = StorageUtil.get('db_testimonials', []);
    
    if (testimonialId) {
      const index = testimonials.findIndex(t => t.id === testimonialId);
      if (index !== -1) {
        testimonials[index] = { ...testimonials[index], ...testimonialData };
        AdminDashboard.logAction('update', 'testimonial', testimonialId, testimonialData);
        AdminDashboard.addActivity('testimonial_update', `Updated testimonial from: ${testimonialData.clientName}`);
      }
    } else {
      testimonials.push(testimonialData);
      AdminDashboard.logAction('create', 'testimonial', testimonialData.id, testimonialData);
      AdminDashboard.addActivity('testimonial_create', `Added new testimonial from: ${testimonialData.clientName}`);
    }

    StorageUtil.set('db_testimonials', testimonials);
    this.loadTestimonials();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('testimonialModal'));
    if (modal) modal.hide();
    e.target.reset();
    
    const statusMsg = isDraft ? 'Testimonial saved as draft!' : 'Testimonial saved successfully!';
    this.showNotification('success', statusMsg);
  },

  /**
   * Edit testimonial
   * @param {string} testimonialId - Testimonial ID
   */
  editTestimonial(testimonialId) {
    const testimonials = StorageUtil.get('db_testimonials', []);
    const testimonial = testimonials.find(t => t.id === testimonialId);
    
    if (!testimonial) {
      this.showNotification('error', 'Testimonial not found');
      return;
    }

    const form = document.getElementById('testimonialForm');
    if (form) {
      form.elements['testimonialId'].value = testimonial.id;
      form.elements['clientName'].value = testimonial.clientName || '';
      form.elements['company'].value = testimonial.company || '';
      form.elements['position'].value = testimonial.position || '';
      form.elements['projectName'].value = testimonial.projectName || '';
      form.elements['testimonial'].value = testimonial.testimonial || '';
      form.elements['rating'].value = testimonial.rating || 5;
      form.elements['photo'].value = testimonial.photo || '';
      form.elements['published'].value = testimonial.published ? 'true' : 'false';
      
      const modal = new bootstrap.Modal(document.getElementById('testimonialModal'));
      modal.show();
    }
  },

  /**
   * View testimonial
   * @param {string} testimonialId - Testimonial ID
   */
  viewTestimonial(testimonialId) {
    const testimonials = StorageUtil.get('db_testimonials', []);
    const testimonial = testimonials.find(t => t.id === testimonialId);
    
    if (!testimonial) {
      this.showNotification('error', 'Testimonial not found');
      return;
    }

    alert(`Testimonial from: ${testimonial.clientName}\nCompany: ${testimonial.company}\nRating: ${testimonial.rating}/5\n\n"${testimonial.testimonial}"`);
  },

  /**
   * Delete testimonial
   * @param {string} testimonialId - Testimonial ID
   */
  deleteTestimonial(testimonialId) {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    const testimonials = StorageUtil.get('db_testimonials', []);
    const testimonial = testimonials.find(t => t.id === testimonialId);
    
    if (!testimonial) {
      this.showNotification('error', 'Testimonial not found');
      return;
    }

    testimonial.deleted = true;
    testimonial.deletedAt = new Date().toISOString();
    
    StorageUtil.set('db_testimonials', testimonials);
    AdminDashboard.logAction('delete', 'testimonial', testimonialId, { clientName: testimonial.clientName });
    AdminDashboard.addActivity('testimonial_delete', `Deleted testimonial from: ${testimonial.clientName}`);
    
    this.loadTestimonials();
    this.showNotification('success', 'Testimonial deleted successfully!');
  },

  // ==================== SERVICE OFFERING MANAGEMENT ====================

  /**
   * Load and display service offerings
   */
  loadServiceOfferings() {
    const services = StorageUtil.get('db_service_offerings', []);
    this.displayServiceOfferings(services);
  },

  /**
   * Display service offerings
   * @param {array} services - Service offerings to display
   */
  displayServiceOfferings(services) {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;

    if (services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No service offerings found</td></tr>';
      return;
    }

    tbody.innerHTML = services.filter(s => !s.deleted).map(service => `
      <tr>
        <td><strong>${service.name}</strong></td>
        <td>${service.category || 'N/A'}</td>
        <td>${service.price || 'Contact for quote'}</td>
        <td>${service.duration || 'Varies'}</td>
        <td><span class="badge bg-${service.published ? 'success' : 'warning'}">${service.published ? 'Published' : 'Draft'}</span></td>
        <td class="table-actions">
          <button class="btn btn-sm btn-${service.published ? 'secondary' : 'success'}" 
                  onclick="ContentManagement.toggleServicePublish('${service.id}')" 
                  title="${service.published ? 'Unpublish' : 'Publish'}">
            <i class="fas fa-${service.published ? 'eye-slash' : 'check'}"></i>
          </button>
          <button class="btn btn-sm btn-primary" onclick="ContentManagement.viewService('${service.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="ContentManagement.editService('${service.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="ContentManagement.deleteService('${service.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Handle service offering form submission
   * @param {Event} e - Submit event
   * @param {boolean} isDraft - Whether to save as draft
   */
  handleServiceSubmit(e, isDraft = false) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serviceId = formData.get('serviceId');
    
    const serviceData = {
      id: serviceId || 'service_' + Date.now(),
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price'),
      duration: formData.get('duration'),
      features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()) : [],
      icon: formData.get('icon'),
      published: isDraft ? false : (formData.get('published') === 'true'),
      createdAt: serviceId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const services = StorageUtil.get('db_service_offerings', []);
    
    if (serviceId) {
      const index = services.findIndex(s => s.id === serviceId);
      if (index !== -1) {
        services[index] = { ...services[index], ...serviceData };
        AdminDashboard.logAction('update', 'service_offering', serviceId, serviceData);
        AdminDashboard.addActivity('service_update', `Updated service: ${serviceData.name}`);
      }
    } else {
      services.push(serviceData);
      AdminDashboard.logAction('create', 'service_offering', serviceData.id, serviceData);
      AdminDashboard.addActivity('service_create', `Added new service: ${serviceData.name}`);
    }

    StorageUtil.set('db_service_offerings', services);
    this.loadServiceOfferings();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
    if (modal) modal.hide();
    e.target.reset();
    
    const statusMsg = isDraft ? 'Service offering saved as draft!' : 'Service offering saved successfully!';
    this.showNotification('success', statusMsg);
  },

  /**
   * Edit service offering
   * @param {string} serviceId - Service ID
   */
  editService(serviceId) {
    const services = StorageUtil.get('db_service_offerings', []);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      this.showNotification('error', 'Service offering not found');
      return;
    }

    const form = document.getElementById('serviceForm');
    if (form) {
      form.elements['serviceId'].value = service.id;
      form.elements['name'].value = service.name || '';
      form.elements['description'].value = service.description || '';
      form.elements['category'].value = service.category || '';
      form.elements['price'].value = service.price || '';
      form.elements['duration'].value = service.duration || '';
      form.elements['features'].value = service.features ? service.features.join(', ') : '';
      form.elements['icon'].value = service.icon || '';
      form.elements['published'].value = service.published ? 'true' : 'false';
      
      const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
      modal.show();
    }
  },

  /**
   * View service offering
   * @param {string} serviceId - Service ID
   */
  viewService(serviceId) {
    const services = StorageUtil.get('db_service_offerings', []);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      this.showNotification('error', 'Service offering not found');
      return;
    }

    alert(`Service: ${service.name}\nCategory: ${service.category}\nPrice: ${service.price}\n\n${service.description}`);
  },

  /**
   * Delete service offering
   * @param {string} serviceId - Service ID
   */
  deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service offering?')) {
      return;
    }

    const services = StorageUtil.get('db_service_offerings', []);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      this.showNotification('error', 'Service offering not found');
      return;
    }

    service.deleted = true;
    service.deletedAt = new Date().toISOString();
    
    StorageUtil.set('db_service_offerings', services);
    AdminDashboard.logAction('delete', 'service_offering', serviceId, { name: service.name });
    AdminDashboard.addActivity('service_delete', `Deleted service: ${service.name}`);
    
    this.loadServiceOfferings();
    this.showNotification('success', 'Service offering deleted successfully!');
  },

  // ==================== CONTENT PUBLISHING WORKFLOW ====================

  /**
   * Toggle publish status for a project
   * @param {string} projectId - Project ID
   */
  toggleProjectPublish(projectId) {
    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      this.showNotification('error', 'Project not found');
      return;
    }

    // Toggle published status
    project.published = !project.published;
    project.updatedAt = new Date().toISOString();
    
    StorageUtil.set(CONFIG.STORAGE_KEYS.PROJECTS, projects);
    
    const action = project.published ? 'published' : 'unpublished';
    AdminDashboard.logAction(action, 'project', projectId, { title: project.title });
    AdminDashboard.addActivity(`project_${action}`, `${action.charAt(0).toUpperCase() + action.slice(1)} project: ${project.title}`);
    
    this.loadProjects();
    this.showNotification('success', `Project ${action} successfully!`);
  },

  /**
   * Toggle publish status for a blog post
   * @param {string} postId - Post ID
   */
  toggleBlogPublish(postId) {
    const posts = StorageUtil.get('db_blog_posts', []);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      this.showNotification('error', 'Blog post not found');
      return;
    }

    // Toggle published status
    post.published = !post.published;
    post.updatedAt = new Date().toISOString();
    
    // Update publish date if publishing for the first time
    if (post.published && !post.publishDate) {
      post.publishDate = new Date().toISOString();
    }
    
    StorageUtil.set('db_blog_posts', posts);
    
    const action = post.published ? 'published' : 'unpublished';
    AdminDashboard.logAction(action, 'blog_post', postId, { title: post.title });
    AdminDashboard.addActivity(`blog_${action}`, `${action.charAt(0).toUpperCase() + action.slice(1)} blog post: ${post.title}`);
    
    this.loadBlogPosts();
    this.showNotification('success', `Blog post ${action} successfully!`);
  },

  /**
   * Toggle publish status for a testimonial
   * @param {string} testimonialId - Testimonial ID
   */
  toggleTestimonialPublish(testimonialId) {
    const testimonials = StorageUtil.get('db_testimonials', []);
    const testimonial = testimonials.find(t => t.id === testimonialId);
    
    if (!testimonial) {
      this.showNotification('error', 'Testimonial not found');
      return;
    }

    // Toggle published status
    testimonial.published = !testimonial.published;
    testimonial.updatedAt = new Date().toISOString();
    
    StorageUtil.set('db_testimonials', testimonials);
    
    const action = testimonial.published ? 'published' : 'unpublished';
    AdminDashboard.logAction(action, 'testimonial', testimonialId, { clientName: testimonial.clientName });
    AdminDashboard.addActivity(`testimonial_${action}`, `${action.charAt(0).toUpperCase() + action.slice(1)} testimonial from: ${testimonial.clientName}`);
    
    this.loadTestimonials();
    this.showNotification('success', `Testimonial ${action} successfully!`);
  },

  /**
   * Toggle publish status for a service offering
   * @param {string} serviceId - Service ID
   */
  toggleServicePublish(serviceId) {
    const services = StorageUtil.get('db_service_offerings', []);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      this.showNotification('error', 'Service offering not found');
      return;
    }

    // Toggle published status
    service.published = !service.published;
    service.updatedAt = new Date().toISOString();
    
    StorageUtil.set('db_service_offerings', services);
    
    const action = service.published ? 'published' : 'unpublished';
    AdminDashboard.logAction(action, 'service_offering', serviceId, { name: service.name });
    AdminDashboard.addActivity(`service_${action}`, `${action.charAt(0).toUpperCase() + action.slice(1)} service: ${service.name}`);
    
    this.loadServiceOfferings();
    this.showNotification('success', `Service offering ${action} successfully!`);
  },

  /**
   * Get all published content for public site
   * @param {string} contentType - Type of content (projects, blog_posts, testimonials, service_offerings)
   * @returns {array} - Published content items
   */
  getPublishedContent(contentType) {
    let storageKey;
    
    switch(contentType) {
      case 'projects':
        storageKey = CONFIG.STORAGE_KEYS.PROJECTS;
        break;
      case 'blog_posts':
        storageKey = 'db_blog_posts';
        break;
      case 'testimonials':
        storageKey = 'db_testimonials';
        break;
      case 'service_offerings':
        storageKey = 'db_service_offerings';
        break;
      default:
        return [];
    }
    
    const content = StorageUtil.get(storageKey, []);
    
    // Return only published and non-deleted content
    return content.filter(item => item.published && !item.deleted);
  },

  // ==================== IMAGE UPLOAD AND OPTIMIZATION ====================

  /**
   * Setup image upload handlers for all forms
   */
  setupImageUploadHandlers() {
    // Project image upload
    const projectImageInput = document.getElementById('projectImageUpload');
    if (projectImageInput) {
      ImageOptimizer.setupFileInput(projectImageInput, (results) => {
        this.handleProjectImageUpload(results);
      });
    }

    // Blog post image upload
    const blogImageInput = document.getElementById('blogImageUpload');
    if (blogImageInput) {
      ImageOptimizer.setupFileInput(blogImageInput, (results) => {
        this.handleBlogImageUpload(results);
      }, { maxWidth: 1200, maxHeight: 800 });
    }

    // Team member photo upload
    const teamPhotoInput = document.getElementById('teamPhotoUpload');
    if (teamPhotoInput) {
      ImageOptimizer.setupFileInput(teamPhotoInput, (results) => {
        this.handleTeamPhotoUpload(results);
      }, { maxWidth: 800, maxHeight: 800, thumbnailWidth: 200, thumbnailHeight: 200 });
    }

    // Testimonial photo upload
    const testimonialPhotoInput = document.getElementById('testimonialPhotoUpload');
    if (testimonialPhotoInput) {
      ImageOptimizer.setupFileInput(testimonialPhotoInput, (results) => {
        this.handleTestimonialPhotoUpload(results);
      }, { maxWidth: 400, maxHeight: 400 });
    }
  },

  /**
   * Handle project image upload
   * @param {array} results - Optimized image results
   */
  handleProjectImageUpload(results) {
    const validResults = results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      this.showNotification('error', 'No valid images to upload');
      return;
    }

    // Store optimized images
    const imageIds = validResults.map(result => {
      const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Store in localStorage (in production, would upload to server)
      StorageUtil.set(`db_image_${imageId}`, {
        id: imageId,
        original: result.original.dataUrl,
        thumbnail: result.thumbnail.dataUrl,
        metadata: result.metadata
      });

      return imageId;
    });

    // Update form field with image IDs
    const imagesField = document.getElementById('images');
    if (imagesField) {
      const currentImages = imagesField.value ? imagesField.value.split(',').map(s => s.trim()) : [];
      imagesField.value = [...currentImages, ...imageIds].join(', ');
    }

    // Display preview
    this.displayImagePreviews('projectImagePreview', imageIds);

    this.showNotification('success', `${validResults.length} image(s) optimized and uploaded successfully!`);
  },

  /**
   * Handle blog post image upload
   * @param {array} results - Optimized image results
   */
  handleBlogImageUpload(results) {
    if (results.length === 0 || results[0].error) {
      this.showNotification('error', 'Failed to upload image');
      return;
    }

    const result = results[0];
    const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Store optimized image
    StorageUtil.set(`db_image_${imageId}`, {
      id: imageId,
      original: result.original.dataUrl,
      thumbnail: result.thumbnail.dataUrl,
      metadata: result.metadata
    });

    // Update form field
    const imageField = document.getElementById('image');
    if (imageField) {
      imageField.value = imageId;
    }

    // Display preview
    this.displayImagePreviews('blogImagePreview', [imageId]);

    this.showNotification('success', 'Featured image optimized and uploaded successfully!');
  },

  /**
   * Handle team member photo upload
   * @param {array} results - Optimized image results
   */
  handleTeamPhotoUpload(results) {
    if (results.length === 0 || results[0].error) {
      this.showNotification('error', 'Failed to upload photo');
      return;
    }

    const result = results[0];
    const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Store optimized image
    StorageUtil.set(`db_image_${imageId}`, {
      id: imageId,
      original: result.original.dataUrl,
      thumbnail: result.thumbnail.dataUrl,
      metadata: result.metadata
    });

    // Update form field
    const photoField = document.getElementById('photo');
    if (photoField) {
      photoField.value = imageId;
    }

    // Display preview
    this.displayImagePreviews('teamPhotoPreview', [imageId]);

    this.showNotification('success', 'Photo optimized and uploaded successfully!');
  },

  /**
   * Handle testimonial photo upload
   * @param {array} results - Optimized image results
   */
  handleTestimonialPhotoUpload(results) {
    if (results.length === 0 || results[0].error) {
      this.showNotification('error', 'Failed to upload photo');
      return;
    }

    const result = results[0];
    const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Store optimized image
    StorageUtil.set(`db_image_${imageId}`, {
      id: imageId,
      original: result.original.dataUrl,
      thumbnail: result.thumbnail.dataUrl,
      metadata: result.metadata
    });

    // Update form field
    const photoField = document.getElementById('photoTest');
    if (photoField) {
      photoField.value = imageId;
    }

    // Display preview
    this.displayImagePreviews('testimonialPhotoPreview', [imageId]);

    this.showNotification('success', 'Photo optimized and uploaded successfully!');
  },

  /**
   * Display image previews
   * @param {string} containerId - Container element ID
   * @param {array} imageIds - Array of image IDs
   */
  displayImagePreviews(containerId, imageIds) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    imageIds.forEach(imageId => {
      const imageData = StorageUtil.get(`db_image_${imageId}`);
      if (!imageData) return;

      const previewDiv = document.createElement('div');
      previewDiv.className = 'd-inline-block position-relative m-2';
      previewDiv.style.cssText = 'width: 100px; height: 100px;';
      
      previewDiv.innerHTML = `
        <img src="${imageData.thumbnail.dataUrl}" 
             class="img-thumbnail" 
             style="width: 100%; height: 100%; object-fit: cover;"
             alt="Preview">
        <button type="button" 
                class="btn btn-sm btn-danger position-absolute top-0 end-0" 
                onclick="ContentManagement.removeImagePreview('${containerId}', '${imageId}')"
                style="padding: 2px 6px; font-size: 10px;">
          <i class="fas fa-times"></i>
        </button>
        <small class="d-block text-center text-muted" style="font-size: 9px;">
          ${Math.round(imageData.original.size / 1024)}KB
        </small>
      `;

      container.appendChild(previewDiv);
    });
  },

  /**
   * Remove image preview
   * @param {string} containerId - Container element ID
   * @param {string} imageId - Image ID to remove
   */
  removeImagePreview(containerId, imageId) {
    // Remove from storage
    StorageUtil.remove(`db_image_${imageId}`);

    // Update form field based on container
    if (containerId === 'projectImagePreview') {
      const imagesField = document.getElementById('images');
      if (imagesField) {
        const images = imagesField.value.split(',').map(s => s.trim()).filter(id => id !== imageId);
        imagesField.value = images.join(', ');
      }
    } else if (containerId === 'blogImagePreview') {
      const imageField = document.getElementById('image');
      if (imageField) {
        imageField.value = '';
      }
    } else if (containerId === 'teamPhotoPreview') {
      const photoField = document.getElementById('photo');
      if (photoField) {
        photoField.value = '';
      }
    } else if (containerId === 'testimonialPhotoPreview') {
      const photoField = document.getElementById('photoTest');
      if (photoField) {
        photoField.value = '';
      }
    }

    // Refresh preview display
    const container = document.getElementById(containerId);
    if (container) {
      container.querySelector(`[onclick*="${imageId}"]`)?.closest('.d-inline-block')?.remove();
    }

    this.showNotification('info', 'Image removed');
  },

  /**
   * Get image URL by ID
   * @param {string} imageId - Image ID
   * @param {boolean} thumbnail - Whether to get thumbnail (default: false)
   * @returns {string|null} - Image data URL or null
   */
  getImageUrl(imageId, thumbnail = false) {
    const imageData = StorageUtil.get(`db_image_${imageId}`);
    if (!imageData) return null;

    return thumbnail ? imageData.thumbnail.dataUrl : imageData.original.dataUrl;
  },

  // ==================== ARCHIVED CONTENT MANAGEMENT ====================

  /**
   * Load and display archived content
   */
  loadArchivedContent() {
    const archivedItems = this.getAllArchivedContent();
    this.displayArchivedContent(archivedItems);
  },

  /**
   * Get all archived content from all content types
   * @returns {array} - Array of archived content items
   */
  getAllArchivedContent() {
    const archivedItems = [];

    // Get archived projects
    const projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    projects.filter(p => p.deleted).forEach(project => {
      archivedItems.push({
        type: 'projects',
        typeName: 'Project',
        id: project.id,
        title: project.title,
        deletedAt: project.deletedAt,
        data: project
      });
    });

    // Get archived blog posts
    const posts = StorageUtil.get('db_blog_posts', []);
    posts.filter(p => p.deleted).forEach(post => {
      archivedItems.push({
        type: 'blog_posts',
        typeName: 'Blog Post',
        id: post.id,
        title: post.title,
        deletedAt: post.deletedAt,
        data: post
      });
    });

    // Get archived team members
    const members = StorageUtil.get('db_team_members', []);
    members.filter(m => m.deleted).forEach(member => {
      archivedItems.push({
        type: 'team_members',
        typeName: 'Team Member',
        id: member.id,
        title: member.name,
        deletedAt: member.deletedAt,
        data: member
      });
    });

    // Get archived testimonials
    const testimonials = StorageUtil.get('db_testimonials', []);
    testimonials.filter(t => t.deleted).forEach(testimonial => {
      archivedItems.push({
        type: 'testimonials',
        typeName: 'Testimonial',
        id: testimonial.id,
        title: `${testimonial.clientName} - ${testimonial.company || 'N/A'}`,
        deletedAt: testimonial.deletedAt,
        data: testimonial
      });
    });

    // Get archived service offerings
    const services = StorageUtil.get('db_service_offerings', []);
    services.filter(s => s.deleted).forEach(service => {
      archivedItems.push({
        type: 'service_offerings',
        typeName: 'Service Offering',
        id: service.id,
        title: service.name,
        deletedAt: service.deletedAt,
        data: service
      });
    });

    // Sort by deleted date (most recent first)
    archivedItems.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    return archivedItems;
  },

  /**
   * Display archived content in table
   * @param {array} items - Archived items to display
   */
  displayArchivedContent(items) {
    const tbody = document.getElementById('archivedContentTableBody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No archived content found</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td><span class="badge bg-secondary">${item.typeName}</span></td>
        <td><strong>${item.title}</strong></td>
        <td>${new Date(item.deletedAt).toLocaleString()}</td>
        <td class="table-actions">
          <button class="btn btn-sm btn-success" 
                  onclick="ContentManagement.restoreContent('${item.type}', '${item.id}')" 
                  title="Restore">
            <i class="fas fa-undo"></i> Restore
          </button>
          <button class="btn btn-sm btn-danger" 
                  onclick="ContentManagement.permanentlyDeleteContent('${item.type}', '${item.id}')" 
                  title="Permanently Delete">
            <i class="fas fa-trash-alt"></i> Delete Permanently
          </button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Filter archived content by type
   */
  filterArchivedContent() {
    const filterSelect = document.getElementById('archivedContentTypeFilter');
    if (!filterSelect) return;

    const selectedType = filterSelect.value;
    const allArchived = this.getAllArchivedContent();

    if (selectedType === 'all') {
      this.displayArchivedContent(allArchived);
    } else {
      const filtered = allArchived.filter(item => item.type === selectedType);
      this.displayArchivedContent(filtered);
    }
  },

  /**
   * Restore archived content
   * @param {string} contentType - Type of content (projects, blog_posts, etc.)
   * @param {string} contentId - Content ID
   */
  restoreContent(contentType, contentId) {
    if (!confirm('Are you sure you want to restore this content?')) {
      return;
    }

    let storageKey;
    let contentName = '';

    switch(contentType) {
      case 'projects':
        storageKey = CONFIG.STORAGE_KEYS.PROJECTS;
        break;
      case 'blog_posts':
        storageKey = 'db_blog_posts';
        break;
      case 'team_members':
        storageKey = 'db_team_members';
        break;
      case 'testimonials':
        storageKey = 'db_testimonials';
        break;
      case 'service_offerings':
        storageKey = 'db_service_offerings';
        break;
      default:
        this.showNotification('error', 'Invalid content type');
        return;
    }

    const content = StorageUtil.get(storageKey, []);
    const item = content.find(c => c.id === contentId);

    if (!item) {
      this.showNotification('error', 'Content not found');
      return;
    }

    // Remove deleted flag and deletedAt timestamp
    delete item.deleted;
    delete item.deletedAt;
    item.updatedAt = new Date().toISOString();

    StorageUtil.set(storageKey, content);

    // Get content name for logging
    contentName = item.title || item.name || item.clientName || 'Unknown';

    // Log the restore action
    AdminDashboard.logAction('restore', contentType, contentId, { name: contentName });
    AdminDashboard.addActivity('content_restore', `Restored ${contentType.replace('_', ' ')}: ${contentName}`);

    // Reload displays
    this.loadArchivedContent();
    
    // Reload the specific content type display
    switch(contentType) {
      case 'projects':
        this.loadProjects();
        break;
      case 'blog_posts':
        this.loadBlogPosts();
        break;
      case 'team_members':
        this.loadTeamMembers();
        break;
      case 'testimonials':
        this.loadTestimonials();
        break;
      case 'service_offerings':
        this.loadServiceOfferings();
        break;
    }

    this.showNotification('success', 'Content restored successfully!');
  },

  /**
   * Permanently delete archived content
   * @param {string} contentType - Type of content
   * @param {string} contentId - Content ID
   */
  permanentlyDeleteContent(contentType, contentId) {
    if (!confirm('Are you sure you want to PERMANENTLY delete this content? This action cannot be undone!')) {
      return;
    }

    let storageKey;
    let contentName = '';

    switch(contentType) {
      case 'projects':
        storageKey = CONFIG.STORAGE_KEYS.PROJECTS;
        break;
      case 'blog_posts':
        storageKey = 'db_blog_posts';
        break;
      case 'team_members':
        storageKey = 'db_team_members';
        break;
      case 'testimonials':
        storageKey = 'db_testimonials';
        break;
      case 'service_offerings':
        storageKey = 'db_service_offerings';
        break;
      default:
        this.showNotification('error', 'Invalid content type');
        return;
    }

    const content = StorageUtil.get(storageKey, []);
    const index = content.findIndex(c => c.id === contentId);

    if (index === -1) {
      this.showNotification('error', 'Content not found');
      return;
    }

    // Get content name for logging
    const item = content[index];
    contentName = item.title || item.name || item.clientName || 'Unknown';

    // Permanently remove from array
    content.splice(index, 1);
    StorageUtil.set(storageKey, content);

    // Log the permanent deletion
    AdminDashboard.logAction('permanent_delete', contentType, contentId, { name: contentName });
    AdminDashboard.addActivity('content_permanent_delete', `Permanently deleted ${contentType.replace('_', ' ')}: ${contentName}`);

    // Reload archived content display
    this.loadArchivedContent();

    this.showNotification('warning', 'Content permanently deleted!');
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Show notification
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {string} message - Notification message
   */
  showNotification(type, message) {
    const alertClass = type === 'error' ? 'danger' : type;
    const icon = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    }[type] || 'info-circle';

    const notification = document.createElement('div');
    notification.className = `alert alert-${alertClass} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      <i class="fas fa-${icon} me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentManagement;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.ContentManagement = ContentManagement;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-dashboard')) {
      ContentManagement.init();
    }
  });
}
