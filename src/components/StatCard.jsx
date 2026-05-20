export default function StatCard({ label, value, icon: Icon, color = 'text-navy' }) {
  return (
    <div className="card flex items-center gap-3">
      {Icon && <Icon className={`w-8 h-8 ${color}`} />}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}