// Todo class to manage todo items
class Todo {
    constructor(text, datetime, status = 'Processing', personalInfo = {}) {
        this.id = Date.now();
        this.text = text;
        this.datetime = datetime;
        this.status = status;
        this.completed = false;
        this.personalInfo = personalInfo;
        this.selected = false;
    }
}

// TodoManager class to handle CRUD operations
class TodoManager {
    constructor() {
        try {
            this.todos = JSON.parse(localStorage.getItem('todos')) || [];
            this.form = document.getElementById('todoForm');
            this.input = document.getElementById('todoInput');
            this.datetimeInput = document.getElementById('todoDateTime');
            this.todoList = document.getElementById('todoList');
            this.statusGroup = document.getElementById('statusGroup');
            this.selectAllBtn = document.getElementById('selectAllBtn');
            this.printSelectedBtn = document.getElementById('printSelectedBtn');

            if (!this.form || !this.input || !this.datetimeInput || !this.todoList || !this.statusGroup || 
                !this.selectAllBtn || !this.printSelectedBtn) {
                throw new Error('Required DOM elements not found');
            }
            
            this.initializeEventListeners();
            this.setCurrentDateTime();
            this.renderTodos();
        } catch (error) {
            console.error('Initialization error:', error);
            alert('Error initializing the application. Please check the console for details.');
        }
    }

