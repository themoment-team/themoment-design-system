import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import '@themoment-team/design-system-react/styles.css';
import { vars } from '@themoment-team/design-system-react/tokens';

const TokenPanel = styled.div`
  background-color: ${vars.color.brand.default};
  color: ${vars.color.text.primary};
  border-radius: ${vars.radius.md};
  padding: ${vars.spacing['4']};
`;

createRoot(document.getElementById('root')).render(
  <TokenPanel>styled-components: Tailwind 없이 같은 임시 토큰을 사용합니다.</TokenPanel>,
);
