import { CredentialsTable } from "@/components/dashboard/credentials-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function CredentialsPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        eyebrow="Verified Credentials"
        title="Trust signals for every clinician and partner"
        description="Give operations teams a professional verification ledger for medical staff, labs, insurers, and external networks participating in each care workflow."
        demoMode={data.demoMode}
      />
      <CredentialsTable credentials={data.credentials} />
    </>
  );
}
