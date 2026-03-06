export const getDeploymentUrl = (headersList: Pick<Headers, "get">): string => {
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "your-deployment.vercel.app";
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
};
