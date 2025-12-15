/**
 * Admin CRUD Operations Module
 * Complete Create, Read, Update, Delete functionality for admin panels
 */

const AdminCRUD = {
    // Storage keys
    STORAGE_KEYS: {
        PROJECTS: 'db_admin_projects',
        CLIENTS: 'db_admin_clients',
        TEAM_MEMBERS: 'db_admin_team',
        INQUIRIES: 'db_admin_inquiries',
        BLOG_POSTS: 'db_admin_blog',
        INVOICES: 'db_admin_invoices',
        SCHEDULE: 'db_admin_schedule',
        QUOTES: 'db_admin_quotes',
        TESTIMONIALS: 'db_admin_testimonials',
        SERVICES: 'db_admin_services'
    },

    /**
     * Initialize data from localStorage or use defaults
     */
    init() {
        this.initProjects();
        this.initClients();
        this.initTeamMembers();
        this.initInquiries();
        this.initBlogPosts();
        this.initInvoices();
        this.initSchedule();
        this.initQuotes();
        this.initTestimonials();
        this.initServices();
    },

    /**
     * Initialize Projects
     */
    initProjects() {
        const defaultProjects = [
            { id: 1, name: 'Addis Ababa Commercial Tower', client: 'ABC Corporation', type: 'Commercial', location: 'Addis Ababa', budget: '15M ETB', status: 'Active', progress: 75, startDate: 'Jan 15, 2024' },
            { id: 2, name: 'Sheger General Hospital', client: 'Ministry of Health', type: 'Healthcare', location: 'Addis Ababa', budget: '25M ETB', status: 'In Progress', progress: 45, startDate: 'Mar 10, 2024' },
            { id: 3, name: 'Adama Residential Complex', client: 'Real Estate Group', type: 'Residential', location: 'Adama', budget: '8M ETB', status: 'Planning', progress: 20, startDate: 'May 01, 2024' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.PROJECTS)) {
            StorageUtil.set(this.STORAGE_KEYS.PROJECTS, defaultProjects);
        }
    },

    /**
     * Initialize Clients
     */
    initClients() {
        const defaultClients = [
            { id: 1, name: 'ABC Corporation', email: 'contact@abc.com', phone: '+251-911-123-456', type: 'Corporate', projects: 3, value: '35M ETB', status: 'Active' },
            { id: 2, name: 'Ministry of Health', email: 'info@moh.gov.et', phone: '+251-911-234-567', type: 'Government', projects: 2, value: '45M ETB', status: 'Active' },
            { id: 3, name: 'Real Estate Group', email: 'contact@regroup.com', phone: '+251-911-345-678', type: 'Corporate', projects: 5, value: '52M ETB', status: 'Active' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.CLIENTS)) {
            StorageUtil.set(this.STORAGE_KEYS.CLIENTS, defaultClients);
        }
    },

    /**
     * Initialize Team Members
     */
    initTeamMembers() {
        const defaultTeam = [
            { id: 1, name: 'ENG. DALE MELAKU', position: 'General Manager', email: 'dale@dbconstruction.com', phone: '+251-911-590-12', experience: '15 Years', status: 'Active', image: 'Images/dale.png' },
            { id: 2, name: 'MOTI ELIAS', position: 'Site Engineer', email: 'moti@dbconstruction.com', phone: '+251-911-590-13', experience: '10 Years', status: 'Active', image: 'Images/Construction Team.jpg' },
            { id: 3, name: 'MOTI TOLA', position: 'Project Manager', email: 'tola@dbconstruction.com', phone: '+251-911-590-14', experience: '12 Years', status: 'Active', image: 'Images/card2.jpg' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.TEAM_MEMBERS)) {
            StorageUtil.set(this.STORAGE_KEYS.TEAM_MEMBERS, defaultTeam);
        }
    },

    /**
     * Initialize Inquiries
     */
    initInquiries() {
        const defaultInquiries = [
            { id: 1, name: 'Temesgen Dereje', email: 'temed2025@gmail.com', phone: '+251-911-111-111', subject: 'New Project Inquiry', message: 'Interested in commercial construction', date: 'Dec 03, 2025', priority: 'High', status: 'Pending' },
            { id: 2, name: 'Jafar Tule', email: 'jaft@gmail.com', phone: '+251-911-222-222', subject: 'Cost Estimate Request', message: 'Need estimate for residential project', date: 'Dec 02, 2025', priority: 'Medium', status: 'Responded' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.INQUIRIES)) {
            StorageUtil.set(this.STORAGE_KEYS.INQUIRIES, defaultInquiries);
        }
    },

    /**
     * Initialize Blog Posts
     */
    initBlogPosts() {
        const defaultPosts = [
            { id: 1, title: 'Top 10 Construction Safety Practices', category: 'Construction Tips', content: 'Safety first...', date: 'Nov 25, 2025', views: 1200, status: 'Published', image: 'Images/gallery1.jpg' },
            { id: 2, title: 'Sheger Hospital Project Progress', category: 'Project Updates', content: 'Great progress...', date: 'Nov 20, 2025', views: 856, status: 'Published', image: 'Images/gallery3.jpg' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.BLOG_POSTS)) {
            StorageUtil.set(this.STORAGE_KEYS.BLOG_POSTS, defaultPosts);
        }
    },

    /**
     * Initialize Invoices
     */
    initInvoices() {
        const defaultInvoices = [
            { id: 1, client: 'ABC Corporation', project: 'Commercial Tower', amount: '5M ETB', date: 'Dec 01, 2025', dueDate: 'Dec 31, 2025', status: 'Paid' },
            { id: 2, name: 'Ministry of Health', project: 'Sheger Hospital', amount: '8M ETB', date: 'Nov 25, 2025', dueDate: 'Dec 25, 2025', status: 'Pending' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.INVOICES)) {
            StorageUtil.set(this.STORAGE_KEYS.INVOICES, defaultInvoices);
        }
    },

    /**
     * Initialize Schedule
     */
    initSchedule() {
        const defaultSchedule = [
            { id: 1, title: 'Site Inspection - Commercial Tower', date: '2025-12-10', time: '09:00 AM', location: 'Addis Ababa', type: 'Inspection' },
            { id: 2, title: 'Client Meeting - Hospital Project', date: '2025-12-11', time: '02:00 PM', location: 'Office', type: 'Meeting' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.SCHEDULE)) {
            StorageUtil.set(this.STORAGE_KEYS.SCHEDULE, defaultSchedule);
        }
    },

    /**
     * Initialize Quotes
     */
    initQuotes() {
        const defaultQuotes = [
            { id: 1, name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+251-911-333-333', projectType: 'Residential', budget: '5M ETB', description: 'New house construction', date: 'Dec 01, 2025', status: 'Pending' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.QUOTES)) {
            StorageUtil.set(this.STORAGE_KEYS.QUOTES, defaultQuotes);
        }
    },

    // ============================================
    // PROJECTS CRUD
    // ============================================

    getProjects() {
        return StorageUtil.get(this.STORAGE_KEYS.PROJECTS, []);
    },

    addProject(projectData) {
        try {
            // Validate required fields
            if (!projectData || !projectData.name) {
                throw new Error('Project name is required');
            }

            const projects = this.getProjects();
            const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
            
            const newProject = {
                id: newId,
                name: projectData.name,
                client: projectData.client || 'N/A',
                type: projectData.type || 'General',
                location: projectData.location || 'N/A',
                budget: projectData.budget || '0 ETB',
                status: projectData.status || 'Planning',
                progress: projectData.progress || 0,
                startDate: projectData.startDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
                // Support additional fields from modal forms
                description: projectData.description || '',
                category: projectData.category || [],
                completionDate: projectData.completionDate || '',
                size: projectData.size || '',
                cost: projectData.cost || projectData.budget || '0 ETB',
                images: projectData.images || [],
                featuredImage: projectData.featuredImage || ''
            };
            
            projects.push(newProject);
            StorageUtil.set(this.STORAGE_KEYS.PROJECTS, projects);
            this.logAction('create', 'project', newId, newProject);
            return newProject;
        } catch (error) {
            console.error('Error adding project:', error);
            throw error;
        }
    },

    updateProject(id, updates) {
        try {
            if (!id) {
                throw new Error('Project ID is required');
            }

            const projects = this.getProjects();
            const index = projects.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error(`Project with ID ${id} not found`);
            }

            projects[index] = { ...projects[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.PROJECTS, projects);
            this.logAction('update', 'project', id, updates);
            return projects[index];
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    deleteProject(id) {
        const projects = this.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.PROJECTS, filtered);
        this.logAction('delete', 'project', id);
        return true;
    },

    getProject(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    },

    // ============================================
    // CLIENTS CRUD
    // ============================================

    getClients() {
        return StorageUtil.get(this.STORAGE_KEYS.CLIENTS, []);
    },

    addClient(clientData) {
        const clients = this.getClients();
        const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        
        const newClient = {
            id: newId,
            name: clientData.name,
            email: clientData.email || 'N/A',
            phone: clientData.phone || 'N/A',
            type: clientData.type || 'Individual',
            projects: clientData.projects || 0,
            value: clientData.value || '0 ETB',
            status: clientData.status || 'Active'
        };
        
        clients.push(newClient);
        StorageUtil.set(this.STORAGE_KEYS.CLIENTS, clients);
        this.logAction('create', 'client', newId, newClient);
        return newClient;
    },

    updateClient(id, updates) {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === id);
        
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.CLIENTS, clients);
            this.logAction('update', 'client', id, updates);
            return clients[index];
        }
        return null;
    },

    deleteClient(id) {
        const clients = this.getClients();
        const filtered = clients.filter(c => c.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.CLIENTS, filtered);
        this.logAction('delete', 'client', id);
        return true;
    },

    getClient(id) {
        const clients = this.getClients();
        return clients.find(c => c.id === id);
    },

    // ============================================
    // TEAM MEMBERS CRUD
    // ============================================

    getTeamMembers() {
        return StorageUtil.get(this.STORAGE_KEYS.TEAM_MEMBERS, []);
    },

    addTeamMember(memberData) {
        try {
            // Validate required fields
            if (!memberData || !memberData.name) {
                throw new Error('Team member name is required');
            }

            const members = this.getTeamMembers();
            const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
            
            const newMember = {
                id: newId,
                name: memberData.name,
                position: memberData.position || 'Staff',
                email: memberData.email || 'N/A',
                phone: memberData.phone || 'N/A',
                experience: memberData.experience || '0 Years',
                status: memberData.status || 'Active',
                image: memberData.image || 'Images/card2.jpg',
                // Support additional fields from modal forms
                bio: memberData.bio || '',
                photo: memberData.photo || memberData.image,
                socialLinks: memberData.socialLinks || {},
                linkedin: memberData.linkedin || memberData.socialLinks?.linkedin || '',
                twitter: memberData.twitter || memberData.socialLinks?.twitter || '',
                displayOrder: memberData.displayOrder || 0,
                active: memberData.active !== undefined ? memberData.active : true
            };
            
            members.push(newMember);
            StorageUtil.set(this.STORAGE_KEYS.TEAM_MEMBERS, members);
            this.logAction('create', 'team_member', newId, newMember);
            return newMember;
        } catch (error) {
            console.error('Error adding team member:', error);
            throw error;
        }
    },

    updateTeamMember(id, updates) {
        try {
            if (!id) {
                throw new Error('Team member ID is required');
            }

            const members = this.getTeamMembers();
            const index = members.findIndex(m => m.id === id);
            
            if (index === -1) {
                throw new Error(`Team member with ID ${id} not found`);
            }

            members[index] = { ...members[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.TEAM_MEMBERS, members);
            this.logAction('update', 'team_member', id, updates);
            return members[index];
        } catch (error) {
            console.error('Error updating team member:', error);
            throw error;
        }
    },

    deleteTeamMember(id) {
        const members = this.getTeamMembers();
        const filtered = members.filter(m => m.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.TEAM_MEMBERS, filtered);
        this.logAction('delete', 'team_member', id);
        return true;
    },

    getTeamMember(id) {
        const members = this.getTeamMembers();
        return members.find(m => m.id === id);
    },

    // ============================================
    // INQUIRIES CRUD
    // ============================================

    getInquiries() {
        return StorageUtil.get(this.STORAGE_KEYS.INQUIRIES, []);
    },

    addInquiry(inquiryData) {
        const inquiries = this.getInquiries();
        const newId = inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id)) + 1 : 1;
        
        const newInquiry = {
            id: newId,
            name: inquiryData.name,
            email: inquiryData.email || 'N/A',
            phone: inquiryData.phone || 'N/A',
            subject: inquiryData.subject || 'General Inquiry',
            message: inquiryData.message || '',
            date: inquiryData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
            priority: inquiryData.priority || 'Medium',
            status: inquiryData.status || 'Pending'
        };
        
        inquiries.push(newInquiry);
        StorageUtil.set(this.STORAGE_KEYS.INQUIRIES, inquiries);
        this.logAction('create', 'inquiry', newId, newInquiry);
        return newInquiry;
    },

    updateInquiry(id, updates) {
        const inquiries = this.getInquiries();
        const index = inquiries.findIndex(i => i.id === id);
        
        if (index !== -1) {
            inquiries[index] = { ...inquiries[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.INQUIRIES, inquiries);
            this.logAction('update', 'inquiry', id, updates);
            return inquiries[index];
        }
        return null;
    },

    deleteInquiry(id) {
        const inquiries = this.getInquiries();
        const filtered = inquiries.filter(i => i.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.INQUIRIES, filtered);
        this.logAction('delete', 'inquiry', id);
        return true;
    },

    getInquiry(id) {
        const inquiries = this.getInquiries();
        return inquiries.find(i => i.id === id);
    },

    // ============================================
    // BLOG POSTS CRUD
    // ============================================

    getBlogPosts() {
        return StorageUtil.get(this.STORAGE_KEYS.BLOG_POSTS, []);
    },

    addBlogPost(postData) {
        try {
            // Validate required fields
            if (!postData || !postData.title) {
                throw new Error('Blog post title is required');
            }

            const posts = this.getBlogPosts();
            const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
            
            const newPost = {
                id: newId,
                title: postData.title,
                category: postData.category || 'General',
                content: postData.content || '',
                date: postData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
                views: postData.views || 0,
                status: postData.status || 'Draft',
                image: postData.image || 'Images/gallery1.jpg',
                // Support additional fields from modal forms
                author: postData.author || 'Admin',
                publishDate: postData.publishDate || postData.date,
                tags: postData.tags || [],
                featuredImage: postData.featuredImage || postData.image,
                excerpt: postData.excerpt || '',
                featured: postData.featured || false
            };
            
            posts.push(newPost);
            StorageUtil.set(this.STORAGE_KEYS.BLOG_POSTS, posts);
            this.logAction('create', 'blog_post', newId, newPost);
            return newPost;
        } catch (error) {
            console.error('Error adding blog post:', error);
            throw error;
        }
    },

    updateBlogPost(id, updates) {
        try {
            if (!id) {
                throw new Error('Blog post ID is required');
            }

            const posts = this.getBlogPosts();
            const index = posts.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error(`Blog post with ID ${id} not found`);
            }

            posts[index] = { ...posts[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.BLOG_POSTS, posts);
            this.logAction('update', 'blog_post', id, updates);
            return posts[index];
        } catch (error) {
            console.error('Error updating blog post:', error);
            throw error;
        }
    },

    deleteBlogPost(id) {
        const posts = this.getBlogPosts();
        const filtered = posts.filter(p => p.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.BLOG_POSTS, filtered);
        this.logAction('delete', 'blog_post', id);
        return true;
    },

    getBlogPost(id) {
        const posts = this.getBlogPosts();
        return posts.find(p => p.id === id);
    },

    // ============================================
    // INVOICES CRUD
    // ============================================

    getInvoices() {
        return StorageUtil.get(this.STORAGE_KEYS.INVOICES, []);
    },

    addInvoice(invoiceData) {
        const invoices = this.getInvoices();
        const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
        
        const newInvoice = {
            id: newId,
            client: invoiceData.client,
            project: invoiceData.project || 'N/A',
            amount: invoiceData.amount || '0 ETB',
            date: invoiceData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
            dueDate: invoiceData.dueDate || 'N/A',
            status: invoiceData.status || 'Pending'
        };
        
        invoices.push(newInvoice);
        StorageUtil.set(this.STORAGE_KEYS.INVOICES, invoices);
        this.logAction('create', 'invoice', newId, newInvoice);
        return newInvoice;
    },

    updateInvoice(id, updates) {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(i => i.id === id);
        
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.INVOICES, invoices);
            this.logAction('update', 'invoice', id, updates);
            return invoices[index];
        }
        return null;
    },

    deleteInvoice(id) {
        const invoices = this.getInvoices();
        const filtered = invoices.filter(i => i.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.INVOICES, filtered);
        this.logAction('delete', 'invoice', id);
        return true;
    },

    getInvoice(id) {
        const invoices = this.getInvoices();
        return invoices.find(i => i.id === id);
    },

    // ============================================
    // SCHEDULE CRUD
    // ============================================

    getScheduleEvents() {
        return StorageUtil.get(this.STORAGE_KEYS.SCHEDULE, []);
    },

    addScheduleEvent(eventData) {
        const events = this.getScheduleEvents();
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        
        const newEvent = {
            id: newId,
            title: eventData.title,
            date: eventData.date || new Date().toISOString().split('T')[0],
            time: eventData.time || '09:00 AM',
            location: eventData.location || 'TBD',
            type: eventData.type || 'Meeting'
        };
        
        events.push(newEvent);
        StorageUtil.set(this.STORAGE_KEYS.SCHEDULE, events);
        this.logAction('create', 'schedule_event', newId, newEvent);
        return newEvent;
    },

    updateScheduleEvent(id, updates) {
        const events = this.getScheduleEvents();
        const index = events.findIndex(e => e.id === id);
        
        if (index !== -1) {
            events[index] = { ...events[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.SCHEDULE, events);
            this.logAction('update', 'schedule_event', id, updates);
            return events[index];
        }
        return null;
    },

    deleteScheduleEvent(id) {
        const events = this.getScheduleEvents();
        const filtered = events.filter(e => e.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.SCHEDULE, filtered);
        this.logAction('delete', 'schedule_event', id);
        return true;
    },

    getScheduleEvent(id) {
        const events = this.getScheduleEvents();
        return events.find(e => e.id === id);
    },

    // ============================================
    // QUOTES CRUD
    // ============================================

    getQuotes() {
        return StorageUtil.get(this.STORAGE_KEYS.QUOTES, []);
    },

    addQuote(quoteData) {
        const quotes = this.getQuotes();
        const newId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1;
        
        const newQuote = {
            id: newId,
            name: quoteData.name,
            email: quoteData.email || 'N/A',
            phone: quoteData.phone || 'N/A',
            projectType: quoteData.projectType || 'General',
            budget: quoteData.budget || 'N/A',
            description: quoteData.description || '',
            date: quoteData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
            status: quoteData.status || 'Pending'
        };
        
        quotes.push(newQuote);
        StorageUtil.set(this.STORAGE_KEYS.QUOTES, quotes);
        this.logAction('create', 'quote', newId, newQuote);
        return newQuote;
    },

    updateQuote(id, updates) {
        const quotes = this.getQuotes();
        const index = quotes.findIndex(q => q.id === id);
        
        if (index !== -1) {
            quotes[index] = { ...quotes[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.QUOTES, quotes);
            this.logAction('update', 'quote', id, updates);
            return quotes[index];
        }
        return null;
    },

    deleteQuote(id) {
        const quotes = this.getQuotes();
        const filtered = quotes.filter(q => q.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.QUOTES, filtered);
        this.logAction('delete', 'quote', id);
        return true;
    },

    getQuote(id) {
        const quotes = this.getQuotes();
        return quotes.find(q => q.id === id);
    },

    // ============================================
    // TESTIMONIALS CRUD
    // ============================================

    /**
     * Initialize Testimonials
     */
    initTestimonials() {
        const defaultTestimonials = [
            { 
                id: 1, 
                clientName: 'Ahmed Hassan', 
                company: 'ABC Corporation', 
                position: 'CEO',
                testimonialText: 'DB General Construction delivered exceptional quality on our commercial tower project. Their attention to detail and professionalism exceeded our expectations.',
                rating: 5,
                projectRef: 'Addis Ababa Commercial Tower',
                photo: 'Images/cust1.jpg',
                date: 'Nov 15, 2025',
                dateReceived: '2025-11-15',
                featured: true,
                displayHomepage: true
            },
            { 
                id: 2, 
                clientName: 'Dr. Marta Bekele', 
                company: 'Ministry of Health', 
                position: 'Director',
                testimonialText: 'The hospital construction was completed on time and within budget. The team showed great expertise in healthcare facility construction.',
                rating: 5,
                projectRef: 'Sheger General Hospital',
                photo: 'Images/cust1.png',
                date: 'Oct 20, 2025',
                dateReceived: '2025-10-20',
                featured: true,
                displayHomepage: true
            }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.TESTIMONIALS)) {
            StorageUtil.set(this.STORAGE_KEYS.TESTIMONIALS, defaultTestimonials);
        }
    },

    getTestimonials() {
        return StorageUtil.get(this.STORAGE_KEYS.TESTIMONIALS, []);
    },

    addTestimonial(testimonialData) {
        try {
            // Validate required fields
            if (!testimonialData || !testimonialData.clientName) {
                throw new Error('Client name is required');
            }
            if (!testimonialData.testimonialText) {
                throw new Error('Testimonial text is required');
            }

            const testimonials = this.getTestimonials();
            const newId = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.id)) + 1 : 1;
            
            const newTestimonial = {
                id: newId,
                clientName: testimonialData.clientName,
                company: testimonialData.company || '',
                position: testimonialData.position || '',
                testimonialText: testimonialData.testimonialText || '',
                rating: testimonialData.rating || 5,
                projectRef: testimonialData.projectRef || '',
                photo: testimonialData.photo || 'Images/cust1.jpg',
                date: testimonialData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
                dateReceived: testimonialData.dateReceived || new Date().toISOString().split('T')[0],
                featured: testimonialData.featured || false,
                displayHomepage: testimonialData.displayHomepage || false
            };
            
            testimonials.push(newTestimonial);
            StorageUtil.set(this.STORAGE_KEYS.TESTIMONIALS, testimonials);
            this.logAction('create', 'testimonial', newId, newTestimonial);
            return newTestimonial;
        } catch (error) {
            console.error('Error adding testimonial:', error);
            throw error;
        }
    },

    updateTestimonial(id, updates) {
        try {
            if (!id) {
                throw new Error('Testimonial ID is required');
            }

            const testimonials = this.getTestimonials();
            const index = testimonials.findIndex(t => t.id === id);
            
            if (index === -1) {
                throw new Error(`Testimonial with ID ${id} not found`);
            }

            testimonials[index] = { ...testimonials[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.TESTIMONIALS, testimonials);
            this.logAction('update', 'testimonial', id, updates);
            return testimonials[index];
        } catch (error) {
            console.error('Error updating testimonial:', error);
            throw error;
        }
    },

    deleteTestimonial(id) {
        const testimonials = this.getTestimonials();
        const filtered = testimonials.filter(t => t.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.TESTIMONIALS, filtered);
        this.logAction('delete', 'testimonial', id);
        return true;
    },

    getTestimonial(id) {
        const testimonials = this.getTestimonials();
        return testimonials.find(t => t.id === id);
    },

    // ============================================
    // SERVICES CRUD
    // ============================================

    /**
     * Initialize Services
     */
    initServices() {
        const defaultServices = [
            { 
                id: 1, 
                serviceName: 'Commercial Construction', 
                name: 'Commercial Construction',
                shortDescription: 'Professional commercial building construction services for offices, retail spaces, and industrial facilities.',
                description: 'Professional commercial building construction services for offices, retail spaces, and industrial facilities.',
                fullDescription: '<p>We specialize in commercial construction projects of all sizes, from small retail spaces to large office complexes. Our experienced team ensures quality workmanship and timely completion.</p>',
                details: '<p>We specialize in commercial construction projects of all sizes, from small retail spaces to large office complexes. Our experienced team ensures quality workmanship and timely completion.</p>',
                features: ['Project Management', 'Quality Assurance', 'On-time Delivery', 'Budget Control'],
                pricing: 'Contact for Quote',
                price: 'Contact for Quote',
                duration: '3-12 months',
                timeline: '3-12 months',
                icon: 'fa-building',
                displayOrder: 1,
                active: true,
                status: 'Active'
            },
            { 
                id: 2, 
                serviceName: 'Residential Construction', 
                name: 'Residential Construction',
                shortDescription: 'Custom home building and residential development services with attention to detail and quality.',
                description: 'Custom home building and residential development services with attention to detail and quality.',
                fullDescription: '<p>Build your dream home with our residential construction services. We handle everything from design to completion, ensuring your vision becomes reality.</p>',
                details: '<p>Build your dream home with our residential construction services. We handle everything from design to completion, ensuring your vision becomes reality.</p>',
                features: ['Custom Design', 'Quality Materials', 'Skilled Craftsmen', 'Warranty Included'],
                pricing: 'Starting at $200,000',
                price: 'Starting at $200,000',
                duration: '6-18 months',
                timeline: '6-18 months',
                icon: 'fa-home',
                displayOrder: 2,
                active: true,
                status: 'Active'
            },
            { 
                id: 3, 
                serviceName: 'Renovation & Remodeling', 
                name: 'Renovation & Remodeling',
                shortDescription: 'Transform your existing space with our expert renovation and remodeling services.',
                description: 'Transform your existing space with our expert renovation and remodeling services.',
                fullDescription: '<p>Breathe new life into your property with our renovation services. From minor updates to complete overhauls, we deliver exceptional results.</p>',
                details: '<p>Breathe new life into your property with our renovation services. From minor updates to complete overhauls, we deliver exceptional results.</p>',
                features: ['Space Planning', 'Modern Updates', 'Minimal Disruption', 'Value Enhancement'],
                pricing: 'Varies by project',
                price: 'Varies by project',
                duration: '2-6 months',
                timeline: '2-6 months',
                icon: 'fa-tools',
                displayOrder: 3,
                active: true,
                status: 'Active'
            }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.SERVICES)) {
            StorageUtil.set(this.STORAGE_KEYS.SERVICES, defaultServices);
        }
    },

    getServices() {
        return StorageUtil.get(this.STORAGE_KEYS.SERVICES, []);
    },

    addService(serviceData) {
        try {
            // Validate required fields
            if (!serviceData || (!serviceData.serviceName && !serviceData.name)) {
                throw new Error('Service name is required');
            }

            const services = this.getServices();
            const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
            
            const newService = {
                id: newId,
                serviceName: serviceData.serviceName || serviceData.name,
                name: serviceData.serviceName || serviceData.name,
                shortDescription: serviceData.shortDescription || serviceData.description || '',
                description: serviceData.shortDescription || serviceData.description || '',
                fullDescription: serviceData.fullDescription || serviceData.details || '',
                details: serviceData.fullDescription || serviceData.details || '',
                features: serviceData.features || [],
                pricing: serviceData.pricing || serviceData.price || 'Contact for Quote',
                price: serviceData.pricing || serviceData.price || 'Contact for Quote',
                duration: serviceData.duration || serviceData.timeline || 'Varies',
                timeline: serviceData.duration || serviceData.timeline || 'Varies',
                icon: serviceData.icon || 'fa-tools',
                displayOrder: serviceData.displayOrder || 0,
                active: serviceData.active !== undefined ? serviceData.active : true,
                status: serviceData.status || (serviceData.active ? 'Active' : 'Inactive')
            };
            
            services.push(newService);
            StorageUtil.set(this.STORAGE_KEYS.SERVICES, services);
            this.logAction('create', 'service', newId, newService);
            return newService;
        } catch (error) {
            console.error('Error adding service:', error);
            throw error;
        }
    },

    updateService(id, updates) {
        try {
            if (!id) {
                throw new Error('Service ID is required');
            }

            const services = this.getServices();
            const index = services.findIndex(s => s.id === id);
            
            if (index === -1) {
                throw new Error(`Service with ID ${id} not found`);
            }

            // Ensure both name formats are updated
            if (updates.serviceName) {
                updates.name = updates.serviceName;
            } else if (updates.name) {
                updates.serviceName = updates.name;
            }
            
            if (updates.shortDescription) {
                updates.description = updates.shortDescription;
            } else if (updates.description) {
                updates.shortDescription = updates.description;
            }
            
            if (updates.fullDescription) {
                updates.details = updates.fullDescription;
            } else if (updates.details) {
                updates.fullDescription = updates.details;
            }
            
            if (updates.pricing) {
                updates.price = updates.pricing;
            } else if (updates.price) {
                updates.pricing = updates.price;
            }
            
            if (updates.duration) {
                updates.timeline = updates.duration;
            } else if (updates.timeline) {
                updates.duration = updates.timeline;
            }
            
            services[index] = { ...services[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.SERVICES, services);
            this.logAction('update', 'service', id, updates);
            return services[index];
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    deleteService(id) {
        const services = this.getServices();
        const filtered = services.filter(s => s.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.SERVICES, filtered);
        this.logAction('delete', 'service', id);
        return true;
    },

    getService(id) {
        const services = this.getServices();
        return services.find(s => s.id === id);
    },

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Log admin action for audit trail
     */
    logAction(action, targetType, targetId, details = {}) {
        if (typeof AuditLog !== 'undefined') {
            AuditLog.logAction(action, targetType, targetId, details);
        }
    },

    /**
     * Export data to JSON
     */
    exportToJSON(dataType) {
        let data;
        switch(dataType) {
            case 'projects': data = this.getProjects(); break;
            case 'clients': data = this.getClients(); break;
            case 'team': data = this.getTeamMembers(); break;
            case 'inquiries': data = this.getInquiries(); break;
            case 'blog': data = this.getBlogPosts(); break;
            case 'invoices': data = this.getInvoices(); break;
            case 'schedule': data = this.getScheduleEvents(); break;
            case 'quotes': data = this.getQuotes(); break;
            case 'testimonials': data = this.getTestimonials(); break;
            case 'services': data = this.getServices(); break;
            default: return null;
        }
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Clear all data (use with caution)
     * Note: Legitimate use of confirm() for destructive action
     * This is a critical operation that requires explicit user confirmation
     */
    clearAllData() {
        // Legitimate use of confirm() - warns user about destructive action
        if (confirm('Are you sure you want to clear ALL admin data? This cannot be undone!')) {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.init(); // Reinitialize with defaults
            return true;
        }
        return false;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminCRUD;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AdminCRUD = AdminCRUD;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-dashboard')) {
            AdminCRUD.init();
        }
    });
}
