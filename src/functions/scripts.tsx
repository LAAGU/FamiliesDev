
export const setPermanentRootVariables = (key : string, value : string) => {
    const root = document.documentElement;
    root.style.setProperty(key, value);
    localStorage.setItem(key, value);
    
}

export const getPermanentRootVariables = (key : string) => {
  const fromLocalStorage = localStorage.getItem(key);
  if (fromLocalStorage) return fromLocalStorage;

  return getComputedStyle(document.documentElement)
    .getPropertyValue(key)
    .trim();
}

const defaultPermanentVariables: any = {"--w-1":"#000000", "--w-2": "#2e2e2e", "--def-bg": "#cacaca", "--def-main3": "#ffffff"};

export function resetPermanentVariables(list : string[]) {
    list.forEach((v) => {
      document.documentElement.style.setProperty(v, defaultPermanentVariables[v]);
      localStorage.removeItem(v);
    });
}

export function applySavedPermanentVariables() {
    const vars = ["--w-1", "--w-2", "--def-bg", "--def-main3"];
    vars.forEach((v) => {
      const val = localStorage.getItem(v);
      if (val) {
        document.documentElement.style.setProperty(v, val);
      }
    });
  }

export const getRootVariables = (key : string) => {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(key).trim() || "";
}

export const setRootVariablesBulk = (data : any[]) => {
    const root = document.documentElement;

    data?.forEach((item : any) => {
        root.style.setProperty(item.key, item.value);
    })

}



export function copyTextToClipboard(text : string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        try {
            document.execCommand("copy");
        } catch (err) {
            console.error("Something went wrong",err);
        }
        document.body.removeChild(textArea);
    }
}


export function obscureString(str: string) {
  if (!str || str.length <= 3) return str;

  const lastThree = str.slice(-3);
  const stars = '*'.repeat(str.length - 3);

  return stars + lastThree;
}



export const isValidUrl = (url : string) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

export const isValidHexColor = (color : string) => {
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexColorRegex.test(color);
}

