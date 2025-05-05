"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Calendar,
  Clock,
  AlertCircle,
  Check,
  CheckCircle,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Tag,
  Repeat,
  Calendar as CalendarIcon,
  Loader
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TaskDetailView({params}) {
//   const router = useRouter();
  const  {id}  = React.use(params);
  console.log(id);
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creator, setCreator] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const token=localStorage.getItem('token');
  // Fetch task data
  useEffect(() => {
    async function fetchTaskData() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL+`/tasks/${id}`,{
            method: 'GET', // or POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        
        const taskData = await response.json();
        setTask(taskData.task);
        
        // Fetch creator info
        if (taskData.task.createdBy._id) {
          fetchUserInfo(taskData.task.createdBy._id, 'creator');
        }
        
        // Fetch assignee info
        if (taskData.task.assignedTo._id) {
          fetchUserInfo(taskData.task.assignedTo._id, 'assignee');
        }
        
      } catch (error) {
        setError(error.message || 'Failed to load task data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTaskData();
  }, [id]);
  
  // Fetch user info (creator or assignee)
  async function fetchUserInfo(userId, userType) {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL+`/users/${userId}`,{
        method: 'GET', // or POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        
        if (userType === 'creator') {
          setCreator(userData);
        } else {
          setAssignee(userData.task);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${userType} info:`, error);
    }
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format relative time (e.g. 2 days ago)
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return date > now ? 'Tomorrow' : 'Yesterday';
    return date > now ? `In ${diffDays} days` : `${diffDays} days ago`;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority color and icon
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'low':
        return { color: 'text-green-500', bgColor: 'bg-green-50', icon: <AlertCircle className="h-4 w-4" /> };
      case 'medium':
        return { color: 'text-blue-500', bgColor: 'bg-blue-50', icon: <AlertCircle className="h-4 w-4" /> };
      case 'high':
        return { color: 'text-orange-500', bgColor: 'bg-orange-50', icon: <AlertCircle className="h-4 w-4" /> };
      case 'urgent':
        return { color: 'text-red-500', bgColor: 'bg-red-50', icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { color: 'text-gray-500', bgColor: 'bg-gray-50', icon: <AlertCircle className="h-4 w-4" /> };
    }
  };
  
  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'In Review';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Navigate back to tasks list
      router.push('/tasks');
    } catch (error) {
      setError(error.message);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Button variant="outline" onClick={() => router.push('/tasks')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Button variant="outline" onClick={() => router.push('/tasks')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Task Not Found</AlertTitle>
          <AlertDescription>
            The requested task could not be found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const priorityInfo = getPriorityInfo(task.priority);
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Button variant="outline" onClick={() => router.push('/tasks')} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            // onClick={() => router.push(`/tasks/edit/${id}`)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this task? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                {console.log(task)
                }
              <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
              <CardDescription className="mt-1">
                Created {formatDate(task.createdAt)}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {formatStatus(task.status)}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className={`${priorityInfo.bgColor} border-0`}>
              <span className={priorityInfo.color + " flex items-center"}>
                {priorityInfo.icon}
                <span className="ml-1 capitalize">{task.priority} Priority</span>
              </span>
            </Badge>
            
            {task.dueDate && (
              <Badge variant="outline" className="bg-blue-50 border-0">
                <span className="text-blue-600 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>Due {formatDate(task.dueDate)}</span>
                </span>
              </Badge>
            )}
            
            {task.isRecurring && (
              <Badge variant="outline" className="bg-purple-50 border-0">
                <span className="text-purple-600 flex items-center">
                  <Repeat className="mr-1 h-4 w-4" />
                  <span>Recurring ({task.recurringType})</span>
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-24">
              {task.description ? (
                <p className="whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* People */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">People</h3>
            {console.log(creator)
            }
            <div className="space-y-4">
              {/* Creator */}
              <div className="flex items-center">
                <div className="mr-3">
                  <Avatar>
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {creator ? getInitials(creator.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium">
                    {creator ? creator.name : 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500">Creator</p>
                </div>
              </div>
              
              {/* Assignee (if different from creator) */}
              {task.assignedTo && (
                <div className="flex items-center">
                  <div className="mr-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {assignee ? getInitials(assignee.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-medium">
                      {assignee ? assignee.name : 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">Assigned to</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              {/* Due date */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {task.dueDate ? (
                      <>
                        {formatDate(task.dueDate)}
                        <span className="text-sm text-gray-500 ml-2">
                          ({getRelativeTime(task.dueDate)})
                        </span>
                      </>
                    ) : (
                      'Not set'
                    )}
                  </span>
                </div>
              </div>
              
              {/* Created/Updated dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatDate(task.createdAt)}</span>
                </div>
              </div>
              
              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                {task.tags && task.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No tags</p>
                )}
              </div>
              
              {/* Recurring details (if applicable) */}
              {task.isRecurring && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Recurrence</h3>
                  <div className="flex items-center mb-2">
                    <Repeat className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="capitalize">{task.recurringType}</span>
                  </div>
                  
                  {task.recurringEndDate && (
                    <div className="flex items-center text-sm text-gray-500 ml-6">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>Ends on {formatDate(task.recurringEndDate)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-gray-500">
            Task ID: {task._id}
          </div>
          
          {task.status !== 'completed' ? (
            <Button 
              variant="outline" 
              className="bg-green-50 hover:bg-green-100 text-green-700"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/tasks/${id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'completed' }),
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to update task');
                  }
                  
                  // Refresh task data
                  setTask(prev => ({ ...prev, status: 'completed' }));
                } catch (error) {
                  setError(error.message);
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/tasks/${id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'todo' }),
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to update task');
                  }
                  
                  // Refresh task data
                  setTask(prev => ({ ...prev, status: 'todo' }));
                } catch (error) {
                  setError(error.message);
                }
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Reopen Task
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}