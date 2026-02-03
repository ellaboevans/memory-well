import { ReactNode } from "react";

interface WallLayoutProps {
  children: ReactNode;
}

/**
 * Layout for public wall pages
 * This wraps /wall/[slug] routes that are rewritten from subdomain requests
 */
export default function WallLayout({ children }: WallLayoutProps) {
  return <>{children}</>;
}
