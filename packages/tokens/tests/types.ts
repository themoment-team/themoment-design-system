import { values, vars } from '@themoment-team/design-system-tokens';

const brandReference: 'var(--tm-color-brand-default)' = vars.color.brand.default;
const brandColorSpace: 'srgb' = values.color.brand.default.colorSpace;
const radiusUnit: 'px' = values.radius.md.unit;
const spacingValue: 16 = values.spacing['4'].value;

void [brandReference, brandColorSpace, radiusUnit, spacingValue];
