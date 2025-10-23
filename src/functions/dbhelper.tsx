import { supabase } from "./supabase";

export async function GetNameFromUID(uid: string) {
    const { data, error } = await supabase.from("users").select("*").eq("uid", uid).single();

    if (error) {
        console.error(error);
        return null;
    }

    return data?.name || null
}

export async function GetMemberFromUID(uid: string) {
    const { data, error } = await supabase.from("users").select("*").eq("uid", uid).single();

    if (error) {
        console.error(error);
        return null;
    }
    return data
}

export async function GetMemberMidFromUID(uid: string) {
    const { data, error } = await supabase.from("users").select("*").eq("uid", uid).single();

    if (error) {
        console.error(error);
        return null;
    }
    return data?.mid
}


export function GetTotalMembers(data : any): number {
    if (!data?.members) return 0;

    return Number(Object.values(data.members).reduce((total, group) => total + (group as any).length, 0)) || 10000;
  }


export function IsStaff(family: any, user: any) {
  const data = family.creator === user?.uid ||
  family?.managerRoles?.some((role: string) =>
  family?.members?.[role]?.includes(user?.uid)
  );
  return data
}  

export function IsInRoles(userId: string, members : any) {
    return Object.values(members).some((ids : any) => ids.includes(userId));
  }