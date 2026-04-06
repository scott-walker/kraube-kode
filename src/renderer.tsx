import { createRoot } from 'react-dom/client';
import App from './App';
import './design/tokens.css';
import './design/themes/dark.css';
import './design/themes/light.css';
import './design/base.css';
import './design/syntax.css';
import './design/utilities.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
