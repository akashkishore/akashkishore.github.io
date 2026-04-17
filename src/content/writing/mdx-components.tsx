import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  JSX,
  PropsWithChildren,
} from "react";
import { Equation } from "../../components/Equation";

function headingClassName(depth: 1 | 2 | 3 | 4): string {
  switch (depth) {
    case 1:
      return "mt-10 text-3xl font-semibold tracking-tight text-primary";
    case 2:
      return "mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-primary";
    case 3:
      return "mt-8 scroll-mt-24 text-xl font-semibold text-primary";
    default:
      return "mt-6 text-lg font-semibold text-primary";
  }
}

function Heading({
  depth,
  id,
  children,
}: PropsWithChildren<{ depth: 1 | 2 | 3 | 4; id?: string | undefined }>): JSX.Element {
  const Tag = `h${depth}` as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag id={id} className={headingClassName(depth)}>
      {children}
    </Tag>
  );
}

function MdxLink(props: AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element {
  const isExternal = props.href?.startsWith("http");
  return (
    <a
      {...props}
      className={["font-medium text-primary underline decoration-neutral-300 underline-offset-4", props.className]
        .filter(Boolean)
        .join(" ")}
      rel={isExternal ? "noreferrer" : props.rel}
      target={isExternal ? "_blank" : props.target}
    />
  );
}

function MdxImage(props: ImgHTMLAttributes<HTMLImageElement>): JSX.Element {
  const { alt, className, ...rest } = props;
  return (
    <figure className="my-8 space-y-3">
      <img
        {...rest}
        alt={alt}
        className={["w-full rounded border border-neutral-200 object-cover dark:border-neutral-800", className]
          .filter(Boolean)
          .join(" ")}
      />
      {alt ? <figcaption className="text-sm text-muted">{alt}</figcaption> : null}
    </figure>
  );
}

function InlineCode({ className, children, ...props }: HTMLAttributes<HTMLElement>): JSX.Element {
  const isBlock =
    className?.includes("language-") ||
    className?.includes("pretty-code") ||
    "data-language" in props ||
    "data-theme" in props;
  if (isBlock) {
    return (
      <code {...props} className={className}>
        {children}
      </code>
    );
  }

  return (
    <code
      {...props}
      className={[
        "rounded bg-neutral-100 px-1.5 py-0.5 text-[0.9em] text-primary dark:bg-neutral-900",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </code>
  );
}

function listClassName(
  variant: "disc" | "decimal",
  className?: string,
): string {
  return ["my-6 pl-6", variant === "disc" ? "list-disc" : "list-decimal", className]
    .filter(Boolean)
    .join(" ");
}

export const writingMdxComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading depth={1} id={props.id}>{props.children}</Heading>,
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading depth={2} id={props.id}>{props.children}</Heading>,
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading depth={3} id={props.id}>{props.children}</Heading>,
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => <Heading depth={4} id={props.id}>{props.children}</Heading>,
  a: MdxLink,
  img: MdxImage,
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className={[
        "my-8 border-l-2 border-neutral-300 pl-5 text-lg leading-relaxed text-muted dark:border-neutral-700",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className={listClassName("disc", props.className)} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className={listClassName("decimal", props.className)} />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className={[
        "my-8 overflow-x-auto p-0 text-sm",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  code: InlineCode,
  Equation,
};
