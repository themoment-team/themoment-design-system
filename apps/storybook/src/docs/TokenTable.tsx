import { values } from '@themoment-team/design-system-react/tokens';

type TokenRow = { path: string; value: unknown };

function flatten(value: unknown, path: string[] = []): TokenRow[] {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    if (!('colorSpace' in object) && !('unit' in object)) {
      return Object.entries(object).flatMap(([key, child]) => flatten(child, [...path, key]));
    }
  }
  return [{ path: path.join('.'), value }];
}

export function TokenTable({ categories }: { categories: string[] }) {
  const rows = flatten(values).filter(({ path }) =>
    categories.some((category) => path === category || path.startsWith(`${category}.`)),
  );
  return (
    <>
      <p>현재 값은 파이프라인 검증용 placeholder이며 확정 디자인이 아닙니다.</p>
      <p>이 표는 패키지의 values에서 생성됩니다. 토큰을 교체한 뒤 다시 빌드하면 자동 갱신됩니다.</p>
      {rows.length ? (
        <table>
          <thead>
            <tr>
              <th>토큰 경로</th>
              <th>원본 값</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ path, value }) => (
              <tr key={path}>
                <td>
                  <code>{path}</code>
                </td>
                <td>
                  <code>{JSON.stringify(value)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>아직 이 분류의 토큰이 없습니다.</p>
      )}
    </>
  );
}
