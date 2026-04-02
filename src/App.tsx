import { useInit } from './hooks/useInit';
import AppShell from './ui/layout/AppShell';

export default function App() {
  useInit();
  return <AppShell />;
}
