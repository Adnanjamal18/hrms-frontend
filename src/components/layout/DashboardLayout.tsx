import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLocation } from "react-router-dom"
import React from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  // Basic breadcrumb logic
  const pathnames = location.pathname.split("/").filter((x) => x)
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-slate-300 bg-white px-8 transition-all">
            <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-900" />
            
            <div className="flex items-center gap-2 max-w-[200px] sm:max-w-xs xl:max-w-sm hidden sm:flex">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-slate-500 hover:text-slate-900">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathnames.length > 0 && <BreadcrumbSeparator />}
                  {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
                    const isLast = index === pathnames.length - 1
                    const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
                    return (
                      <React.Fragment key={name}>
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage className="font-medium text-slate-900">{formattedName}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={routeTo} className="text-slate-500 hover:text-slate-900">{formattedName}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                      </React.Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="ml-auto flex items-center space-x-5">
              <div className="relative w-full max-w-sm hidden md:flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-md bg-white border-slate-300 pl-9 sm:w-[320px] focus-visible:ring-primary h-9 shadow-sm transition-all duration-200 hover:border-slate-400"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-9 w-9">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-slate-300 transition-all duration-200">
                <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
                <AvatarFallback className="bg-primary text-white font-medium text-xs">AD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <main className="flex-1 p-8 overflow-auto">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
