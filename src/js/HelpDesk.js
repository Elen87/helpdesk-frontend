
import TicketService from './TicketService';
import Modal from './Modal';

export default class HelpDesk {
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('Container must be HTML element');
    }
    this.container = container;
    this.ticketsList = null;
    this.currentDetailId = null;
  }

  init() {
    this.renderHeader();
    this.renderTicketsList();
    this.loadTickets();
    this.addEventListeners();
  }

  renderHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
      <h1>HelpDesk</h1>
      <button class="add-ticket-btn">➕ Добавить тикет</button>
    `;
    this.container.appendChild(header);
    this.addTicketBtn = header.querySelector('.add-ticket-btn');
  }

  renderTicketsList() {
    this.ticketsList = document.createElement('div');
    this.ticketsList.className = 'tickets-list';
    this.container.appendChild(this.ticketsList);
  }

  addEventListeners() {
    this.addTicketBtn.addEventListener('click', () => this.showAddModal());
    this.ticketsList.addEventListener('click', this.handleTicketClick.bind(this));
  }

  async loadTickets() {
    this.ticketsList.innerHTML = '<div class="loading">Загрузка...</div>';
    try {
      const tickets = await TicketService.getAllTickets();
      this.renderTickets(tickets);
    } catch (error) {
      this.ticketsList.innerHTML = '<div class="error">❌ Ошибка загрузки тикетов</div>';
    }
  }

  renderTickets(tickets) {
    this.ticketsList.innerHTML = '';
    if (!tickets || tickets.length === 0) {
      this.ticketsList.innerHTML = '<div class="loading">Нет тикетов</div>';
      return;
    }
    
    tickets.forEach(ticket => {
      const ticketElement = this.createTicketElement(ticket);
      this.ticketsList.appendChild(ticketElement);
    });
  }

  createTicketElement(ticket) {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'ticket-item';
    ticketDiv.dataset.id = ticket.id;
    
    const date = new Date(ticket.created);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    ticketDiv.innerHTML = `
      <div class="ticket-status">
        <div class="status-checkbox ${ticket.status ? 'completed' : ''}"></div>
      </div>
      <div class="ticket-info">
        <div class="ticket-name ${ticket.status ? 'completed' : ''}">${this.escapeHtml(ticket.name)}</div>
        <div class="ticket-created">${formattedDate}</div>
      </div>
      <div class="ticket-actions">
        <button class="edit-btn" title="Редактировать">✎</button>
        <button class="delete-btn" title="Удалить">✕</button>
      </div>
    `;
    
    return ticketDiv;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  async handleTicketClick(e) {
    const ticketItem = e.target.closest('.ticket-item');
    if (!ticketItem) return;
    const ticketId = ticketItem.dataset.id;
    
    if (e.target.classList.contains('edit-btn')) {
      e.stopPropagation();
      this.showEditModal(ticketId);
      return;
    }
    
    if (e.target.classList.contains('delete-btn')) {
      e.stopPropagation();
      this.showDeleteModal(ticketId);
      return;
    }
    
    if (e.target.classList.contains('status-checkbox')) {
      e.stopPropagation();
      const isCompleted = e.target.classList.contains('completed');
      await this.updateTicketStatus(ticketId, !isCompleted);
      return;
    }
    
    const existingDetail = ticketItem.nextElementSibling;
    if (existingDetail && existingDetail.classList.contains('ticket-detail')) {
      existingDetail.remove();
      this.currentDetailId = null;
    } else {
      if (this.currentDetailId === ticketId) {
        const detail = ticketItem.nextElementSibling;
        if (detail && detail.classList.contains('ticket-detail')) {
          detail.remove();
          this.currentDetailId = null;
          return;
        }
      }
      await this.showTicketDetail(ticketId, ticketItem);
    }
  }

  async updateTicketStatus(ticketId, status) {
    try {
      const ticket = await TicketService.getTicketById(ticketId);
      await TicketService.updateTicket(ticketId, { ...ticket, status });
      await this.loadTickets();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async showTicketDetail(ticketId, ticketItem) {
    try {
      const ticket = await TicketService.getTicketById(ticketId);
      const detailDiv = document.createElement('div');
      detailDiv.className = 'ticket-detail';
      detailDiv.innerHTML = `<div class="ticket-detail-description">${this.escapeHtml(ticket.description || 'Нет описания').replace(/\n/g, '<br>')}</div>`;
      ticketItem.insertAdjacentElement('afterend', detailDiv);
      this.currentDetailId = ticketId;
    } catch (error) {
      console.error('Error loading ticket detail:', error);
    }
  }

  showAddModal() {
    const modal = new Modal({
      title: 'Добавить тикет',
      fields: [
        { name: 'name', label: 'Краткое описание', type: 'text', required: true },
        { name: 'description', label: 'Подробное описание', type: 'textarea' }
      ],
      onSubmit: async (data) => {
        await TicketService.createTicket({
          name: data.name,
          description: data.description || '',
          status: false
        });
        await this.loadTickets();
      },
      onCancel: () => {}
    });
    modal.show();
  }

  async showEditModal(ticketId) {
    try {
      const ticket = await TicketService.getTicketById(ticketId);
      const modal = new Modal({
        title: 'Изменить тикет',
        fields: [
          { name: 'name', label: 'Краткое описание', type: 'text', value: ticket.name, required: true },
          { name: 'description', label: 'Подробное описание', type: 'textarea', value: ticket.description || '' }
        ],
        onSubmit: async (data) => {
          await TicketService.updateTicket(ticketId, {
            ...ticket,
            name: data.name,
            description: data.description
          });
          await this.loadTickets();
        },
        onCancel: () => {}
      });
      modal.show();
    } catch (error) {
      console.error('Error loading ticket for edit:', error);
    }
  }

  showDeleteModal(ticketId) {
    const modal = new Modal({
      title: 'Удалить тикет',
      isDelete: true,
      onSubmit: async () => {
        await TicketService.deleteTicket(ticketId);
        await this.loadTickets();
      },
      onCancel: () => {}
    });
    modal.show();
  }
}
