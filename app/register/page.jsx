import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Crear cuenta · SecDocs',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
