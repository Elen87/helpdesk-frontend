export default class Modal {
  constructor(options = {}) {
    this.title = options.title || 'Окно';
    this.onSubmit = options.onSubmit || (() => {});
    this.onCancel = options.onCancel || (() => {});
    this.fields = options.fields || [];
    this.isDelete = options.isDelete || false;
    this.element = null;
  }

  show() {
    this.remove();
    this.element = this.createModal();
    document.body.appendChild(this.element);
    this.element.addEventListener('click', this.handleOutsideClick.bind(this));
    
    if (!this.isDelete) {
      const firstInput = this.element.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  hide() {
    this.remove();
  }

  remove() {
    if (this.element) {
      this.element.removeEventListener('click', this.handleOutsideClick);
      this.element.remove();
      this.element = null;
    }
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = `modal ${this.isDelete ? 'delete-modal' : ''}`;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'modal-header';
    const title = document.createElement('h2');
    title.textContent = this.title;
    header.appendChild(title);
    
    // Тело
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    if (this.isDelete) {
      const message = document.createElement('p');
      message.textContent = 'Вы уверены, что хотите удалить этот тикет? Это действие необратимо.';
      body.appendChild(message);
    } else {
      this.fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        label.htmlFor = field.name;
        
        let input;
        if (field.type === 'textarea') {
          input = document.createElement('textarea');
          input.rows = 4;
        } else {
          input = document.createElement('input');
          input.type = field.type || 'text';
        }
        
        input.id = field.name;
        input.name = field.name;
        input.value = field.value || '';
        input.placeholder = field.placeholder || '';
        
        if (field.required) {
          input.required = true;
        }
        
        group.appendChild(label);
        group.appendChild(input);
        body.appendChild(group);
      });
    }
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'submit-btn';
    submitBtn.textContent = this.isDelete ? 'Удалить' : 'Сохранить';
    submitBtn.addEventListener('click', () => {
      if (this.isDelete) {
        this.onSubmit();
      } else {
        const formData = {};
        this.fields.forEach(field => {
          const input = this.element.querySelector(`#${field.name}`);
          if (input) {
            formData[field.name] = input.value;
          }
        });
        this.onSubmit(formData);
      }
      this.hide();
    });
    
    footer.appendChild(cancelBtn);
    footer.appendChild(submitBtn);
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    return modal;
  }

  handleOutsideClick(e) {
    if (e.target === this.element) {
      this.onCancel();
      this.hide();
    }
  }
}
