import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Building2, Home, Users, Settings, Briefcase, FileText, ChevronUp, User2, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { authClient } from "@/app/better-auth"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Attendance", url: "/attendance", icon: Clock },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Projects", url: "/projects", icon: Briefcase },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate("/auth")
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="bg-primary text-white p-1 rounded-md">
            <Building2 size={24} />
          </div>
          <span>HRMS Pro</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link to={item.url} />} 
                      isActive={isActive} 
                      tooltip={item.title}
                      className="rounded-md h-10 transition-all duration-200 text-slate-300 font-medium hover:bg-sidebar-accent hover:text-white data-[active=true]:bg-sidebar-accent data-[active=true]:text-white relative overflow-hidden data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-2 data-[active=true]:before:bottom-2 data-[active=true]:before:w-1 data-[active=true]:before:bg-primary data-[active=true]:before:rounded-r-md"
                    >
                      <item.icon className="h-5 w-5 opacity-80" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <SidebarMenuButton className="h-14 px-3 rounded-md transition-all duration-200 hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent text-white">
                  <User2 className="h-5 w-5 opacity-80" />
                  <div className="flex flex-col gap-1 leading-none text-left">
                    <span className="font-semibold text-sm">{session?.user?.name || "User"}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{session?.user?.email || ""}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 opacity-50" />
                </SidebarMenuButton>
              } />
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
