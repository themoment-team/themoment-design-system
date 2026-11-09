# themoment Design System — Figma 검토 요청

- 대상 파일: [themoment-Design-System](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System)
- 검토일: 2026-11-09
- 목적: 코드 구현(토큰 → 컴포넌트)을 시작하기 전에 Figma와 코드의 기준 맞추기
- 확인 방법: Figma Dev Mode MCP로 16개 페이지의 레이어 트리, 컴포넌트 variant, 연결된 변수 값을 조회하고 페이지 스크린샷 확인

우선순위
- **P1**: 토큰 구조에 영향이 있어서 구현을 시작하기 전에 정리가 필요합니다.
- **P2**: 문서와 실제 값이 다르거나 이름이 잘못된 경우입니다. 구현과 병행할 수 있습니다.
- **확인**: 스크린샷만 보고 판단한 내용이라 의도를 확인하고 싶은 항목입니다.

---

## P1. 토큰 구조

### 1-1. Color Palette 페이지가 변수와 연결되어 있지 않음

- 위치: [Color Palette](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=43-1091)
- 현상: 페이지 전체에 연결된 변수가 0개입니다. 스와치에 hex 값이 직접 들어가 있습니다.
- 영향: 변수 값을 바꿔도 팔레트 문서가 따라 바뀌지 않아서 문서와 실제 값이 어긋날 수 있습니다.
- 요청: 스와치를 `1. Primitives` / `2. Semantic` 변수로 연결해 주세요. 코드는 변수를 기준으로 구현합니다.

### 1-2. 파일에 정의되지 않은 외부 변수 사용

