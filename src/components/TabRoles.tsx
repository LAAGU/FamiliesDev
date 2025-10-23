import { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { usePopup } from '../hooks/usePopup';
import { useGlobal } from '../hooks/useGlobal';
import { supabase } from '../functions/supabase';
import { GetNameFromUID, IsStaff } from '../functions/dbhelper';
import isEqual from 'lodash/isEqual';
import { sendLog } from '../functions/scripts';

const RoleNode = ({ data }: { data: any }) => (
    <div className="pointer-events-auto cursor-default">
    <div className="flex flex-col gap-2 bg-black/20 border-[1px] border-bg/20 text-fore rounded p-3 shadow text-base min-w-[360px] w-max text-center">
      <div className="top flex items-center justify-between gap-5">
        <div className="font-semibold text-nowrap">{data?.default && <i title='Default Role' className="fa-solid fa-bookmark mr-2"></i>}{data?.label}</div>
        <div title='Role Weight' className="flex items-center justify-center gap-2 bg-black/10 rounded p-2 min-w-[100px]">
        <i className="fa-solid fa-weight-hanging text-sm"></i> {data?.weight}
        </div>
      </div>
      {data?.isStaff && (
        <div className="btns flex items-center gap-2">
            <button onClick={data?.onEditRoleName} className="btn-d w-full !text-base !text-fore flex items-center justify-center gap-2 uppercase"><i className="fa-solid fa-pen-to-square text-sm p-1.5"></i></button>
            <button onClick={data?.onEditRoleWeight} className="btn-d w-full !text-base !text-fore flex items-center justify-center gap-2 uppercase"><i className="fa-solid fa-weight-hanging text-sm p-1.5"></i></button>
            <button onClick={data?.onShowRoleMembers} className="btn-d w-full !text-base !text-fore flex items-center justify-center gap-2 uppercase"><i className="fa-solid fa-users text-sm p-1.5"></i></button>
            <button onClick={data?.onDelete} className="btn-r !text-base !text-fore flex items-center justify-center gap-2 uppercase"><i className="fa-solid fa-trash text-sm p-1.5"></i></button>
        </div>  
      )}
      
  
      <Handle type="target" position={Position.Top} className="w-0 h-0 opacity-0" />
      <Handle type="source" position={Position.Bottom} className="w-0 h-0 opacity-0" />
    </div>
  </div>
);

const nodeTypes = {
  role: RoleNode,
};

export default function TabRoles({ family }: { family: any }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const {showPopup,resetPopup} = usePopup();

  const {popupInputs, user,setPopupInfo} = useGlobal();

  const [miniMapSize, setMiniMapSize] = useState({ width: 120});

  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;

      setMiniMapSize({
        width: Math.min(120, Math.max(200, screenWidth * 0.2)),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);



    

  const lastShowRoleMembersData = useRef<any>();
  const lastVisualShowRoleMembersData = useRef<any>();

  const handleShowRoleMembers = async (roleName: string) => {
    if (!IsStaff(family,user)) return
    const newData = family?.members?.[roleName];
    if (!newData || newData?.length === 0) {
      showPopup({
        title: "Role View",
        description: "No members in " + roleName,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }


    if (!isEqual(lastShowRoleMembersData.current, newData)) {
      const visualData = await Promise.all(
        newData?.map(async (uid: string) => {
          const name = await GetNameFromUID(uid);
          return name;
        })
      );
  
      lastVisualShowRoleMembersData.current = visualData;
      lastShowRoleMembersData.current = newData;
  
      showPopup({
        title: "Role View",
        description: "Members in " + roleName,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        labelsArray: visualData.map((name: string) => ({
          text: name,
          className: "input-d"
        })),
      });
    } else {
      showPopup({
        title: "Role View",
        description: "Members in " + roleName,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        labelsArray: lastVisualShowRoleMembersData.current?.map((name: string) => ({
          text: name,
          className: "input-d"
        })),
      });
    }
  };

  const handleEditRoleWeight = (name:string,weight: number) => {
    if (!IsStaff(family,user)) return
    const lastValue = weight

    async function doAction(newValue: number) {
        resetPopup()

        const { data, error: fetchError } = await supabase
          .from('families')
          .select('roles')
          .eq('name', family?.name)
          .maybeSingle()
        
        if (fetchError) {
          console.error('Error fetching roles:', fetchError)
          showPopup({
            title: 'Error',
            description: 'An error occurred while fetching roles. Please try again later.',
            buttonsArray: [{ text: 'Close', onClick: resetPopup, className: 'btn-d' }],
            inputsArray: [],
            type: 'default'
          })
          return
        }


        const updatedRoles: any = { ...data?.roles }
        if (updatedRoles[name]) {
            updatedRoles[name].weight = newValue
        }


        const { error: updateError } = await supabase
          .from('families')
          .update({ roles: updatedRoles })
          .eq('name', family?.name)
          .maybeSingle()
        
        if (updateError) {
          console.error('Error updating roles:', updateError)
          showPopup({
            title: 'Error',
            description: 'An error occurred while fetching roles. Please try again later.',
            buttonsArray: [{ text: 'Close', onClick: resetPopup, className: 'btn-d' }],
            inputsArray: [],
            type: 'default'
          })
          return
        }

        showPopup({
          title: 'Success',
          description: 'Role weight updated successfully.',
          buttonsArray: [{ text: 'Close', onClick: resetPopup, className: 'btn-d' }],
          inputsArray: [],
          type: 'default'
        })

        await sendLog(family,"Role", {
          roleName: name,
          oldWeight: lastValue,
          newWeight: newValue,
          staffName: user?.name,
          staffUID: user?.uid,
        },"Role Weight Modified",16767388)
    }

    
    showPopup({
        title:`${name}`,
        description:"Modify role weight.",
        inputsArray:[{title:"Weight",name:"edit-role-weight-input",type:"number",defaultValue:weight, className:"input-d", placeholder:"Weight"}],
        buttonsArray:[{text: "Close", className: "btn-d", onClick:resetPopup},{text: "Save", className: "btn-g", onClick:()=>{
        (popupInputs.current["edit-role-weight-input"] && parseInt(popupInputs.current["edit-role-weight-input"]) !== lastValue)
        && doAction(parseInt(popupInputs.current["edit-role-weight-input"]))   
    }}],
    })
  }

  const handleDeleteRole = (name:string) => {
    if (!IsStaff(family,user)) return
    if (name === family?.defaultRole) {
      showPopup({
        title: 'Error',
        description: 'You cannot delete the default role, First change the default role from settings.',
        buttonsArray: [{ text: 'Close', onClick: resetPopup, className: 'btn-d' }],
        inputsArray: [],
        type: 'default'
      })
      return
    }

    async function confirm() {
        if (!family || !family.roles[name]) {
          console.error("Role not found in family.roles:", name);
          setPopupInfo("There was an Error.", "red");
          return;
        }

        const roleWeight = family.roles[name]?.weight
      
        const clonedFamily = {
          ...family,
          members: { ...family.members },
          roles: { ...family.roles },
        };
      
        const sourceMembers = clonedFamily.members[name];
        const targetRole = clonedFamily.defaultRole;
      
        if (Array.isArray(sourceMembers) && sourceMembers.length > 0) {
          clonedFamily.members[targetRole] = [
            ...(clonedFamily.members[targetRole] || []),
            ...sourceMembers,
          ];
        }
      
        delete clonedFamily.members[name];
        delete clonedFamily.roles[name];
      
        const {error} = await supabase
        .from("families")
        .update({members:clonedFamily?.members,roles:clonedFamily?.roles})
        .eq("name",clonedFamily?.name)
        .maybeSingle()

        if (error) {
            console.error(error)
            setPopupInfo("There was an Error.", "red");
            return
        }

        resetPopup()
        showPopup({
            title: "Role Deleted",
            description: `${name} role was deleted.`,
            buttonsArray: [
                {text: "Close", className: "btn-d", onClick: resetPopup}
            ]
        })

        await sendLog(family,"Role", {
          roleName: name,
          weight: roleWeight,
          staffName: user?.name,
          staffUID: user?.uid,
        },"Role Deleted",16711680)

      }

    showPopup({
        title: 'Role Deletion',
        description: `Are you sure you want to delete the role "${name}" ?, Every member that has this role will be given the default role.`,
        buttonsArray: [
            { text: 'Close', onClick: resetPopup, className: 'btn-d' },
            { text: 'Delete', onClick: confirm, className: 'btn-r' }
        ],
        inputsArray: [],
        type: 'default'
      })
  }

  function handleEditRoleName(name: string) {
    if (!IsStaff(family,user)) return
    if (name === family?.defaultRole) {
      showPopup({
        title: 'Error',
        description: 'You cannot rename the default role. Please change the default role first in settings.',
        buttonsArray: [{ text: 'Close', onClick: resetPopup, className: 'btn-d' }],
        inputsArray: [],
        type: 'default',
      });
      return;
    }
  
  
    async function confirmRename() {
      if (!popupInputs.current["role-rename-input"] || popupInputs.current["role-rename-input"] === "") {
        setPopupInfo("Nothing Changed.", "red");
        return;
      }
  
  
      if (!family || !family.roles[name]) {
        console.error("Role not found in family.roles:", name);
        setPopupInfo("There was an Error.", "red");
        return;
      }
  
      if (family.roles[popupInputs.current["role-rename-input"]]) {
        setPopupInfo("A role with that name already exists.", "red");
        return;
      }
      
      const roleWeight = family?.roles[name]?.weight

      const clonedFamily = {
        ...family,
        members: { ...family.members },
        roles: { ...family.roles },
      };
  

      clonedFamily.roles[popupInputs.current["role-rename-input"]] = clonedFamily.roles[name];
      delete clonedFamily.roles[name];
  

      if (clonedFamily.members[name]) {
        clonedFamily.members[popupInputs.current["role-rename-input"]] = clonedFamily.members[name];
        delete clonedFamily.members[name];
      }
  
      const { error } = await supabase
        .from("families")
        .update({ members: clonedFamily.members, roles: clonedFamily.roles })
        .eq("name", clonedFamily.name)
        .maybeSingle();
  
      if (error) {
        console.error(error);
        setPopupInfo("There was an Error.", "red");
        return;
      }
      
      const newName = popupInputs.current["role-rename-input"]
      resetPopup();
      showPopup({
        title: "Role Renamed",
        description: `The role "${name}" was renamed to "${newName}".`,
        buttonsArray: [{ text: "Close", className: "btn-d", onClick: resetPopup }],
      });

      await sendLog(family,"Role", {
        newName: newName,
        oldName: name,
        weight: roleWeight,
        staffName: user?.name,
        staffUID: user?.uid,
      },"Role Renamed",16763586)
    }
  

    showPopup({
      title: `${name}`,
      description: "Modify role name.",
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Save", onClick: confirmRename, className: "btn-g" },
      ],
      inputsArray: [
        {
          title: "Role Name",  
          type: "text",
          placeholder: "Role name...",
          name: "role-rename-input",
          className: "input-d",
          defaultValue: name,
          maxLength: 20
        },
      ],
      type: "default",
    });
  }

  function handleCreateRole() {
    if (!IsStaff(family,user)) return
    async function createRole() {
      const nameInput = popupInputs.current["create-role-name-input"];
      const weightInput = popupInputs.current["create-role-weight-input"];
      const roleName = nameInput?.trim();
      const roleWeight = parseInt(weightInput, 10) || 0;
  
      if (!roleName || roleName.length < 1) {
        setPopupInfo("Please provide a valid role name (min 1 character).", "red");
        return;
      }
  
      if (family?.roles?.[roleName]) {
        setPopupInfo("A role with that name already exists.", "red");
        return;
      }
  
      const { error } = await supabase
        .from("families")
        .update({
          roles: {
            ...family?.roles,
            [roleName]: { weight: roleWeight },
          },
        })
        .eq("name", family?.name)
        .maybeSingle();
  
      if (error) {
        console.error(error);
        setPopupInfo("There was an error.", "red");
        return;
      }
  
      resetPopup();
      showPopup({
        title: "Role Created",
        description: `Role named ${roleName} created with a weight of ${roleWeight}.`,
        buttonsArray: [{ text: "Close", className: "btn-d", onClick: resetPopup }],
      });

      await sendLog(family,"Role", {
              roleName: roleName,
              roleWeight: roleWeight,
              staffName: user?.name,
              staffUID: user?.uid,
            },"Role Created",16767463)
    }

    const maxRoleLimit = ["2","0"]

    if (Object.keys(family?.roles || {}).length >= parseInt(maxRoleLimit[0] + maxRoleLimit[1])) {
      showPopup({
        title: "Role Limit Reached",
        description: `You cannot create more than ${maxRoleLimit[0] + maxRoleLimit[1]} roles, To create more you have to delete some.`,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }
  
    showPopup({
      title: "Create Role",
      description: "Put the values below to create your role.",
      inputsArray: [
        {
          title: "Role Name",
          type: "text",
          className: "input-d",
          placeholder: "Enter your role name...",
          name: "create-role-name-input",
          maxLength: 20,
        },
        {
          title: "Role Weight",
          type: "number",
          className: "input-d",
          placeholder: "Put your role weight...",
          name: "create-role-weight-input",
          defaultValue: 0,
        },
      ],
      buttonsArray: [
        { text: "Close", className: "btn-d", onClick: resetPopup },
        { text: "Create", className: "btn-g", onClick: createRole },
      ],
    });
  }


  useEffect(() => {
    if (!family?.roles) return;

    const tempNodes: Node[] = [];
    const tempEdges: Edge[] = [];

    const sortedRoles = Object.entries(family.roles).sort(
      (a: any, b: any) => b[1].weight - a[1].weight
    );

    const spacingY = 250;
    let y = 0;

    sortedRoles.forEach(([role, info] : any, index) => {
      const roleId = `role-${role}`;

      tempNodes.push({
        id: roleId,
        data: { 
            label: role,
            default: role === family?.defaultRole, 
            weight: info?.weight, 
            onEditRoleWeight: () => handleEditRoleWeight(role,info?.weight),
            onEditRoleName: () => handleEditRoleName(role),
            onShowRoleMembers: () => handleShowRoleMembers(role),
            onDelete: () => handleDeleteRole(role), 
            isStaff: IsStaff(family,user)},
        position: { x: index % 2 !== 0 ? 300 * 2 : index, y },
        type: 'role',
      });

      if (index < sortedRoles.length - 1) {
        const nextRole = sortedRoles[index + 1][0];
        tempEdges.push({
          id: `edge-${role}-to-${nextRole}`,
          source: roleId,
          target: `role-${nextRole}`,
        });
      }

      y += spacingY;
    });

    setNodes(tempNodes);
    setEdges(tempEdges);

    //eslint-disable-next-line
  }, [family]);

  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden shadow relative">
      {IsStaff(family,user) && <div onClick={handleCreateRole} className="plusicon z-10 absolute right-5 top-5 !w-max rounded text-white text-base bg-main-4/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-regular fa-plus-large"></i></div> } 
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll
          minZoom={0.4}
          maxZoom={1.5}
          panOnDrag
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            style={{
                width: miniMapSize.width,
                height: miniMapSize.width,
                background: "var(--window)",
                border: "var(--fore) 1px solid",
                borderRadius: "0.3rem",
                marginBottom: "3.75rem"
                
            }}
            maskColor="transparent"
            nodeColor={(node) => node.id.startsWith('role-') ? getComputedStyle(document.documentElement).getPropertyValue('--bg') : getComputedStyle(document.documentElement).getPropertyValue('--fore')}
            nodeStrokeWidth={0}
            zoomable
            pannable
          />    
          <Background />
          <Controls className="nodesControls" showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
