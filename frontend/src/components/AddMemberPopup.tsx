import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface AddMemberPopupProps {
  roomId: string;
  toast: typeof toast;
  onClose: () => void;
}

export default function AddMemberPopup({roomId, toast, onClose}: AddMemberPopupProps) {

  const [email, setEmail] = useState('');

  async function addMember(){
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/room/add`, 
        {
          roomId: roomId,
          email: email
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setEmail('');
      toast.success('Member added successfully!');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(230,228,228,0.15)] backdrop-blur-[3px]  flex items-center justify-center z-20">
      <div className="relative p-6 min-w-sm space-y-2 flex flex-col bg-white border rounded">
        <X className='absolute right-4 top-4' size={20} onClick={onClose} />
        <h2 className='text-xl font-bold'>Add Team Member</h2>
          <div className='mb-5 space-y-2 text-sm'>
            <label className='flex flex-col font-medium'>
              Member Email
            </label>
            <div className='flex gap-3'>
              <input 
                className='flex-1 px-2 py-1 border rounded' 
                type='email' 
                placeholder='Enter Email ID'
                value={email}
                onChange={(e) => {setEmail(e.target.value)}}  
              />
              <button className='px-3 py-1 btn-1 rounded' onClick={addMember}>Add</button>
            </div>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Existing Members</p>
          </div>
          <div>
            <p className='mb-2 text-sm text-muted-foreground'>Share Room Link with Members:</p>
            <div className='flex items-center gap-2'>
              <span className='flex-1 text-sm px-3 py-1 border rounded'>http://localhost:5173/room/</span>
              <button className='px-2 py-1 flex gap-2 text-sm btn-2 rounded'>
                <span>Copy</span>
                <Copy size={18} />
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}
