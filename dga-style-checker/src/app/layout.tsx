import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme, rem } from "@mantine/core";
import Header from "@/app/components/Header";
import '@mantine/charts/styles.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DGA Style Checker",
  description: "",
};
const theme = createTheme({
  primaryColor: 'dga-color',
  colors: {
    'dga-color': [
      "#f7f0fd",
      "#e8dff0",
      "#cfbbde",
      "#b496cb",
      "#9d76bc",
      "#8f62b2",
      "#8958af",
      "#76489a",
      "#69408a",
      "#5b357a"
    ]
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body style={{ backgroundColor: 'rgb(250, 250, 250)' }} className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider theme={theme}>
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
