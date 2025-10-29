import { Spinner } from '@/components/ui/spinner';

export default function SignupLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading signup page...</p>
      </div>
    </div>
  );
}