    setCurrentDateTime() {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            this.datetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
            console.error('Error setting date/time:', error);
        }
    }

    initializeEventListeners() {
        try {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
            this.printSelectedBtn.addEventListener('click', () => this.printSelected());
            document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadPdf());
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    handleSubmit(e) {
        try {
            e.preventDefault();
            
            // Get personal information
            const personalInfo = {
                name: document.getElementById('nameInput').value.trim(),
                citizenship: document.getElementById('citizenshipInput').value.trim(),
                phone: document.getElementById('phoneInput').value.trim(),
                address: document.getElementById('addressInput').value.trim()
            };

            // Get task information
            const text = this.input.value.trim();
            const datetime = this.datetimeInput.value;
            const status = this.statusGroup.querySelector('input[name="status"]:checked').value;

            // Validate all fields
            if (!personalInfo.name || !personalInfo.citizenship || !personalInfo.phone || !personalInfo.address) {
                alert('Please fill in all personal information fields.');
                return;
            }

            if (!text) {
                alert('Please enter a task.');
                return;
            }

            if (!datetime) {
                alert('Please select a date and time.');
                return;
            }

            // Add the todo if all validations pass
            this.addTodo(text, datetime, status, personalInfo);
            this.form.reset();
            this.setCurrentDateTime();
        } catch (error) {
            console.error('Error handling form submission:', error);
            alert('An error occurred while submitting the form. Please try again.');
        }
    }

    addTodo(text, datetime, status, personalInfo) {
        try {
            const todo = new Todo(text, datetime, status, personalInfo);
            this.todos.push(todo);
            this.saveTodos();
            this.renderTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
            alert('An error occurred while adding the task. Please try again.');
        }
    }

    deleteTodo(id) {
        try {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
            alert('An error occurred while deleting the task. Please try again.');
        }
    }

    toggleTodo(id) {
        try {
            this.todos = this.todos.map(todo => {
                if (todo.id === id) {
                    const newStatus = todo.status === 'Completed' ? 'Processing' : 'Completed';
                    return { ...todo, status: newStatus, completed: !todo.completed };
                }
                return todo;
            });
            this.saveTodos();
            this.renderTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
            alert('An error occurred while updating the task status. Please try again.');
        }
    }

    editTodo(id, newText) {
        this.todos = this.todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text: newText };
            }
            return todo;
        });
        this.saveTodos();
        this.renderTodos();
    }

    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving todos:', error);
            alert('An error occurred while saving your tasks. Please try again.');
        }
    }

    formatDateTime(datetime) {
        try {
            const date = new Date(datetime);
            return date.toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return datetime;
        }
    }

    toggleSelectAll() {
        try {
            const allSelected = this.todos.every(todo => todo.selected);
            this.todos.forEach(todo => todo.selected = !allSelected);
            this.renderTodos();
            this.updateSelectAllButton();
        } catch (error) {
            console.error('Error toggling select all:', error);
        }
    }

    updateSelectAllButton() {
        const allSelected = this.todos.every(todo => todo.selected);
        this.selectAllBtn.innerHTML = `<i class="fas ${allSelected ? 'fa-times-square' : 'fa-check-square'} me-1"></i>${allSelected ? 'Deselect All' : 'Select All'}`;
    }

    toggleSelect(id) {
        try {
            const todo = this.todos.find(todo => todo.id === id);
            if (todo) {
                todo.selected = !todo.selected;
                this.renderTodos();
                this.updateSelectAllButton();
            }
        } catch (error) {
            console.error('Error toggling selection:', error);
        }
    }

    printSelected() {
        try {
            const selectedTodos = this.todos.filter(todo => todo.selected);
            if (selectedTodos.length === 0) {
                alert('Please select at least one task to print.');
                return;
            }

            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups for this website to print.');
                return;
            }

            // Create the print content
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Todo List Report</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            color: #333;
                        }
                        .print-header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #2193b0;
                        }
                        .print-header h2 {
                            color: #2193b0;
                            margin-bottom: 10px;
                        }
                        .print-item {
                            margin-bottom: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            page-break-inside: avoid;
                        }
                        .print-item h3 {
                            color: #2193b0;
                            margin-bottom: 15px;
                            border-bottom: 1px solid #eee;
                            padding-bottom: 10px;
                        }
                        .info-row {
                            margin-bottom: 8px;
                            line-height: 1.4;
                        }
                        .status {
                            display: inline-block;
                            padding: 5px 10px;
                            border-radius: 4px;
                            margin-top: 10px;
                            font-weight: bold;
                        }
                        .status.Processing {
                            background-color: #ffc107;
                            color: #000;
                        }
                        .status.Incompleted {
                            background-color: #dc3545;
                            color: #fff;
                        }
                        .status.Completed {
                            background-color: #28a745;
                            color: #fff;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 20px;
                            }
                            .print-item {
                                border: 1px solid #ccc;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h2>Todo List Report</h2>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                    ${selectedTodos.map(todo => `
                        <div class="print-item">
                            <h3>${todo.text}</h3>
                            <div class="info-row">
                                <strong>Name:</strong> ${todo.personalInfo.name}
                            </div>
                            <div class="info-row">
                                <strong>Citizenship No:</strong> ${todo.personalInfo.citizenship}
                            </div>
                            <div class="info-row">
                                <strong>Phone:</strong> ${todo.personalInfo.phone}
                            </div>
                            <div class="info-row">
                                <strong>Address:</strong> ${todo.personalInfo.address}
                            </div>
                            <div class="info-row">
                                <strong>Date & Time:</strong> ${this.formatDateTime(todo.datetime)}
                            </div>
                            <div class="status ${todo.status}">${todo.status}</div>
                        </div>
                    `).join('')}
                    <script>
                        // Automatically trigger print when the window loads
                        window.onload = function() {
                            window.print();
                            // Close the window after printing (or if print is cancelled)
                            window.onafterprint = function() {
                                window.close();
                            };
                        };
                    </script>
                </body>
                </html>
            `;

            // Write the content to the new window
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();

        } catch (error) {
            console.error('Error printing:', error);
            alert('An error occurred while printing. Please try again.');
        }
    }

    downloadPdf() {
        try {
            const selectedTodos = this.todos.filter(todo => todo.selected);
            if (selectedTodos.length === 0) {
                alert('Please select at least one task to download as PDF');
                return;
            }

            // Create a container for the PDF content
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'pdf-container';
            pdfContainer.style.padding = '20px';
            pdfContainer.style.fontFamily = 'Arial, sans-serif';

            // Add header
            const header = document.createElement('div');
            header.innerHTML = `
                <h2 style="text-align: center; margin-bottom: 20px;">Daily Todo Report</h2>
                <div style="margin-bottom: 20px;">
                    <p><strong>Name:</strong> ${selectedTodos[0].personalInfo.name}</p>
                    <p><strong>Citizenship No.:</strong> ${selectedTodos[0].personalInfo.citizenship}</p>
                    <p><strong>Phone No.:</strong> ${selectedTodos[0].personalInfo.phone}</p>
                    <p><strong>Address:</strong> ${selectedTodos[0].personalInfo.address}</p>
                </div>
                <hr style="margin: 20px 0;">
            `;
            pdfContainer.appendChild(header);

            // Add selected tasks
            const tasksList = document.createElement('div');
            tasksList.innerHTML = '<h3 style="margin-bottom: 15px;">Selected Tasks:</h3>';
            
            selectedTodos.forEach((todo, index) => {
                tasksList.innerHTML += `
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <p style="margin: 0;"><strong>Task ${index + 1}:</strong> ${todo.text}</p>
                        <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${this.formatDateTime(todo.datetime)}</p>
                        <p style="margin: 0;"><strong>Status:</strong> ${todo.status}</p>
                    </div>
                `;
            });
            pdfContainer.appendChild(tasksList);

            // Add footer with current date
            const footer = document.createElement('div');
            footer.innerHTML = `
                <hr style="margin: 20px 0;">
                <p style="text-align: right; margin: 0;">Generated on: ${new Date().toLocaleString()}</p>
            `;
            pdfContainer.appendChild(footer);

            // Configure PDF options
            const opt = {
                margin: 1,
                filename: 'todo_report.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // Generate and download PDF
            html2pdf().set(opt).from(pdfContainer).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred while generating the PDF. Please try again.');
        }
    }

    createTodoElement(todo) {
        try {
            const div = document.createElement('div');
            div.className = `list-group-item todo-item ${todo.completed ? 'completed' : ''} ${todo.selected ? 'selected' : ''}`;
            
            const statusClass = {
                'Processing': 'warning',
                'Incompleted': 'danger',
                'Completed': 'success'
            }[todo.status] || 'warning';
            
            const content = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center flex-grow-1">
                        <input type="checkbox" class="form-check-input select-checkbox" ${todo.selected ? 'checked' : ''} onclick="todoManager.toggleSelect(${todo.id})">
                        <input type="checkbox" class="form-check-input me-2" ${todo.completed ? 'checked' : ''}>
                        <div>
                            <h5 class="mb-1 ${todo.completed ? 'text-decoration-line-through' : ''}">${todo.text}</h5>
                            <div class="d-flex flex-column">
                                <small class="datetime mb-1">${this.formatDateTime(todo.datetime)}</small>
                                <div class="personal-info small text-muted">
                                    <div><i class="fas fa-user me-1"></i>${todo.personalInfo.name}</div>
                                    <div><i class="fas fa-phone me-1"></i>${todo.personalInfo.phone}</div>
                                    <div><i class="fas fa-map-marker-alt me-1"></i>${todo.personalInfo.address}</div>
                                </div>
                                <span class="badge bg-${statusClass} mt-1">${todo.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-success btn-sm" onclick="todoManager.toggleTodo(${todo.id})">
                            <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="todoManager.deleteTodo(${todo.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            div.innerHTML = content;
            return div;
        } catch (error) {
            console.error('Error creating todo element:', error);
            return document.createElement('div');
        }
    }

    renderTodos() {
        try {
            this.todoList.innerHTML = '';
            this.todos.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            
            this.todos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        } catch (error) {
            console.error('Error rendering todos:', error);
            alert('An error occurred while displaying tasks. Please refresh the page.');
        }
    }
}

// Initialize TodoManager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.todoManager = new TodoManager();
    } catch (error) {
        console.error('Error initializing TodoManager:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
}); 