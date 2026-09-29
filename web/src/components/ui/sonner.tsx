import { Toaster as Sonner, type ToasterProps } from 'sonner';
export function Toaster(props: ToasterProps) {
  return <Sonner theme="light" containerAriaLabel="Notificações" position="bottom-center" offset={20} mobileOffset={20} visibleToasts={1} gap={0}
    style={{ left: '50%', right: 'auto', width: 'min(356px, calc(100vw - 32px))', transform: 'translateX(-50%)' }} {...props} />;
}
