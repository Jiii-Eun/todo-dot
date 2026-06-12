import { Slot } from 'expo-router';
import { useUserContext } from '@/contexts/UserProvider';

export default function MainLayout() {
  const { user, isLoading } = useUserContext();

  if (isLoading || !user) {
    return null;
  }

  return <Slot />;
}
