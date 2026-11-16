import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { values } from '@themoment-team/design-system-react/tokens';
import plainCss from './plain.css?inline';
import tailwindFirst from './tailwind-first.css?inline';
import packageFirst from './package-first.css?inline';

type FixtureProps = { css: string; utility?: boolean; override?: boolean };

function Fixture({ css, utility = false, override = false }: FixtureProps) {
  return (
    <iframe
      title="CSS 계약 격리 문서"
      srcDoc={`<!doctype html><html lang="ko"><head><style>${css}</style>${override ? '<style>:root { --tm-color-brand-default: rgb(0, 128, 0); }</style>' : ''}</head><body><div data-testid="brand" class="${utility ? 'bg-brand-default' : 'fixture'}">브랜드 토큰 검증</div></body></html>`}
      style={{ width: '100%', height: 120, border: 0 }}
    />
  );
}

const meta = {
  title: 'CSS contract/브랜드 토큰',
  component: Fixture,
  parameters: { layout: 'padded' },
  play: async ({ canvasElement, args }) => {
    const frame = canvasElement.querySelector('iframe');
    const expected = args.override
      ? 'rgb(0, 128, 0)'
      : `rgb(${values.color.brand.default.components.map((part) => Math.round(part * 255)).join(', ')})`;
    await waitFor(() => {
      const element = frame?.contentDocument?.querySelector('[data-testid="brand"]');
      expect(element).toBeTruthy();
      expect(frame?.contentWindow?.getComputedStyle(element!).backgroundColor).toBe(expected);
    });
  },
} satisfies Meta<typeof Fixture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PlainCss: Story = { args: { css: plainCss } };
export const TailwindFirst: Story = { args: { css: tailwindFirst, utility: true } };
export const PackageFirst: Story = { args: { css: packageFirst, utility: true } };
export const OverrideTailwindFirst: Story = {
  args: { css: tailwindFirst, utility: true, override: true },
};
export const OverridePackageFirst: Story = {
  args: { css: packageFirst, utility: true, override: true },
};
