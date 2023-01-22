import Head from "next/head";
import Features from "@/components/landing-page/features";
import Navbar from "@/components/ui/navbar";
import Hero from "@/components/landing-page/hero";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Linkhub: link in bio tool</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Hero />
      <Features />
    </>
  );
}
