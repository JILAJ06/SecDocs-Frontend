import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Iniciar sesión · SecDocs',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
