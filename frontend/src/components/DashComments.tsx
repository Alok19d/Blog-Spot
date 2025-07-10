import { toast } from 'react-toastify';

interface IDashCommentsProps{
  toast: typeof toast;
}

export default function DashComments({ toast }: IDashCommentsProps) {
  return (
    <div className="p-6 border rounded">
      <h3 className="text-2xl font-semibold">Recent Comments</h3>
      <p className="mb-6 text-sm text-muted-foreground">Manage comments on your blog posts</p>
    </div>
  )
}
