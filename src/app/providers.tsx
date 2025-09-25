'use client';

import { ProgressProvider } from '@bprogress/next/app';
import { usePathname } from 'next/navigation';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <ProgressProvider
      key={pathname}
      height="4px"
      color="#0EA5E9"
      options={{ showSpinner: false }}
    >
      {children}
    </ProgressProvider>
  );
};

export default Providers;