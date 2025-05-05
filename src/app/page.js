// app/page.jsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center bg-primary text-primary-foreground px-4 lg:px-8">
        <div className="container flex items-center justify-between">
          <div className="text-xl font-bold">Task Management System</div>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container flex flex-col items-center justify-center py-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Manage your team&apos;s tasks <br />
            <span className="text-primary">efficiently and effectively</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            A comprehensive task management system designed for small teams to collaborate, track progress, and achieve goals together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
        
        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-10">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-3">Task Management</h3>
            <p className="text-muted-foreground">Create, assign, and track tasks with priorities, due dates, and categories.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-3">Team Collaboration</h3>
            <p className="text-muted-foreground">Assign tasks to team members and receive real-time notifications on updates.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
            <p className="text-muted-foreground">View comprehensive dashboards and reports on task completion and team performance.</p>
          </div>
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Task Management System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}