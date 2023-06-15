import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { useState } from "react";
import { DatabaseProvider } from "@/context/DatabaseContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <ChakraProvider>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <DatabaseProvider>
          <Component {...pageProps} />
        </DatabaseProvider>
      </SessionContextProvider>
    </ChakraProvider>
  );
}
