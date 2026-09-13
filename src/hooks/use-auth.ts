import { useCallback, useState } from "react";
export function useAuth(){
 const [isAuthenticated,setAuth]=useState(()=>typeof window!=="undefined" && localStorage.getItem("blockmind-auth")==="1");
 const signIn=useCallback(async (_provider?:string,_data?:FormData)=>{setAuth(true);if(typeof window!=="undefined")localStorage.setItem("blockmind-auth","1");},[]);
 const signOut=useCallback(async()=>{setAuth(false);if(typeof window!=="undefined")localStorage.removeItem("blockmind-auth");},[]);
 return {user:isAuthenticated?{name:"Player"}:null,isLoading:false,isAuthenticated,signIn,signOut};
}
