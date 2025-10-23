import { CleanNode } from './CleanNode';
import { MemberNode } from './MemberNode';

const nodeTypes = {
  clean: CleanNode,
  member: MemberNode,
};



import { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GetMemberMidFromUID, GetNameFromUID, IsStaff } from '../functions/dbhelper';
import { useGlobal } from '../hooks/useGlobal';
import { usePopup } from '../hooks/usePopup';
import { supabase } from '../functions/supabase';
import { sendLog } from '../functions/scripts';
import ToggleButton from './ToggleButton';

export default function TabMembers({ family }: { family: any }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const {user,setPopupInfo,popupInputs, membersTabCachedUsernames} = useGlobal()
  const {showPopup,resetPopup} = usePopup();

  const [miniMapSize, setMiniMapSize] = useState({ width: 120});

  const [listView, setListView] = useState(
    localStorage.getItem("listView") === "true" ? true : false
  );

  function toggleListView(value: boolean) {
    setListView(value);
    localStorage.setItem("listView", (value).toString());
  }

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


  async function banMember(uid: string, name: string) {
    const mid = await GetMemberMidFromUID(uid);

    async function confirm() {
      if (!family?.creator || uid === family?.creator) {
        setPopupInfo("You cannot ban the family creator.", "red");
        return;
      }

      const reason = popupInputs?.current["ban-member-reason-input"] || "Not Given.";

      resetPopup();

      const updatedFamily = Object.fromEntries(
        Object.entries(family?.members).map(([role, ids] : any) => [role, [...ids].filter(id => id !== uid)])
      );
      

      const { error } = await supabase
      .from("families")
      .update({members:updatedFamily,bannedUsers: {
        ...family?.bannedUsers, [mid]: {
          uid: uid, name: name, reason: reason,date: new Date().toLocaleString(),staffName: user?.name,staffUID: user?.uid
        }
      }})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        console.error("Error updating family:", error);
        showPopup({
          title: "Error",
          description: "An error occurred while banning the member.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return;
      }

      showPopup({
        title: "Success",
        description: "Member banned successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        labelsArray: [{title: "Reason Given",text: reason,className: "input-d"}]
      })

      await sendLog(family,"Ban", {
        username: name,
        userID: uid,
        reason: reason,
        staffName: user?.name,
        staffUID: user?.uid 
      },"Member Banned",16711680)

    }



    if (uid === user?.uid || mid === user?.mid) {
      showPopup({
        title: "Error",
        description: "You cannot ban yourself",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }

    showPopup({
      title: "Ban Member",
      description: `Are you sure you want to ban ${name}?`,
      inputsArray: [
        {title: "Reason for Ban",placeholder: "(Optional) Ban Reason...",type: "text", className: "input-d",name:"ban-member-reason-input"}
      ],
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Ban", onClick: confirm, className: "btn-r"},
      ]
    })
  }

  function kickMember(uid : string,name : string) {
    async function confirm() {
      if (!family?.creator || uid === family?.creator) {
        setPopupInfo("You cannot kick the family creator.", "red");
        return;
      }
      const reason = popupInputs?.current["kick-member-reason-input"] || "Not Given.";
      resetPopup();

      const updatedFamily = Object.fromEntries(
        Object.entries(family?.members).map(([role, ids] : any) => [role, [...ids].filter(id => id !== uid)])
      );
    
      const { error } = await supabase
      .from("families")
      .update({members:updatedFamily})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        console.error("Error updating family:", error);
        showPopup({
          title: "Error",
          description: "An error occurred while kicking the member.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return;
      }


      showPopup({
        title: "Success",
        description: "Member kicked successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        labelsArray: [{title: "Reason Given",text:reason,className: "input-d"}]
      })

      await sendLog(family,"Kick", {
        username: name,
        userID: uid,
        reason: reason,
        staffName: user?.name,
        staffUID: user?.uid 
      },"Member Kicked",16764928)

    }

    if (uid === user?.uid) {
      showPopup({
        title: "Error",
        description: "You cannot kick yourself",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }

    showPopup({
      title: "Kick Member",
      description: `Are you sure you want to kick ${name}?`,
      inputsArray: [
        {title: "Reason for kick",placeholder: "(Optional) Kick Reason...",type: "text", className: "input-d",name:"kick-member-reason-input"}
      ],
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Kick", onClick: confirm, className: "btn-r"},
      ]
    })
  }

  function changeRole(uid: string, name : string) {
    const currentRole = Object.entries(family.members).find(([, uids] : any) => uids.includes(uid))?.[0];
  
    const addableRoles = Object.keys(family.roles).filter(role => role !== currentRole);

    async function confirm(data : any,roleName : string) {
      const {error} = await supabase
      .from("families")
      .update({members:data})
      .eq("name",family?.name)
  
      if (error) {
        console.error("Error updating family:", error);
        setPopupInfo("There was an error.", "red");
        return;
      }
  
      resetPopup();
      showPopup({
        title: "Success",
        description: "Role changed successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      await sendLog(family,"Role", {
        username: name,
        userID: uid,
        oldRole: currentRole,
        newRole: roleName,
        staffName: user?.name,
        staffUID: user?.uid,
      },"Role Changed",16767232)
    }
  
    showPopup({
      title: "Change Role",
      description: `Select a new role for ${name}. (currently has ${currentRole})`,
      buttonsArray: [
        {
          text: "Cancel",
          onClick: resetPopup,
          className: "btn-d",
        },  
        ...addableRoles.map(role => ({
          text: role,
          className: "btn-g",
          onClick: () => {
            const updatedMembers: Record<string, string[]> = Object.fromEntries(
              Object.entries(family.members).map(([role, uids] : any) => [role, [...uids]])
            );
          
            if (currentRole) {
              updatedMembers[currentRole] = updatedMembers[currentRole].filter(id => id !== uid);
            }
          

            if (!updatedMembers[role]) updatedMembers[role] = [];
            updatedMembers[role].push(uid);
    
            confirm(updatedMembers,role);
          }
        }))
      ]
    });
  }

  useEffect(() => {
    if (!family?.members) return;
    if (listView) return;

    const buildGraph = async () => {
      const tempNodes: Node[] = [];
      const tempEdges: Edge[] = [];
    
      let y = 0;
      const roleSpacing = 300;
      const nodeSpacing = 400;
    
      const sortedRoles = Object.entries(family.members).sort(([roleA], [roleB]) => {
        const weightA = family.roles?.[roleA]?.weight ?? 0;
        const weightB = family.roles?.[roleB]?.weight ?? 0;
        return weightB - weightA;
      });
    
      for (const [role, userIds] of sortedRoles) {
        const roleNodeId = `role-${role}`;
        const roleX = 350; 
        const roleY = y;
    
        tempNodes.push({
          id: roleNodeId,
          data: { label: role },
          position: { x: roleX, y: roleY },
          type: 'clean',
        });
    
        const names = await Promise.all(
          (userIds as string[]).map((uid) => GetNameFromUID(uid))
        );
    
        const totalWidth = (names.length - 1) * nodeSpacing;
        const startX = roleX - totalWidth / 2;
    
        for (let index = 0; index < names.length; index++) {
          const name = names[index];
          const userId = (userIds as string[])[index];
          const userX = startX + index * nodeSpacing;
          const userY = roleY + 150;
    
    
          tempNodes.push({
            id: userId,
            type: 'member',
            position: { x: userX, y: userY },
            data: {
              index: index,
              family: family,
              label: name || userId || "Unknown",
              userId,
              joinDate: family?.joinedDates?.[userId] || "Unknown",
              isStaff: IsStaff(family, user),
              onKick: (uid: string, name: string) => kickMember(uid, name),
              onBan: (uid: string, name: string) => banMember(uid, name),
              onRoleChange: (uid: string, name: string) => changeRole(uid, name),
            },
          });
    
          tempEdges.push({
            id: `e-${roleNodeId}-${userId}`,
            source: roleNodeId,
            target: userId,
          });
        }
    
        y += roleSpacing + 100;
      }
    
      setNodes(tempNodes);
      setEdges(tempEdges);
    };

    buildGraph();

  // eslint-disable-next-line
  }, [family,user?.uid,listView]);

  const [searchInput, setSearchInput] = useState<string>("");


  const [usernames, setUsernames] = useState<any>({});

  useEffect(() => {
    if (!family?.members) return;
    if (!listView) return;
    const fetchUsernames = async () => {
      const newUsernames: any = {};
      for (const role of Object.keys(family?.roles || {})) {
        for (const uid of Object.values(family?.members[role] || {}) as string[]) {
          if (!newUsernames[uid]) {
            newUsernames[uid] = await GetNameFromUID(uid);
          }
        }
      }
      setUsernames(newUsernames);
    };

    fetchUsernames();
  }, [family?.members, family?.roles,listView]);



  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden shadow">
      {!listView && (
        <ReactFlowProvider>
        <ReactFlow
          nodesDraggable={true}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultViewport={{ zoom: 0.5, x: 0, y: 0 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={true}
          panOnDrag
          proOptions={{ hideAttribution: true }}
        >
          <Background />
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
          <Controls className="nodesControls" showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
      )}

      <div className="toggleContainer z-2 absolute right-5 top-15 flex flex-col gap-2 items-center">
        <div title={!listView ? "Nodes View" : "List View"} className="text text-xl text-bg">{!listView ? <i className="fa-solid fa-circle-nodes"></i> : <i className="fa-solid fa-square-list"></i>}</div>
        <ToggleButton tooltip='Change View Type' className='toggle-d' bool={listView} setter={toggleListView} cooldown={1000}/>
      </div>
      
      {listView && (
        <div className="listView !rounded-none flex flex-col gap-3 !p-4 backdrop-blur-md min-w-[300px] w-[100%] max-w-[100%] h-[100%] input-d !border-none">
        <div className="innerList flex flex-col h-full w-[90%]">
      
          <div className="search w-full">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              className="input-d w-full"
              placeholder="Search via name or role..."
            />
          </div>
      
          <div className="infoContainer animte-fade-F-Y-T-B-in-ALL-CHILD flex flex-col gap-2 w-full h-full overflow-y-auto p-2">
            {Object.keys(family?.roles || {})
              .sort((a, b) => family?.roles[b]?.weight - family?.roles[a]?.weight)
              .filter((role) => {
                const normalizedSearch = searchInput.toLowerCase();
                const roleMatches = role.toLowerCase().includes(normalizedSearch);
                const memberMatches = Object.values(family?.members[role] || {}).some((uid: any) => {
                  const username = usernames[uid];
                  return username?.toLowerCase().includes(normalizedSearch);
                });
                return roleMatches || memberMatches;
              })
              .map((role) => (
                <div key={role} className="role flex flex-col p-5">
                  <div className="role text-xl text-fore">
                    {role}
                  </div>
                  <div className="users ml-5 flex text-fore-2">
                    <div className="line h-full w-[3px] rounded-b bg-bg/20"></div>
                    <div className="inside flex flex-col gap-5">
                      {(() => {
  const normalizedSearch = searchInput.toLowerCase();
  const uids = Object.values(family?.members[role] || {});

  const sortedUids = [...uids].sort((a: any, b: any) => {
    const aName = usernames[a]?.toLowerCase() || "";
    const bName = usernames[b]?.toLowerCase() || "";

    const aMatch = aName.includes(normalizedSearch);
    const bMatch = bName.includes(normalizedSearch);

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return sortedUids.map((uid: any) => {
    let username = usernames[uid];

    // Use cached value if username not available
    if (!username) {
      username = membersTabCachedUsernames.current[uid] || "Loading...";
    } else {
      // Cache the value
      membersTabCachedUsernames.current[uid] = username;
    }

    return (
      <div key={uid} className="user flex items-center">
        <div className="line h-[3px] w-5 bg-bg/20 rounded-r"></div>
        <div className="name ml-2 flex items-center gap-2">
          <div className="name">{username}</div>
          {IsStaff(family, user) && (
            <div className="btns flex items-center gap-2 text-sm bg-black/20">
              <button
                onClick={() => kickMember(uid, username)}
                className="flex transition-all items-center justify-center text-yellow-300 p-2 aspect-square hover:bg-white/10 cursor-pointer nodrag"
                title="Kick"
              >
                <i className="fa-solid fa-user-minus"></i>
              </button>
              <button
                onClick={() => banMember(uid, username)}
                className="flex transition-all items-center justify-center text-red-500 p-2 aspect-square hover:bg-white/10 cursor-pointer nodrag"
                title="Ban"
              >
                <i className="fa-solid fa-hammer-crash"></i>
              </button>
              <button
                onClick={() => changeRole(uid, username)}
                className="flex transition-all items-center justify-center text-green-400 p-2 aspect-square hover:bg-white/10 cursor-pointer nodrag"
                title="Change Role"
              >
                <i className="fa-solid fa-user-gear"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  });
})()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
      
        </div>
      </div>
      )}

    </div>
  );
}
