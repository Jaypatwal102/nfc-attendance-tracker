export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Admin Portal</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