| 페이지 | 외부 변수 | 대체 후보 (제안) |
|---|---|---|
| [Dialog](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=43-148) | `gray/700` (#374151) | `Text/Primary` 또는 새 토큰 |
| Dialog | `gray/200` (#E5E7EB) | `Grey/150` (#e5e7eb, 값 동일) |
| Dialog | `kakao/logo` (#000000) | 카카오 브랜드 고정값이면 유지해도 됨 |
| [Drop Down Field](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=72-251) | `slate/500` (#64748B) | `Text/Secondary` 등 Semantic 토큰 |
| [Other Asset](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=43-147) | `slate/300` (#CBD5E1) | `Border/Default` (#cbd5e1, 값 동일) |
| [Terms of Service](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=43-1778) | `detail - regular` (12/18) | `Body/XSmall` (12, line-height 1.5 = 18) |

- 원인 추정: 다른 파일에서 컴포넌트를 복사하면서 변수가 함께 따라온 것으로 보입니다.
- 요청: 우리 파일의 변수로 바꿔 주세요. 대체 후보는 제안이고, 의미에 맞는 토큰은 디자이너분 판단에 맡깁니다.

### 1-3. Search Action이 Primitive 변수를 직접 참조

- 위치: [Search Action](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=72-99)
- 현상: `Brand/Primary`, `Brand/Accent`, `Grey/150`, `Grey/300`, `Grey/400`, `Neutral/Dark`를 직접 사용합니다.
- 영향: 다른 컴포넌트는 Semantic 변수를 쓰기 때문에, 테마나 색을 바꿀 때 이 컴포넌트만 따로 수정해야 합니다.
- 요청: Semantic 변수로 바꿔 주세요. 예: `Brand/Default`, `Border/Default`, `Text/Primary`, `Text/Placeholder`.
- 참고: [Text Field](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=43-141)의 `Slate/Accent`(Focused 테두리로 추정)와 [Text Form Template](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=43-142)의 `Brand/Accent`도 Primitive를 직접 참조하고 있습니다. 같이 정리하면 좋겠습니다.

---

## P2. 문서 불일치 / 이름

### 2-1. Typography 문서와 텍스트 스타일 불일치

- 위치: [Typography](https://www.figma.com/design/nKZ0QCNMIEGDMyPR4GjRR5/themoment-Design-System?node-id=77-12)
- `Label/Large`: 문서에는 SemiBold 16으로 적혀 있지만, 실제 스타일은 **Regular 16** (line-height 1.4)입니다. 어느 쪽이 맞는지 알려 주세요.
- `Body/2XSmall` (Regular 11, line-height 1.5): 스타일은 있는데 Typography 페이지에는 없습니다. 쓰는 스타일이면 문서에 추가하고, 안 쓰면 삭제해 주세요.

### 2-2. Dialog 속성 설명과 실제 속성 불일치

- 설명에 적힌 내용: `State: Alert | Confirm | SerchAlert | LoginAlert`
- 실제 속성: `HasSearch` (True/False) + `Type` (Alert / Confirm / Search / Login)
- 요청: 설명을 실제 속성에 맞춰 주세요. `Serch` 오타도 같이 고쳐 주세요.

### 2-3. 속성 이름과 오타

| 위치 | 현재 | 제안 |
|---|---|---|
| Search Action 속성 이름 | `속성 1` | `State` |
| Search Action 속성 값 | `default`, `hover`, … (소문자) | `Default`, `Hover`, … (다른 컴포넌트와 통일) |
| Terms of Service | `Ture` | `True` |
| Terms of Service 속성 | `expanded` | `Expanded` (다른 컴포넌트와 통일, 선택) |

### 2-4. 복사해 온 이름이 그대로 남은 프레임

| 페이지 | 현재 프레임 이름 | 제안 |
|---|---|---|
| Terms of Service | `Button Master Component` | `Terms of Service Master Component` |
| Search Action | `Text Field Master Component` | `Search Action Master Component` |

### 2-5. 중복 컴포넌트

- 위치: Internal Only Canvas의 `text field` 프레임 (`variants=Default` … `variants=Error`, 7개)
- 현상: Text Field 페이지의 `State=Default` … `State=Error`와 구성이 같아 보입니다.
- 요청: 중복이라면 삭제해 주세요. 인스턴스가 이쪽을 참조하고 있다면 Text Field 페이지 쪽으로 바꿔 주세요.

---

## 확인 요청 (스크린샷 기준 추정)

제가 잘못 봤을 수 있습니다. 의도하신 게 맞다면 그대로 두셔도 됩니다.

1. **Terms of Service**: True 라벨 행은 접힌 모양, False 라벨 행은 펼친 모양으로 보입니다. 라벨이 반대로 붙은 걸까요?
2. **Drop Down Field**: `Selected` 상태에서는 메뉴가 열려 있고, `MenuHover` 상태에서는 닫혀 있는 것처럼 보입니다. 의도하신 상태 정의가 맞을까요?
3. **Search Action**: Text Field에는 `Error` 상태가 있는데 Search Action에는 없습니다. 필요 없는 게 맞을까요?
4. **Button Primary · Weak**: Hover와 Pressed가 화면에서 거의 구분되지 않습니다. 차이를 조금 더 줄 수 있을까요?
5. **Button L / XL 너비**: 380px / 500px로 고정되어 있습니다. 코드에서는 고정 너비 대신 "부모 너비 채우기(full-width)" 옵션으로 처리하려고 하는데 괜찮을까요?

---

## 참고: 현재 파일 구성 요약

**페이지**: Cover, Typography, Internal Only Canvas, Color Palette, Button, Text Field, Search Action, Text Form Template, Drop Down Menu, Drop Down Field, Select Item, Select Form Template, Checkbox Asset, Other Asset, Terms of Service, Dialog

**컴포넌트 variant 수**

| 컴포넌트 | variant 수 | 속성 |
|---|---|---|
| Button | 96 | Size(S/M/L/XL) × Color(Primary/Grey/Danger) × Variant(Fill/Weak) × State(Default/Hover/Pressed/Disabled) |
| Text Field | 7 | State: Default / Hover / Focused / Typing / Typed / Disabled / Error |
| Search Action | 6 | 속성 1: default / hover / focused / typing / typed / disabled |
| Text Form Template | 7 | State (Text Field와 같음) |
| Drop Down Menu | 3 | State: Default / Hover / Selected |
| Drop Down Field | 8 | State: Default / Hover / Focused / Selected / MenuHover / MenuScroll / MenuSelect / Disabled |
| Select Item | 3 | State: Default / Hover / Selected |
| Select Form Template | 3 | State: Default / Hover / Selected |
| Checkbox | 4 | Checked(True/False) × 크기 16 / 18 |
| Other Asset | 4 | Stepper State: Active / Complete / Disabled, Favicon |
| Terms of Service | 2 | expanded: True / False |
| Dialog | 4 | HasSearch × Type: Alert / Confirm / Search / Login |

**변수 컬렉션**

- `1. Primitives` (30): Brand, Neutral, Grey 50~900, Slate, Red, Green
- `2. Semantic` (22): Surface, Text, Border, Brand, Feedback
- `3. Tokens` (20): Radius (sm 4 / md 8 / lg 12 / xl / full 9999), Spacing (2 / 4 / 6 / 8 / 12 / 16 / 20 / 24), Pressed·Disabled 색상
- 텍스트 스타일 14개: Pretendard 하나 — Display(L/M), Heading 1~4, Body(L/M/S/XS/2XS), Label(L/M/S)
