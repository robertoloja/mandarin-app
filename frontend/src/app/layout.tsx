'use client'

import { ChakraProvider } from "@chakra-ui/react";
import TopNav from "@/components/TopNav";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>mandoBot</title>
      </head>
      <body>
        <ChakraProvider resetCSS>
          {/* <TopNav /> */}
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
