
import './css/style.css';
import HelpDesk from './js/HelpDesk';

// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (!root) {
        console.error('Element with id "root" not found!');
        return;
    }
    const app = new HelpDesk(root);
    app.init();
})