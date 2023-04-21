import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function NavigationTransition() {
  const router = useRouter();

  useEffect(() => {
    const start = (url: string) => url !== router.asPath && nprogress.start();
    const complete = () => nprogress.complete();

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", complete);
    router.events.on("routeChangeError", complete);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", complete);
      router.events.off("routeChangeError", complete);
    };
  }, [router.asPath, router.events]);

  return <NavigationProgress autoReset={true} />;
}
