import React from "react";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { CodeBlockWrapper } from "@/components/learning/code-block";
import { slugifyHeading } from "@/modules/content/loader";

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "success";
  title?: string;
  children: React.ReactNode;
}) {
  const styles =
    type === "warning"
      ? "border-[#784F14] bg-[#1F1A12] text-[#FDE68A]"
      : type === "success"
      ? "border-[#1F5132] bg-[#112018] text-[#BBF7D0]"
      : "border-[#2B4358] bg-[#131C26] text-[#BAE6FD]";

  const Icon =
    type === "warning" ? AlertTriangle : type === "success" ? ShieldCheck : Info;

  return (
    <div className={`my-6 rounded-lg border p-4 ${styles}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 text-sm leading-relaxed">
          {title ? <div className="font-semibold mb-1">{title}</div> : null}
          <div className="text-[#E5E7EB] [&>p]:my-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const mdxComponents = {
  Callout,
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugifyHeading(extractText(children));
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugifyHeading(extractText(children));
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    );
  },
  pre: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & { "data-language"?: string }) => {
    const lang = props["data-language"];
    return (
      <CodeBlockWrapper language={lang} {...props}>
        {children}
      </CodeBlockWrapper>
    );
  },
};