export async function sendLineupNotification(family: any,data: any) {
  if (!family?.webhooks?.family_list) {
    console.error('No family_list webhook found for :', family?.name);
    return false
  }

  const C: any = {
    
  }

  Object.keys(data).forEach((key) => {
    if (C[data[key]]) {
      C[data[key]].push(key);
    }
    else {
      C[data[key]] = [key];
    }
  });


  const payload = {
    username: `${family?.name}`,
    avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
    embeds: [
      {
        title: `${family?.name} Family List`,
        description: `Total ${Object.keys(data).length} members in the Family List.`,
        thumbnail: {
          url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
        },
        fields: [
          ...Object.keys(C)
          .sort((a: string, b: string) => a.localeCompare(b))
          .map((key) => {
            return {
              name: `${key} ➡ ${C[key].length}`,
              value: C[key]
              .join(",")
              .split(",")
              .sort((a: string, b: string) => a.localeCompare(b))
              .map((x: string) => `-${" "}${x}`)
              .join("\n") || "No members found",
            }
          })
        ],
        color: 16773279,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(family?.webhooks?.family_list, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response?.status || !response?.ok || response?.status === 429) {
      console.error('Error sending family_list:', response || "Unknown error");
      return false
  }

  return true
}


export async function sendStashUpdate(family: any) {
  if (!family?.webhooks?.stash) {
    console.error('No stash webhook found for :', family?.name);
    return false
  }


  const payload = {
    username: `${family?.name}`,
    avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
    embeds: [
      {
        title: `${family?.name} Stash`,
        description: `Items in the stash.`,
        thumbnail: {
          url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
        },
        fields: [
          ...Object.keys(family?.stash || {})
          .sort((a: string, b: string) => a.localeCompare(b))
          .map((key) => {
            return {
              name: `${key}`,
              value: "`x" + (family?.stash[key]?.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "`",
              inline: false,
            }
          })
        ],
        color: 16773279,
        timestamp: new Date().toISOString(),
      },
    ],
  };
  
  const response = await fetch(family?.webhooks?.stash, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response?.status || !response?.ok || response?.status === 429) {
      console.error('Error sending stash:', response || "Unknown error");
      return false
  }

  return true
}

export async function sendStashNotification(family:any,data:any) {
  if (!family?.webhooks?.stash_logs) {
    console.error('No stash_logs webhook found for :', family?.name);
    return false
  }
  
    const payload = {
      username: `${family?.name}`,
      avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
      embeds: [
        {
          title: `${family?.name} Stash Log`,
          description: `### ( x${data?.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ) ${data?.itemName} ${data?.type === "add" ? "added in" : "removed from"} stash\n- **${data?.reason || "No reason given"}**`,
          color: data?.type === "add" ? 3135330 : 16711713,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  
    const response = await fetch(family?.webhooks?.stash_logs, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (!response?.status || !response?.ok || response?.status === 429) {
        console.error('Error sending stash_logs:', response || "Unknown error");
        return false
    }
  
    return true
}

export async function sendTaskNotification(family: any,data: any) {
  if (!family?.webhooks?.task) {
    console.error('No task webhook found for :', family?.name);
    return false
  }

  const payload = {
    username: `${family?.name}`,
    avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
    embeds: [
      {
        title: data?.title,
        description: data?.description,
        fields:  [
        {
          name: 'Reward',
          value: data?.reward || "None",
          inline: false
        },
        {
          name: 'Penalty',
          value: data?.penalty || "None",
          inline: false
        },
        {
          name: 'Start Date',
          value: data?.startDate,
          inline: true
        },
        {
          name: 'End Date',
          value: data?.endDate,
          inline: true
        }],
        image: {
          url: isValidUrl(data?.bannerUrl) ? data?.bannerUrl : 'https://images01.military.com/sites/default/files/styles/full/public/2018-08/infantrytroops1200.jpg?itok=UUxzBgL-',
        },
        color: 1441833,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(family?.webhooks?.task, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response?.status || !response?.ok || response?.status === 429) {
      console.error('Error sending task:', response || "Unknown error");
      return false
  }

  return true
}

export async function sendFundNotification(family: any,data: any) {
  if (!family?.webhooks?.funds) {
    console.error('No Funds webhook found for :', family?.name);
    return false
  }

  const payload = {
    username: `${family?.name}`,
    avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
    embeds: [
      {
        title: `$${data?.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` + ' Family funds ' + (data?.type === "add" ? "added " + `by ${data?.targetName || "Someone"}` : `${data?.targetName ? "removed by " + data?.targetName : "removed."}`),
        description: `${data?.reason ? "**Reason : ** "  + "`" +  data?.reason + "`" + "\n" : ""}## Family Funds Total:\n` + "`" + `$${data?.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` + "`",
        color: data?.type === "add" ? 3145648 : 16727608, 
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(family?.webhooks?.funds, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response?.status || !response?.ok || response?.status === 429) {
      console.error('Error sending loa:', response || "Unknown error");
      return false
  }

  return true
}

export async function sendLoa(family: any,user: any, data: any) {
  if (!family?.webhooks?.loa) {
    console.error('No Loa webhook found for :', family?.name);
    return false
  }

  const payload = {
    username: `${family?.name}`,
    avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
    embeds: [
      {
        title: 'Loa Request',
        description: "```json\n" + `Name: ${user?.name}\nStartDate: ${data?.startDate}\nEndDate: ${data?.endDate}\nReason: ${data?.reason}` + "```",
        color: 3132159, 
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const response = await fetch(family?.webhooks?.loa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response?.status || !response?.ok || response?.status === 429) {
      console.error('Error sending loa:', response || "Unknown error");
      return false
  }

  return true

}

export async function sendLog(family: any,type: string, data: Record<string, any>,title?:string,color?: number) {

    if (!family?.webhooks?.logs) {
        console.error('No Logs webhook found for :', family?.name);
        return false
    }


    const payload = {
        username: `${family?.name} Logs`,
        avatar_url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
        content: "`" + type + "-logs" + "`",
        embeds: [
          {
            thumbnail: {
              url: family?.logoUrl || 'https://webhostingmedia.net/wp-content/uploads/2018/01/http-error-404-not-found.png',
            },
            title: title || 'Title Not Given',
            description: "```json\n" + JSON.stringify(data, null, 2) + "```" || 'Description Not Found',
            color: color || 13346126, 
            timestamp: new Date().toISOString(),
          },
        ],
      };
    
    const response = await fetch(family?.webhooks?.logs, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response?.status || !response?.ok || response?.status === 429) {
        console.error('Error sending log:', response || "Unknown error");
        return false
    }

    return true
}




