
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react-native/icons';
import { useLogout } from '../api/hook';

export default function LogoutButton() {
  const { mutate, isPending } = useLogout();

  const logout = () => {
    mutate();
  };

  return (
    <Button variant="ghost" disabled={isPending} onPress={logout}>
      <LogOut />
    </Button>
  );
}
