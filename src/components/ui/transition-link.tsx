"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

type TransitionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Omit<LinkProps, "href"> & {
    href: string;
    transitionMs?: number;
  };

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href, onClick, transitionMs = 190, target, children, ...props }, ref) => {
    const router = useRouter();

    return (
      <Link
        ref={ref}
        href={href}
        target={target}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (target === "_blank") return;
          if (isModifiedEvent(event)) return;
          if (href.startsWith("http://") || href.startsWith("https://")) return;

          event.preventDefault();
          if (typeof document !== "undefined") {
            document.body.classList.add("route-fade-transitioning");
          }

          window.setTimeout(() => {
            router.push(href);
          }, transitionMs);
        }}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

TransitionLink.displayName = "TransitionLink";
