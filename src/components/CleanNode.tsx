import { Handle, Position, NodeProps } from 'reactflow';

export function CleanNode({ data, id }: NodeProps) {
  const isRole = id.startsWith('role-');

  return (
    <div
      className={`relative px-4 py-2 border rounded shadow text-sm font-medium 
        ${isRole ? 'bg-bg/30 border-main-3/20 text-xl text-fore cursor-default' : 'bg-fore-2/30 border-bg/50 text-fore'}
      `}
    >
      {data.label}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
