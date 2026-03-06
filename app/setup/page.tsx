import { headers } from "next/headers";

import { SetupPage } from "@/app/components/product-surfaces";
import { getSetupDiagnostics } from "@/lib/setup-diagnostics";
import { getDeploymentUrl } from "@/lib/site-url";

const Page = async () => {
  const [diagnostics, requestHeaders] = await Promise.all([
    getSetupDiagnostics(),
    headers(),
  ]);

  return (
    <SetupPage
      deploymentUrl={getDeploymentUrl(requestHeaders)}
      diagnostics={diagnostics}
    />
  );
};

export default Page;
