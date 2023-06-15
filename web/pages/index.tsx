import { Box } from "@chakra-ui/react";
import UnauthorizedDashboard from "@/components/Dashboard/UnauthorizedDashboard";
import AuthorizedDashboard from "@/components/Dashboard/AuthorizedDashboard";
import { useUserData } from "@/hooks/useUserData";

export default function Home() {
  const userData = useUserData();

  return (
    <Box w="100vw" h="100vh" p={[5, 10]} overflow="hidden">
      {userData?.valid ? <AuthorizedDashboard /> : <UnauthorizedDashboard />}
    </Box>
  );
}
