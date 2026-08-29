import type { HTMLAttributes, ReactNode } from "react";

type CarViewerShellProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function CarViewerShell({
  children,
  className = "",
  ...props
}: CarViewerShellProps) {
  return (
    <div
      className={`viewer-gradient relative h-full w-full min-h-[min(48dvh,380px)] lg:min-h-0 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
