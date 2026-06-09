
// Временно используем тестовые данные вместо реального API
const USE_MOCK_DATA = true;

// Тестовые данные
let mockTickets = [
  {
    id: '1',
    name: 'Поменять краску в принтере, ком. 404',
    description: 'Принтер HP LJ 1210, картриджи на складе',
    status: false,
    created: Date.now() - 86400000,
  },
  {
    id: '2',
    name: 'Переустановить Windows, ПК-Hall24',
    description: '',
    status: false,
    created: Date.now() - 43200000,
  },
  {
    id: '3',
    name: 'Установить обновление KB-XXX',
    description: 'Вышло критическое обновление для Windows, нужно поставить обновления в следующем приоритете:\n1. Сервера (не забыть сделать бэкап!)\n2. Рабочие станции',
    status: false,
    created: Date.now() - 21600000,
  },
];

export default class TicketService {
  static async request(method, id = null, data = null) {
    if (!USE_MOCK_DATA) {
      // Реальный API (закомментировано)
      let url = `http://localhost:7070/?method=${method}`;
      if (id) {
        url += `&id=${id}`;
      }
      const options = {
        method: data ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      if (data) {
        options.body = JSON.stringify(data);
      }
      const response = await fetch(url, options);
      return response.json();
    }
    
    // Мок-данные
    await new Promise(resolve => setTimeout(resolve, 300));
    
    switch (method) {
      case 'allTickets':
        return mockTickets.map(({ id, name, status, created }) => ({
          id, name, status, created
        }));
      
      case 'ticketById':
        return mockTickets.find(t => t.id === id);
      
      case 'createTicket':
        const newTicket = {
          id: Date.now().toString(),
          name: data.name,
          description: data.description || '',
          status: false,
          created: Date.now(),
        };
        mockTickets.push(newTicket);
        return newTicket;
      
      case 'updateById':
        const index = mockTickets.findIndex(t => t.id === id);
        if (index !== -1) {
          mockTickets[index] = { ...mockTickets[index], ...data };
        }
        return mockTickets[index];
      
      case 'deleteById':
        mockTickets = mockTickets.filter(t => t.id !== id);
        return { success: true };
      
      default:
        return null;
    }
  }

  static async getAllTickets() {
    return this.request('allTickets');
  }

  static async getTicketById(id) {
    return this.request('ticketById', id);
  }

  static async createTicket(data) {
    return this.request('createTicket', null, data);
  }

  static async updateTicket(id, data) {
    return this.request('updateById', id, data);
  }

  static async deleteTicket(id) {
    return this.request('deleteById', id);
  }
}
