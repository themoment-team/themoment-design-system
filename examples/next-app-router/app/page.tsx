import { vars } from '@themoment-team/design-system-react/tokens';

// 'use client' 없이 서버에서 /tokens 진입점을 읽습니다.
export default function Home() {
  return (
    <div
      style={{
        backgroundColor: vars.color.brand.default,
        color: vars.color.text.primary,
        borderRadius: vars.radius.md,
        padding: vars.spacing['4'],
      }}
    >
      App Router 서버 컴포넌트에서도 임시 토큰을 사용할 수 있습니다.
    </div>
  );
}
