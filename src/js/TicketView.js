export default class TicketView {
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static createTicketElement(ticket) {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'ticket-item';
    ticketDiv.dataset.id = ticket.id;

    const statusDiv = document.createElement('div');
    statusDiv.className = 'ticket-status';
    
    const statusCheckbox = document.createElement('div');
    statusCheckbox.className = `status-checkbox ${ticket.status ? 'completed' : ''}`;
    statusDiv.appendChild(statusCheckbox);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'ticket-info';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = `ticket-name ${ticket.status ? 'completed' : ''}`;
    nameDiv.textContent = ticket.name;
    
    const createdDiv = document.createElement('div');
    createdDiv.className = 'ticket-created';
    createdDiv.textContent = this.formatDate(ticket.created);
    
    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(createdDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'ticket-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Редактировать';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Удалить';
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    ticketDiv.appendChild(statusDiv);
    ticketDiv.appendChild(infoDiv);
    ticketDiv.appendChild(actionsDiv);

    return ticketDiv;
  }

  static createDetailElement(description) {
    const detailDiv = document.createElement('div');
    detailDiv.className = 'ticket-detail';
    
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'ticket-detail-description';
    descriptionDiv.textContent = description || 'Нет описания';
    
    detailDiv.appendChild(descriptionDiv);
    return detailDiv;
  }

  static showLoading(container) {
    container.innerHTML = '<div class="loading">Загрузка...</div>';
  }

  static showError(container, message) {
    container.innerHTML = `<div class="error">❌ ${message}</div>`;
  }
}
