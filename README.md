# .Todo Dot

> 할 일을 관리하는 것이 아니라, **남은 시간을 관리한다.**

시간 중심(Time-Driven) 생산성 관리 모바일 앱입니다. Expo + React Native + TypeScript + Firebase로 구성됩니다.

## 기술 스택

- **Frontend:** Expo, React Native, TypeScript, expo-router
- **Backend:** Firebase Firestore
- **로컬 저장:** AsyncStorage (오프라인 + 서버 동기화)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. **Firestore Database** 생성 (테스트 모드 또는 rules 배포)
3. **프로젝트 설정 → 일반 → 내 앱**에서 웹 앱 추가 후 config 복사

### 3. 환경 변수

`.env.example`을 복사해 `.env`를 만들고 Firebase config 값을 입력하세요.

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Firebase 미설정 시에도 **로컬(AsyncStorage)만으로** 동작합니다.

### 4. Firestore Rules & Indexes

Firebase Console 또는 CLI로 배포:

- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`

### 5. 앱 실행

```bash
npm start
```

## Firestore 컬렉션

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
lib/firebase/        # Firestore 연동
lib/todo/            # 반복 일정 로직
firebase/            # Firestore rules, indexes
.cursor/rules/       # Cursor AI 규칙
```
