'use client'

import { Provider } from "@/components/ui/provider";
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
        <Provider>
          {/* <TopNav /> */}
          {children}
        </Provider>
      </body>
    </html>
  );
}
