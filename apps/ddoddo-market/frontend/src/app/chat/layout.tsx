export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-4xl h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold my-4">채팅</h1>
      <div className="bg-white rounded-lg shadow-md h-full">{children}</div>
    </div>
  );
}