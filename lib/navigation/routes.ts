import { router } from 'expo-router';

/** 닉네임(시작) 화면 */
export function navigateToWelcomeScreen(): void {
  router.replace('/');
}

/** 메인 화면 */
export function navigateToMainScreen(): void {
  router.replace('/home');
}
