
export function StatCard({ title, value, change, trend, icon: Icon, colorClass = "text-emerald-600" }){
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-slate-50 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}