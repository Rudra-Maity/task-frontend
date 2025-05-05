 "use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, X, Check, Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

export default function EditTaskForm({params}) {
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    assignedTo: '',
    recurringType: 'none',
    recurringEndDate: null
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');
  // Fetch task data when component mounts
  const { id } = React.use(params); 
  useEffect(()=>{
    async function fetchUsers(){
      const token=localStorage.getItem('token');
      const api=process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(api+'/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      // const result = await response.json();
      if (response.data) {
        setUsers(response.data.users);
      } else {
        console.error('Failed to fetch users:', result.message);
      }
    }
    fetchUsers()
      },[])
  useEffect(() => {
    async function fetchTaskData() {
      if (!id) return;
      
      try {
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
        setFormData(taskData.task)
        // Convert date strings to Date objects
        // const formattedData = {
        //   ...taskData.task,
        //   dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        //   recurringEndDate: taskData.recurringEndDate ? new Date(taskData.recurringEndDate) : null
        // };
        
        // Set form data
        // setFormData(formattedData);
        
        // Set tags
        if (taskData.tags && Array.isArray(taskData.tags)) {
          setTags(taskData.tags);
        }
        
        // Set recurring flag
        setIsRecurring(!!taskData.isRecurring);
        
      } catch (error) {
        setErrors({ fetch: error.message || 'Failed to load task data' });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTaskData();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (isRecurring && !formData.recurringType) {
      newErrors.recurringType = 'Please select a recurrence pattern';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Prepare data for submission
      const taskData = {
        ...formData,
        tags,
        isRecurring,
      };
      
      // If not recurring, make sure recurring fields are null/empty
      if (!isRecurring) {
        taskData.recurringType = 'none';
        taskData.recurringEndDate = null;
      }
      
      // Submit the form data
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL+`/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update task');
      }
      
      setSuccessMessage('Task updated successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => {
        // router.push('/tasks');
      }, 1500);
      
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
        <CardFooter>
          <div className="flex justify-end w-full">
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (errors.fetch) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-600">
              {errors.fetch}
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button onClick={() => router.push('/tasks')}>
              Back to Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Task</CardTitle>
        <CardDescription>Update task details</CardDescription>
      </CardHeader>
      
      <CardContent>
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {errors.submit && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-600">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}
      
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
              Title <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="title" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title" 
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Describe the task" 
              className="min-h-32"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      formatDate(formData.dueDate)
                    ) : (
                      <span className="text-gray-400">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleDateChange('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
  <Label htmlFor="assignedTo">Assigned To (User ID)</Label>
  <Select
    value={formData.assignedTo?._id || ""}
    onValueChange={(value) =>
      handleChange({
        target: { name: "assignedTo", value: users.find(u => u._id === value) },
      })
    }
  >
    <SelectTrigger id="assignedTo" className="w-full">
      <SelectValue placeholder="Select a user" />
    </SelectTrigger>
    <SelectContent>
      {users.map((user) => (
        <SelectItem key={user._id} value={user._id}>
          {user.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

          </div>
          
          <div>
            <Label htmlFor="tags" className="block mb-2">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleTagAdd}>
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                id="recurring-task"
              />
              <Label
                htmlFor="recurring-task"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Recurring Task
              </Label>
            </div>
            
            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-gray-200">
                <div>
                  <Label htmlFor="recurringType" className={errors.recurringType ? "text-red-500" : ""}>
                    Recurrence Pattern
                  </Label>
                  <Select
                    value={formData.recurringType || 'none'}
                    onValueChange={(value) => handleSelectChange('recurringType', value)}
                    disabled={!isRecurring}
                  >
                    <SelectTrigger className={errors.recurringType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.recurringType && (
                    <p className="text-red-500 text-sm mt-1">{errors.recurringType}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="recurringEndDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!isRecurring}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.recurringEndDate ? (
                          formatDate(formData.recurringEndDate)
                        ) : (
                          <span className="text-gray-400">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.recurringEndDate}
                        onSelect={(date) => handleDateChange('recurringEndDate', date)}
                        initialFocus
                        disabled={!isRecurring}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/tasks')}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Task"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}