import type { SVGProps } from 'react';

function AndroidIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.6 9.5c.8 0 1.4.6 1.4 1.4v6.2c0 .8-.6 1.4-1.4 1.4h-.4v2.1c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3v-2.1h-4.2v2.1c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3v-2.1h-.4c-.8 0-1.4-.6-1.4-1.4v-6.2c0-.8.6-1.4 1.4-1.4zM8.4 4.8 7.2 2.7c-.2-.3 0-.7.3-.8.3-.2.7 0 .8.3L9.4 4c.8-.3 1.7-.5 2.6-.5s1.8.2 2.6.5l1.1-1.8c.2-.3.6-.4.8-.3.4.1.5.5.3.8L15.6 4.8c1.6.8 2.8 2.3 3.2 4.1H5.2c.4-1.8 1.6-3.3 3.2-4.1M9 8.1c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9m6 0c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9" />
    </svg>
  );
}

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.8-.4 6.9 1.1 9.1.8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.8 3-.8s1.8.8 3 .8 2-.1 2.9-2.3c.7-1 1.2-2 1.5-3.1-3.9-1.5-3.8-5.9-3.8-6.1M14.6 6.3c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.8-.9 2.8 1.1.1 2.1-.6 2.7-1.4" />
    </svg>
  );
}

function FlutterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="m14.2 2-9.7 9.7 3.5 3.5L21.2 2zm.1 11.2-4.3 4.3 4.3 4.5H21l-4.4-4.5 4.4-4.3z" />
    </svg>
  );
}

function ReactIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
    </svg>
  );
}

export const SdkIcons: Record<string, typeof AndroidIcon> = {
  android: AndroidIcon,
  ios: AppleIcon,
  flutter: FlutterIcon,
  react: ReactIcon,
};
