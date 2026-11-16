import { redirect } from "next/navigation";

export default async function TutorialAliasRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/learn/lessons/${slug}`);
}
