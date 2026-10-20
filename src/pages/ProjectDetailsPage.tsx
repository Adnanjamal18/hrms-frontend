import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [storyPoint, setStoryPoint] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/project/${projectId}`, { withCredentials: true });
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/user', { withCredentials: true });
      setTeamMembers(res.data?.data?.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        projectId: Number(projectId),
        taskName,
        taskDescription,
        priority,
        assignedTo,
        storyPoint: storyPoint ? parseInt(storyPoint) : null
      }, { withCredentials: true });
      setIsCreateOpen(false);
      setTaskName('');
      setTaskDescription('');
      setPriority('MEDIUM');
      setAssignedTo('');
      setStoryPoint('');
      fetchTasks();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}`, {
        status: newStatus
      }, { withCredentials: true });
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, { withCredentials: true });
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert("Failed to delete task");
    }
  };

  const renderColumn = (title: string, status: string, bgClass: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className={`flex-1 min-w-[280px] rounded-xl border border-slate-200 p-4 ${bgClass}`}>
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-xs border border-slate-200">
            {columnTasks.length}
          </span>
        </h3>
        <div className="space-y-3">
          {columnTasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h4 className="font-semibold text-sm text-slate-900 leading-snug">{task.taskName}</h4>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                    title="Delete task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {task.taskDescription && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{task.taskDescription}</p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[10px] font-bold">
                    {task.assignedUser?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-xs text-slate-600 font-medium truncate max-w-[90px]">
                    {task.assignedUser?.fullName || "Unassigned"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.storyPoint !== null && task.storyPoint !== undefined && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                      {task.storyPoint} pts
                    </span>
                  )}
                  <select 
                    className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-md py-1 px-1.5 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-400">
              No tasks in this column
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Kanban Board...</div>;

  return (
    <div className="flex-1 p-8 pt-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2">
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Project Tasks</h2>
          <p className="text-sm text-slate-500">Interactive Kanban board for project execution & team workload.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> New Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {renderColumn('To Do', 'TODO', 'bg-slate-50')}
        {renderColumn('In Progress', 'IN_PROGRESS', 'bg-blue-50/50')}
        {renderColumn('In Review', 'REVIEW', 'bg-amber-50/50')}
        {renderColumn('Done', 'DONE', 'bg-green-50/50')}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input required value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="e.g. Design Login Page" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} placeholder="Task details..." />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Story Points</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="50" 
                  placeholder="e.g. 5" 
                  value={storyPoint} 
                  onChange={e => setStoryPoint(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  value={assignedTo} 
                  onChange={e => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="" disabled>Select User</option>
                  {teamMembers.map(user => (
                    <option key={user.id} value={user.id}>{user.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">Create Task</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
