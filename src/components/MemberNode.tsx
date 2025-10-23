import { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';


export const MemberNode = ({ data }: NodeProps) => {
  const { label, isStaff, userId, onKick, onBan, onRoleChange, joinDate } = data;
  return (
    <div title={`First joined on ${joinDate}`} className={`cursor-default flex gap-2 items-center justify-center bg-bg/10 border-bg/20 text-fore border rounded p-2 shadow-md text-xs relative min-w-[260px] pointer-events-auto`}>
      <div className="font-medium text-sm w-full text-center"> {label}</div>

      {isStaff && (
        <div className="gap-2 flex items-center">
          <button
            onClick={() => onKick(userId,label)}
            className="flex transition-all items-center justify-center text-yellow-300 p-2 rounded aspect-square hover:bg-white/10 cursor-pointer nodrag"
            title="Kick"
          >
            <i className="fa-solid fa-user-minus"></i>
          </button>
          <button
            onClick={() => onBan(userId,label)}
            className="flex transition-all items-center justify-center text-red-500 p-2 rounded aspect-square hover:bg-white/10 cursor-pointer nodrag"
            title="Ban"
          >
            <i className="fa-solid fa-hammer-crash"></i>
          </button>
          <button
            onClick={() => onRoleChange(userId,label)}
            className="flex transition-all items-center justify-center text-green-400 p-2 rounded aspect-square hover:bg-white/10 cursor-pointer nodrag"
            title="Change Role"
          >
            <i className="fa-solid fa-user-gear"></i>
          </button>
        </div>
      )}


    <Handle type="target" position={Position.Top} className="w-0 h-0 opacity-0" />
    <Handle type="source" position={Position.Bottom} className="w-0 h-0 opacity-0" />

    </div>
  );
};
