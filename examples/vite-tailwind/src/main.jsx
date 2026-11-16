import { createRoot } from 'react-dom/client';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <div className="bg-brand-default p-4 text-text-primary rounded-md">
    Tailwind v4: 디자인 시스템의 임시 토큰으로 만든 영역입니다.
  </div>,
);
