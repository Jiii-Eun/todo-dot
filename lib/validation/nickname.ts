import { NICKNAME_MAX, NICKNAME_MIN } from '@/constants/storage';

const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣]+$/;

export interface NicknameValidation {
  valid: boolean;
  message: string;
}

export function validateNickname(value: string): NicknameValidation {
  const trimmed = value.trim();
  if (trimmed.length < NICKNAME_MIN) {
    return { valid: false, message: `닉네임은 ${NICKNAME_MIN}자 이상 입력해 주세요.` };
  }
  if (trimmed.length > NICKNAME_MAX) {
    return { valid: false, message: `닉네임은 ${NICKNAME_MAX}자 이하로 입력해 주세요.` };
  }
  if (!NICKNAME_PATTERN.test(trimmed)) {
    return { valid: false, message: '한글, 영문, 숫자만 사용할 수 있습니다.' };
  }
  return { valid: true, message: '' };
}

export function generateTag(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}

export interface ParsedDisplayName {
  nickname: string;
  tag: number;
}

export function parseDisplayName(value: string): ParsedDisplayName | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(.+)#(\d{4})$/);
  if (!match) return null;

  const nickname = match[1].trim();
  const tag = Number(match[2]);
  const nicknameValidation = validateNickname(nickname);
  if (!nicknameValidation.valid || Number.isNaN(tag)) return null;

  return { nickname, tag };
}

export function validateDisplayName(value: string): NicknameValidation {
  const parsed = parseDisplayName(value);
  if (!parsed) {
    return { valid: false, message: '닉네임#1234 형태로 입력해 주세요. (예: 민수#4821)' };
  }
  return { valid: true, message: '' };
}
