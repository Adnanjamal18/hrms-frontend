import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentUrl, deleteDocument } from '../api/employees';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Loader2, FileWarning, Download, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface Props {
  userId: string;
  employeeName?: string;
  hasResume?: boolean;
  variant?: 'button' | 'icon' | 'link';
  className?: string;
}

export function ViewDocumentButton({
  userId,
  employeeName = 'Employee',
  hasResume = true,
  variant = 'button',
  className = '',
}: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleFetchDocument = async () => {
    try {
      setLoading(true);
      const res = await getDocumentUrl(userId);
      if (res && res.downloadUrl) {
        setPreviewUrl(res.downloadUrl);
        setIsOpen(true);
      } else {
        toast.error('Resume document not found for this employee');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch document URL';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', userId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Resume document deleted successfully');
      setIsConfirmOpen(false);
      setIsOpen(false);
      setPreviewUrl(null);
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete document';
      toast.error(msg);
    },
  });

  const triggerElement = () => {
    if (variant === 'icon') {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFetchDocument}
          disabled={loading || !hasResume}
          className={`h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 ${className}`}
          title={hasResume ? 'View Resume' : 'No Resume Uploaded'}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </Button>
      );
    }

    if (variant === 'link') {
      return (
        <button
          type="button"
          onClick={handleFetchDocument}
          disabled={loading}
          className={`text-primary hover:underline inline-flex items-center gap-1.5 font-medium text-sm disabled:opacity-50 ${className}`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching Resume...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              View Resume Document
            </>
          )}
        </button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleFetchDocument}
        disabled={loading}
        className={`gap-2 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Fetching Document...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 text-primary" />
            View Document
          </>
        )}
      </Button>
    );
  };

  return (
    <>
      {triggerElement()}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-6xl w-[94vw] h-[90vh] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {employeeName} — Resume
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    <ShieldCheck size={12} /> Presigned Access
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Secure PDF document viewer (Link valid for 8 minutes)
                </DialogDescription>
              </div>
            </div>

            {previewUrl && (
              <div className="flex items-center gap-2 mr-8">
                <a
                  href={previewUrl}
                  download={`${employeeName.replace(/\s+/g, '_')}_Resume.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download size={13} />
                  Download
                </a>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <ExternalLink size={13} />
                  Full Screen
                </a>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={deleteMutation.isPending}
                  className="gap-1.5 text-xs font-semibold h-8"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Delete Document
                </Button>
              </div>
            )}
          </DialogHeader>

          {/* PDF Viewer Body */}
          <div className="flex-1 bg-slate-900/95 relative flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title={`Resume - ${employeeName}`}
                className="w-full h-full border-none shadow-inner"
              />
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-3 p-6 text-center">
                <FileWarning size={40} className="text-slate-500" />
                <p className="font-medium text-slate-300">No document preview available.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isConfirmOpen && (
        <DeleteConfirmModal
          isOpen={isConfirmOpen}
          title="Delete Resume Document"
          description={`Are you sure you want to permanently delete the resume file for ${employeeName}? This action removes the file from cloud storage and cannot be undone.`}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(userId)}
          onClose={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
}
