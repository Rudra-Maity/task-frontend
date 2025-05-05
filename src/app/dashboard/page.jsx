'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  CheckSquare,
  Calendar,
  Users,
  BarChart
} from 'lucide-react'
import axios from 'axios'

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    taskSummary: {
      completed: 0,
      inProgress: 0,
      upcoming: 0,
      overdue: 0,
      total: 0
    },
    recentTasks: [],
    loading: true
  })
const token=localStorage.getItem('token')
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL+'/tasks/',{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        console.log(response.data);
        
        const currentDate = new Date();
        // Initialize task summary
        const taskSummary = {
            completed: 0,
            inProgress: 0,
            upcoming: 0,
            overdue: 0,
            total: response.data.tasks.length
        };
        // Calculate task summary based on task status and due date
        response.data.tasks.forEach(task => {
            const dueDate = new Date(task.dueDate);
            if (task.status === 'completed') {
                taskSummary.completed++;
            } else if (dueDate < currentDate) {
                taskSummary.overdue++;
            } else if (dueDate >= currentDate && task.status !== 'completed') {
                taskSummary.upcoming++;
            }
        });
        // Prepare recent tasks
        const recentTasks = response.data.tasks.map((task, index) => ({
            id: task._id,
            title: task.title,
            status: task.status === 'completed' ? 'completed' : 'in_progress', // Assuming in_progress for others
            priority: task.priority,
            dueDate: task?.dueDate.split('T')[0], // Format to YYYY-MM-DD
            assignedTo: { name: task.assignedTo.name }
        }));
        // Combine task summary and recent tasks into a final result
        const result = {
            taskSummary,
            recentTasks
        };
console.log(result);



        // In a real app, these would be separate API calls
        // For this example, we'll use mock data
        
        // Mock data - in a real app, uncomment this and remove the mock data
        // const response = await axios.get('/dashboard/summary')
        // setDashboardData({
        //   ...response.data,
        //   loading: false
        // })

        // Mock data for demonstration
        result.loading = false
       setDashboardData(result)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setDashboardData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchDashboardData()
  }, [user])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'in_progress':
        return 'text-blue-500'
      case 'upcoming':
        return 'text-yellow-500'
      case 'overdue':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'upcoming':
        return <Calendar className="h-5 w-5 text-yellow-500" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (dashboardData.loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.taskSummary.completed}</div>
            <Progress 
              value={(dashboardData.taskSummary.completed / dashboardData.taskSummary.total) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.taskSummary.inProgress}</div>
            <Progress 
              value={(dashboardData.taskSummary.inProgress / dashboardData.taskSummary.total) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.taskSummary.upcoming}</div>
            <Progress 
              value={(dashboardData.taskSummary.upcoming / dashboardData.taskSummary.total) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.taskSummary.overdue}</div>
            <Progress 
              value={(dashboardData.taskSummary.overdue / dashboardData.taskSummary.total) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  No tasks available
                </div>
              ) : (
                dashboardData.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                  >
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <Link href={`/dashboard/tasks/${task.id}`}>
                          <h3 className="font-medium hover:underline">{task.title}</h3>
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Assigned to: {task.assignedTo.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div className="pt-2 text-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/tasks">
                    View All Tasks
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Tasks</p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.taskSummary.completed} of {dashboardData.taskSummary.total} tasks completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.taskSummary.overdue} overdue, {dashboardData.taskSummary.upcoming} upcoming
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Team</p>
                  <p className="text-sm text-muted-foreground">
                    4 active members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((dashboardData.taskSummary.completed / dashboardData.taskSummary.total) * 100)}% completion rate
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}