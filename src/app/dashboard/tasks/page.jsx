'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/tasks')
        console.log(res.data)
        setTasks(res.data.tasks.map((task, index) => ({
          id:task. _id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate.split('T')[0],
          assignedTo: {
            id: task.assignedTo._id,
            name: task.assignedTo.name
          },
          createdBy: {
            id: task.createdBy._id,
            name: task.createdBy.name || 'You'
          },
          isRecurring: task.isRecurring
        })))
        
        
        setLoading(false)
  
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setLoading(false) // already here for errors
      }
    }
  
    fetchTasks()
  }, [user])
  console.log(tasks);
  
  console.log(user);
  const token=localStorage.getItem('token')
  const handleDeleteTask = async (taskId) => {
    try {
      // In a real app, we would call the API
      // await axios.delete(`/tasks/${taskId}`)
      
      // For demonstration, just remove from state
      const res=await axios.delete(process.env.NEXT_PUBLIC_API_URL + '/tasks/' + taskId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
  
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // In a real app, we would call the API
      // await axios.patch(`/tasks/${taskId}`, { status: newStatus })
      
      // For demonstration, update the state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-yellow-500" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'upcoming':
        return 'Upcoming'
      case 'overdue':
        return 'Overdue'
      default:
        return status
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
  
  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Apply status filter
    const matchesStatus = statusFilter === '' || task.status === statusFilter
    
    // Apply priority filter
    const matchesPriority = priorityFilter === '' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Button asChild>
          <Link href="/dashboard/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span>{getStatusLabel(task.status)}</span>
                      {task.isRecurring && (
                        <Badge variant="outline" className="ml-2">
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/tasks/${task.id}`} className="font-medium hover:underline">
                      {task.title}
                    </Link>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {task.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeClass(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{task.assignedTo.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/tasks/${task.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/tasks/edit/${task.id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {task.status !== 'completed' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(task.id, 'completed')}
                          >
                            Mark as Complete
                          </DropdownMenuItem>
                        )}
                        {task.status === 'completed' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                          >
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}