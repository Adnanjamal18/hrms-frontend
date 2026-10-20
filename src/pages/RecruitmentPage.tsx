import { useState, useEffect } from 'react';
import {
  UserPlus,
  Briefcase,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  Building,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  getAllJobs,
  createJob,
  deleteJob,
  getCandidatesByJobId,
  createCandidate,
  updateCandidateStatus,
  type Job,
  type JobApplication,
} from '../api/recruitment';
import { getDepartments, type Department } from '../api/departments';

export function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Job for candidates view
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<JobApplication[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobDepartmentId, setJobDepartmentId] = useState('');

  // Candidate Form State
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candAddress, setCandAddress] = useState('');
  const [candExperience, setCandExperience] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candCompany, setCandCompany] = useState('');
  const [candNotice, setCandNotice] = useState('');
  const [candCtc, setCandCtc] = useState('');
  const [candExpectedCtc, setCandExpectedCtc] = useState('');
  const [candResume, setCandResume] = useState('');
  const [candJobId, setCandJobId] = useState<string>('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidatesForJob(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [jobsData, deptsData] = await Promise.all([
        getAllJobs().catch(() => []),
        getDepartments().catch(() => []),
      ]);
      setJobs(jobsData);
      setDepartments(deptsData);
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidatesForJob = async (jobId: number) => {
    setCandidatesLoading(true);
    try {
      const data = await getCandidatesByJobId(jobId);
      setCandidates(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidates for this job');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDepartmentId) {
      toast.error('Please fill in title and department');
      return;
    }

    try {
      await createJob({
        title: jobTitle,
        description: jobDescription,
        departmentid: parseInt(jobDepartmentId),
      });
      toast.success('Job posting created successfully!');
      setIsJobModalOpen(false);
      setJobTitle('');
      setJobDescription('');
      setJobDepartmentId('');
      fetchInitialData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create job');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await deleteJob(jobId);
      toast.success('Job posting deleted');
      fetchInitialData();
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetJobId = candJobId ? parseInt(candJobId) : selectedJobId;
    if (!targetJobId) {
      toast.error('Please select a job for this candidate');
      return;
    }

    try {
      await createCandidate({
        name: candName,
        email: candEmail,
        phone: candPhone,
        address: candAddress || undefined,
        experience: candExperience ? parseInt(candExperience) : undefined,
        skills: candSkills || undefined,
        currentCompany: candCompany || undefined,
        noticePeriod: candNotice ? parseInt(candNotice) : undefined,
        ctc: candCtc ? parseFloat(candCtc) : undefined,
        expectedCtc: candExpectedCtc ? parseFloat(candExpectedCtc) : undefined,
        resumeLink: candResume || undefined,
        jobId: targetJobId,
      });

      toast.success('Candidate registered successfully!');
      setIsCandidateModalOpen(false);
      setCandName('');
      setCandEmail('');
      setCandPhone('');
      setCandAddress('');
      setCandExperience('');
      setCandSkills('');
      setCandCompany('');
      setCandNotice('');
      setCandCtc('');
      setCandExpectedCtc('');
      setCandResume('');
      setCandJobId('');

      if (selectedJobId) {
        fetchCandidatesForJob(selectedJobId);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleStatusChange = async (
    candidateId: number,
    newStatus: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED'
  ) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      toast.success(`Candidate status updated to ${newStatus}`);
      if (selectedJobId) {
        fetchCandidatesForJob(selectedJobId);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Selected</span>;
      case 'INTERVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Interview</span>;
      case 'SHORTLISTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Shortlisted</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Applied</span>;
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.skills && c.skills.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <UserPlus className="text-primary" size={30} />
            Recruitment & Talent Acquisition
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage job postings, track applicant pipelines, schedule interviews, and hire talent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setCandJobId(selectedJobId ? selectedJobId.toString() : '');
              setIsCandidateModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Users size={16} /> Add Candidate
          </Button>
          <Button onClick={() => setIsJobModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Post New Job
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Openings</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{jobs.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applicants</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {jobs.reduce((acc, j) => acc + (j.applications?.length || 0), 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Interview</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {jobs.reduce(
              (acc, j) => acc + (j.applications?.filter((a) => a.status === 'INTERVIEW').length || 0),
              0
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Selected / Hired</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-3">
            {jobs.reduce(
              (acc, j) => acc + (j.applications?.filter((a) => a.status === 'SELECTED').length || 0),
              0
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'jobs'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Job Openings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'candidates'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Candidate Pipeline ({candidates.length})
        </button>
      </div>

      {/* Job Openings Tab */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Loading job postings...</div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
              <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No Job Openings Posted Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Create your first job listing to start receiving candidate applications.
              </p>
              <Button onClick={() => setIsJobModalOpen(true)}>Create First Job</Button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                      {job.jobTitle}
                    </h3>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Delete job"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                    <Building size={14} className="text-slate-400" />
                    <span>{job.department?.departmentName || 'General Dept'}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {job.jobDescription || 'No description provided for this job.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-700">
                      {job.applications?.length || 0} Applicants
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setActiveTab('candidates');
                    }}
                    className="text-primary hover:text-primary/80 text-xs font-bold flex items-center gap-1 p-0 h-auto"
                  >
                    View Pipeline <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Candidate Pipeline Tab */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job:</span>
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(Number(e.target.value))}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-slate-50 focus:bg-white"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobTitle} ({j.applications?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-slate-50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search candidates, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Experience & Skills</TableHead>
                  <TableHead>Compensation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead className="text-right">Change Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-28 text-slate-400">
                      Loading candidates...
                    </TableCell>
                  </TableRow>
                ) : filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-slate-400">
                      No candidate applications found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((cand) => (
                    <TableRow key={cand.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail size={12} /> {cand.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {cand.phone}
                            </span>
                          </div>
                          {cand.currentCompany && (
                            <span className="text-[11px] text-slate-500 mt-0.5">
                              Current: {cand.currentCompany}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {cand.experience !== undefined && cand.experience !== null
                              ? `${cand.experience} yrs exp`
                              : '-'}
                            {cand.noticePeriod ? ` • ${cand.noticePeriod}d notice` : ''}
                          </span>
                          {cand.skills && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cand.skills.split(',').slice(0, 3).map((s, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                                >
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs">
                          {cand.ctc ? (
                            <p className="text-slate-600 font-medium">Curr: ₹{cand.ctc} LPA</p>
                          ) : null}
                          {cand.expectedCtc ? (
                            <p className="text-emerald-600 font-bold">Exp: ₹{cand.expectedCtc} LPA</p>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(cand.status)}</TableCell>

                      <TableCell>
                        {cand.resumeLink ? (
                          <a
                            href={cand.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            <ExternalLink size={13} /> View CV
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <select
                          value={cand.status}
                          onChange={(e) =>
                            handleStatusChange(
                              cand.id,
                              e.target.value as 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED'
                            )
                          }
                          className="text-xs font-semibold border border-slate-200 bg-white rounded-lg p-1.5 focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="SELECTED">Selected</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create Job Dialog */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase size={20} className="text-primary" /> Post New Job Opening
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateJob} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Job Title *</Label>
              <Input
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Department *</Label>
              <select
                required
                value={jobDepartmentId}
                onChange={(e) => setJobDepartmentId(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-1 focus:ring-primary"
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Job Description</Label>
              <Textarea
                rows={4}
                placeholder="Responsibilities, requirements, tech stack..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsJobModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Posting</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={isCandidateModalOpen} onOpenChange={setIsCandidateModalOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} className="text-primary" /> Register New Candidate
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCandidate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Job Opening *</Label>
              <select
                required
                value={candJobId}
                onChange={(e) => setCandJobId(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-1 focus:ring-primary"
              >
                <option value="" disabled>
                  Select Job Opening
                </option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  required
                  placeholder="Candidate Name"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="candidate@example.com"
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  required
                  placeholder="+91 9876543210"
                  value={candPhone}
                  onChange={(e) => setCandPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Current Company</Label>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={candCompany}
                  onChange={(e) => setCandCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Experience (Yrs)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 4"
                  value={candExperience}
                  onChange={(e) => setCandExperience(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Notice Period (Days)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 30"
                  value={candNotice}
                  onChange={(e) => setCandNotice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Expected CTC (LPA)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 15.0"
                  value={candExpectedCtc}
                  onChange={(e) => setCandExpectedCtc(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Skills (Comma-separated)</Label>
              <Input
                placeholder="React, TypeScript, Node.js, PostgreSQL"
                value={candSkills}
                onChange={(e) => setCandSkills(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Resume Link (Google Drive / Dropbox / URL)</Label>
              <Input
                placeholder="https://drive.google.com/..."
                value={candResume}
                onChange={(e) => setCandResume(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCandidateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Candidate</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
