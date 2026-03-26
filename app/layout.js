import "./globals.css";

export const metadata = {
  title: "Command Applications",
  description: "Veteran-led SDVOSB provider of AI training, workflow automation, advisory, and custom AI applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
