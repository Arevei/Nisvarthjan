import { redirect } from "next/navigation";

export default async function VerificationRedirect({
  params,
}: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = await params;
  redirect(`/verify?certificateNumber=${encodeURIComponent(verificationId)}`);
}
