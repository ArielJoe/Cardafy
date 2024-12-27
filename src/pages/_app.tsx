import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Montserrat } from "next/font/google";
import Head from "next/head";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <MeshProvider>
        <main className={montserrat.className}>
          <Head>
            <title>Cardafy</title>
          </Head>
          <Component {...pageProps} />
        </main>
        <Toaster />
      </MeshProvider>
    </ThemeProvider>
  );
}

export default App;
