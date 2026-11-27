export function Footer({ className = '' }) {
  return (
    <footer
      className={`border-t border-slate-200 bg-white px-4 py-4 sm:px-6 text-center text-xs text-slate-500 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="space-y-0.5 sm:text-left">
          <p className="font-medium text-slate-700">
            Developed &amp; Maintained By: Shagun, Shivam Tomara
          </p>
          <p className="text-slate-500">Full Stack Development Team</p>
        </div>
        <p className="text-slate-500 sm:text-right">
          © 2026 ABESEC Ghaziabad. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
