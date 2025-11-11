import type { SVGProps } from 'react';

export function LiptonSwapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
      <path d="M12 6c-2.4 2.2-3 5.1-3 7.8 0 2.2 1.8 4.2 4 4.2 1.2 0 2.3-.5 3.1-1.2" />
      <path d="M12 6c2.4 2.2 3 5.1 3 7.8" />
    </svg>
  );
}
