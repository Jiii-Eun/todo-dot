# .Todo Dot

> 할 일을 관리하는 것이 아니라, **남은 시간을 관리한다.**

시간 중심(Time-Driven) 생산성 관리 모바일 앱입니다. Expo + React Native + TypeScript + MongoDB REST API로 구성됩니다.

## 기술 스택

- **Frontend:** Expo, React Native, TypeScript, expo-router
- **Backend:** MongoDB (Mongoose) REST API — 기본 `http://localhost:5000`
- **로컬 저장:** AsyncStorage (오프라인 + 서버 동기화)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. API 서버 실행

MongoDB 백엔드 서버를 **5000번 포트**에서 실행하세요.

```bash
# 백엔드 프로젝트에서 (별도 저장소)
npm start
```

연결 확인:

```bash
curl http://localhost:5000/health
```

### 3. 환경 변수 (선택)

API 주소를 바꿀 때만 `.env`에 설정합니다. 기본값은 `http://localhost:5000`입니다.

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

서버 미연결 시에도 **로컬(AsyncStorage)만으로** 동작합니다.

> **로컬 개발 참고**
> - Android 에뮬레이터: `http://10.0.2.2:5000`
> - 실기기: PC IP 주소 사용 (예: `http://192.168.0.10:5000`)

### 4. 앱 실행

```bash
npm start
```

## Android APK 설치 (무료)

Android는 APK 파일을 받아 **직접 설치(사이드로드)** 할 수 있습니다. Google Play 등록비도 필요 없습니다.

### 빌드

```bash
# Expo 로그인 (최초 1회)
eas login

# API URL 환경 변수 업로드 (최초 1회, .env 설정 후)
eas env:push --environment preview --path .env

# APK 빌드 (EAS 무료 플랜 — 월 빌드 횟수 제한 있음)
npm run build:android:apk
```

빌드가 끝나면 [Expo 대시보드](https://expo.dev/accounts/jiiiieun/projects/todo-dot/builds)에서 **APK 다운로드** 링크가 생깁니다.

### 기기에 설치

1. APK 파일을 Android 기기로 전송 (링크·카카오톡·USB 등)
2. **출처를 알 수 없는 앱** 설치 허용 (설정 → 보안)
3. APK 탭해서 설치

---

## iPhone — APK와 같은 방식은 불가 (무료)

**Apple은 Android APK처럼 파일 하나 받아서 영구 설치하는 방식을 막아 둡니다.**

| | Android APK | iPhone IPA |
|---|---|---|
| 파일 직접 설치 | ✅ 가능 | ❌ Apple 정책상 불가 |
| 비용 | 무료 | 독립 앱 설치 시 **연 $99** (Developer Program) |
| EAS 무료 빌드 | ✅ APK 제공 | ❌ 실기기 설치용 IPA는 유료 계정 필요 |

즉, **무료로 iPhone에 "내 앱 파일"을 내려받아 쓰는 방법은 공식적으로 없습니다.**

### iPhone에서 무료로 쓰는 방법

**1. Expo Go (개발·개인 사용, 가장 간단)**

1. App Store에서 **Expo Go** 설치
2. PC에서 `npm start` 실행
3. iPhone Expo Go 앱으로 QR 코드 스캔

→ 별도 앱 파일은 없지만, 무료로 실제 기기에서 바로 실행할 수 있습니다.

**2. Apple Developer Program ($99/년) — IPA 직접 설치**

비용을 내면 Android APK와 비슷하게 IPA를 빌드해 등록 기기에 설치할 수 있습니다. (이전에 README에 적어 둔 EAS iOS 빌드 절차)

**3. AltStore 등 사이드로드 (비추천)**

무료 Apple ID로 IPA를 넣을 수 있지만, **7일마다 재서명**이 필요하고 앱 3개 제한 등 불편이 많습니다.

---

## Vercel 웹 → 앱처럼 설치 (무료, iPhone·Android)

Vercel에 배포한 URL을 **홈 화면에 추가**하면 앱 아이콘처럼 쓸 수 있습니다.  
APK/IPA 파일 다운로드는 아니지만, **무료**이고 App Store·Play Store 없이 설치됩니다.

### iPhone (Safari)

1. Vercel URL을 **Safari**에서 엽니다 (Chrome 등 다른 브라우저 X)
2. 하단 **공유** 버튼 → **홈 화면에 추가**
3. 이름 확인 후 **추가**

홈 화면 아이콘을 누르면 브라우저 주소창 없이 앱처럼 열립니다.

### Android (Chrome)

1. Vercel URL을 Chrome에서 엽니다
2. 메뉴(⋮) → **앱 설치** 또는 **홈 화면에 추가**

### Vercel 재배포

PWA 설정(`app.json`의 `web`, `app/+html.tsx`) 반영 후:

```bash
npx expo export --platform web
```

`dist/` 폴더를 Vercel에 배포하면 아이콘·앱 이름이 설치 화면에 표시됩니다.

## MongoDB 컬렉션

| 컬렉션 | 설명 |
|--------|------|
| `users` | 닉네임, tag, createdAt |
| `todos` | 할 일 (userId, 시간, 완료 상태 등) |
| `todo_repeat_rules` | 반복 규칙 |

## 주요 화면

| 화면 | 설명 |
|------|------|
| 닉네임 입력 | 새 계정 / 기존 계정(`닉네임#1234`) 접속 |
| 메인 | 날짜 선택, 달성률, 24h 분포도, Todo 목록 |
| 집중 | 실시간 남은 시간 (시작/정지 버튼 없음) |

## 프로젝트 구조

```
app/                 # expo-router 화면
components/          # UI 컴포넌트
contexts/            # User, Todo Provider
lib/api/             # REST API 연동
lib/local/           # AsyncStorage
lib/todo/            # 반복 일정 로직
.cursor/rules/       # Cursor AI 규칙
```
