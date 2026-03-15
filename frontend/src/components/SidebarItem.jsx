
export function SidebarItem({className, icon: Icon, label, active, onClick }){
  return (
  <button className={`flex items-center space-x-2 ${className}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
  )
}