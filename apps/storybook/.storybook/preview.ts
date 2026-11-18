import type { Preview } from '@storybook/react-vite';
const preview: Preview = {
  parameters: {
    options: { storySort: { order: ['Introduction', 'Tokens', 'CSS contract'] } },
  },
};
export default preview;
