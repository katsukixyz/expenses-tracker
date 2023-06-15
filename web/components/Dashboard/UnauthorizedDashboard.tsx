import React, { useEffect } from "react";
import { Button, Center, Heading, VStack } from "@chakra-ui/react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useUserData } from "@/hooks/useUserData";
import { Database } from "@/types/db";

export default function UnauthorizedDashboard() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const userData = useUserData();

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  useEffect(() => {
    const insertUserRow = async () => {
      await supabase.from("users").insert({ uid: user?.id, valid: false });
    };
    if (user && !userData) {
      insertUserRow();
    }
  }, [userData]);

  return (
    <Center w="100%" h="100%">
      <VStack spacing={5}>
        <Heading>Expenses</Heading>
        <Button paddingX={20} onClick={signInWithGoogle}>
          Authenticate
        </Button>
      </VStack>
    </Center>
  );
}
