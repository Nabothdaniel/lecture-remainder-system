import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUserStore } from "./store/authStore";


const App = () => {
    const initAuth = useUserStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);


  return( <Outlet />)
}

export default App