export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 p-4 bg-slate-950">
        <h1 className="text-xl font-bold text-indigo-400">Admin Portal</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
